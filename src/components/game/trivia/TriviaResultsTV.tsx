import { motion } from 'framer-motion'
import type { Player } from '../../../types/room'
import PlayerAvatar from '../../shared/PlayerAvatar'

interface TriviaResultsTVProps {
  question: string
  displayOptions: string[]
  correctIndex: number
  answers: Record<string, number>
  allPlayers: Player[]
  scoreDeltas: Record<string, number>
  round: number
  totalRounds: number
}

const OPTION_COLORS = ['#b537f2', '#00f5ff', '#ff8c00', '#39ff14']
const LABELS = ['A', 'B', 'C', 'D']

export default function TriviaResultsTV({
  question, displayOptions, correctIndex, answers, allPlayers, scoreDeltas, round, totalRounds
}: TriviaResultsTVProps) {
  const getPlayer = (id: string) => allPlayers.find(p => p.id === id)
  const correctPlayers = Object.entries(answers)
    .filter(([, idx]) => idx === correctIndex)
    .map(([id]) => id)

  return (
    <div className="flex flex-col flex-1 p-8 gap-5">
      <div className="flex items-center justify-between">
        <p className="font-display text-neon-pink text-3xl">Deadly Trivia — Round {round}/{totalRounds}</p>
        <div className="flex items-center gap-2">
          <span className="font-display text-neon-green text-2xl">{correctPlayers.length}</span>
          <span className="text-text-muted font-body text-lg">/ {allPlayers.length} correct</span>
        </div>
      </div>

      <div className="game-card text-center" style={{ border: '2px solid rgba(255,45,120,0.4)' }}>
        <p className="font-display text-3xl text-text-primary">{question}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1">
        {displayOptions.map((opt, i) => {
          const isCorrect = i === correctIndex
          const voters = Object.entries(answers)
            .filter(([, idx]) => idx === i)
            .map(([id]) => getPlayer(id))
            .filter(Boolean) as Player[]

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.12 }}
              className="rounded-2xl p-4 flex flex-col gap-3"
              style={{
                background: isCorrect ? 'rgba(57,255,20,0.15)' : 'rgba(255,45,120,0.06)',
                border: `2px solid ${isCorrect ? '#39ff14' : 'rgba(255,45,120,0.25)'}`,
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="font-display px-3 py-1 rounded-lg"
                  style={{
                    background: isCorrect ? '#39ff14' : OPTION_COLORS[i],
                    color: '#0f0f1a',
                  }}
                >
                  {isCorrect ? '✓' : LABELS[i]}
                </span>
                <p className="font-body text-text-primary text-xl font-semibold">{opt}</p>
              </div>

              {voters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {voters.map(p => (
                    <motion.div
                      key={p.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      className="flex items-center gap-1 px-2 py-1 rounded-full"
                      style={{ background: `${p.avatarColor}20`, border: `1px solid ${p.avatarColor}50` }}
                    >
                      <PlayerAvatar name={p.name} color={p.avatarColor} size="sm" />
                      <span className="font-body text-xs" style={{ color: p.avatarColor }}>{p.name}</span>
                      {isCorrect && scoreDeltas[p.id] > 0 && (
                        <span className="font-display text-neon-green text-xs ml-1">+{scoreDeltas[p.id].toLocaleString()}</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
