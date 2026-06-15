import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PhoneLayout from '../components/layout/PhoneLayout'
import { ensureAuthenticated } from '../firebase/auth'
import { addPlayer } from '../firebase/database'
import { registerPresence } from '../firebase/presence'
import { useGameStore } from '../store/gameStore'
import { AVATAR_COLORS } from '../types/room'
import { get } from 'firebase/database'
import { roomMetaRef } from '../firebase/database'

export default function MobileHomePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { setPlayer, setRoomCode } = useGameStore()

  const initialRoom = params.get('room')?.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) ?? ''
  const [codeChars, setCodeChars] = useState<string[]>(
    Array.from({ length: 4 }, (_, i) => initialRoom[i] ?? '')
  )
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showHostInfo, setShowHostInfo] = useState(false)

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const code = codeChars.join('')

  useEffect(() => {
    if (!initialRoom) inputRefs[0].current?.focus()
  }, [])

  function handleCharInput(i: number, val: string) {
    const char = val.toUpperCase().replace(/[^A-Z]/g, '').slice(-1)
    const next = [...codeChars]
    next[i] = char
    setCodeChars(next)
    if (char && i < 3) inputRefs[i + 1].current?.focus()
  }

  function handleCharKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !codeChars[i] && i > 0) {
      const next = [...codeChars]
      next[i - 1] = ''
      setCodeChars(next)
      inputRefs[i - 1].current?.focus()
    } else if (e.key === 'ArrowLeft' && i > 0) {
      inputRefs[i - 1].current?.focus()
    } else if (e.key === 'ArrowRight' && i < 3) {
      inputRefs[i + 1].current?.focus()
    } else if (e.key === 'Enter') {
      handleJoin()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4)
    const next = Array.from({ length: 4 }, (_, i) => pasted[i] ?? '')
    setCodeChars(next)
    inputRefs[Math.min(pasted.length, 3)].current?.focus()
    e.preventDefault()
  }

  async function handleJoin() {
    if (code.length !== 4) { setError('Enter the 4-letter room code'); return }
    if (!name.trim()) { setError('Enter your name'); return }

    setLoading(true)
    setError('')

    try {
      const user = await ensureAuthenticated()

      const snap = await get(roomMetaRef(code))
      if (!snap.exists()) { setError(`Room "${code}" not found`); setLoading(false); return }
      if (snap.val().state === 'done' && snap.val().hostOnline !== true) { setError('That game is already over'); setLoading(false); return }

      const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]

      await addPlayer(code, {
        id: user.uid,
        name: name.trim(),
        score: 0,
        connected: true,
        isHost: false,
        avatarColor: color,
        joinedAt: Date.now(),
      })

      registerPresence(code, user.uid, false)
      setPlayer(user.uid, name.trim())
      setRoomCode(code)

      navigate('/play')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not join room'
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <PhoneLayout>
      <div className="flex flex-col flex-1 gap-6">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          className="text-center pt-4 pb-2"
        >
          <div style={{ fontSize: '3.5rem', lineHeight: 1 }}>🎉</div>
          <h1
            className="font-display font-black mt-2 leading-none"
            style={{
              fontSize: '2.75rem',
              color: '#fde047',
              textShadow: '3px 3px 0 #92400e, 0 0 40px rgba(253,224,71,0.25)',
            }}
          >
            PARTY QUIPS
          </h1>
          <p className="font-label font-semibold mt-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem' }}>
            The hilarious phone party game
          </p>
        </motion.div>

        {/* Join card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, type: 'spring', stiffness: 240, damping: 22 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: '#ffffff', boxShadow: '0 8px 0 rgba(0,0,0,0.25), 0 16px 40px rgba(0,0,0,0.3)' }}
        >
          <div className="px-6 py-5 flex flex-col gap-5">
            <div className="text-center">
              <p className="font-display font-black text-xl" style={{ color: '#1e1b4b' }}>
                📱 JOIN A GAME
              </p>
              <p className="font-label text-sm mt-1" style={{ color: '#6b7280' }}>
                Enter the code shown on the TV
              </p>
            </div>

            {/* Code boxes */}
            <div className="flex gap-3 justify-center" onPaste={handlePaste}>
              {codeChars.map((char, i) => (
                <div key={i} className="relative w-16 h-16">
                  <input
                    ref={inputRefs[i]}
                    type="text"
                    inputMode="text"
                    maxLength={1}
                    value={char}
                    onChange={e => handleCharInput(i, e.target.value)}
                    onKeyDown={e => handleCharKeyDown(i, e)}
                    onFocus={e => e.target.select()}
                    disabled={loading}
                    className="w-full h-full font-black text-center uppercase rounded-2xl outline-none transition-all duration-150"
                    style={{
                      caretColor: 'transparent',
                      background: '#fde047',
                      color: '#1e1b4b',
                      border: '3px solid #ca8a04',
                      boxShadow: '0 4px 0 #a16207',
                      fontSize: '2rem',
                    }}
                    aria-label={`Room code character ${i + 1}`}
                  />
                  {!char && (
                    <span
                      className="absolute inset-0 flex items-center justify-center font-black pointer-events-none select-none"
                      style={{ color: 'rgba(30,27,75,0.25)', fontSize: '2rem' }}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Name */}
            <input
              className="w-full text-center text-xl font-display font-bold px-4 py-3 rounded-xl outline-none transition-all"
              placeholder="Your Name"
              value={name}
              maxLength={20}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              disabled={loading}
              style={{
                background: '#f3f4f6',
                border: '3px solid #e5e7eb',
                color: '#1e1b4b',
              }}
              onFocus={e => (e.target.style.borderColor = '#fbbf24')}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            />

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-4 py-3 rounded-xl text-center font-label text-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', color: '#dc2626' }}
                >
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.96 }}
              className="btn-primary w-full text-xl py-4"
              onClick={handleJoin}
              disabled={loading}
            >
              {loading ? '⏳ Joining...' : 'JOIN GAME →'}
            </motion.button>

            <p className="font-label text-xs text-center" style={{ color: '#9ca3af' }}>
              No account needed • Free to play
            </p>
          </div>
        </motion.div>

        {/* Games preview pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 justify-center flex-wrap"
        >
          {[
            { label: 'Witty Quips', emoji: '😂', color: '#0891b2' },
            { label: 'Fib Finder', emoji: '🤥', color: '#ea580c' },
            { label: 'Deadly Trivia', emoji: '💀', color: '#dc2626' },
            { label: 'Sketch Bluff', emoji: '🎨', color: '#0284c7' },
          ].map(g => (
            <div
              key={g.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label text-xs font-bold"
              style={{ background: `${g.color}25`, border: `1px solid ${g.color}60`, color: g.color }}
            >
              {g.emoji} {g.label}
            </div>
          ))}
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl px-4 py-4"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <p className="font-label text-xs font-bold uppercase tracking-widest text-center mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
            How to play
          </p>
          <div className="flex justify-around text-center">
            {[
              { step: '1', icon: '📺', text: 'Host opens the TV screen' },
              { step: '2', icon: '📱', text: 'Players join with the code' },
              { step: '3', icon: '😂', text: 'Everyone plays on their phone' },
            ].map(s => (
              <div key={s.step} className="flex flex-col items-center gap-1 flex-1">
                <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
                <p className="font-label text-xs leading-tight" style={{ color: 'rgba(255,255,255,0.55)' }}>{s.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Host info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => setShowHostInfo(v => !v)}
            className="w-full font-label text-sm text-center transition-opacity"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            🖥️ Want to host a game?
          </button>

          <AnimatePresence>
            {showHostInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="mt-3 rounded-2xl px-4 py-4 text-sm leading-relaxed font-label text-center"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}
                >
                  Open <span style={{ color: '#fde047', fontWeight: 700 }}>chartmann1590.github.io/party-quips</span> on your TV or laptop to host. Players join with this app!
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer links */}
        <div className="flex justify-center gap-5 pb-2">
          <button
            onClick={() => navigate('/store')}
            className="font-label text-xs transition-opacity hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            🛍️ Store
          </button>
          <button
            onClick={() => navigate('/account')}
            className="font-label text-xs transition-opacity hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            👤 Account
          </button>
          <button
            onClick={() => navigate('/feedback')}
            className="font-label text-xs transition-opacity hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            🐛 Report
          </button>
        </div>

      </div>
    </PhoneLayout>
  )
}
