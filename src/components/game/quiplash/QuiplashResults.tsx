import { motion } from 'framer-motion'
import type { Player } from '../../../types/room'
import PlayerAvatar from '../../shared/PlayerAvatar'

interface QuiplashResultsProps {
  promptText: string
  answerA: string
  answerB: string
  playerA: Player | undefined
  playerB: Player | undefined
  votesForA: string[]
  votesForB: string[]
  deltaA: number
  deltaB: number
  quiplash: boolean
  allPlayers: Player[]
  autoQuippedA?: boolean
  autoQuippedB?: boolean
}

export default function QuiplashResults({
  promptText, answerA, answerB, playerA, playerB,
  votesForA, votesForB, deltaA, deltaB, quiplash, allPlayers,
  autoQuippedA = false, autoQuippedB = false,
}: QuiplashResultsProps) {
  const getPlayer = (id: string) => allPlayers.find(p => p.id === id)

  const winner = deltaA > deltaB ? playerA : deltaB > deltaA ? playerB : null

  return (
    <div className="flex flex-col gap-6 flex-1 px-8">
      {/* Quiplash banner */}
      {quiplash && (
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          className="text-center py-4 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #b537f2, #ff2d78)',
            boxShadow: '0 0 40px rgba(181,55,242,0.6)',
          }}
        >
          <p className="font-display text-5xl text-white">⚡ QUIPLASH! ⚡</p>
          <p className="font-body text-white/80 text-lg">Unanimous vote!</p>
        </motion.div>
      )}

      {/* Prompt */}
      <p className="font-display text-3xl text-text-primary text-center">{promptText}</p>

      {/* Results */}
      <div className="flex flex-col md:flex-row gap-4 flex-1">
        {[
          { player: playerA, answer: answerA, delta: deltaA, votes: votesForA, color: '#b537f2', label: 'A', autoQuipped: autoQuippedA },
          { player: playerB, answer: answerB, delta: deltaB, votes: votesForB, color: '#00f5ff', label: 'B', autoQuipped: autoQuippedB },
        ].map(({ player, answer, delta, votes, color, label, autoQuipped }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 rounded-2xl p-5 flex flex-col gap-3"
            style={{
              background: `${color}10`,
              border: `2px solid ${color}50`,
            }}
          >
            {player && (
              <div className="flex items-center gap-3">
                <PlayerAvatar name={player.name} color={player.avatarColor} size="md" />
                <div>
                  <p className="font-display text-xl" style={{ color }}>{player.name}</p>
                  <p className="text-text-muted font-body text-sm">{votes.length} vote{votes.length !== 1 ? 's' : ''}</p>
                </div>
                {delta > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring' }}
                    className="ml-auto font-display text-2xl text-neon-green"
                  >
                    +{delta.toLocaleString()}
                  </motion.span>
                )}
              </div>
            )}
            <p className="font-body text-xl text-text-primary italic">"{answer || 'nothing'}"</p>
            {autoQuipped && (
              <span className="text-xs font-body px-2 py-1 rounded-full self-start" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
                🤖 Auto-Quip
              </span>
            )}

            {/* Voters */}
            {votes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-auto">
                {votes.map(vid => {
                  const voter = getPlayer(vid)
                  return voter ? (
                    <span
                      key={vid}
                      className="px-2 py-1 rounded-full font-body text-xs"
                      style={{ background: `${voter.avatarColor}30`, color: voter.avatarColor }}
                    >
                      {voter.name}
                    </span>
                  ) : null
                })}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
