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
