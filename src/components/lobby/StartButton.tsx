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
        whileHover={canStart ? { scale: 1.04 } : {}}
        whileTap={canStart ? { scale: 0.95 } : {}}
        className={`
          font-display font-bold text-2xl px-12 py-5 rounded-full transition-all duration-200
          ${canStart ? 'cursor-pointer' : 'cursor-not-allowed'}
        `}
        style={canStart ? {
          background: '#fde047',
          color: '#1e1b4b',
          boxShadow: '0 6px 0 #a16207, 0 10px 30px rgba(253,224,71,0.4)',
        } : {
          background: 'rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.35)',
          border: '2px solid rgba(255,255,255,0.15)',
          boxShadow: 'none',
        }}
      >
        {canStart ? '🎮 START GAME' : 'Waiting...'}
      </motion.button>
      {!canStart && needed > 0 && (
        <p className="text-pq-muted font-label text-sm">
          Need {needed} more player{needed !== 1 ? 's' : ''} to start
        </p>
      )}
    </div>
  )
}
