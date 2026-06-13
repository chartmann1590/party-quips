import { motion } from 'framer-motion'

interface VoteButtonProps {
  answer: string
  label: 'A' | 'B'
  onVote: () => void
  disabled?: boolean
  selected?: boolean
  voteCount?: number
}

const LABEL_COLORS = {
  A: { bg: '#b537f2', text: '#f0f0ff', shadow: 'rgba(181,55,242,0.5)' },
  B: { bg: '#00f5ff', text: '#0f0f1a', shadow: 'rgba(0,245,255,0.5)' },
}

export default function VoteButton({ answer, label, onVote, disabled = false, selected = false, voteCount }: VoteButtonProps) {
  const colors = LABEL_COLORS[label]

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={!disabled ? onVote : undefined}
      disabled={disabled}
      className="flex flex-col gap-3 p-5 rounded-2xl text-left w-full transition-all"
      style={{
        background: selected
          ? `${colors.bg}25`
          : 'rgba(26,26,46,0.9)',
        border: `3px solid ${selected ? colors.bg : 'rgba(45,45,78,0.8)'}`,
        boxShadow: selected ? `0 0 25px ${colors.shadow}` : 'none',
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="font-display text-xl px-3 py-1 rounded-xl shrink-0"
          style={{ background: colors.bg, color: colors.text }}
        >
          {label}
        </span>
        <p className="font-body text-text-primary text-lg leading-relaxed flex-1">
          {answer || <em className="text-text-muted">(no answer)</em>}
        </p>
      </div>
      {voteCount != null && (
        <div className="flex items-center gap-1">
          {Array.from({ length: voteCount }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{ background: colors.bg, boxShadow: `0 0 6px ${colors.shadow}` }}
            />
          ))}
        </div>
      )}
    </motion.button>
  )
}
