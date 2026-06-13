import { motion } from 'framer-motion'

interface RoomCodeProps {
  code: string
  size?: 'normal' | 'large'
}

export default function RoomCode({ code, size = 'normal' }: RoomCodeProps) {
  const charClass = size === 'large' ? 'text-8xl md:text-9xl' : 'text-6xl md:text-7xl'
  const boxSize = size === 'large' ? 'w-32 h-32 md:w-40 md:h-40' : 'w-20 h-20 md:w-24 md:h-24'

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-label text-sm uppercase tracking-[0.2em] font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
        Room Code
      </p>
      <div className="flex gap-3">
        {code.split('').map((char, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 400, damping: 20 }}
            className={`${boxSize} ${charClass} room-code-box`}
            style={{ background: '#fde047', color: '#1e1b4b', border: '3px solid #ca8a04' }}
          >
            {char}
          </motion.div>
        ))}
      </div>
      <p className="font-label text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
        Go to <span className="font-black" style={{ color: '#fde047' }}>party-quips</span> on your phone
      </p>
    </div>
  )
}
