import { VOTE_SCORE_PER_VOTER, QUIPLASH_BONUS, ROUND_MULTIPLIERS } from '../types/quiplash'
import { FIBBAGE_FOOL_POINTS, FIBBAGE_TRUTH_POINTS } from '../types/fibbage'
import { SKETCHBLUFF_ARTIST_BONUS, SKETCHBLUFF_FOOL_POINTS, SKETCHBLUFF_TRUTH_POINTS } from '../types/sketchbluff'
import { TRIVIA_CORRECT_POINTS, TRIVIA_SPEED_BONUS } from '../types/trivia'

// ── Quiplash ──────────────────────────────────────────────────────────────────

export interface QuiplashScoreResult {
  playerADelta: number
  playerBDelta: number
  quiplash: boolean
  noVotes: boolean
}

export function calculateQuiplashScores(
  votes: Record<string, string>, // voterId -> playerId (A or B)
  playerAId: string,
  playerBId: string,
  allPlayerIds: string[],
  round: number
): QuiplashScoreResult {
  const multiplier = ROUND_MULTIPLIERS[round] ?? 1
  const voters = allPlayerIds.filter(id => id !== playerAId && id !== playerBId)

  const votesForA = Object.values(votes).filter(v => v === playerAId).length
  const votesForB = Object.values(votes).filter(v => v === playerBId).length
  const totalVotes = votesForA + votesForB

  if (totalVotes === 0) {
    return { playerADelta: 0, playerBDelta: 0, quiplash: false, noVotes: true }
  }

  const allVotedForA = votesForA === voters.length && voters.length > 0
  const allVotedForB = votesForB === voters.length && voters.length > 0

  const playerADelta = allVotedForA
    ? QUIPLASH_BONUS * multiplier
    : Math.round(votesForA * VOTE_SCORE_PER_VOTER * multiplier)

  const playerBDelta = allVotedForB
    ? QUIPLASH_BONUS * multiplier
    : Math.round(votesForB * VOTE_SCORE_PER_VOTER * multiplier)

  return {
    playerADelta,
    playerBDelta,
    quiplash: allVotedForA || allVotedForB,
    noVotes: false,
  }
}

// ── Fibbage ───────────────────────────────────────────────────────────────────

export interface FibbageScoreResult {
  // playerId -> score delta
  deltas: Record<string, number>
  fools: Record<string, string[]>   // answer author -> list of player IDs fooled
}

export function calculateFibbageScores(
  votes: Record<string, string>,       // voterId -> chosen string
  realAnswer: string,
  fakesAuthored: Record<string, string> // answer string -> playerId who wrote it
): FibbageScoreResult {
  const deltas: Record<string, number> = {}
  const fools: Record<string, string[]> = {}

  for (const [voterId, choice] of Object.entries(votes)) {
    if (choice === realAnswer) {
      // Voted for truth
      deltas[voterId] = (deltas[voterId] ?? 0) + FIBBAGE_TRUTH_POINTS
    } else {
      // Voted for a fake
      const authorId = fakesAuthored[choice]
      if (authorId) {
        deltas[authorId] = (deltas[authorId] ?? 0) + FIBBAGE_FOOL_POINTS
        fools[authorId] = [...(fools[authorId] ?? []), voterId]
      }
    }
  }

  return { deltas, fools }
}

// ── Sketch Bluff ─────────────────────────────────────────────────────────────

export interface SketchBluffScoreResult {
  deltas: Record<string, number>
  fooled: Record<string, string[]>
  correctVoters: string[]
}

export function calculateSketchBluffScores(
  votes: Record<string, string>,
  realChoiceId: string,
  fakeChoiceAuthors: Record<string, string>,
  artistId: string
): SketchBluffScoreResult {
  const deltas: Record<string, number> = {}
  const fooled: Record<string, string[]> = {}
  const correctVoters: string[] = []

  for (const [voterId, choiceId] of Object.entries(votes)) {
    if (choiceId === realChoiceId) {
      correctVoters.push(voterId)
      deltas[voterId] = (deltas[voterId] ?? 0) + SKETCHBLUFF_TRUTH_POINTS
      deltas[artistId] = (deltas[artistId] ?? 0) + SKETCHBLUFF_ARTIST_BONUS
      continue
    }

    const authorId = fakeChoiceAuthors[choiceId]
    if (authorId && authorId !== voterId) {
      deltas[authorId] = (deltas[authorId] ?? 0) + SKETCHBLUFF_FOOL_POINTS
      fooled[authorId] = [...(fooled[authorId] ?? []), voterId]
    }
  }

  return { deltas, fooled, correctVoters }
}

// ── Trivia ────────────────────────────────────────────────────────────────────

export interface TriviaScoreResult {
  deltas: Record<string, number>
  correct: string[]  // playerIds who got it right
}

export function calculateTriviaScores(
  answers: Record<string, number>,      // playerId -> chosen index
  correctIndex: number,
  timerStartedAt: number,
  timerDuration: number
): TriviaScoreResult {
  const deltas: Record<string, number> = {}
  const correct: string[] = []
  const halfTime = timerStartedAt + (timerDuration / 2) * 1000

  for (const [playerId, chosenIndex] of Object.entries(answers)) {
    if (chosenIndex === correctIndex) {
      correct.push(playerId)
      const elapsed = Date.now() - timerStartedAt
      const wasQuick = elapsed < timerDuration * 500
      deltas[playerId] = TRIVIA_CORRECT_POINTS + (wasQuick ? TRIVIA_SPEED_BONUS : 0)
    }
  }

  return { deltas, correct }
}
