import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import TVLayout from '../components/layout/TVLayout'
import PhaseTransition from '../components/transitions/PhaseTransition'
import CountdownTimer from '../components/shared/CountdownTimer'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import PlayerList from '../components/lobby/PlayerList'
import ScoreBoard from '../components/shared/ScoreBoard'
import PlayerAvatar from '../components/shared/PlayerAvatar'
import { useRoomMeta, usePlayers } from '../hooks/useRoom'
import { useSketchBluffRound, useSystemData } from '../hooks/useGameState'
import { useGameStore } from '../store/gameStore'
import { useTvNarration } from '../hooks/useTvNarration'
import { waitForCurrentNarration } from '../lib/tvNarration'
import {
  startSketchBluffGame,
  beginSketchBluffGuessing,
  beginSketchBluffVoting,
  resolveSketchBluffVoting,
} from '../lib/gameEngine'
import {
  setRoomState,
  submitSketchBluffDrawing,
  submitSketchBluffGuess,
  submitSketchBluffVote,
} from '../firebase/database'
import {
  getComputerPlayers,
  getComputerSketchDrawing,
  getComputerSketchGuess,
  pickComputerSketchVote,
} from '../lib/computerPlayer'
import { calculateSketchBluffScores } from '../lib/scoring'
import { SKETCHBLUFF_RESULTS_TIME_SECONDS } from '../types/sketchbluff'

