import { AnimatePresence, motion } from 'framer-motion'
import type { Player } from '../../types/room'
import PlayerAvatar from '../shared/PlayerAvatar'

interface PlayerListProps {
  players: Player[]
  compact?: boolean
}

export default function PlayerList({ players, compact = false }: PlayerListProps) {
  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6">
        <div className="text-4xl animate-pulse">👀</div>
        <p className="text-text-muted font-body text-lg">Waiting for players...</p>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-3 justify-center">
        <AnimatePresence>
          {players.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <PlayerAvatar name={p.name} color={p.avatarColor} size="md" showName connected={p.connected} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <AnimatePresence>
        {players.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
            className="flex items-center gap-4 bg-game-surface rounded-xl p-3"
            style={{ border: `1px solid ${p.avatarColor}40` }}
          >
            <PlayerAvatar name={p.name} color={p.avatarColor} size="md" connected={p.connected} />
            <span className="font-body font-bold text-text-primary text-lg flex-1">{p.name}</span>
            {p.isHost && (
              <span className="text-xs font-body text-neon-yellow bg-neon-yellow/10 px-2 py-1 rounded-full border border-neon-yellow/30">
                HOST
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
