import { motion } from 'framer-motion'
import type { SketchBluffVotingChoice } from '../../../types/sketchbluff'

interface SketchChoicePickerProps {
  drawingUrl: string
  choices: SketchBluffVotingChoice[]
  playerId: string
  selectedChoice?: string
  onVote: (choiceId: string) => void
}

export default function SketchChoicePicker({
  drawingUrl,
  choices,
  playerId,
  selectedChoice,
  onVote,
}: SketchChoicePickerProps) {
  if (selectedChoice) {
    return (
      <div className="flex flex-col items-center gap-4 flex-1 justify-center">
        <div className="text-6xl">✓</div>
        <p className="font-display text-neon-green text-2xl text-center">Vote cast!</p>
        <p className="text-text-muted font-body text-center">Watch the TV for the reveal.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-white p-2 shadow-xl">
        <img src={drawingUrl} alt="Drawing to identify" className="w-full rounded-xl" />
      </div>
      <div className="flex flex-col gap-3">
        {choices.map((choice, index) => {
          const disabled = choice.authorId === playerId
          return (
            <motion.button
              key={choice.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={!disabled ? { scale: 0.97 } : {}}
              className="rounded-xl p-4 text-left flex items-center gap-3"
              style={{
                background: disabled ? 'rgba(148,163,184,0.14)' : 'rgba(26,26,46,0.82)',
                border: `2px solid ${disabled ? 'rgba(148,163,184,0.25)' : 'rgba(56,189,248,0.45)'}`,
                opacity: disabled ? 0.55 : 1,
              }}
              onClick={() => !disabled && onVote(choice.id)}
              disabled={disabled}
            >
              <span className="font-display text-sm px-2 py-1 rounded-lg bg-cyan-300 text-slate-950">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="font-body text-text-primary text-lg">{choice.text}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
