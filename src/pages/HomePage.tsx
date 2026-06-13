import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import TVLayout from '../components/layout/TVLayout'
import { GAME_LABELS, GAME_DESCRIPTIONS, type GameType } from '../types/room'

const GAMES: GameType[] = ['quiplash', 'fibbage', 'trivia']
const GAME_ICONS: Record<GameType, string> = {
  quiplash: '😂',
  fibbage: '🤥',
  trivia: '💀',
}
const GAME_COLORS: Record<GameType, string> = {
  quiplash: '#b537f2',
  fibbage: '#ff8c00',
  trivia: '#ff2d78',
}

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <TVLayout>
      <div className="flex flex-col items-center justify-center flex-1 px-8 py-12 gap-12">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center"
        >
          <h1
            className="font-display text-7xl md:text-8xl"
            style={{
              color: '#b537f2',
              textShadow: '0 0 30px rgba(181,55,242,0.8), 0 0 80px rgba(181,55,242,0.4)',
            }}
          >
            🎉 PARTY QUIPS
          </h1>
          <p className="text-text-muted font-body text-2xl mt-2">
            The hilarious game show for your phone and TV
          </p>
        </motion.div>

        {/* Main CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
          className="flex flex-col sm:flex-row gap-6 items-center"
        >
          {/* Join card */}
          <div
            className="flex flex-col items-center gap-4 game-card w-72 text-center cursor-pointer group"
            onClick={() => navigate('/join')}
            style={{ border: '2px solid rgba(0,245,255,0.4)' }}
          >
            <div className="text-5xl group-hover:scale-110 transition-transform">📱</div>
            <h2 className="font-display text-neon-cyan text-3xl">Join a Game</h2>
            <p className="text-text-muted font-body">Got a room code? Jump in!</p>
            <button className="btn-secondary w-full">Enter Code →</button>
          </div>

          <div className="text-text-muted font-display text-3xl">OR</div>

          {/* Host card */}
          <div className="flex flex-col gap-4 items-center">
            <h2 className="font-display text-neon-purple text-3xl">🖥️ Host on TV</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              {GAMES.map((game, i) => (
                <motion.button
                  key={game}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/host?game=${game}`)}
                  className="flex flex-col items-center gap-2 px-6 py-5 rounded-2xl cursor-pointer transition-all"
                  style={{
                    background: `${GAME_COLORS[game]}20`,
                    border: `2px solid ${GAME_COLORS[game]}60`,
                    boxShadow: `0 0 20px ${GAME_COLORS[game]}20`,
                  }}
                >
                  <span className="text-4xl">{GAME_ICONS[game]}</span>
                  <span className="font-display text-lg" style={{ color: GAME_COLORS[game] }}>
                    {GAME_LABELS[game]}
                  </span>
                  <span className="text-text-muted font-body text-xs text-center max-w-[120px]">
                    {GAME_DESCRIPTIONS[game]}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-text-muted font-body text-sm text-center"
        >
          2–8 players • Free • No download required • PWA on iPhone ✓
        </motion.p>
      </div>
    </TVLayout>
  )
}
