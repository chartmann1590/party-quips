import { addPlayer } from '../firebase/database'
import { AVATAR_COLORS, type Player } from '../types/room'

export const COMPUTER_PLAYER_ID = 'computer-player'
export const COMPUTER_PLAYER_NAME = 'CPU Player'

const FIBBAGE_FAKE_ANSWERS = [
  'a tiny parade',
  'the moon',
  'twelve sandwiches',
  'a suspicious hat',
  'Canada',
  'a secret button',
]

const SKETCH_FAKE_TITLES = [
  'A very normal Tuesday',
  'The problem with modern furniture',
  'One bad idea too many',
  'A meeting that should have been an email',
  'The champion of nonsense',
  'An emergency at snack time',
]

export function isComputerPlayer(player: Player): boolean {
  return player.isComputer === true
}

export async function addComputerPlayerForTwoHumans(code: string, players: Player[]): Promise<boolean> {
  const humanPlayers = players.filter(player => !player.isHost && !player.isComputer)
  const hasComputerPlayer = players.some(isComputerPlayer)

  if (humanPlayers.length !== 2 || hasComputerPlayer) return false

  await addPlayer(code, {
    id: COMPUTER_PLAYER_ID,
    name: COMPUTER_PLAYER_NAME,
    score: 0,
    connected: true,
    isHost: false,
    isComputer: true,
    avatarColor: AVATAR_COLORS[2],
    joinedAt: Date.now(),
  })

  return true
}

export function getComputerPlayers(players: Player[]): Player[] {
  return players.filter(isComputerPlayer)
}

export function pickComputerQuiplashVote(playerA: string, playerB: string): string {
  return Math.random() < 0.5 ? playerA : playerB
}

export function getComputerFibbageEntry(promptText: string, realAnswer: string): string {
  const seed = promptText.length % FIBBAGE_FAKE_ANSWERS.length
  const fallback = FIBBAGE_FAKE_ANSWERS[seed]

  if (fallback.toLowerCase() === realAnswer.toLowerCase()) {
    return 'a mysterious envelope'
  }

  return fallback
}

export function pickComputerFibbageVote(choices: string[], ownEntry?: string): string | null {
  const eligible = choices.filter(choice => choice !== ownEntry)
  if (eligible.length === 0) return null
  return eligible[Math.floor(Math.random() * eligible.length)]
}

export function pickComputerTriviaAnswer(optionCount: number): number {
  return Math.floor(Math.random() * Math.max(optionCount, 1))
}

export function getComputerSketchDrawing(promptText: string): string {
  const label = promptText.slice(0, 42).replace(/[<>&]/g, '')
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
      <rect width="640" height="420" fill="#fff7ed"/>
      <path d="M88 298 C154 130 244 130 314 286 S474 260 548 122" fill="none" stroke="#111827" stroke-width="16" stroke-linecap="round"/>
      <circle cx="196" cy="152" r="42" fill="#fde047" stroke="#111827" stroke-width="10"/>
      <rect x="382" y="168" width="118" height="92" rx="18" fill="#38bdf8" stroke="#111827" stroke-width="10"/>
      <path d="M420 305 L486 305 L454 350 Z" fill="#fb7185" stroke="#111827" stroke-width="8"/>
      <text x="320" y="390" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#111827">${label}</text>
    </svg>
  `
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function getComputerSketchGuess(promptText: string, drawingPlayerId: string): string {
  const seed = (promptText.length + drawingPlayerId.length) % SKETCH_FAKE_TITLES.length
  return SKETCH_FAKE_TITLES[seed]
}

export function pickComputerSketchVote(choices: { id: string; authorId?: string }[], ownId: string): string | null {
  const eligible = choices.filter(choice => choice.authorId !== ownId)
  if (eligible.length === 0) return null
  return eligible[Math.floor(Math.random() * eligible.length)].id
}
