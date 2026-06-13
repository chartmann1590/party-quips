import { motion } from 'framer-motion'
import type { Player } from '../../../types/room'

interface VotingPairProps {
  promptText: string
  answerA: string
  answerB: string
  playerA: Player | undefined
  playerB: Player | undefined
  votesForA: number
  votesForB: number
  totalVoters: number
  revealed?: boolean
  autoQuippedA?: boolean
  autoQuippedB?: boolean
}

export default function VotingPair({
  promptText, answerA, answerB, playerA, playerB,
  votesForA, votesForB, totalVoters, revealed = false,
  autoQuippedA = false, autoQuippedB = false,
}: VotingPairProps) {
  return (
    <div className="flex flex-col gap-8 flex-1">
      {/* Prompt */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-8"
      >
        <p className="font-display text-4xl md:text-5xl text-text-primary leading-tight">
          {promptText}
        </p>
      </motion.div>

      {/* The two answers */}
      <div className="flex flex-col md:flex-row gap-6 flex-1 px-8">
        {/* Answer A */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 rounded-2xl p-6 flex flex-col gap-4"
          style={{
            background: 'rgba(181,55,242,0.1)',
            border: '3px solid rgba(181,55,242,0.5)',
            boxShadow: '0 0 30px rgba(181,55,242,0.15)',
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="font-display text-3xl px-4 py-2 rounded-xl"
              style={{ background: '#b537f2', color: '#f0f0ff' }}
            >
              A
            </span>
            {revealed && playerA && (
              <span
                className="font-body text-lg font-bold px-3 py-1 rounded-full"
                style={{ background: `${playerA.avatarColor}30`, color: playerA.avatarColor }}
              >
                {playerA.name}
              </span>
            )}
          </div>
          <p className="font-body text-3xl md:text-4xl text-text-primary flex-1 flex items-center">
            {answerA || <em className="text-text-muted text-2xl">(no answer)</em>}
          </p>
          {autoQuippedA && (
            <span className="text-xs font-body px-2 py-1 rounded-full self-start" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
              🤖 Auto-Quip
            </span>
          )}
          {/* Vote bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-game-border rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: totalVoters > 0 ? `${(votesForA / totalVoters) * 100}%` : '0%' }}
                className="h-full rounded-full"
                style={{ background: '#b537f2' }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="font-display text-neon-purple text-xl w-6">{votesForA}</span>
          </div>
        </motion.div>

        {/* VS divider */}
        <div className="flex items-center justify-center">
          <span className="font-display text-4xl text-text-muted">VS</span>
        </div>

        {/* Answer B */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-1 rounded-2xl p-6 flex flex-col gap-4"
          style={{
            background: 'rgba(0,245,255,0.07)',
            border: '3px solid rgba(0,245,255,0.4)',
            boxShadow: '0 0 30px rgba(0,245,255,0.1)',
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="font-display text-3xl px-4 py-2 rounded-xl"
              style={{ background: '#00f5ff', color: '#0f0f1a' }}
            >
              B
            </span>
            {revealed && playerB && (
              <span
                className="font-body text-lg font-bold px-3 py-1 rounded-full"
                style={{ background: `${playerB.avatarColor}30`, color: playerB.avatarColor }}
              >
                {playerB.name}
              </span>
            )}
          </div>
          <p className="font-body text-3xl md:text-4xl text-text-primary flex-1 flex items-center">
            {answerB || <em className="text-text-muted text-2xl">(no answer)</em>}
          </p>
          {autoQuippedB && (
            <span className="text-xs font-body px-2 py-1 rounded-full self-start" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
              🤖 Auto-Quip
            </span>
          )}
          {/* Vote bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-game-border rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: totalVoters > 0 ? `${(votesForB / totalVoters) * 100}%` : '0%' }}
                className="h-full rounded-full"
                style={{ background: '#00f5ff' }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="font-display text-neon-cyan text-xl w-6">{votesForB}</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
