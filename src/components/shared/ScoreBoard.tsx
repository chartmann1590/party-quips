import { motion, AnimatePresence } from 'framer-motion'
import type { Player } from '../../types/room'
import PlayerAvatar from './PlayerAvatar'

interface ScoreBoardProps {
  players: Player[]
  isFinal?: boolean
  deltaMap?: Record<string, number>
  compact?: boolean
}

export default function ScoreBoard({ players, isFinal = false, deltaMap = {}, compact = false }: ScoreBoardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="flex flex-col gap-3 w-full">
      <AnimatePresence mode="popLayout">
        {sorted.map((player, i) => (
          <motion.div
            key={player.id}
            layout
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 30 }}
            className={`flex items-center gap-4 rounded-2xl ${compact ? 'p-3' : 'p-4'}`}
            style={{
              background: i === 0 && isFinal
                ? `linear-gradient(135deg, ${player.avatarColor}30, ${player.avatarColor}10)`
                : 'rgba(26, 26, 46, 0.8)',
              border: `1px solid ${i === 0 && isFinal ? player.avatarColor : 'rgba(45, 45, 78, 0.5)'}`,
              boxShadow: i === 0 && isFinal ? `0 0 20px ${player.avatarColor}40` : 'none',
            }}
          >
            {/* Rank */}
            <span className={`font-display ${compact ? 'text-lg w-6' : 'text-2xl w-8'} text-center`}>
              {isFinal && i < 3 ? medals[i] : `${i + 1}`}
            </span>

            {/* Avatar */}
            <PlayerAvatar name={player.name} color={player.avatarColor} size={compact ? 'sm' : 'md'} />

            {/* Name */}
            <span className={`flex-1 font-body ${compact ? 'text-base' : 'text-xl'} font-bold text-text-primary truncate`}>
              {player.name}
            </span>

            {/* Score + delta */}
            <div className="flex flex-col items-end">
              <span className={`font-display ${compact ? 'text-lg' : 'text-2xl'} text-text-primary`}>
                {player.score.toLocaleString()}
              </span>
              {deltaMap[player.id] != null && deltaMap[player.id] > 0 && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-display text-neon-green text-sm"
                >
                  +{deltaMap[player.id].toLocaleString()}
                </motion.span>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
