export type GameType = 'quiplash' | 'fibbage' | 'trivia'

export type GameState =
  | 'lobby'
  | 'answering'
  | 'voting'
  | 'results'
  | 'scoreboard'
  | 'done'

export interface Player {
  id: string
  name: string
  score: number
  connected: boolean
  isHost: boolean
  isComputer?: boolean
  avatarColor: string
  joinedAt: number
  alive?: boolean       // for trivia: whether player is still alive
  cursed?: boolean      // for trivia: penalty on next round
}

export interface RoomMeta {
  hostId: string
  hostName: string
  createdAt: number
  game: GameType
  state: GameState
  round: number
  maxPlayers: number
  activeAddOns?: string[]
}

export interface SystemData {
  timerStartedAt: number
  timerDuration: number
}

export interface Room {
  meta: RoomMeta
  players: Record<string, Player>
  system?: SystemData
}

export const AVATAR_COLORS = [
  '#b537f2', // purple
  '#00f5ff', // cyan
  '#ff2d78', // pink
  '#ffeb00', // yellow
  '#39ff14', // green
  '#ff8c00', // orange
  '#00bfff', // blue
  '#ff69b4', // hot pink
]

export const GAME_LABELS: Record<GameType, string> = {
  quiplash: 'Witty Quips',
  fibbage: 'Fib Finder',
  trivia: 'Deadly Trivia',
}

export const GAME_DESCRIPTIONS: Record<GameType, string> = {
  quiplash: 'Answer hilarious prompts and vote for the funniest response!',
  fibbage: 'Make up fake answers and fool your friends!',
  trivia: 'Answer trivia or face deadly consequences!',
}
