import { useState } from 'react'
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

const GAME_GRADIENTS: Record<GameType, string> = {
  quiplash: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
  fibbage: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)',
  trivia: 'linear-gradient(135deg, #831843 0%, #ec4899 100%)',
}

const GAME_GLOW: Record<GameType, string> = {
  quiplash: 'rgba(124, 58, 237, 0.5)',
  fibbage: 'rgba(234, 88, 12, 0.5)',
  trivia: 'rgba(236, 72, 153, 0.5)',
}

export default function HomePage() {
  const navigate = useNavigate()
  const [codeInput, setCodeInput] = useState('')

  function handleJoinSubmit() {
    const clean = codeInput.toUpperCase().replace(/[^A-Z]/g, '')
    if (clean.length === 4) {
      navigate(`/join?room=${clean}`)
    } else {
      navigate('/join')
    }
  }

  return (
    <TVLayout>
      <div className="flex flex-col items-center justify-center flex-1 px-8 py-10 gap-10">

        {/* Hero title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center"
        >
          <h1
            className="font-display font-black text-7xl md:text-8xl tracking-tight"
            style={{
              color: '#ffffff',
              textShadow: '0 0 40px rgba(236,72,153,0.6), 0 0 80px rgba(168,85,247,0.3)',
            }}
          >
            🎉 PARTY QUIPS
          </h1>
          <p className="text-pq-muted font-label text-xl mt-2 tracking-wide">
            The hilarious game show for your phone and TV
          </p>
        </motion.div>

        {/* Main area */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 20 }}
          className="flex flex-col lg:flex-row gap-6 items-stretch w-full max-w-5xl"
        >
          {/* Left: Join a Game */}
          <div className="glass-card p-8 flex flex-col gap-5 min-w-[280px] lg:w-80">
            <div className="text-center">
              <div className="text-4xl mb-2">📱</div>
              <h2 className="font-display font-black text-2xl text-white">Join a Game</h2>
              <p className="text-pq-muted font-label text-sm mt-1">Got a room code? Jump in!</p>
            </div>
            <div className="flex flex-col gap-3">
              <input
                className="input-field uppercase tracking-[0.3em] font-display font-bold text-center text-3xl"
                placeholder="ABCD"
                value={codeInput}
                maxLength={4}
                onChange={e => setCodeInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handleJoinSubmit()}
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleJoinSubmit}
                className="btn-primary w-full"
              >
                JOIN →
              </motion.button>
            </div>
            <button
              className="text-pq-muted font-label text-sm underline underline-offset-2 hover:text-pq-pink transition-colors"
              onClick={() => navigate('/join')}
            >
              Enter full details →
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center">
            <span className="text-pq-muted font-display font-bold text-2xl opacity-60">OR</span>
          </div>

          {/* Right: Host on TV */}
          <div className="flex flex-col gap-4 flex-1">
            <h2 className="font-display font-black text-2xl text-white text-center">
              🖥️ Host on TV
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
              {GAMES.map((game, i) => (
                <motion.button
                  key={game}
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.08, type: 'spring', stiffness: 300, damping: 22 }}
                  whileHover={{ scale: 1.04, y: -4 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate(`/host?game=${game}`)}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl cursor-pointer transition-all text-left"
                  style={{
                    background: GAME_GRADIENTS[game],
                    boxShadow: `0 4px 25px ${GAME_GLOW[game]}, 0 0 40px ${GAME_GLOW[game]}50`,
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <span className="text-5xl">{GAME_ICONS[game]}</span>
                  <div className="text-center">
                    <div className="font-display font-black text-xl text-white">
                      {GAME_LABELS[game]}
                    </div>
                    <div className="font-label text-xs text-white/70 mt-1 leading-tight">
                      {GAME_DESCRIPTIONS[game]}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-pq-muted font-label text-sm text-center tracking-wide"
        >
          2–8 players • Free • No download required • PWA on iPhone ✓
        </motion.p>
      </div>
    </TVLayout>
  )
}
