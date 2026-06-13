import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import TVLayout from '../components/layout/TVLayout'
import PhaseTransition from '../components/transitions/PhaseTransition'
import FibbageVotingTV from '../components/game/fibbage/FibbageVotingTV'
import FibbageResults from '../components/game/fibbage/FibbageResults'
import ScoreBoard from '../components/shared/ScoreBoard'
import CountdownTimer from '../components/shared/CountdownTimer'
import PlayerList from '../components/lobby/PlayerList'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import { useRoomMeta, usePlayers } from '../hooks/useRoom'
import { useFibbageRound, useSystemData } from '../hooks/useGameState'
import { useGameStore } from '../store/gameStore'
import { startFibbageGame, beginFibbageVoting, resolveFibbageVoting } from '../lib/gameEngine'
import { calculateFibbageScores } from '../lib/scoring'
import { setRoomState } from '../firebase/database'
import type { FibbageRound } from '../types/fibbage'

const RESULTS_DISPLAY_MS = 5000

export default function HostFibbageGame() {
  const navigate = useNavigate()
  const { roomCode } = useGameStore()
  const { data: meta } = useRoomMeta(roomCode)
  const { playerList } = usePlayers(roomCode)
  const { data: system } = useSystemData(roomCode)
  const round = meta?.round ?? 1
  const gameState = meta?.state
  const { data: fibbageRound } = useFibbageRound(roomCode, round)

  const [promptIds, setPromptIds] = useState<string[]>([])
  const [scoreDeltas, setScoreDeltas] = useState<Record<string, number>>({})
  const transitioning = useRef(false)
  const resultsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nonHostPlayers = playerList.filter(p => !p.isHost)

  // Timer tick to re-evaluate effects
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 500)
    return () => clearInterval(id)
  }, [])

  // Start game when lobby loads
  useEffect(() => {
    if (!roomCode || !playerList.length || gameState !== 'lobby') return
    if (transitioning.current) return
    transitioning.current = true

    startFibbageGame(roomCode, round)
      .then(ids => {
        setPromptIds(ids)
        transitioning.current = false
      })
      .catch(console.error)
  }, [gameState, roomCode])

  // Sync promptIds from DB when round data arrives
  useEffect(() => {
    if (fibbageRound?.prompts && promptIds.length === 0) {
      setPromptIds(Object.keys(fibbageRound.prompts))
    }
  }, [fibbageRound])

  // Answering → Voting: all submitted OR timer expired
  useEffect(() => {
    if (gameState !== 'answering' || !fibbageRound || !system || !roomCode || transitioning.current) return
    if (promptIds.length === 0) return

    const totalSubmitted = Object.values(fibbageRound.prompts ?? {})
      .reduce((sum, p) => sum + Object.keys(p.submitted ?? {}).length, 0)
    const expected = nonHostPlayers.length * promptIds.length
    const allSubmitted = totalSubmitted >= expected

    const elapsed = (Date.now() - system.timerStartedAt) / 1000
    const timerExpired = elapsed >= system.timerDuration

    if (allSubmitted || timerExpired) {
      transitioning.current = true
      beginFibbageVoting(roomCode, round, fibbageRound, promptIds[0], nonHostPlayers)
        .then(() => { transitioning.current = false })
        .catch(console.error)
    }
  }, [gameState, fibbageRound, system, promptIds])

  // Voting → Results: all voted OR timer expired
  useEffect(() => {
    if (gameState !== 'voting' || !fibbageRound || !system || !roomCode || transitioning.current) return
    if (!fibbageRound.voting?.currentPromptId) return

    const voteCount = Object.keys(fibbageRound.voting.votes ?? {}).length
    const elapsed = (Date.now() - system.timerStartedAt) / 1000
    const timerExpired = elapsed >= system.timerDuration
    const allVoted = voteCount >= nonHostPlayers.length && nonHostPlayers.length > 0

    if (allVoted || timerExpired) {
      transitioning.current = true

      const promptId = fibbageRound.voting.currentPromptId
      const prompt = fibbageRound.prompts[promptId]
      const votes = fibbageRound.voting.votes ?? {}
      const fakesAuthored: Record<string, string> = {}
      for (const [pid, ans] of Object.entries(prompt?.playerEntries ?? {})) {
        fakesAuthored[ans] = pid
      }
      const result = calculateFibbageScores(votes, prompt?.realAnswer ?? '', fakesAuthored)
      setScoreDeltas(result.deltas)

      resolveFibbageVoting(roomCode, round, fibbageRound, nonHostPlayers)
        .then(() => { transitioning.current = false })
        .catch(console.error)
    }
  }, [gameState, fibbageRound, system])

  // Results → next prompt OR scoreboard
  useEffect(() => {
    if (gameState !== 'results' || !fibbageRound || !roomCode || transitioning.current) return

    const currentRound: FibbageRound = fibbageRound
    const currentPromptIds = promptIds

    if (resultsTimer.current) clearTimeout(resultsTimer.current)
    resultsTimer.current = setTimeout(async () => {
      if (transitioning.current) return
      transitioning.current = true

      const currentPromptId = currentRound.voting?.currentPromptId
      const currentIdx = currentPromptIds.indexOf(currentPromptId)
      const nextId = currentPromptIds[currentIdx + 1]

      if (nextId) {
        setScoreDeltas({})
        await beginFibbageVoting(roomCode, round, currentRound, nextId, nonHostPlayers)
      } else {
        await setRoomState(roomCode, 'scoreboard')
      }
      transitioning.current = false
    }, RESULTS_DISPLAY_MS)

    return () => { if (resultsTimer.current) clearTimeout(resultsTimer.current) }
  }, [gameState, fibbageRound])

  useEffect(() => {
    if (gameState === 'done') navigate('/')
  }, [gameState])

  // ── Render ──────────────────────────────────────────────────────────────────

  function renderAnswering() {
    const submittedCount = nonHostPlayers.filter(player =>
      Object.values(fibbageRound?.prompts ?? {}).some(p => p.submitted?.[player.id])
    ).length

    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-8 p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-display text-5xl" style={{ color: '#ff8c00' }}>🤥 Fib Finder</p>
          <p className="text-text-muted font-body text-2xl mt-2">Players are crafting their lies...</p>
        </motion.div>
        {system && (
          <CountdownTimer totalSeconds={system.timerDuration} startedAt={system.timerStartedAt} size={160} />
        )}
        <div className="flex items-center gap-3">
          <div className="font-display text-4xl text-neon-green">{submittedCount}</div>
          <div className="font-body text-text-muted text-2xl">/ {nonHostPlayers.length} ready</div>
        </div>
        <div className="mt-2">
          <PlayerList players={nonHostPlayers} compact />
        </div>
      </div>
    )
  }

  function renderVoting() {
    if (!fibbageRound?.voting?.currentPromptId || !system) return <LoadingSpinner size="lg" />
    const promptId = fibbageRound.voting.currentPromptId
    const prompt = fibbageRound.prompts?.[promptId]
    if (!prompt?.choices) return <LoadingSpinner size="lg" />

    return (
      <FibbageVotingTV
        promptText={prompt.text}
        choices={prompt.choices}
        votes={fibbageRound.voting.votes ?? {}}
        totalVoters={nonHostPlayers.length}
        system={system}
        promptNumber={promptIds.indexOf(promptId) + 1}
        totalPrompts={promptIds.length}
      />
    )
  }

  function renderResults() {
    if (!fibbageRound?.voting?.currentPromptId) return <LoadingSpinner size="lg" />
    const promptId = fibbageRound.voting.currentPromptId
    const prompt = fibbageRound.prompts?.[promptId]
    if (!prompt?.choices) return <LoadingSpinner size="lg" />

    const fakesAuthored: Record<string, string> = {}
    for (const [pid, ans] of Object.entries(prompt.playerEntries ?? {})) {
      fakesAuthored[ans] = pid
    }

    return (
      <div className="flex flex-col flex-1 p-6 gap-4">
        <div className="flex items-center justify-between">
          <p className="font-display text-2xl" style={{ color: '#ff8c00' }}>
            Prompt {promptIds.indexOf(promptId) + 1}/{promptIds.length} — Results
          </p>
        </div>
        <FibbageResults
          promptText={prompt.text}
          realAnswer={prompt.realAnswer}
          choices={prompt.choices}
          votes={fibbageRound.voting.votes ?? {}}
          fakesAuthored={fakesAuthored}
          allPlayers={nonHostPlayers}
          scoreDeltas={scoreDeltas}
        />
        <div className="mt-2">
          <ScoreBoard players={nonHostPlayers} deltaMap={scoreDeltas} compact />
        </div>
      </div>
    )
  }

  function renderScoreboard() {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-8 p-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <h2 className="font-display text-6xl neon-text-yellow text-center">🏆 FINAL SCORES</h2>
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
          🏠 Back to Home
        </motion.button>
      </div>
    )
  }

  if (!meta || gameState === 'lobby') {
    return (
      <TVLayout>
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner size="lg" label="Starting Fib Finder..." />
        </div>
      </TVLayout>
    )
  }

  return (
    <TVLayout>
      <div className="flex flex-col flex-1">
        <PhaseTransition phase={`${gameState}-${fibbageRound?.voting?.currentPromptId ?? ''}`}>
          {gameState === 'answering' && renderAnswering()}
          {gameState === 'voting' && renderVoting()}
          {gameState === 'results' && renderResults()}
          {gameState === 'scoreboard' && renderScoreboard()}
        </PhaseTransition>
      </div>
    </TVLayout>
  )
}
