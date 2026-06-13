import { useState } from 'react'
import { motion } from 'framer-motion'
import { generateAutoQuip } from '../../../lib/autoQuip'

interface AnswerInputProps {
  promptText: string
  onSubmit: (answer: string) => Promise<void>
  disabled?: boolean
  submitted?: boolean
}

export default function AnswerInput({ promptText, onSubmit, disabled = false, submitted = false }: AnswerInputProps) {
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  async function handleSubmit() {
    if (submitting || submitted) return
    setSubmitting(true)
    await onSubmit(answer.trim())
    setSubmitting(false)
  }

  async function handleAutoQuip() {
    if (aiLoading || submitting || submitted) return
    setAiLoading(true)
    try {
      const quip = await generateAutoQuip(promptText)
      setAnswer(quip)
      setAiLoading(false)
      setSubmitting(true)
      await onSubmit(quip.trim())
      setSubmitting(false)
    } catch {
      setAiLoading(false)
    }
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
          disabled={disabled || submitting || aiLoading}
          autoFocus
        />
        <p className="text-text-muted font-body text-xs mt-1 text-right">{answer.length}/200</p>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        className="btn-primary text-center w-full"
        onClick={handleSubmit}
        disabled={disabled || submitting || aiLoading || !answer.trim()}
        style={{ opacity: answer.trim() ? 1 : 0.5 }}
      >
        {submitting ? '⏳ Submitting...' : '✅ Submit Answer'}
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleAutoQuip}
        disabled={disabled || submitting || aiLoading || submitted}
        className="w-full py-3 px-4 rounded-2xl font-display font-black text-base transition-all"
        style={{
          background: aiLoading ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.15)',
          border: '2px solid rgba(99,102,241,0.5)',
          color: aiLoading ? 'rgba(165,180,252,0.7)' : '#a5b4fc',
          opacity: aiLoading ? 0.8 : 1,
        }}
      >
        {aiLoading ? '🤖 Generating...' : '🤖 Auto-Quip'}
      </motion.button>

      <p className="text-text-muted font-body text-xs text-center">
        Leave blank to submit an empty answer (bold move)
      </p>
    </div>
  )
}
