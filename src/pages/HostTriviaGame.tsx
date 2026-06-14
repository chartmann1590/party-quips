import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import TVLayout from '../components/layout/TVLayout'
import PhaseTransition from '../components/transitions/PhaseTransition'
import TriviaQuestionTV from '../components/game/trivia/TriviaQuestionTV'
import TriviaResultsTV from '../components/game/trivia/TriviaResultsTV'
import ScoreBoard from '../components/shared/ScoreBoard'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import { useRoomMeta, usePlayers } from '../hooks/useRoom'
import { useTriviaRound, useSystemData } from '../hooks/useGameState'
import { useTvNarration } from '../hooks/useTvNarration'
import { useGameStore } from '../store/gameStore'
import { startTriviaRound, resolveTriviaRound, advanceTriviaOrFinish, resolveContentLibrary } from '../lib/gameEngine'
import type { ContentLibrary } from '../types/addOns'
import { calculateTriviaScores } from '../lib/scoring'
import { setRoomState, submitTriviaAnswer } from '../firebase/database'
import { getComputerPlayers, pickComputerTriviaAnswer } from '../lib/computerPlayer'
import { TOTAL_TRIVIA_ROUNDS } from '../types/trivia'

const RESULTS_DISPLAY_MS = 4500

export default function HostTriviaGame() {
  const navigate = useNavigate()
  const { roomCode } = useGameStore()
  const { data: meta } = useRoomMeta(roomCode)
  const { playerList } = usePlayers(roomCode)
  const { data: system } = useSystemData(roomCode)
  const round = meta?.round ?? 1
  const gameState = meta?.state
  const { data: triviaRound } = useTriviaRound(roomCode, round)

  const contentLibrary = useRef<ContentLibrary | null>(null)
  useEffect(() => {
    if (meta?.activeAddOns !== undefined && contentLibrary.current === null) {
      contentLibrary.current = resolveContentLibrary(meta.activeAddOns ?? [])
    }
  }, [meta?.activeAddOns])

  const [scoreDeltas, setScoreDeltas] = useState<Record<string, number>>({})
  const transitioning = useRef(false)
  const resultsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const computerActionKeys = useRef(new Set<string>())
  const nonHostPlayers = playerList.filter(p => !p.isHost)
  const narrationOptions = triviaRound?.question.displayOptions ?? triviaRound?.question.options ?? []
  const narrationCorrectIndex = triviaRound ? narrationOptions.indexOf(triviaRound.question.options[0]) : -1
  const narrationCorrectPlayers = Object.entries(triviaRound?.answers ?? {})
    .filter(([, idx]) => idx === narrationCorrectIndex)
    .map(([id]) => nonHostPlayers.find(p => p.id === id)?.name)
    .filter(Boolean)

  // Timer tick
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 500)
    return () => clearInterval(id)
  }, [])

  // Start first round when lobby loads
  useEffect(() => {
    if (!roomCode || !playerList.length || gameState !== 'lobby') return
    if (transitioning.current) return
    transitioning.current = true

    startTriviaRound(roomCode, round, contentLibrary.current ?? undefined)
      .then(() => { transitioning.current = false })
      .catch(console.error)
  }, [gameState, roomCode])

  // Computer players answer trivia from the host browser.
  useEffect(() => {
    if (gameState !== 'answering' || !triviaRound || !roomCode) return

    const displayOptions = triviaRound.question.displayOptions ?? triviaRound.question.options
    for (const computer of getComputerPlayers(nonHostPlayers)) {
      if (triviaRound.submitted?.[computer.id]) continue

      const key = `trivia-answer:${round}:${computer.id}`
      if (computerActionKeys.current.has(key)) continue
      computerActionKeys.current.add(key)

      submitTriviaAnswer(roomCode, round, computer.id, pickComputerTriviaAnswer(displayOptions.length))
        .catch(console.error)
    }
  }, [gameState, triviaRound, roomCode, round, nonHostPlayers.length])

  // Answering → Results: all submitted OR timer expired
  useEffect(() => {
    if (gameState !== 'answering' || !triviaRound || !system || !roomCode || transitioning.current) return

    const submittedCount = Object.keys(triviaRound.submitted ?? {}).length
    const allSubmitted = submittedCount >= nonHostPlayers.length && nonHostPlayers.length > 0
    const elapsed = (Date.now() - system.timerStartedAt) / 1000
    const timerExpired = elapsed >= system.timerDuration

    if (allSubmitted || timerExpired) {
      transitioning.current = true

      const displayOptions = triviaRound.question.displayOptions ?? triviaRound.question.options
      // options[0] is always the correct answer; find its index in the displayed (shuffled) array
      const correctIndex = displayOptions.indexOf(triviaRound.question.options[0])
      const answers = triviaRound.answers ?? {}
      const result = calculateTriviaScores(answers, correctIndex, system.timerStartedAt, system.timerDuration)
      setScoreDeltas(result.deltas)

      resolveTriviaRound(roomCode, round, answers, correctIndex, system.timerStartedAt)
        .then(() => { transitioning.current = false })
        .catch(console.error)
    }
  }, [gameState, triviaRound, system])

  // Results → next round or scoreboard
  useEffect(() => {
    if (gameState !== 'results' || !roomCode) return

    if (resultsTimer.current) clearTimeout(resultsTimer.current)
    resultsTimer.current = setTimeout(async () => {
      transitioning.current = true
      setScoreDeltas({})
      await advanceTriviaOrFinish(roomCode, round, contentLibrary.current ?? undefined)
      transitioning.current = false
    }, RESULTS_DISPLAY_MS)

    return () => { if (resultsTimer.current) clearTimeout(resultsTimer.current) }
  }, [gameState, round])

  useEffect(() => {
    if (gameState === 'done') navigate('/')
  }, [gameState])

  useTvNarration(
    gameState === 'answering' && triviaRound ? `trivia-question-${round}` : null,
    triviaRound
      ? `Deadly Trivia. Round ${round} of ${TOTAL_TRIVIA_ROUNDS}. ${triviaRound.question.category}. ${triviaRound.question.text}. ${narrationOptions.map((option, index) => `Option ${index + 1}. ${option}`).join('. ')}. Answer on your phones now.`
      : null
  )

  useTvNarration(
    gameState === 'results' && triviaRound ? `trivia-results-${round}` : null,
    triviaRound && narrationCorrectIndex >= 0
      ? `The correct answer was ${narrationOptions[narrationCorrectIndex]}. ${narrationCorrectPlayers.length ? `${narrationCorrectPlayers.join(', ')} got it right.` : 'Nobody got it right.'}`
      : null
  )

  useTvNarration(
    gameState === 'scoreboard' ? 'trivia-final-scoreboard' : null,
    nonHostPlayers.length
      ? `Final scores. ${[...nonHostPlayers].sort((a, b) => b.score - a.score).map((p, i) => `${i + 1}. ${p.name}, ${p.score} points`).join('. ')}.`
      : null
  )

  // ── Render ──────────────────────────────────────────────────────────────────

  function renderAnswering() {
    if (!triviaRound || !system) return <LoadingSpinner size="lg" />
    const displayOptions = triviaRound.question.displayOptions ?? triviaRound.question.options
    const submittedCount = Object.keys(triviaRound.submitted ?? {}).length

    return (
      <TriviaQuestionTV
        question={triviaRound.question.text}
        category={triviaRound.question.category}
        difficulty={triviaRound.question.difficulty}
        displayOptions={displayOptions}
        submittedCount={submittedCount}
        totalPlayers={nonHostPlayers.length}
        system={system}
        round={round}
        totalRounds={TOTAL_TRIVIA_ROUNDS}
      />
    )
  }

  function renderResults() {
    if (!triviaRound) return <LoadingSpinner size="lg" />
    const displayOptions = triviaRound.question.displayOptions ?? triviaRound.question.options
    const correctIndex = displayOptions.indexOf(triviaRound.question.options[0])

    return (
      <div className="flex flex-col flex-1 gap-4">
        <TriviaResultsTV
          question={triviaRound.question.text}
          displayOptions={displayOptions}
          correctIndex={correctIndex}
          answers={triviaRound.answers ?? {}}
          allPlayers={nonHostPlayers}
          scoreDeltas={scoreDeltas}
          round={round}
          totalRounds={TOTAL_TRIVIA_ROUNDS}
        />
        <div className="px-8 pb-4">
          <ScoreBoard players={nonHostPlayers} deltaMap={scoreDeltas} compact />
        </div>
      </div>
    )
  }

  function renderScoreboard() {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-8 p-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <h2 className="font-display text-6xl neon-text-yellow text-center">💀 SURVIVORS</h2>
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
          <LoadingSpinner size="lg" label="Starting Deadly Trivia..." />
        </div>
      </TVLayout>
    )
  }

  return (
    <TVLayout>
      <div className="flex flex-col flex-1">
        <PhaseTransition phase={`${gameState}-${round}`}>
          {gameState === 'answering' && renderAnswering()}
          {gameState === 'results' && renderResults()}
          {gameState === 'scoreboard' && renderScoreboard()}
        </PhaseTransition>
      </div>
    </TVLayout>
  )
}
