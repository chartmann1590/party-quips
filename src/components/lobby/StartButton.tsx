import { motion } from 'framer-motion'

interface StartButtonProps {
  onStart: () => void
  playerCount: number
  minPlayers?: number
  disabled?: boolean
}

export default function StartButton({ onStart, playerCount, minPlayers = 2, disabled = false }: StartButtonProps) {
  const canStart = playerCount >= minPlayers && !disabled
  const needed = minPlayers - playerCount

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        onClick={canStart ? onStart : undefined}
        disabled={!canStart}
        whileHover={canStart ? { scale: 1.05 } : {}}
        whileTap={canStart ? { scale: 0.95 } : {}}
        className={`
          font-display text-2xl px-12 py-5 rounded-2xl transition-all duration-200
          ${canStart
            ? 'bg-neon-purple text-white cursor-pointer'
            : 'bg-game-border text-text-muted cursor-not-allowed opacity-60'
          }
        `}
        style={canStart ? {
          boxShadow: '0 0 30px rgba(181,55,242,0.6), 0 0 60px rgba(181,55,242,0.3)',
        } : {}}
      >
        {canStart ? '🎮 START GAME' : `Waiting...`}
      </motion.button>
      {!canStart && needed > 0 && (
        <p className="text-text-muted font-body text-sm">
          Need {needed} more player{needed !== 1 ? 's' : ''} to start
        </p>
      )}
    </div>
  )
}
