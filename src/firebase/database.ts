import {
  ref, set, update, get, push, serverTimestamp, onDisconnect,
  type DatabaseReference
} from 'firebase/database'
import { db } from './config'
import type { Player, RoomMeta, GameType, GameState } from '../types/room'
import type { QuiplashPrompt } from '../types/quiplash'
import type { FibbagePrompt } from '../types/fibbage'
import type { TriviaQuestion } from '../types/trivia'

// ── Ref builders ─────────────────────────────────────────────────────────────

export const roomRef = (code: string) => ref(db, `rooms/${code}`)
export const roomMetaRef = (code: string) => ref(db, `rooms/${code}/meta`)
export const roomStateRef = (code: string) => ref(db, `rooms/${code}/meta/state`)
export const playersRef = (code: string) => ref(db, `rooms/${code}/players`)
export const playerRef = (code: string, uid: string) => ref(db, `rooms/${code}/players/${uid}`)
export const playerConnectedRef = (code: string, uid: string) => ref(db, `rooms/${code}/players/${uid}/connected`)
export const systemRef = (code: string) => ref(db, `rooms/${code}/system`)

// Quiplash
export const quiplashRoundsRef = (code: string) => ref(db, `rooms/${code}/quiplash/rounds`)
export const quiplashRoundRef = (code: string, round: number) => ref(db, `rooms/${code}/quiplash/rounds/${round}`)
export const quiplashPromptRef = (code: string, round: number, promptId: string) =>
  ref(db, `rooms/${code}/quiplash/rounds/${round}/prompts/${promptId}`)
export const quiplashAnswerRef = (code: string, round: number, promptId: string, playerId: string) =>
  ref(db, `rooms/${code}/quiplash/rounds/${round}/prompts/${promptId}/answers/${playerId}`)
export const quiplashSubmittedRef = (code: string, round: number, promptId: string, playerId: string) =>
  ref(db, `rooms/${code}/quiplash/rounds/${round}/prompts/${promptId}/submitted/${playerId}`)
export const quiplashVotingRef = (code: string, round: number) =>
  ref(db, `rooms/${code}/quiplash/rounds/${round}/voting`)
export const quiplashVoteRef = (code: string, round: number, voterId: string) =>
  ref(db, `rooms/${code}/quiplash/rounds/${round}/voting/votes/${voterId}`)

// Fibbage
export const fibbageRoundRef = (code: string, round: number) => ref(db, `rooms/${code}/fibbage/rounds/${round}`)
export const fibbagePromptRef = (code: string, round: number, promptId: string) =>
  ref(db, `rooms/${code}/fibbage/rounds/${round}/prompts/${promptId}`)
export const fibbageEntryRef = (code: string, round: number, promptId: string, playerId: string) =>
  ref(db, `rooms/${code}/fibbage/rounds/${round}/prompts/${promptId}/playerEntries/${playerId}`)
export const fibbageSubmittedRef = (code: string, round: number, promptId: string, playerId: string) =>
  ref(db, `rooms/${code}/fibbage/rounds/${round}/prompts/${promptId}/submitted/${playerId}`)
export const fibbageVotingRef = (code: string, round: number) =>
  ref(db, `rooms/${code}/fibbage/rounds/${round}/voting`)
export const fibbageVoteRef = (code: string, round: number, voterId: string) =>
  ref(db, `rooms/${code}/fibbage/rounds/${round}/voting/votes/${voterId}`)

// Trivia
export const triviaRoundRef = (code: string, round: number) => ref(db, `rooms/${code}/trivia/rounds/${round}`)
export const triviaAnswerRef = (code: string, round: number, playerId: string) =>
  ref(db, `rooms/${code}/trivia/rounds/${round}/answers/${playerId}`)
export const triviaSubmittedRef = (code: string, round: number, playerId: string) =>
  ref(db, `rooms/${code}/trivia/rounds/${round}/submitted/${playerId}`)

// ── Write operations ──────────────────────────────────────────────────────────

export async function roomExists(code: string): Promise<boolean> {
  const snap = await get(roomMetaRef(code))
  return snap.exists()
}

export async function createRoom(code: string, meta: Omit<RoomMeta, 'state' | 'round'>): Promise<void> {
  await set(roomMetaRef(code), {
    ...meta,
    state: 'lobby' as GameState,
    round: 1,
  })
}

export async function setRoomState(code: string, state: GameState): Promise<void> {
  await set(roomStateRef(code), state)
}

export async function addPlayer(code: string, player: Player): Promise<void> {
  let lastError: unknown

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await set(playerRef(code, player.id), player)
      return
    } catch (err) {
      lastError = err
      await new Promise(resolve => setTimeout(resolve, 200 * (attempt + 1)))
    }
  }

  throw lastError
}

