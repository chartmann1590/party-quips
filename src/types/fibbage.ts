export interface FibbagePrompt {
  id: string
  text: string
  blank: string
  realAnswer: string
  category: string
  playerEntries: Record<string, string>   // playerId -> fake answer
  submitted: Record<string, boolean>
  choices?: string[]                       // shuffled array written by host before voting
}

export interface FibbageVoting {
  phase: 'waiting' | 'active' | 'complete'
  currentPromptId: string
  votes: Record<string, string>  // voterId -> the string they chose
}

export interface FibbageRound {
  prompts: Record<string, FibbagePrompt>
  voting: FibbageVoting
}

export interface FibbageResult {
  promptId: string
  promptText: string
  realAnswer: string
  choices: string[]
  votes: Record<string, string>  // voterId -> choice
  fakesAuthored: Record<string, string>  // answer -> playerId who wrote it
}

export const FIBBAGE_ANSWER_TIME = 60
export const FIBBAGE_VOTE_TIME = 30
export const FIBBAGE_FOOL_POINTS = 500    // per player fooled
export const FIBBAGE_TRUTH_POINTS = 1000  // for knowing the real answer
