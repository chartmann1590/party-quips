import { useState } from 'react'
import { motion } from 'framer-motion'

interface SketchGuessInputProps {
  drawingUrl: string
  artistName: string
  submitted: boolean
  submittedGuess?: string
  onSubmit: (guess: string) => void
}

export default function SketchGuessInput({
  drawingUrl,
  artistName,
  submitted,
  submittedGuess,
  onSubmit,
}: SketchGuessInputProps) {
  const [guess, setGuess] = useState(submittedGuess ?? '')

  function handleSubmit() {
    const clean = guess.trim()
    if (clean.length < 2 || submitted) return
    onSubmit(clean)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="game-card text-center" style={{ border: '2px solid rgba(56,189,248,0.45)' }}>
        <p className="text-text-muted font-body text-xs uppercase tracking-wider mb-2">{artistName}'s drawing</p>
        <div className="rounded-xl bg-white p-2">
          <img src={drawingUrl} alt="Drawing to title" className="w-full rounded-lg" />
        </div>
      </div>
      {submitted ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="text-5xl">✓</div>
          <p className="font-display text-neon-green text-2xl text-center">Fake title sent!</p>
          <p className="text-text-muted font-body text-center">{submittedGuess}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <input
            className="input-field text-center text-lg"
            value={guess}
            maxLength={60}
            placeholder="Write a convincing fake title"
            onChange={event => setGuess(event.target.value)}
            onKeyDown={event => event.key === 'Enter' && handleSubmit()}
          />
          <motion.button
            whileTap={{ scale: 0.96 }}
            className="btn-primary"
            onClick={handleSubmit}
            disabled={guess.trim().length < 2}
          >
            Submit Fake Title
          </motion.button>
        </div>
      )}
    </div>
  )
}