export async function updatePlayerScore(code: string, playerId: string, scoreDelta: number): Promise<void> {
  const snap = await get(playerRef(code, playerId))
  if (!snap.exists()) return
  const current = snap.val().score ?? 0
  await update(playerRef(code, playerId), { score: current + scoreDelta })
}

export async function updateMultipleScores(code: string, deltas: Record<string, number>): Promise<void> {
  const updates: Record<string, number> = {}
  for (const [playerId, delta] of Object.entries(deltas)) {
    const snap = await get(playerRef(code, playerId))
    if (snap.exists()) {
      updates[`rooms/${code}/players/${playerId}/score`] = (snap.val().score ?? 0) + delta
    }
  }
  await update(ref(db), updates)
}

export async function setTimer(code: string, durationSeconds: number): Promise<void> {
  await set(systemRef(code), {
    timerStartedAt: Date.now(),
    timerDuration: durationSeconds,
  })
}

export async function writeQuiplashRound(
  code: string,
  round: number,
  prompts: Record<string, Omit<QuiplashPrompt, 'answers' | 'submitted' | 'id'>>
): Promise<void> {
  const data: Record<string, unknown> = {}
  for (const [id, p] of Object.entries(prompts)) {
    data[id] = { text: p.text, playerA: p.playerA, playerB: p.playerB, answers: {}, submitted: {} }
  }
  await set(ref(db, `rooms/${code}/quiplash/rounds/${round}/prompts`), data)
  await set(ref(db, `rooms/${code}/quiplash/rounds/${round}/voting`), {
    phase: 'waiting',
    currentPromptId: '',
    votes: {},
  })
}

export async function submitQuiplashAnswer(
  code: string, round: number, promptId: string, playerId: string, answer: string
): Promise<void> {
  await set(quiplashAnswerRef(code, round, promptId, playerId), answer)
  await set(quiplashSubmittedRef(code, round, promptId, playerId), true)
}

export async function submitAutoQuip(
  code: string, round: number, promptId: string, playerId: string, answer: string
): Promise<void> {
  await update(ref(db, `rooms/${code}/quiplash/rounds/${round}/prompts/${promptId}`), {
    [`answers/${playerId}`]: answer,
    [`submitted/${playerId}`]: true,
    [`autoQuipped/${playerId}`]: true,
  })
}

export async function startQuiplashVoting(
  code: string, round: number, promptId: string
): Promise<void> {
  await update(quiplashVotingRef(code, round), {
    phase: 'active',
    currentPromptId: promptId,
    votes: {},
  })
}

export async function submitQuiplashVote(
  code: string, round: number, voterId: string, chosenPlayerId: string
): Promise<void> {
  await set(quiplashVoteRef(code, round, voterId), chosenPlayerId)
}

export async function writeFibbageRound(
  code: string,
  round: number,
  prompts: Record<string, Omit<FibbagePrompt, 'playerEntries' | 'submitted' | 'choices'>>
): Promise<void> {
  const data: Record<string, unknown> = {}
  for (const [id, p] of Object.entries(prompts)) {
    data[id] = {
      text: p.text,
      blank: p.blank,
      realAnswer: p.realAnswer,
      category: p.category,
      playerEntries: {},
      submitted: {},
    }
  }
  await set(ref(db, `rooms/${code}/fibbage/rounds/${round}/prompts`), data)
  await set(ref(db, `rooms/${code}/fibbage/rounds/${round}/voting`), {
    phase: 'waiting',
    currentPromptId: '',
    votes: {},
  })
}

export async function submitFibbageEntry(
  code: string, round: number, promptId: string, playerId: string, entry: string
): Promise<void> {
  await set(fibbageEntryRef(code, round, promptId, playerId), entry)
  await set(fibbageSubmittedRef(code, round, promptId, playerId), true)
}

export async function writeFibbageChoices(
  code: string, round: number, promptId: string, choices: string[]
): Promise<void> {
  await set(ref(db, `rooms/${code}/fibbage/rounds/${round}/prompts/${promptId}/choices`), choices)
}

export async function submitFibbageVote(
  code: string, round: number, voterId: string, choice: string
): Promise<void> {
  await set(fibbageVoteRef(code, round, voterId), choice)
}

export async function writeTriviaRound(
  code: string, round: number, question: TriviaQuestion, displayOptions: string[]
): Promise<void> {
  await set(triviaRoundRef(code, round), {
    question: { ...question, displayOptions },
    answers: {},
    submitted: {},
  })
}

export async function submitTriviaAnswer(
  code: string, round: number, playerId: string, optionIndex: number
): Promise<void> {
  await set(triviaAnswerRef(code, round, playerId), optionIndex)
  await set(triviaSubmittedRef(code, round, playerId), true)
}

export async function deleteRoom(code: string): Promise<void> {
  await set(roomRef(code), null)
}
