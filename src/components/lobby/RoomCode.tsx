import { motion } from 'framer-motion'

interface RoomCodeProps {
  code: string
  size?: 'normal' | 'large'
}

export default function RoomCode({ code, size = 'normal' }: RoomCodeProps) {
  const charClass = size === 'large'
    ? 'text-8xl md:text-9xl'
    : 'text-6xl md:text-7xl'

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-text-muted font-body text-lg uppercase tracking-widest">Room Code</p>
      <div className="flex gap-3">
        {code.split('').map((char, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -20, rotate: -10 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 400, damping: 20 }}
            className={`
              font-display ${charClass} font-bold
              bg-game-surface rounded-2xl flex items-center justify-center
              aspect-square px-4
            `}
            style={{
              color: '#b537f2',
              textShadow: '0 0 20px rgba(181,55,242,0.8), 0 0 60px rgba(181,55,242,0.4)',
              border: '3px solid rgba(181,55,242,0.5)',
              boxShadow: '0 0 30px rgba(181,55,242,0.3), inset 0 0 20px rgba(181,55,242,0.1)',
            }}
          >
            {char}
          </motion.div>
        ))}
      </div>
      <p className="text-text-muted font-body text-base mt-1">
        Go to <span className="text-neon-cyan font-bold">party-quips</span> on your phone
      </p>
    </div>
  )
}
