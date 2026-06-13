export interface TriviaQuestion {
  id: string
  text: string
  options: string[]      // 4 options, index 0 is always correct (shuffled before display)
  correctIndex: number   // index in displayed options (set by host when written)
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  displayOptions?: string[]  // shuffled options written to DB by host
}

export interface TriviaRound {
  question: TriviaQuestion
  answers: Record<string, number>   // playerId -> chosen option index
  submitted: Record<string, boolean>
  miniGame?: TriviaMinigame
}

export interface TriviaMinigame {
  type: 'math' | 'countdown' | 'scramble'
  prompt: string
  answer: string
  answers: Record<string, string>   // playerId -> their answer
  submitted: Record<string, boolean>
}

export const TRIVIA_ANSWER_TIME = 20
export const TRIVIA_CORRECT_POINTS = 1000
export const TRIVIA_SPEED_BONUS = 500   // for answering in first half of timer
export const TOTAL_TRIVIA_ROUNDS = 10
