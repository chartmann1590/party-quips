/**
 * Game Engine — drives state transitions.
 * ONLY the host browser calls these functions.
 */
import { set, update, ref } from 'firebase/database'
import { db } from '../firebase/config'
import {
  createRoom,
  setRoomState,
  setTimer,
  writeQuiplashRound,
  startQuiplashVoting,
  updateMultipleScores,
  writeFibbageRound,
  writeFibbageChoices,
  writeTriviaRound,
} from '../firebase/database'
import type { Player, GameType } from '../types/room'
import type { ContentLibrary } from '../types/addOns'
import { buildContentLibrary } from './contentPacks'
import { ANSWER_TIME_SECONDS, VOTE_TIME_SECONDS, RESULTS_TIME_SECONDS, ROUNDS_TOTAL } from '../types/quiplash'
import { FIBBAGE_ANSWER_TIME, FIBBAGE_VOTE_TIME } from '../types/fibbage'
import { TRIVIA_ANSWER_TIME, TOTAL_TRIVIA_ROUNDS } from '../types/trivia'
import {
  shuffleArray,
  getRandomQuiplashPrompts,
  getRandomFinalLashPrompt,
  getRandomFibbagePrompts,
  getRandomTriviaQuestions,
} from './prompts'
import { calculateQuiplashScores, calculateFibbageScores, calculateTriviaScores } from './scoring'
import type { QuiplashRound } from '../types/quiplash'
import type { FibbageRound } from '../types/fibbage'

// ── Room Creation ─────────────────────────────────────────────────────────────

export async function initRoom(
  code: string,
  hostId: string,
  hostName: string,
  game: GameType,
  activeAddOns?: string[]
): Promise<void> {
  await createRoom(code, {
    hostId,
    hostName,
    createdAt: Date.now(),
    game,
    maxPlayers: 8,
    ...(activeAddOns && activeAddOns.length > 0 ? { activeAddOns } : {}),
  })
}

export function resolveContentLibrary(activeAddOns: string[]): ContentLibrary {
  return buildContentLibrary(activeAddOns)
}

// ── Quiplash Engine ───────────────────────────────────────────────────────────

function assignQuiplashPrompts(
  players: Player[],
  round: number,
  usedIds: Set<string>,
  library?: ContentLibrary
): Record<string, { text: string; playerA: string; playerB: string }> {
  const shuffledPlayers = shuffleArray(players)
  const n = shuffledPlayers.length
  const qPool = library ? [...library.quiplashPrompts, ...library.quiplashFinalLash] : undefined

  // Round 3 = final lash: all players answer same prompt
  if (round === ROUNDS_TOTAL) {
    const finalPool = library?.quiplashFinalLash
    const finalPrompt = getRandomFinalLashPrompt(usedIds, finalPool)
    const promptId = `round${round}_final`
    return {
      [promptId]: {
        text: finalPrompt.text,
        playerA: shuffledPlayers[0].id,
        playerB: shuffledPlayers[1]?.id ?? shuffledPlayers[0].id,
      },
    }
  }

  // Rounds 1-2: cyclic pairing — player i paired with player (i+1)%n
  // Each player gets exactly 2 prompts
  const prompts = getRandomQuiplashPrompts(n, usedIds, qPool)
  const result: Record<string, { text: string; playerA: string; playerB: string }> = {}

  for (let i = 0; i < n; i++) {
    const prompt = prompts[i]
    if (!prompt) break
    const promptId = `round${round}_p${i}`
    result[promptId] = {
      text: prompt.text,
      playerA: shuffledPlayers[i].id,
      playerB: shuffledPlayers[(i + 1) % n].id,
    }
    usedIds.add(prompt.id)
  }

  return result
}

export async function startQuiplashGame(
  code: string,
  players: Player[],
  round: number,
  usedPromptIds: Set<string>,
  library?: ContentLibrary
): Promise<string[]> {
  const assignments = assignQuiplashPrompts(players, round, usedPromptIds, library)
  await writeQuiplashRound(code, round, assignments)
  await setTimer(code, round === ROUNDS_TOTAL ? ANSWER_TIME_SECONDS + 30 : ANSWER_TIME_SECONDS)
  await setRoomState(code, 'answering')
  return Object.keys(assignments)
}

export async function beginQuiplashVoting(
  code: string,
  round: number,
  promptIds: string[]
): Promise<void> {
  if (promptIds.length === 0) return
  await startQuiplashVoting(code, round, promptIds[0])
  await setTimer(code, VOTE_TIME_SECONDS)
  await setRoomState(code, 'voting')
}

export async function resolveQuiplashVoting(
  code: string,
  round: number,
  currentRoundData: QuiplashRound,
  allPlayers: Player[]
): Promise<void> {
  const promptId = currentRoundData.voting.currentPromptId
  const prompt = currentRoundData.prompts[promptId]
  if (!prompt) return

  const votes = currentRoundData.voting.votes ?? {}
  const playerIds = allPlayers.map(p => p.id)
  const result = calculateQuiplashScores(votes, prompt.playerA, prompt.playerB, playerIds, round)

  const deltas: Record<string, number> = {}
  if (result.playerADelta > 0) deltas[prompt.playerA] = result.playerADelta
  if (result.playerBDelta > 0) deltas[prompt.playerB] = result.playerBDelta

  await updateMultipleScores(code, deltas)
  await setRoomState(code, 'results')
}

