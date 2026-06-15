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
import { useTvNarration } from '../hooks/useTvNarration'
import { waitForCurrentNarration } from '../lib/tvNarration'
import { useGameStore } from '../store/gameStore'
import {
  startQuiplashGame,
  beginQuiplashVoting,
  resolveQuiplashVoting,
  advanceToNextQuiplashPrompt,
  startNextRoundOrFinish,
  resolveContentLibrary,
} from '../lib/gameEngine'
import type { ContentLibrary } from '../types/addOns'
import { generateAutoQuip } from '../lib/autoQuip'
import { submitAutoQuip, submitQuiplashVote } from '../firebase/database'
import { calculateQuiplashScores } from '../lib/scoring'
import { setRoomState } from '../firebase/database'
import { getComputerPlayers, pickComputerQuiplashVote } from '../lib/computerPlayer'
import { ROUNDS_TOTAL, RESULTS_TIME_SECONDS } from '../types/quiplash'

export default function HostGamePage() {
  const navigate = useNavigate()
  const { roomCode, clearSession } = useGameStore()

  const { data: meta } = useRoomMeta(roomCode)
  const { playerList } = usePlayers(roomCode)
  const { data: system } = useSystemData(roomCode)
  const round = meta?.round ?? 1
  const gameState = meta?.state

  const { data: roundData } = useQuiplashRound(roomCode, round)

  // Build content library from active add-ons (resolved once when meta arrives)
  const contentLibrary = useRef<ContentLibrary | null>(null)
  useEffect(() => {
    if (meta?.activeAddOns !== undefined && contentLibrary.current === null) {
      contentLibrary.current = resolveContentLibrary(meta.activeAddOns ?? [])
    }
  }, [meta?.activeAddOns])

  // Track prompt IDs for this round
  const [promptIds, setPromptIds] = useState<string[]>([])
  const usedPromptIds = useRef(new Set<string>())
  const [scoreDeltas, setScoreDeltas] = useState<Record<string, number>>({})

  // Guard against double-firing transitions
  const transitioning = useRef(false)
  const resultsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const computerActionKeys = useRef(new Set<string>())

  // Kick off the game when this page loads (Quiplash only for now)
  useEffect(() => {
    if (!roomCode || !playerList.length || gameState !== 'lobby') return
    if (meta?.game !== 'quiplash') return
    if (transitioning.current) return
    transitioning.current = true

    const nonHostPlayers = playerList.filter(p => !p.isHost)
    startQuiplashGame(roomCode, nonHostPlayers, round, usedPromptIds.current, contentLibrary.current ?? undefined)
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

  // Computer players answer their assigned prompts from the host browser.
  useEffect(() => {
    if (gameState !== 'answering' || !roundData || !roomCode) return

    const computerPlayers = getComputerPlayers(playerList)
    if (computerPlayers.length === 0) return

    for (const [promptId, prompt] of Object.entries(roundData.prompts ?? {})) {
      for (const computer of computerPlayers) {
        if (prompt.playerA !== computer.id && prompt.playerB !== computer.id) continue
        if (prompt.submitted?.[computer.id]) continue

        const key = `quiplash-answer:${round}:${promptId}:${computer.id}`
        if (computerActionKeys.current.has(key)) continue
        computerActionKeys.current.add(key)

        generateAutoQuip(prompt.text)
          .then(answer => submitAutoQuip(roomCode, round, promptId, computer.id, answer))
          .catch(console.error)
      }
    }
  }, [gameState, roundData, roomCode, round, playerList.length])

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
    if (!playerList.length) return

    const nonHostPlayers = playerList.filter(p => !p.isHost)
    const totalAnswers = Object.values(roundData.prompts ?? {}).reduce((total, prompt) => {
      return total + new Set([prompt.playerA, prompt.playerB]).size
    }, 0)

    let submitted = 0
    for (const prompt of Object.values(roundData.prompts ?? {})) {
      submitted += Object.keys(prompt.submitted ?? {}).length
    }
    const allSubmitted = submitted >= totalAnswers

    const elapsed = (Date.now() - system.timerStartedAt) / 1000
    const timerExpired = elapsed >= system.timerDuration

    if ((allSubmitted || timerExpired) && promptIds.length > 0) {
      transitioning.current = true
      ;(async () => {
        // Generate auto-quips for players who didn't answer before timer expired
        if (timerExpired && !allSubmitted) {
          const missing: { promptId: string; playerId: string; promptText: string }[] = []
          for (const [promptId, prompt] of Object.entries(roundData.prompts ?? {})) {
            for (const pid of [prompt.playerA, prompt.playerB]) {
              if (!prompt.submitted?.[pid]) {
                missing.push({ promptId, playerId: pid, promptText: prompt.text })
              }
            }
          }
          if (missing.length > 0) {
            await Promise.all(
              missing.map(({ promptId, playerId, promptText }) =>
                generateAutoQuip(promptText).then(answer =>
                  submitAutoQuip(roomCode!, round, promptId, playerId, answer)
                )
              )
            )
          }
        }
        await beginQuiplashVoting(roomCode!, round, promptIds)
        transitioning.current = false
      })().catch(err => {
        transitioning.current = false
        console.error(err)
      })
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

    for (const computer of getComputerPlayers(voters)) {
      if (roundData.voting.votes?.[computer.id]) continue

      const key = `quiplash-vote:${round}:${currentPromptId}:${computer.id}`
      if (computerActionKeys.current.has(key)) continue
      computerActionKeys.current.add(key)

      submitQuiplashVote(roomCode, round, computer.id, pickComputerQuiplashVote(prompt.playerA, prompt.playerB))
        .catch(console.error)
    }

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
    if (gameState !== 'results' || !roundData || !roomCode) return

    if (resultsTimer.current) clearTimeout(resultsTimer.current)
    resultsTimer.current = setTimeout(async () => {
      transitioning.current = true
      // Wait for narrator to finish before advancing (cap at 12s so we never hang)
      await Promise.race([waitForCurrentNarration(), new Promise(r => setTimeout(r, 12000))])

      const currentPromptId = roundData.voting?.currentPromptId
      const result = await advanceToNextQuiplashPrompt(roomCode, round, promptIds, currentPromptId)

      if (result === 'round_done') {
        const nonHostPlayers = playerList.filter(p => !p.isHost)
        const outcome = await startNextRoundOrFinish(roomCode, round, nonHostPlayers, usedPromptIds.current, contentLibrary.current ?? undefined)
        if (outcome === 'next_round') {
          setPromptIds([])
          setScoreDeltas({})
        }
      }
      transitioning.current = false
    }, RESULTS_TIME_SECONDS * 1000)

    return () => { if (resultsTimer.current) clearTimeout(resultsTimer.current) }
  }, [gameState, roundData, promptIds])

  // ── Navigate on done ───────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState === 'done') {
      clearSession()
      navigate('/')
    }
  }, [gameState])

  // ── Render helpers ─────────────────────────────────────────────────────────
  const nonHostPlayers = playerList.filter(p => !p.isHost)
  const getPlayer = (id: string) => nonHostPlayers.find(p => p.id === id)
  const currentPromptId = roundData?.voting?.currentPromptId
  const currentPrompt = currentPromptId ? roundData?.prompts?.[currentPromptId] : undefined
  const currentAnswerA = currentPrompt ? currentPrompt.answers?.[currentPrompt.playerA] ?? '' : ''
  const currentAnswerB = currentPrompt ? currentPrompt.answers?.[currentPrompt.playerB] ?? '' : ''
  const currentVotes = roundData?.voting?.votes ?? {}
  const currentVotesForA = currentPrompt
    ? Object.values(currentVotes).filter(v => v === currentPrompt.playerA).length
    : 0
  const currentVotesForB = currentPrompt
    ? Object.values(currentVotes).filter(v => v === currentPrompt.playerB).length
    : 0

  useTvNarration(
    meta?.game === 'quiplash' && gameState === 'answering' ? `quiplash-answering-${round}` : null,
    `Round ${round} of ${ROUNDS_TOTAL}, everyone! Time to put those big brains to work. Check your phones and write the funniest thing you can think of. No pressure. Well... some pressure.`
  )

  useTvNarration(
    meta?.game === 'quiplash' && gameState === 'voting' && currentPromptId && currentPrompt
      ? `quiplash-voting-${round}-${currentPromptId}`
      : null,
    currentPrompt
      ? `${currentPrompt.text}. Option A — ${currentAnswerA || 'absolutely nothing, wow.'}. Option B — ${currentAnswerB || 'also nothing, incredible.'}. Vote for the one that made you snort. Or the one you wrote. We honestly can't tell.`
      : null
  )

  useTvNarration(
    meta?.game === 'quiplash' && gameState === 'results' && currentPromptId && currentPrompt
      ? `quiplash-results-${round}-${currentPromptId}`
      : null,
    currentPrompt
      ? `Results are in! ${currentPrompt.text}. ${getPlayer(currentPrompt.playerA)?.name ?? 'Player A'} grabbed ${currentVotesForA} ${currentVotesForA === 1 ? 'vote' : 'votes'}! ${getPlayer(currentPrompt.playerB)?.name ?? 'Player B'} snagged ${currentVotesForB} ${currentVotesForB === 1 ? 'vote' : 'votes'}!${currentVotesForA === currentVotesForB ? ' A tie! Absolute chaos. Nobody wins. Everybody loses.' : ''}`
      : null
  )

  useTvNarration(
    meta?.game === 'quiplash' && gameState === 'scoreboard' ? 'quiplash-final-scoreboard' : null,
    (() => {
      if (!nonHostPlayers.length) return null
      const sorted = [...nonHostPlayers].sort((a, b) => b.score - a.score)
      const scores = sorted.map((p, i) => `${i + 1}. ${p.name}, ${p.score} points`).join('. ')
      return `That's all, folks! Final scores: ${scores}. Our champion is ${sorted[0].name}! Everyone else... tried their best. And that counts for something. Probably.`
    })()
  )

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
          autoQuippedA={!!prompt.autoQuipped?.[prompt.playerA]}
          autoQuippedB={!!prompt.autoQuipped?.[prompt.playerB]}
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
          autoQuippedA={!!prompt.autoQuipped?.[prompt.playerA]}
          autoQuippedB={!!prompt.autoQuipped?.[prompt.playerB]}
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
