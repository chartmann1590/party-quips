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

const GAME_COLORS: Record<GameType, string> = {
  quiplash: '#0891b2',
  fibbage: '#ea580c',
  trivia: '#dc2626',
}

const GAME_SHADOW_COLORS: Record<GameType, string> = {
  quiplash: '#0e7490',
  fibbage: '#c2410c',
  trivia: '#b91c1c',
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
      <div className="flex flex-col flex-1 px-10 py-8 gap-6 max-h-screen overflow-hidden">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          className="text-center"
        >
          <h1
            className="font-display font-black leading-none tracking-tight"
            style={{
              fontSize: 'clamp(3.5rem, 7vw, 6rem)',
              color: '#fde047',
              textShadow: '4px 4px 0 #92400e, 0 0 60px rgba(253,224,71,0.3)',
            }}
          >
            🎉 PARTY QUIPS
          </h1>
          <p
            className="font-label font-semibold mt-2 tracking-widest uppercase"
            style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem' }}
          >
            The hilarious game show for your phone and TV
          </p>
        </motion.div>

        {/* Main layout */}
        <div className="flex flex-1 gap-8 items-stretch min-h-0">

          {/* LEFT — Join a Game (white card) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 22 }}
            className="flex-none flex flex-col rounded-3xl overflow-hidden"
            style={{
              width: 'clamp(240px, 22vw, 300px)',
              background: '#ffffff',
              boxShadow: '0 8px 0 rgba(0,0,0,0.25), 0 16px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div className="flex flex-col flex-1 p-8 gap-5">
              <div className="text-center">
                <div style={{ fontSize: '2.5rem' }}>📱</div>
                <h2
                  className="font-display font-black text-2xl mt-2"
                  style={{ color: '#1e1b4b' }}
                >
                  JOIN A GAME
                </h2>
                <p className="font-label text-sm mt-1" style={{ color: '#6b7280' }}>
                  Enter the room code from the TV
                </p>
              </div>

              <input
                className="font-display font-black text-center rounded-xl px-4 py-3 outline-none tracking-[0.3em] uppercase w-full transition-all duration-150"
                style={{
                  fontSize: '2rem',
                  background: '#f3f4f6',
                  border: '3px solid #e5e7eb',
                  color: '#1e1b4b',
                }}
                onFocus={e => (e.target.style.borderColor = '#fbbf24')}
                onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                placeholder="ABCD"
                value={codeInput}
                maxLength={4}
                onChange={e => setCodeInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handleJoinSubmit()}
              />

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleJoinSubmit}
                className="btn-primary w-full"
              >
                JOIN GAME →
              </motion.button>

              <button
                className="font-label text-sm text-center transition-colors"
                style={{ color: '#9ca3af' }}
                onMouseOver={e => ((e.target as HTMLElement).style.color = '#4b5563')}
                onMouseOut={e => ((e.target as HTMLElement).style.color = '#9ca3af')}
                onClick={() => navigate('/join')}
              >
                Enter name + code →
              </button>
            </div>
          </motion.div>

          {/* OR divider */}
          <div className="flex flex-col items-center justify-center gap-3 flex-none">
            <div className="flex-1 w-px" style={{ background: 'rgba(255,255,255,0.2)' }} />
            <span
              className="font-display font-black text-xl"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              OR
            </span>
            <div className="flex-1 w-px" style={{ background: 'rgba(255,255,255,0.2)' }} />
          </div>

          {/* RIGHT — Host on TV */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 22 }}
            className="flex flex-col flex-1 gap-4 min-h-0"
          >
            <p
              className="font-label font-semibold uppercase tracking-[0.2em] text-center"
              style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}
            >
              🖥️ HOST ON YOUR TV — PICK A GAME
            </p>

            <div className="flex gap-4 flex-1 min-h-0">
              {GAMES.map((game, i) => (
                <motion.button
                  key={game}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
                  whileHover={{ y: -6, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/host?game=${game}`)}
                  className="flex flex-col rounded-3xl cursor-pointer text-white text-left overflow-hidden flex-1"
                  style={{
                    background: GAME_COLORS[game],
                    boxShadow: `0 8px 0 ${GAME_SHADOW_COLORS[game]}, 0 14px 35px rgba(0,0,0,0.35)`,
                    border: '3px solid rgba(255,255,255,0.2)',
                    padding: 'clamp(1rem, 2vw, 1.75rem)',
                  }}
                >
                  <div style={{ fontSize: 'clamp(3rem, 5vw, 5rem)' }} className="leading-none">
                    {GAME_ICONS[game]}
                  </div>

                  <div className="mt-auto pt-4">
                    <div
                      className="font-display font-black leading-tight"
                      style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)' }}
                    >
                      {GAME_LABELS[game]}
                    </div>
                    <div
                      className="font-label mt-1 leading-snug"
                      style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}
                    >
                      {GAME_DESCRIPTIONS[game]}
                    </div>
                    <div
                      className="mt-4 inline-block rounded-full font-display font-black uppercase"
                      style={{
                        background: 'rgba(0,0,0,0.25)',
                        padding: '0.4rem 1rem',
                        fontSize: '0.8rem',
                        letterSpacing: '0.05em',
                        border: '2px solid rgba(255,255,255,0.25)',
                      }}
                    >
                      HOST THIS →
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-between gap-4"
        >
          <p
            className="font-label text-center"
            style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', letterSpacing: '0.05em' }}
          >
            2–8 players • Free • No download required • PWA on iPhone ✓
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/store')}
              className="font-label text-xs transition-opacity hover:opacity-80"
              style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.03em' }}
            >
              🛍️ Add-On Store
            </button>
            <button
              onClick={() => navigate('/feedback')}
              className="font-label text-xs transition-opacity hover:opacity-80"
              style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.03em' }}
            >
              🐛 Report a Problem
            </button>
          </div>
        </motion.div>
      </div>
    </TVLayout>
  )
}
