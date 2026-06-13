import { motion } from 'framer-motion'
import CountdownTimer from '../../shared/CountdownTimer'
import type { SystemData } from '../../../types/room'

interface FibbageVotingTVProps {
  promptText: string
  choices: string[]
  votes: Record<string, string>
  totalVoters: number
  system: SystemData
  promptNumber: number
  totalPrompts: number
}

const CHOICE_COLORS = ['#b537f2', '#00f5ff', '#ff8c00', '#ff2d78', '#39ff14', '#ffeb00']
const LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

export default function FibbageVotingTV({
  promptText, choices, votes, totalVoters, system, promptNumber, totalPrompts
}: FibbageVotingTVProps) {
  const votesDone = Object.keys(votes).length

  return (
    <div className="flex flex-col flex-1 p-6 gap-4">
      <div className="flex items-center justify-between">
        <span className="font-display text-2xl" style={{ color: '#ff8c00' }}>
          Fib Finder — Prompt {promptNumber}/{totalPrompts}
        </span>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="font-display text-neon-yellow text-2xl">{votesDone}/{totalVoters}</p>
            <p className="text-text-muted font-body text-xs">voted</p>
          </div>
          <CountdownTimer totalSeconds={system.timerDuration} startedAt={system.timerStartedAt} size={70} />
        </div>
      </div>

      <div className="game-card text-center py-6" style={{ border: '2px solid rgba(255,140,0,0.4)' }}>
        <p className="text-text-muted font-body text-sm uppercase tracking-wider mb-2">Which is the real answer?</p>
        <p className="font-display text-3xl text-text-primary leading-relaxed">{promptText}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1">
        {choices.map((choice, i) => {
          const color = CHOICE_COLORS[i % CHOICE_COLORS.length]
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: `${color}12`, border: `2px solid ${color}45` }}
            >
              <span
                className="font-display text-xl w-10 h-10 flex items-center justify-center rounded-xl shrink-0"
                style={{ background: color, color: '#0f0f1a' }}
              >
                {LABELS[i]}
              </span>
              <p className="font-body text-text-primary text-xl">{choice}</p>
            </motion.div>
          )
        })}
      </div>

      <p className="text-center text-text-muted font-body text-sm">
        Pick on your phone — results reveal when everyone votes!
      </p>
    </div>
  )
}
