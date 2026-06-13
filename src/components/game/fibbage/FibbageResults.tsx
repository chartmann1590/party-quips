import { motion } from 'framer-motion'
import type { Player } from '../../../types/room'
import PlayerAvatar from '../../shared/PlayerAvatar'

interface FibbageResultsProps {
  promptText: string
  realAnswer: string
  choices: string[]
  votes: Record<string, string>
  fakesAuthored: Record<string, string>  // answer -> playerId
  allPlayers: Player[]
  scoreDeltas: Record<string, number>
}

export default function FibbageResults({
  promptText, realAnswer, choices, votes, fakesAuthored, allPlayers, scoreDeltas
}: FibbageResultsProps) {
  const getPlayer = (id: string) => allPlayers.find(p => p.id === id)
  const getVotersFor = (choice: string) => Object.entries(votes).filter(([, v]) => v === choice).map(([vid]) => vid)

  return (
    <div className="flex flex-col gap-6 px-8">
      <p className="font-display text-3xl text-text-primary text-center">{promptText}</p>

      <div className="flex flex-col gap-3">
        {choices.map((choice, i) => {
          const isReal = choice === realAnswer
          const authorId = fakesAuthored[choice]
          const author = authorId ? getPlayer(authorId) : null
          const voters = getVotersFor(choice)

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-4 flex flex-col gap-2"
              style={{
                background: isReal ? 'rgba(57,255,20,0.1)' : 'rgba(255,45,120,0.08)',
                border: `2px solid ${isReal ? 'rgba(57,255,20,0.5)' : 'rgba(255,45,120,0.3)'}`,
              }}
            >
              <div className="flex items-center gap-3">
                <span className={`font-display text-lg px-3 py-1 rounded-lg`}
                  style={{
                    background: isReal ? '#39ff14' : '#ff2d78',
                    color: isReal ? '#0f0f1a' : '#f0f0ff',
                  }}
                >
                  {isReal ? '✓ REAL' : '✗ LIE'}
                </span>
                <p className="font-body text-text-primary text-xl flex-1">{choice}</p>
                {author && !isReal && (
                  <div className="flex items-center gap-2">
                    <PlayerAvatar name={author.name} color={author.avatarColor} size="sm" />
                    <span className="font-body text-sm" style={{ color: author.avatarColor }}>{author.name}</span>
                    {scoreDeltas[authorId] > 0 && (
                      <span className="font-display text-neon-green text-sm">+{scoreDeltas[authorId]}</span>
                    )}
                  </div>
                )}
                {isReal && voters.map(vid => {
                  const voter = getPlayer(vid)
                  return voter && scoreDeltas[vid] > 0 ? (
                    <span key={vid} className="font-display text-neon-green text-sm">+{scoreDeltas[vid]}</span>
                  ) : null
                })}
              </div>

              {/* Voters */}
              {voters.length > 0 && (
                <div className="flex flex-wrap gap-2 ml-2">
                  <span className="text-text-muted font-body text-xs">Voted by:</span>
                  {voters.map(vid => {
                    const voter = getPlayer(vid)
                    return voter ? (
                      <span key={vid} className="px-2 py-0.5 rounded-full font-body text-xs"
                        style={{ background: `${voter.avatarColor}30`, color: voter.avatarColor }}>
                        {voter.name}
                      </span>
                    ) : null
                  })}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
