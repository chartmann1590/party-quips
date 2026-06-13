import { motion } from 'framer-motion'

interface PromptCardProps {
  promptText: string
  index: number
  answered?: boolean
}

export default function PromptCard({ promptText, index, answered = false }: PromptCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="game-card relative"
      style={{
        border: answered
          ? '2px solid rgba(57, 255, 20, 0.5)'
          : '2px solid rgba(181, 55, 242, 0.4)',
        boxShadow: answered
          ? '0 0 15px rgba(57, 255, 20, 0.2)'
          : '0 0 15px rgba(181, 55, 242, 0.1)',
      }}
    >
      <p className="text-text-muted font-body text-xs uppercase tracking-wider mb-2">
        Prompt {index + 1}
      </p>
      <p className="font-body text-text-primary text-xl font-semibold leading-relaxed">
        {promptText}
      </p>
      {answered && (
        <div className="absolute top-3 right-3 text-neon-green text-xl">✓</div>
      )}
    </motion.div>
  )
}
