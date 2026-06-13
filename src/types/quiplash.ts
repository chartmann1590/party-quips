export interface QuiplashPrompt {
  id: string
  text: string
  playerA: string    // playerId
  playerB: string    // playerId
  answers: Record<string, string>    // playerId -> answer text
  submitted: Record<string, boolean> // playerId -> submitted?
}

export interface QuiplashVoting {
  phase: 'waiting' | 'active' | 'complete'
  currentPromptId: string
  votes: Record<string, string>  // voterId -> playerId of chosen answer
}

export interface QuiplashRound {
  prompts: Record<string, QuiplashPrompt>
  voting: QuiplashVoting
}

export interface VoteResult {
  promptId: string
  promptText: string
  playerA: string
  playerB: string
  answerA: string
  answerB: string
  votesForA: string[]  // player IDs who voted for A
  votesForB: string[]  // player IDs who voted for B
  quiplash: boolean    // unanimous vote
}

export const ROUNDS_TOTAL = 3
export const ANSWER_TIME_SECONDS = 90
export const VOTE_TIME_SECONDS = 30
export const RESULTS_TIME_SECONDS = 6

export const VOTE_SCORE_PER_VOTER = 100
export const QUIPLASH_BONUS = 250

export const ROUND_MULTIPLIERS: Record<number, number> = { 1: 1, 2: 2, 3: 3 }
