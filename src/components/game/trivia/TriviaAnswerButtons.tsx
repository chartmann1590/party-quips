import { motion } from 'framer-motion'
import CountdownTimer from '../../shared/CountdownTimer'
import type { SystemData } from '../../../types/room'

interface TriviaAnswerButtonsProps {
  question: string
  displayOptions: string[]
  selectedIndex: number | null
  onAnswer: (index: number) => void
  system: SystemData | null
}

const OPTION_COLORS = ['#b537f2', '#00f5ff', '#ff8c00', '#39ff14']
const LABELS = ['A', 'B', 'C', 'D']

export default function TriviaAnswerButtons({
  question, displayOptions, selectedIndex, onAnswer, system
}: TriviaAnswerButtonsProps) {
  if (selectedIndex !== null) {
    const color = OPTION_COLORS[selectedIndex % OPTION_COLORS.length]
    return (
      <div className="flex flex-col items-center gap-4 flex-1 justify-center">
        <div className="text-6xl">🔒</div>
        <p className="font-display text-neon-pink text-2xl text-center">Locked in!</p>
        <div
          className="game-card text-center w-full"
          style={{ border: `2px solid ${color}` }}
        >
          <p className="font-body text-text-muted text-sm mb-1">{LABELS[selectedIndex]}</p>
          <p className="font-body text-text-primary text-xl">{displayOptions[selectedIndex]}</p>
        </div>
        {system && (
          <CountdownTimer totalSeconds={system.timerDuration} startedAt={system.timerStartedAt} size={60} />
        )}
        <p className="text-text-muted font-body text-sm text-center">Watch the TV for the answer!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="game-card text-center" style={{ border: '2px solid rgba(255,45,120,0.4)' }}>
        <p className="text-text-muted font-body text-xs uppercase tracking-wider mb-1">Deadly Trivia</p>
        <p className="font-body text-text-primary text-lg font-semibold leading-relaxed">{question}</p>
      </div>

      {system && (
        <div className="flex justify-end">
          <CountdownTimer totalSeconds={system.timerDuration} startedAt={system.timerStartedAt} size={50} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {displayOptions.map((opt, i) => {
          const color = OPTION_COLORS[i % OPTION_COLORS.length]
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.93 }}
              onClick={() => onAnswer(i)}
              className="rounded-xl p-4 flex flex-col items-center gap-2 text-center"
              style={{
                background: `${color}20`,
                border: `2px solid ${color}`,
                boxShadow: `0 0 15px ${color}25`,
              }}
            >
              <span
                className="font-display text-xl w-9 h-9 flex items-center justify-center rounded-xl"
                style={{ background: color, color: '#0f0f1a' }}
              >
                {LABELS[i]}
              </span>
              <p className="font-body text-text-primary text-sm leading-snug">{opt}</p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
