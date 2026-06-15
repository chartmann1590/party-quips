export interface SketchBluffPromptDef {
  id: string
  text: string
  category: string
}

export interface SketchBluffDrawing {
  promptId: string
  promptText: string
  drawingUrl?: string
  submitted?: boolean
}

export interface SketchBluffVotingChoice {
  id: string
  text: string
  isReal: boolean
  authorId?: string
}

export interface SketchBluffVoting {
  phase: 'guessing' | 'voting' | 'waiting'
  currentPlayerId: string
  choices?: SketchBluffVotingChoice[]
  votes: Record<string, string>
}

export interface SketchBluffRound {
  drawings: Record<string, SketchBluffDrawing>
  guesses: Record<string, Record<string, string>>
  voting: SketchBluffVoting
}

export const SKETCHBLUFF_DRAW_TIME = 90
export const SKETCHBLUFF_GUESS_TIME = 45
export const SKETCHBLUFF_VOTE_TIME = 35
export const SKETCHBLUFF_RESULTS_TIME_SECONDS = 6

export const SKETCHBLUFF_TRUTH_POINTS = 1000
export const SKETCHBLUFF_FOOL_POINTS = 500
export const SKETCHBLUFF_ARTIST_BONUS = 250
