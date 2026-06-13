import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PhoneLayout from '../components/layout/PhoneLayout'
import PhaseTransition from '../components/transitions/PhaseTransition'
import AnswerInput from '../components/game/quiplash/AnswerInput'
import VoteButton from '../components/game/quiplash/VoteButton'
import FibInput from '../components/game/fibbage/FibInput'
import AnswerPicker from '../components/game/fibbage/AnswerPicker'
import ScoreBoard from '../components/shared/ScoreBoard'
import CountdownTimer from '../components/shared/CountdownTimer'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import { useRoomMeta, usePlayers } from '../hooks/useRoom'
import { useQuiplashRound, useSystemData, useFibbageRound } from '../hooks/useGameState'
import { useGameStore } from '../store/gameStore'
import {
  submitQuiplashAnswer,
  submitQuiplashVote,
  submitFibbageEntry,
  submitFibbageVote,
} from '../firebase/database'

export default function PlayerGamePage() {
  const navigate = useNavigate()
  const { roomCode, playerId } = useGameStore()

  const { data: meta } = useRoomMeta(roomCode)
  const { playerList } = usePlayers(roomCode)
  const { data: system } = useSystemData(roomCode)

  const round = meta?.round ?? 1
  const gameState = meta?.state
  const game = meta?.game ?? 'quiplash'

  const { data: quiplashRound } = useQuiplashRound(game === 'quiplash' ? roomCode : null, round)
  const { data: fibbageRound } = useFibbageRound(game === 'fibbage' ? roomCode : null, round)

  const [myVote, setMyVote] = useState<string | null>(null)
  const [fibChoice, setFibChoice] = useState<string | null>(null)

  useEffect(() => {
    setMyVote(null)
    setFibChoice(null)
  }, [round, gameState])

  useEffect(() => {
    if (gameState === 'done' || meta?.state === 'done') navigate('/')
  }, [meta?.state])

  if (!roomCode || !playerId) {
    navigate('/')
    return null
  }

  const myPlayer = playerList.find(p => p.id === playerId)
  const nonHostPlayers = playerList.filter(p => !p.isHost)

  // ── Quiplash: find this player's prompts ────────────────────────────────────
  const myQuiplashPrompts = quiplashRound
    ? Object.entries(quiplashRound.prompts ?? {}).filter(
        ([, p]) => p.playerA === playerId || p.playerB === playerId
      )
    : []

  async function handleQuiplashAnswer(promptId: string, answer: string) {
    if (!roomCode || !playerId) return
    await submitQuiplashAnswer(roomCode, round, promptId, playerId, answer)
  }

  async function handleQuiplashVote(chosenPlayerId: string) {
    if (!roomCode || !playerId) return
    setMyVote(chosenPlayerId)
    await submitQuiplashVote(roomCode, round, playerId, chosenPlayerId)
  }

  async function handleFibEntry(promptId: string, entry: string) {
    if (!roomCode || !playerId) return
    await submitFibbageEntry(roomCode, round, promptId, playerId, entry)
  }

  async function handleFibVote(choice: string) {
    if (!roomCode || !playerId) return
    setFibChoice(choice)
    await submitFibbageVote(roomCode, round, playerId, choice)
  }

  // ── Render helpers ─────────────────────────────────────────────────────────
  function renderQuiplashAnswering() {
    if (!quiplashRound) return <LoadingSpinner size="md" label="Loading prompts..." />
    if (myQuiplashPrompts.length === 0) return (
      <div className="flex flex-col items-center gap-4 flex-1 justify-center">
        <div className="text-6xl animate-bounce">⏳</div>
        <p className="font-display text-neon-purple text-2xl text-center">You're on the bench!</p>
        <p className="text-text-muted font-body text-center">You got lucky — no prompts this round.</p>
        {system && (
          <CountdownTimer totalSeconds={system.timerDuration} startedAt={system.timerStartedAt} size={80} />
        )}
      </div>
    )

    return (
      <div className="flex flex-col gap-5">
        {system && (
          <div className="flex justify-between items-center">
            <p className="font-display text-neon-purple text-2xl">Round {round}</p>
            <CountdownTimer totalSeconds={system.timerDuration} startedAt={system.timerStartedAt} size={60} />
          </div>
        )}
        {myQuiplashPrompts.map(([promptId, prompt], i) => (
          <AnswerInput
            key={promptId}
            promptText={prompt.text}
            submitted={!!prompt.submitted?.[playerId ?? '']}
            onSubmit={(answer) => handleQuiplashAnswer(promptId, answer)}
          />
        ))}
      </div>
    )
  }

  function renderQuiplashVoting() {
    if (!quiplashRound?.voting?.currentPromptId) return (
      <div className="flex flex-col items-center gap-4 flex-1 justify-center">
        <LoadingSpinner size="md" label="Loading vote..." />
      </div>
    )

    const currentPromptId = quiplashRound.voting.currentPromptId
    const prompt = quiplashRound.prompts?.[currentPromptId]
    if (!prompt) return <LoadingSpinner size="md" />

    const isAuthor = prompt.playerA === playerId || prompt.playerB === playerId
    const answerA = prompt.answers?.[prompt.playerA] ?? ''
    const answerB = prompt.answers?.[prompt.playerB] ?? ''
    const votesForA = Object.values(quiplashRound.voting.votes ?? {}).filter(v => v === prompt.playerA).length
    const votesForB = Object.values(quiplashRound.voting.votes ?? {}).filter(v => v === prompt.playerB).length

    if (isAuthor) {
      return (
        <div className="flex flex-col items-center gap-4 flex-1 justify-center">
          <div className="text-6xl animate-pulse">😬</div>
          <p className="font-display text-neon-yellow text-2xl text-center">Your answer is up!</p>
          <div className="game-card w-full text-center">
            <p className="font-body text-text-muted text-sm mb-1">The prompt:</p>
            <p className="font-body text-text-primary text-lg">{prompt.text}</p>
          </div>
          <p className="text-text-muted font-body text-center">Watch the TV to see how people vote!</p>
          {system && (
            <CountdownTimer totalSeconds={system.timerDuration} startedAt={system.timerStartedAt} size={60} />
          )}
        </div>
      )
    }

    if (myVote) {
      return (
        <div className="flex flex-col items-center gap-4 flex-1 justify-center">
          <div className="text-6xl">✅</div>
          <p className="font-display text-neon-green text-2xl text-center">Vote cast!</p>
          <p className="text-text-muted font-body text-center">Waiting for others...</p>
          {system && (
            <CountdownTimer totalSeconds={system.timerDuration} startedAt={system.timerStartedAt} size={60} />
          )}
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-4">
        {system && (
          <div className="flex justify-between items-center">
            <p className="font-display text-neon-purple text-xl">Vote!</p>
            <CountdownTimer totalSeconds={system.timerDuration} startedAt={system.timerStartedAt} size={60} />
          </div>
        )}
        <div className="game-card text-center">
          <p className="font-body text-text-primary font-semibold text-lg">{prompt.text}</p>
        </div>
        <VoteButton
          answer={answerA}
          label="A"
          onVote={() => handleQuiplashVote(prompt.playerA)}
          selected={myVote === prompt.playerA}
        />
        <VoteButton
          answer={answerB}
          label="B"
          onVote={() => handleQuiplashVote(prompt.playerB)}
          selected={myVote === prompt.playerB}
        />
      </div>
    )
  }

  function renderFibbageAnswering() {
    if (!fibbageRound) return <LoadingSpinner size="md" label="Loading prompts..." />

    const myPrompts = Object.entries(fibbageRound.prompts ?? {})

    return (
      <div className="flex flex-col gap-5">
        {system && (
          <div className="flex justify-between items-center">
            <p className="font-display text-2xl" style={{ color: '#ff8c00' }}>Fib Finder</p>
            <CountdownTimer totalSeconds={system.timerDuration} startedAt={system.timerStartedAt} size={60} />
          </div>
        )}
        {myPrompts.map(([promptId, prompt]) => (
          <FibInput
            key={promptId}
            promptText={prompt.text}
            realAnswer={prompt.realAnswer}
            submitted={!!prompt.submitted?.[playerId ?? '']}
            submittedAnswer={prompt.playerEntries?.[playerId ?? '']}
            onSubmit={(entry) => handleFibEntry(promptId, entry)}
          />
        ))}
      </div>
    )
  }

  function renderFibbageVoting() {
    if (!fibbageRound?.voting?.currentPromptId) return <LoadingSpinner size="md" />
    const promptId = fibbageRound.voting.currentPromptId
    const prompt = fibbageRound.prompts?.[promptId]
    if (!prompt || !prompt.choices) return <LoadingSpinner size="md" />

    if (fibChoice) {
      return (
        <div className="flex flex-col items-center gap-4 flex-1 justify-center">
          <div className="text-6xl">✅</div>
          <p className="font-display text-2xl" style={{ color: '#ff8c00' }}>Vote cast!</p>
          <p className="text-text-muted font-body text-center">Watch the TV to see who got fooled!</p>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-4">
        {system && (
          <div className="flex justify-end">
            <CountdownTimer totalSeconds={system.timerDuration} startedAt={system.timerStartedAt} size={60} />
          </div>
        )}
        <AnswerPicker
          promptText={prompt.text}
          choices={prompt.choices}
          selectedChoice={fibChoice ?? undefined}
          onVote={handleFibVote}
        />
      </div>
    )
  }

  function renderResults() {
    return (
      <div className="flex flex-col items-center gap-4 flex-1 justify-center">
        <div className="text-6xl">📊</div>
        <p className="font-display text-neon-purple text-2xl text-center">Results incoming...</p>
        <p className="text-text-muted font-body text-center">Watch the big screen!</p>
        {myPlayer && (
          <div className="game-card w-full text-center">
            <p className="text-text-muted font-body text-sm">Your score</p>
            <p className="font-display text-4xl text-neon-yellow">{myPlayer.score.toLocaleString()}</p>
          </div>
        )}
      </div>
    )
  }

  function renderScoreboard() {
    return (
      <div className="flex flex-col gap-4 flex-1">
        <h2 className="font-display text-3xl neon-text-yellow text-center">🏆 Final Scores</h2>
        <ScoreBoard players={nonHostPlayers} isFinal />
        <button className="btn-primary mt-auto" onClick={() => navigate('/')}>
          🏠 Back to Home
        </button>
      </div>
    )
  }

  return (
    <PhoneLayout>
      <div className="flex flex-col flex-1 gap-2">
        {/* Header */}
        <div className="flex items-center justify-between py-2">
          <span className="font-display text-neon-purple text-lg">{roomCode}</span>
          {myPlayer && (
            <span className="font-body text-text-muted text-sm">
              {myPlayer.score.toLocaleString()} pts
            </span>
          )}
        </div>

        <div className="flex flex-col flex-1">
          <PhaseTransition phase={`${gameState}-${round}-${
            game === 'quiplash' ? quiplashRound?.voting?.currentPromptId ?? '' :
            game === 'fibbage' ? fibbageRound?.voting?.currentPromptId ?? '' : ''
          }`}>
            {game === 'quiplash' && gameState === 'answering' && renderQuiplashAnswering()}
            {game === 'quiplash' && gameState === 'voting' && renderQuiplashVoting()}
            {game === 'fibbage' && gameState === 'answering' && renderFibbageAnswering()}
            {game === 'fibbage' && gameState === 'voting' && renderFibbageVoting()}
            {(gameState === 'results') && renderResults()}
            {gameState === 'scoreboard' && renderScoreboard()}
            {(!gameState || gameState === 'lobby') && (
              <div className="flex flex-1 items-center justify-center">
                <LoadingSpinner size="md" label="Game starting..." />
              </div>
            )}
          </PhaseTransition>
        </div>
      </div>
    </PhoneLayout>
  )
}
