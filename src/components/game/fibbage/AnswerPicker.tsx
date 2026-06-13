import { motion } from 'framer-motion'

interface AnswerPickerProps {
  promptText: string
  choices: string[]
  onVote: (choice: string) => void
  disabled?: boolean
  selectedChoice?: string
}

const CHOICE_COLORS = ['#b537f2', '#00f5ff', '#ff8c00', '#ff2d78', '#39ff14', '#ffeb00']

export default function AnswerPicker({ promptText, choices, onVote, disabled = false, selectedChoice }: AnswerPickerProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="game-card text-center" style={{ border: '2px solid rgba(255,140,0,0.4)' }}>
        <p className="text-text-muted font-body text-xs uppercase tracking-wider mb-1">What's the real answer?</p>
        <p className="font-body text-text-primary text-xl font-semibold leading-relaxed">{promptText}</p>
      </div>

      <div className="flex flex-col gap-3">
        {choices.map((choice, i) => {
          const color = CHOICE_COLORS[i % CHOICE_COLORS.length]
          const isSelected = selectedChoice === choice
          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={!disabled ? { scale: 1.02 } : {}}
              whileTap={!disabled ? { scale: 0.97 } : {}}
              onClick={!disabled ? () => onVote(choice) : undefined}
              disabled={disabled}
              className="flex items-center gap-3 p-4 rounded-xl text-left transition-all"
              style={{
                background: isSelected ? `${color}20` : 'rgba(26,26,46,0.8)',
                border: `2px solid ${isSelected ? color : 'rgba(45,45,78,0.6)'}`,
                boxShadow: isSelected ? `0 0 15px ${color}40` : 'none',
              }}
            >
              <span
                className="font-display text-sm px-2 py-1 rounded-lg shrink-0"
                style={{ background: color, color: i % 2 === 1 ? '#0f0f1a' : '#f0f0ff' }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="font-body text-text-primary text-lg">{choice}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
