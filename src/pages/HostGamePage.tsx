/**
 * HostGamePage — the game coordinator.
 * Only the host's browser runs this page; it drives all state transitions.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import TVLayout from '../components/layout/TVLayout'
import PhaseTransition from '../components/transitions/PhaseTransition'
import VotingPair from '../components/game/quiplash/VotingPair'
import QuiplashResults from '../components/game/quiplash/QuiplashResults'
import ScoreBoard from '../components/shared/ScoreBoard'
import CountdownTimer from '../components/shared/CountdownTimer'
import PlayerList from '../components/lobby/PlayerList'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import HostFibbageGame from './HostFibbageGame'
import HostTriviaGame from './HostTriviaGame'
import { useRoomMeta, usePlayers } from '../hooks/useRoom'
import { useQuiplashRound, useSystemData } from '../hooks/useGameState'
import { useGameStore } from '../store/gameStore'
import {
  startQuiplashGame,
  beginQuiplashVoting,
  resolveQuiplashVoting,
  advanceToNextQuiplashPrompt,
  startNextRoundOrFinish,
} from '../lib/gameEngine'
import { calculateQuiplashScores } from '../lib/scoring'
import { setRoomState } from '../firebase/database'
import { ROUNDS_TOTAL, RESULTS_TIME_SECONDS } from '../types/quiplash'

export default function HostGamePage() {
  const navigate = useNavigate()
  const { roomCode } = useGameStore()

  const { data: meta } = useRoomMeta(roomCode)
  const { playerList } = usePlayers(roomCode)
  const { data: system } = useSystemData(roomCode)
  const round = meta?.round ?? 1
  const gameState = meta?.state

  const { data: roundData } = useQuiplashRound(roomCode, round)

  // Track prompt IDs for this round
  const [promptIds, setPromptIds] = useState<string[]>([])
  const usedPromptIds = useRef(new Set<string>())
  const [scoreDeltas, setScoreDeltas] = useState<Record<string, number>>({})

  // Guard against double-firing transitions
  const transitioning = useRef(false)
  const resultsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Kick off the game when this page loads (Quiplash only for now)
  useEffect(() => {
    if (!roomCode || !playerList.length || gameState !== 'lobby') return
    if (meta?.game !== 'quiplash') return
    if (transitioning.current) return
    transitioning.current = true

    const nonHostPlayers = playerList.filter(p => !p.isHost)
    startQuiplashGame(roomCode, nonHostPlayers, round, usedPromptIds.current)
      .then(ids => {
        setPromptIds(ids)
        transitioning.current = false
      })
      .catch(err => {
        transitioning.current = false
        console.error(err)
      })
  }, [gameState, roomCode, meta?.game, playerList.length])

  // Collect promptIds from roundData when it arrives
  useEffect(() => {
    if (roundData?.prompts && promptIds.length === 0) {
      setPromptIds(Object.keys(roundData.prompts))
    }
  }, [roundData])

  // Tick for timer updates — also drives transition effects so they re-check
  // timer expiry every 500 ms even when no Firebase data changes (e.g. zero voters).
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 500)
    return () => clearInterval(id)
  }, [])

  // ── Answering → Voting transition ──────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'answering' || !roundData || !system || !roomCode || transitioning.current) return

    const nonHostPlayers = playerList.filter(p => !p.isHost)
    const totalAnswers = nonHostPlayers.length * (round < ROUNDS_TOTAL ? 2 : 1)

    let submitted = 0
    for (const prompt of Object.values(roundData.prompts ?? {})) {
      submitted += Object.keys(prompt.submitted ?? {}).length
    }
    const allSubmitted = submitted >= totalAnswers

    const elapsed = (Date.now() - system.timerStartedAt) / 1000
    const timerExpired = elapsed >= system.timerDuration

    if ((allSubmitted || timerExpired) && promptIds.length > 0) {
      transitioning.current = true
      beginQuiplashVoting(roomCode, round, promptIds)
        .then(() => { transitioning.current = false })
        .catch(console.error)
    }
  }, [gameState, roundData, system, promptIds, tick])

  // ── Voting → Results transition ────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'voting' || !roundData || !system || !roomCode || transitioning.current) return
    if (!roundData.voting?.currentPromptId) return

    const nonHostPlayers = playerList.filter(p => !p.isHost)
    const currentPromptId = roundData.voting.currentPromptId
    const prompt = roundData.prompts?.[currentPromptId]
    if (!prompt) return

    const voters = nonHostPlayers.filter(p => p.id !== prompt.playerA && p.id !== prompt.playerB)
    const voteCount = Object.keys(roundData.voting.votes ?? {}).length

    const elapsed = (Date.now() - system.timerStartedAt) / 1000
    const timerExpired = elapsed >= system.timerDuration
    const allVoted = voteCount >= voters.length && voters.length > 0

    if (allVoted || timerExpired) {
      transitioning.current = true

      // Calculate scores before transitioning
      const votes = roundData.voting.votes ?? {}
      const allPlayerIds = nonHostPlayers.map(p => p.id)
      const result = calculateQuiplashScores(votes, prompt.playerA, prompt.playerB, allPlayerIds, round)
      setScoreDeltas({
        [prompt.playerA]: result.playerADelta,
        [prompt.playerB]: result.playerBDelta,
      })

      resolveQuiplashVoting(roomCode, round, roundData, nonHostPlayers)
        .then(() => { transitioning.current = false })
        .catch(console.error)
    }
  }, [gameState, roundData, system, tick])

  // ── Results → next prompt or next round ────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'results' || !roundData || !roomCode || transitioning.current) return

    if (resultsTimer.current) clearTimeout(resultsTimer.current)
    resultsTimer.current = setTimeout(async () => {
      if (transitioning.current) return
      transitioning.current = true

      const currentPromptId = roundData.voting?.currentPromptId
      const result = await advanceToNextQuiplashPrompt(roomCode, round, promptIds, currentPromptId)

      if (result === 'round_done') {
        const nonHostPlayers = playerList.filter(p => !p.isHost)
        const outcome = await startNextRoundOrFinish(roomCode, round, nonHostPlayers, usedPromptIds.current)
        if (outcome === 'next_round') {
          setPromptIds([])
          setScoreDeltas({})
        }
      }
      transitioning.current = false
    }, RESULTS_TIME_SECONDS * 1000)

    return () => { if (resultsTimer.current) clearTimeout(resultsTimer.current) }
  }, [gameState, roundData])

  // ── Navigate on done ───────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState === 'done') navigate('/')
  }, [gameState])

  // ── Render helpers ─────────────────────────────────────────────────────────
  const nonHostPlayers = playerList.filter(p => !p.isHost)
  const getPlayer = (id: string) => nonHostPlayers.find(p => p.id === id)

  function renderAnsweringPhase() {
    if (!roundData || !system) return <LoadingSpinner size="lg" />

    const submitted = nonHostPlayers.filter(player =>
      Object.values(roundData.prompts ?? {}).some(p =>
        p.submitted?.[player.id]
      )
    ).length

    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-8 p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-display text-neon-purple text-5xl">Round {round} of {ROUNDS_TOTAL}</p>
          <p className="text-text-muted font-body text-2xl mt-2">Players are writing their answers...</p>
        </motion.div>
        <CountdownTimer
          totalSeconds={system.timerDuration}
          startedAt={system.timerStartedAt}
          size={160}
        />
        <div className="flex items-center gap-3">
          <div className="font-display text-4xl text-neon-green">{submitted}</div>
          <div className="font-body text-text-muted text-2xl">/ {nonHostPlayers.length} answered</div>
        </div>
        <div className="mt-4">
          <PlayerList players={nonHostPlayers} compact />
        </div>
      </div>
    )
  }

  function renderVotingPhase() {
    if (!roundData || !system) return <LoadingSpinner size="lg" />

    const currentPromptId = roundData.voting?.currentPromptId
    const prompt = roundData.prompts?.[currentPromptId]
    if (!prompt) return <LoadingSpinner size="lg" />

    const answerA = prompt.answers?.[prompt.playerA] ?? ''
    const answerB = prompt.answers?.[prompt.playerB] ?? ''
    const votes = roundData.voting?.votes ?? {}
    const voters = nonHostPlayers.filter(p => p.id !== prompt.playerA && p.id !== prompt.playerB)
    const votesForA = Object.values(votes).filter(v => v === prompt.playerA).length
    const votesForB = Object.values(votes).filter(v => v === prompt.playerB).length
    const totalVoters = voters.length
    const votesDone = Object.keys(votes).length

    return (
      <div className="flex flex-col flex-1 p-6 gap-6">
        <div className="flex items-center justify-between">
          <span className="text-text-muted font-body text-lg">
            Round {round} • {promptIds.indexOf(currentPromptId) + 1}/{promptIds.length}
          </span>
          <div className="flex items-center gap-4">
            <span className="text-text-muted font-body">{votesDone}/{voters.length} voted</span>
            <CountdownTimer
              totalSeconds={system.timerDuration}
              startedAt={system.timerStartedAt}
              size={70}
            />
          </div>
        </div>
        <VotingPair
          promptText={prompt.text}
          answerA={answerA}
          answerB={answerB}
          playerA={getPlayer(prompt.playerA)}
          playerB={getPlayer(prompt.playerB)}
          votesForA={votesForA}
          votesForB={votesForB}
          totalVoters={totalVoters}
          revealed={false}
        />
      </div>
    )
  }

  function renderResultsPhase() {
    if (!roundData) return <LoadingSpinner size="lg" />

    const currentPromptId = roundData.voting?.currentPromptId
    const prompt = roundData.prompts?.[currentPromptId]
    if (!prompt) return <LoadingSpinner size="lg" />

    const answerA = prompt.answers?.[prompt.playerA] ?? ''
    const answerB = prompt.answers?.[prompt.playerB] ?? ''
    const votes = roundData.voting?.votes ?? {}
    const allPlayerIds = nonHostPlayers.map(p => p.id)
    const result = calculateQuiplashScores(votes, prompt.playerA, prompt.playerB, allPlayerIds, round)

    const votesForA = Object.entries(votes).filter(([, v]) => v === prompt.playerA).map(([id]) => id)
    const votesForB = Object.entries(votes).filter(([, v]) => v === prompt.playerB).map(([id]) => id)

    return (
      <div className="flex flex-col flex-1 p-6 gap-4">
        <QuiplashResults
          promptText={prompt.text}
          answerA={answerA}
          answerB={answerB}
          playerA={getPlayer(prompt.playerA)}
          playerB={getPlayer(prompt.playerB)}
          votesForA={votesForA}
          votesForB={votesForB}
          deltaA={result.playerADelta}
          deltaB={result.playerBDelta}
          quiplash={result.quiplash}
          allPlayers={nonHostPlayers}
        />
        <div className="mt-auto">
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

  // Dispatch to game-specific coordinators
  if (meta?.game === 'fibbage') return <HostFibbageGame />
  if (meta?.game === 'trivia') return <HostTriviaGame />

  if (!meta || gameState === 'lobby') {
    return (
      <TVLayout>
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner size="lg" label="Starting game..." />
        </div>
      </TVLayout>
    )
  }

  return (
    <TVLayout>
      <div className="flex flex-col flex-1">
        <PhaseTransition phase={`${gameState}-${round}-${roundData?.voting?.currentPromptId ?? ''}`}>
          {gameState === 'answering' && renderAnsweringPhase()}
          {gameState === 'voting' && renderVotingPhase()}
          {gameState === 'results' && renderResultsPhase()}
          {gameState === 'scoreboard' && renderScoreboard()}
        </PhaseTransition>
      </div>
    </TVLayout>
  )
}
