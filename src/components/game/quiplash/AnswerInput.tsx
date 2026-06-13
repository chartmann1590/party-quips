import { useState } from 'react'
import { motion } from 'framer-motion'

interface AnswerInputProps {
  promptText: string
  onSubmit: (answer: string) => Promise<void>
  disabled?: boolean
  submitted?: boolean
}

export default function AnswerInput({ promptText, onSubmit, disabled = false, submitted = false }: AnswerInputProps) {
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (submitting || submitted) return
    setSubmitting(true)
    await onSubmit(answer.trim())
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="game-card flex flex-col items-center gap-3 py-8"
        style={{ border: '2px solid rgba(57, 255, 20, 0.5)' }}
      >
        <div className="text-5xl">✅</div>
        <p className="font-display text-neon-green text-xl">Answer submitted!</p>
        <p className="text-text-muted font-body text-sm">Waiting for other players...</p>
        {answer && (
          <p className="text-text-primary font-body italic mt-2 text-center">"{answer}"</p>
        )}
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="game-card" style={{ border: '2px solid rgba(181, 55, 242, 0.4)' }}>
        <p className="text-text-muted font-body text-xs uppercase tracking-wider mb-2">Your Answer</p>
        <p className="font-body text-text-primary font-semibold mb-3 leading-relaxed">{promptText}</p>
        <textarea
          className="w-full bg-game-bg text-text-primary font-body text-xl px-4 py-3 rounded-xl outline-none resize-none"
          style={{ border: '2px solid rgba(45, 45, 78, 0.8)' }}
          placeholder="Type something funny..."
          rows={3}
          maxLength={200}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit() }}
          disabled={disabled || submitting}
          autoFocus
        />
        <p className="text-text-muted font-body text-xs mt-1 text-right">{answer.length}/200</p>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        className="btn-primary text-center w-full"
        onClick={handleSubmit}
        disabled={disabled || submitting || !answer.trim()}
        style={{ opacity: answer.trim() ? 1 : 0.5 }}
      >
        {submitting ? '⏳ Submitting...' : '✅ Submit Answer'}
      </motion.button>
      <p className="text-text-muted font-body text-xs text-center">
        Leave blank to submit an empty answer (bold move)
      </p>
    </div>
  )
}
