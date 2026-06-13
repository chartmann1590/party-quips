import { useState } from 'react'
import { motion } from 'framer-motion'

interface FibInputProps {
  promptText: string
  realAnswer: string    // NOT shown to player
  onSubmit: (entry: string) => Promise<void>
  submitted?: boolean
  submittedAnswer?: string
}

export default function FibInput({ promptText, onSubmit, submitted = false, submittedAnswer }: FibInputProps) {
  const [entry, setEntry] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!entry.trim() || submitting || submitted) return
    setSubmitting(true)
    await onSubmit(entry.trim())
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="game-card flex flex-col items-center gap-3 py-8"
        style={{ border: '2px solid rgba(255, 140, 0, 0.5)' }}
      >
        <div className="text-5xl">🤥</div>
        <p className="font-display text-2xl" style={{ color: '#ff8c00' }}>Lie submitted!</p>
        <p className="text-text-primary font-body text-xl italic">"{submittedAnswer}"</p>
        <p className="text-text-muted font-body text-sm">Now fool the others...</p>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="game-card" style={{ border: '2px solid rgba(255, 140, 0, 0.4)' }}>
        <p className="text-text-muted font-body text-xs uppercase tracking-wider mb-2">Make up a fake answer!</p>
        <p className="font-body text-text-primary text-xl font-semibold mb-4 leading-relaxed">{promptText}</p>
        <input
          className="input-field text-xl"
          placeholder="Type your lie here..."
          value={entry}
          maxLength={100}
          onChange={e => setEntry(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          disabled={submitting}
          autoFocus
        />
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="w-full font-display text-xl py-4 rounded-2xl"
        onClick={handleSubmit}
        disabled={submitting || !entry.trim()}
        style={{
          background: '#ff8c00',
          color: '#0f0f1a',
          opacity: entry.trim() ? 1 : 0.5,
          boxShadow: '0 0 20px rgba(255,140,0,0.4)',
        }}
      >
        {submitting ? '⏳ Submitting...' : '🤥 Submit Lie'}
      </motion.button>
    </div>
  )
}