export async function advanceToNextQuiplashPrompt(
  code: string,
  round: number,
  promptIds: string[],
  currentPromptId: string
): Promise<'next_prompt' | 'round_done'> {
  const idx = promptIds.indexOf(currentPromptId)
  const nextId = promptIds[idx + 1]

  if (nextId) {
    await startQuiplashVoting(code, round, nextId)
    await setTimer(code, VOTE_TIME_SECONDS)
    await setRoomState(code, 'voting')
    return 'next_prompt'
  }

  return 'round_done'
}

export async function startNextRoundOrFinish(
  code: string,
  round: number,
  players: Player[],
  usedPromptIds: Set<string>,
  library?: ContentLibrary
): Promise<'next_round' | 'game_over'> {
  if (round >= ROUNDS_TOTAL) {
    await setRoomState(code, 'scoreboard')
    return 'game_over'
  }

  const nextRound = round + 1
  await update(ref(db, `rooms/${code}/meta`), { round: nextRound })
  await startQuiplashGame(code, players, nextRound, usedPromptIds, library)
  return 'next_round'
}

// ── Fibbage Engine ────────────────────────────────────────────────────────────

export async function startFibbageGame(code: string, round: number, library?: ContentLibrary): Promise<string[]> {
  const prompts = getRandomFibbagePrompts(3, library?.fibbagePrompts)
  const promptData: Record<string, any> = {}
  const ids: string[] = []

  prompts.forEach((p, i) => {
    const id = `round${round}_fp${i}`
    ids.push(id)
    promptData[id] = {
      text: p.text,
      blank: p.blank,
      realAnswer: p.realAnswer,
      category: p.category,
    }
  })

  await writeFibbageRound(code, round, promptData)
  await setTimer(code, FIBBAGE_ANSWER_TIME)
  await setRoomState(code, 'answering')
  return ids
}

export async function beginFibbageVoting(
  code: string,
  round: number,
  fibbageData: FibbageRound,
  promptId: string,
  allPlayers: Player[]
): Promise<void> {
  const prompt = fibbageData.prompts[promptId]
  if (!prompt) return

  // Deduplicate fakes and exclude the real answer from fakes list
  const fakeAnswers = [...new Set(Object.values(prompt.playerEntries ?? {}))]
    .filter(a => a.toLowerCase().trim() !== prompt.realAnswer.toLowerCase().trim())
  const allChoices = shuffleArray([...fakeAnswers, prompt.realAnswer])

  await writeFibbageChoices(code, round, promptId, allChoices)
  await set(ref(db, `rooms/${code}/fibbage/rounds/${round}/voting`), {
    phase: 'active',
    currentPromptId: promptId,
    votes: {},
  })
  await setTimer(code, FIBBAGE_VOTE_TIME)
  await setRoomState(code, 'voting')
}

export async function resolveFibbageVoting(
  code: string,
  round: number,
  fibbageData: FibbageRound,
  allPlayers: Player[]
): Promise<void> {
  const promptId = fibbageData.voting.currentPromptId
  const prompt = fibbageData.prompts[promptId]
  if (!prompt) return

  const votes = fibbageData.voting.votes ?? {}
  const fakesAuthored: Record<string, string> = {}
  for (const [playerId, answer] of Object.entries(prompt.playerEntries ?? {})) {
    fakesAuthored[answer] = playerId
  }

  const result = calculateFibbageScores(votes, prompt.realAnswer, fakesAuthored)
  if (Object.keys(result.deltas).length > 0) {
    await updateMultipleScores(code, result.deltas)
  }
  await setRoomState(code, 'results')
}

// ── Trivia Engine ─────────────────────────────────────────────────────────────

export async function startTriviaRound(code: string, round: number, library?: ContentLibrary): Promise<void> {
  const [question] = getRandomTriviaQuestions(1, library?.triviaQuestions)
  const displayOptions = shuffleArray(question.options)
  const correctIndex = displayOptions.indexOf(question.options[0])

  await writeTriviaRound(code, round, question, displayOptions)
  await setTimer(code, TRIVIA_ANSWER_TIME)
  await setRoomState(code, 'answering')
}

export async function resolveTriviaRound(
  code: string,
  round: number,
  answers: Record<string, number>,
  correctIndex: number,
  timerStartedAt: number
): Promise<void> {
  const result = calculateTriviaScores(answers, correctIndex, timerStartedAt, TRIVIA_ANSWER_TIME)
  if (Object.keys(result.deltas).length > 0) {
    await updateMultipleScores(code, result.deltas)
  }
  await setRoomState(code, 'results')
}

export async function advanceTriviaOrFinish(code: string, round: number, library?: ContentLibrary): Promise<'next_round' | 'game_over'> {
  if (round >= TOTAL_TRIVIA_ROUNDS) {
    await setRoomState(code, 'scoreboard')
    return 'game_over'
  }
  await update(ref(db, `rooms/${code}/meta`), { round: round + 1 })
  await startTriviaRound(code, round + 1, library)
  return 'next_round'
}
