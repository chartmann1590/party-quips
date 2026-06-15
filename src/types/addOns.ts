import type { QuiplashPromptDef } from '../lib/prompts'
import type { TriviaQuestion } from './trivia'
import type { SketchBluffPromptDef } from './sketchbluff'

export type PackId = 'after-dark' | 'nerd-pack' | 'world-tour' | 'sketch-bluff' | 'pop-culture' | 'sports-games'

export interface FibbagePromptDef {
  text: string
  blank: string
  realAnswer: string
  category: string
}

export interface ContentPack {
  id: PackId
  name: string
  tagline: string
  description: string
  priceUsdCents: number
  emoji: string
  accentColor: string
  quiplashPrompts: QuiplashPromptDef[]
  quiplashFinalLash: QuiplashPromptDef[]
  fibbagePrompts: FibbagePromptDef[]
  triviaQuestions: TriviaQuestion[]
  sketchbluffPrompts?: SketchBluffPromptDef[]
}

export interface ContentLibrary {
  quiplashPrompts: QuiplashPromptDef[]
  quiplashFinalLash: QuiplashPromptDef[]
  fibbagePrompts: FibbagePromptDef[]
  triviaQuestions: TriviaQuestion[]
  sketchbluffPrompts: SketchBluffPromptDef[]
}

export interface PurchaseRecord {
  packId: PackId
  purchasedAt: number
  stripePaymentIntentId: string
  priceUsdCents: number
  platform: 'web' | 'android'
}
