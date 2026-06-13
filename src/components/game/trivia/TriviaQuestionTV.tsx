import { motion } from 'framer-motion'
import CountdownTimer from '../../shared/CountdownTimer'
import type { SystemData } from '../../../types/room'

interface TriviaQuestionTVProps {
  question: string
  category: string
  difficulty: string
  displayOptions: string[]
  submittedCount: number
  totalPlayers: number
  system: SystemData
  round: number
  totalRounds: number
}

const OPTION_COLORS = ['#b537f2', '#00f5ff', '#ff8c00', '#39ff14']
const LABELS = ['A', 'B', 'C', 'D']

export default function TriviaQuestionTV({
  question, category, difficulty, displayOptions,
  submittedCount, totalPlayers, system, round, totalRounds
}: TriviaQuestionTVProps) {
  const difficultyColor =
    difficulty === 'easy' ? '#39ff14' :
    difficulty === 'medium' ? '#ffeb00' : '#ff2d78'

  return (
    <div className="flex flex-col flex-1 p-8 gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-neon-pink text-3xl">Deadly Trivia</p>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-text-muted font-body">Round {round}/{totalRounds}</p>
            <span className="text-xs font-body px-2 py-0.5 rounded-full" style={{ background: `${difficultyColor}25`, color: difficultyColor }}>
              {category}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="font-display text-neon-green text-2xl">{submittedCount}/{totalPlayers}</p>
            <p className="text-text-muted font-body text-xs">answered</p>
          </div>
          <CountdownTimer totalSeconds={system.timerDuration} startedAt={system.timerStartedAt} size={80} />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="game-card text-center py-8"
        style={{ border: '2px solid rgba(255,45,120,0.4)' }}
      >
        <p className="font-display text-4xl text-text-primary leading-relaxed">{question}</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {displayOptions.map((opt, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: `${OPTION_COLORS[i]}15`, border: `2px solid ${OPTION_COLORS[i]}50` }}
          >
            <span
              className="font-display text-2xl w-10 h-10 flex items-center justify-center rounded-xl shrink-0"
              style={{ background: OPTION_COLORS[i], color: '#0f0f1a' }}
            >
              {LABELS[i]}
            </span>
            <p className="font-body text-text-primary text-xl">{opt}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