export default function HostSketchBluffGame() {
  const navigate = useNavigate()
  const { roomCode } = useGameStore()
  const { data: meta } = useRoomMeta(roomCode)
  const { playerList } = usePlayers(roomCode)
  const { data: system } = useSystemData(roomCode)
  const round = meta?.round ?? 1
  const gameState = meta?.state
  const { data: sketchRound } = useSketchBluffRound(roomCode, round)

  const [drawingOrder, setDrawingOrder] = useState<string[]>([])
  const [scoreDeltas, setScoreDeltas] = useState<Record<string, number>>({})
  const usedPromptIds = useRef(new Set<string>())
  const transitioning = useRef(false)
  const resultsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const computerActionKeys = useRef(new Set<string>())
  const [, setTick] = useState(0)

  const nonHostPlayers = playerList.filter(p => !p.isHost)
  const currentPlayerId = sketchRound?.voting?.currentPlayerId
  const currentDrawing = currentPlayerId ? sketchRound?.drawings?.[currentPlayerId] : undefined
  const currentVotes = sketchRound?.voting?.votes ?? {}
  const choices = sketchRound?.voting?.choices ?? []
  const getPlayer = (id: string) => nonHostPlayers.find(player => player.id === id)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 500)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!roomCode || !playerList.length || gameState !== 'lobby') return
    if (transitioning.current) return
    transitioning.current = true

    startSketchBluffGame(roomCode, nonHostPlayers, round, usedPromptIds.current)
      .then(ids => {
        setDrawingOrder(ids)
        transitioning.current = false
      })
      .catch(err => {
        transitioning.current = false
        console.error(err)
      })
  }, [gameState, roomCode, playerList.length])

  useEffect(() => {
    if (sketchRound?.drawings && drawingOrder.length === 0) {
      setDrawingOrder(Object.keys(sketchRound.drawings))
    }
  }, [sketchRound, drawingOrder.length])

  useEffect(() => {
    if (gameState !== 'answering' || !sketchRound || !roomCode) return

    for (const computer of getComputerPlayers(nonHostPlayers)) {
      const drawing = sketchRound.drawings?.[computer.id]
      if (!drawing || drawing.submitted) continue

      const key = `sketch-draw:${round}:${computer.id}`
      if (computerActionKeys.current.has(key)) continue
      computerActionKeys.current.add(key)

      submitSketchBluffDrawing(roomCode, round, computer.id, getComputerSketchDrawing(drawing.promptText))
        .catch(console.error)
    }
  }, [gameState, sketchRound, roomCode, round, nonHostPlayers.length])

  useEffect(() => {
    if (gameState !== 'answering' || !sketchRound || !system || !roomCode || transitioning.current) return
    if (drawingOrder.length === 0) return

    const submitted = Object.values(sketchRound.drawings ?? {}).filter(drawing => drawing.submitted).length
    const elapsed = (Date.now() - system.timerStartedAt) / 1000
    const timerExpired = elapsed >= system.timerDuration
    const allSubmitted = submitted >= nonHostPlayers.length && nonHostPlayers.length > 0

    if (allSubmitted || timerExpired) {
      transitioning.current = true
      ;(async () => {
        if (timerExpired) {
          const missing = Object.entries(sketchRound.drawings ?? {}).filter(([, drawing]) => !drawing.submitted)
          await Promise.all(missing.map(([playerId, drawing]) =>
            submitSketchBluffDrawing(roomCode, round, playerId, getComputerSketchDrawing(drawing.promptText))
          ))
        }
        await beginSketchBluffGuessing(roomCode, round, drawingOrder[0])
        transitioning.current = false
      })().catch(err => {
        transitioning.current = false
        console.error(err)
      })
    }
  }, [gameState, sketchRound, system, drawingOrder])

  useEffect(() => {
    if (gameState !== 'voting' || sketchRound?.voting?.phase !== 'guessing' || !currentPlayerId || !currentDrawing || !roomCode) return

    for (const computer of getComputerPlayers(nonHostPlayers)) {
      if (computer.id === currentPlayerId) continue
      if (sketchRound.guesses?.[currentPlayerId]?.[computer.id]) continue

      const key = `sketch-guess:${round}:${currentPlayerId}:${computer.id}`
      if (computerActionKeys.current.has(key)) continue
      computerActionKeys.current.add(key)

      submitSketchBluffGuess(
        roomCode,
        round,
        currentPlayerId,
        computer.id,
        getComputerSketchGuess(currentDrawing.promptText, currentPlayerId)
      ).catch(console.error)
    }
  }, [gameState, sketchRound, currentPlayerId, currentDrawing, roomCode, round, nonHostPlayers.length])

  useEffect(() => {
    if (gameState !== 'voting' || sketchRound?.voting?.phase !== 'guessing' || !system || !roomCode || !currentPlayerId || transitioning.current) return

    const guessers = nonHostPlayers.filter(player => player.id !== currentPlayerId)
    const guessCount = Object.keys(sketchRound.guesses?.[currentPlayerId] ?? {}).length
    const elapsed = (Date.now() - system.timerStartedAt) / 1000
    const timerExpired = elapsed >= system.timerDuration
    const allGuessed = guessCount >= guessers.length && guessers.length > 0

    if (allGuessed || timerExpired) {
      transitioning.current = true
      beginSketchBluffVoting(roomCode, round, sketchRound, currentPlayerId)
        .then(() => { transitioning.current = false })
        .catch(err => {
          transitioning.current = false
          console.error(err)
        })
    }
  }, [gameState, sketchRound, system, currentPlayerId])

  useEffect(() => {
    if (gameState !== 'voting' || sketchRound?.voting?.phase !== 'voting' || !system || !roomCode || !currentPlayerId || transitioning.current) return

    for (const computer of getComputerPlayers(nonHostPlayers)) {
      if (computer.id === currentPlayerId) continue
      if (sketchRound.voting.votes?.[computer.id]) continue

      const key = `sketch-vote:${round}:${currentPlayerId}:${computer.id}`
      if (computerActionKeys.current.has(key)) continue
      const choiceId = pickComputerSketchVote(choices, computer.id)
      if (!choiceId) continue

      computerActionKeys.current.add(key)
      submitSketchBluffVote(roomCode, round, computer.id, choiceId).catch(console.error)
    }

    const voters = nonHostPlayers.filter(player => player.id !== currentPlayerId)
    const voteCount = Object.keys(sketchRound.voting.votes ?? {}).length
    const elapsed = (Date.now() - system.timerStartedAt) / 1000
    const timerExpired = elapsed >= system.timerDuration
    const allVoted = voteCount >= voters.length && voters.length > 0

    if (allVoted || timerExpired) {
      transitioning.current = true
      const realChoice = choices.find(choice => choice.isReal)
      const fakeChoiceAuthors: Record<string, string> = {}
      for (const choice of choices) {
        if (!choice.isReal && choice.authorId) fakeChoiceAuthors[choice.id] = choice.authorId
      }
      setScoreDeltas(realChoice
        ? calculateSketchBluffScores(sketchRound.voting.votes ?? {}, realChoice.id, fakeChoiceAuthors, currentPlayerId).deltas
        : {}
      )

      resolveSketchBluffVoting(roomCode, round, sketchRound)
        .then(deltas => {
          if (Object.keys(deltas).length > 0) setScoreDeltas(deltas)
          transitioning.current = false
        })
        .catch(err => {
          transitioning.current = false
          console.error(err)
        })
    }
  }, [gameState, sketchRound, system, choices, currentPlayerId])

  useEffect(() => {
    if (gameState !== 'results' || !sketchRound || !roomCode || !currentPlayerId) return

    if (resultsTimer.current) clearTimeout(resultsTimer.current)
    resultsTimer.current = setTimeout(async () => {
      transitioning.current = true
      await Promise.race([waitForCurrentNarration(), new Promise(resolve => setTimeout(resolve, 12000))])

      const currentIndex = drawingOrder.indexOf(currentPlayerId)
      const nextPlayerId = drawingOrder[currentIndex + 1]
      if (nextPlayerId) {
        setScoreDeltas({})
        await beginSketchBluffGuessing(roomCode, round, nextPlayerId)
      } else {
        await setRoomState(roomCode, 'scoreboard')
      }
      transitioning.current = false
    }, SKETCHBLUFF_RESULTS_TIME_SECONDS * 1000)

    return () => { if (resultsTimer.current) clearTimeout(resultsTimer.current) }
  }, [gameState, sketchRound, currentPlayerId, drawingOrder])

  useEffect(() => {
    if (gameState === 'done') navigate('/')
  }, [gameState, navigate])

  useTvNarration(
    gameState === 'answering' ? 'sketchbluff-drawing' : null,
    'Sketch Bluff has begun. Check your phones, draw your secret prompt, and remember: artistic talent is optional but suspicious confidence is required.'
  )

  useTvNarration(
    gameState === 'voting' && sketchRound?.voting?.phase === 'guessing' && currentPlayerId
      ? `sketchbluff-guessing-${currentPlayerId}`
      : null,
    currentPlayerId ? `Here comes ${getPlayer(currentPlayerId)?.name ?? 'a player'}'s masterpiece. Write a fake title convincing enough to fool the room.` : null
  )

  useTvNarration(
    gameState === 'results' && currentDrawing
      ? `sketchbluff-results-${currentPlayerId}`
      : null,
    currentDrawing ? `The real prompt was: ${currentDrawing.promptText}. Scores are updated, reputations are not.` : null
  )

  function renderDrawingProgress() {
    const submitted = Object.values(sketchRound?.drawings ?? {}).filter(drawing => drawing.submitted).length

    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-8 p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-display text-5xl" style={{ color: '#38bdf8' }}>Sketch Bluff</p>
          <p className="text-text-muted font-body text-2xl mt-2">Players are drawing their secret prompts...</p>
        </motion.div>
        {system && <CountdownTimer totalSeconds={system.timerDuration} startedAt={system.timerStartedAt} size={160} />}
        <div className="flex items-center gap-3">
          <div className="font-display text-4xl text-neon-green">{submitted}</div>
          <div className="font-body text-text-muted text-2xl">/ {nonHostPlayers.length} drawings</div>
        </div>
        <PlayerList players={nonHostPlayers} compact />
      </div>
    )
  }

  function renderGuessing() {
    if (!currentPlayerId || !currentDrawing || !system) return <LoadingSpinner size="lg" />
    const guessers = nonHostPlayers.filter(player => player.id !== currentPlayerId)
    const guesses = Object.keys(sketchRound?.guesses?.[currentPlayerId] ?? {}).length

    return (
      <div className="flex flex-col flex-1 p-6 gap-5">
        <div className="flex items-center justify-between">
          <span className="font-display text-2xl" style={{ color: '#38bdf8' }}>
            Sketch Bluff - Fake Titles
          </span>
          <div className="flex items-center gap-5">
            <span className="font-display text-neon-yellow text-2xl">{guesses}/{guessers.length}</span>
            <CountdownTimer totalSeconds={system.timerDuration} startedAt={system.timerStartedAt} size={70} />
          </div>
        </div>
        <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(260px,0.6fr)] gap-6 flex-1 min-h-0">
          <div className="rounded-2xl bg-white p-4 flex items-center justify-center border-4 border-cyan-300">
            {currentDrawing.drawingUrl ? (
              <img src={currentDrawing.drawingUrl} alt="Current drawing" className="max-w-full max-h-full object-contain rounded-xl" />
            ) : <LoadingSpinner size="lg" />}
          </div>
          <div className="flex flex-col justify-center gap-5">
            <div className="game-card text-center">
              <p className="text-text-muted font-body text-sm">Artist</p>
              <p className="font-display text-3xl text-text-primary">{getPlayer(currentPlayerId)?.name ?? 'Player'}</p>
            </div>
            <p className="text-text-muted font-body text-xl text-center">
              Write fake titles on your phones. The real prompt is hidden until results.
            </p>
          </div>
        </div>
      </div>
    )
  }

  function renderVoting() {
    if (!currentPlayerId || !currentDrawing || !system) return <LoadingSpinner size="lg" />
    const voters = nonHostPlayers.filter(player => player.id !== currentPlayerId)
    const voteCount = Object.keys(currentVotes).length

    return (
      <div className="flex flex-col flex-1 p-6 gap-4">
        <div className="flex items-center justify-between">
          <span className="font-display text-2xl" style={{ color: '#38bdf8' }}>
            Which title is real?
          </span>
          <div className="flex items-center gap-5">
            <span className="font-display text-neon-yellow text-2xl">{voteCount}/{voters.length}</span>
            <CountdownTimer totalSeconds={system.timerDuration} startedAt={system.timerStartedAt} size={70} />
          </div>
        </div>
        <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] gap-5 flex-1 min-h-0">
          <div className="rounded-2xl bg-white p-4 flex items-center justify-center border-4 border-cyan-300">
            <img src={currentDrawing.drawingUrl} alt="Current drawing" className="max-w-full max-h-full object-contain rounded-xl" />
          </div>
          <div className="grid grid-cols-1 gap-3 content-center">
            {choices.map((choice, index) => (
              <motion.div
                key={choice.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: 'rgba(56,189,248,0.12)', border: '2px solid rgba(56,189,248,0.45)' }}
              >
                <span className="font-display text-lg rounded-xl w-10 h-10 flex items-center justify-center bg-cyan-300 text-slate-950">
                  {String.fromCharCode(65 + index)}
                </span>
                <p className="font-body text-text-primary text-xl">{choice.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  function renderResults() {
    if (!currentPlayerId || !currentDrawing) return <LoadingSpinner size="lg" />
    const realChoice = choices.find(choice => choice.isReal)
    const getVoters = (choiceId: string) => Object.entries(currentVotes).filter(([, vote]) => vote === choiceId).map(([id]) => id)

    return (
      <div className="flex flex-col flex-1 p-6 gap-4">
        <p className="font-display text-3xl text-center" style={{ color: '#38bdf8' }}>
          The prompt was: {currentDrawing.promptText}
        </p>
        <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] gap-5 flex-1 min-h-0">
          <div className="rounded-2xl bg-white p-4 flex items-center justify-center border-4 border-cyan-300">
            <img src={currentDrawing.drawingUrl} alt="Current drawing" className="max-w-full max-h-full object-contain rounded-xl" />
          </div>
          <div className="flex flex-col gap-3 justify-center">
            {choices.map(choice => {
              const author = choice.authorId ? getPlayer(choice.authorId) : null
              const voters = getVoters(choice.id)
              return (
                <div
                  key={choice.id}
                  className="rounded-2xl p-4"
                  style={{
                    background: choice.isReal ? 'rgba(57,255,20,0.12)' : 'rgba(255,45,120,0.08)',
                    border: `2px solid ${choice.isReal ? 'rgba(57,255,20,0.5)' : 'rgba(255,45,120,0.35)'}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-display rounded-lg px-3 py-1" style={{ background: choice.isReal ? '#39ff14' : '#ff2d78', color: '#0f0f1a' }}>
                      {choice.isReal ? 'REAL' : 'FAKE'}
                    </span>
                    <p className="font-body text-text-primary text-xl flex-1">{choice.text}</p>
                    {author && (
                      <div className="flex items-center gap-2">
                        <PlayerAvatar name={author.name} color={author.avatarColor} size="sm" />
                        <span className="font-body text-sm" style={{ color: author.avatarColor }}>{author.name}</span>
                      </div>
                    )}
                  </div>
                  {voters.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {voters.map(voterId => {
                        const voter = getPlayer(voterId)
                        return voter ? (
                          <span key={voterId} className="px-2 py-0.5 rounded-full font-body text-xs" style={{ background: `${voter.avatarColor}30`, color: voter.avatarColor }}>
                            {voter.name}
                          </span>
                        ) : null
                      })}
                    </div>
                  )}
                </div>
              )
            })}
            {realChoice && (
              <p className="text-text-muted font-body text-center">
                Correct votes score points. Fake titles score when they fool someone.
              </p>
            )}
          </div>
        </div>
        <ScoreBoard players={nonHostPlayers} deltaMap={scoreDeltas} compact />
      </div>
    )
  }

  function renderScoreboard() {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-8 p-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <h2 className="font-display text-6xl neon-text-yellow text-center">FINAL SCORES</h2>
        </motion.div>
        <div className="w-full max-w-2xl">
          <ScoreBoard players={nonHostPlayers} isFinal />
        </div>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="btn-primary"
          onClick={() => {
            setRoomState(roomCode!, 'done')
            navigate('/')
          }}
        >
          Back to Home
        </motion.button>
      </div>
    )
  }

  if (!meta || gameState === 'lobby') {
    return (
      <TVLayout>
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner size="lg" label="Starting Sketch Bluff..." />
        </div>
      </TVLayout>
    )
  }

  return (
    <TVLayout>
      <div className="flex flex-col flex-1">
        <PhaseTransition phase={`${gameState}-${sketchRound?.voting?.phase ?? ''}-${currentPlayerId ?? ''}`}>
          {gameState === 'answering' && renderDrawingProgress()}
          {gameState === 'voting' && sketchRound?.voting?.phase === 'guessing' && renderGuessing()}
          {gameState === 'voting' && sketchRound?.voting?.phase === 'voting' && renderVoting()}
          {gameState === 'results' && renderResults()}
          {gameState === 'scoreboard' && renderScoreboard()}
        </PhaseTransition>
      </div>
    </TVLayout>
  )
}
