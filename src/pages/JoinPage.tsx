import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import PhoneLayout from '../components/layout/PhoneLayout'
import { ensureAuthenticated } from '../firebase/auth'
import { addPlayer } from '../firebase/database'
import { registerPresence } from '../firebase/presence'
import { useGameStore } from '../store/gameStore'
import { AVATAR_COLORS } from '../types/room'
import { get } from 'firebase/database'
import { roomMetaRef } from '../firebase/database'

export default function JoinPage() {
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
    if (code.length !== 4) { setError('Enter a 4-letter room code'); return }
    if (!name.trim()) { setError('Enter your name'); return }

    setLoading(true)
    setError('')

    try {
      const user = await ensureAuthenticated()

      const snap = await get(roomMetaRef(code))
      if (!snap.exists()) { setError(`Room "${code}" not found`); setLoading(false); return }
      if (snap.val().state === 'done') { setError('That game is already over'); setLoading(false); return }

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
    } catch (e: any) {
      setError(e?.message ?? 'Could not join room')
      setLoading(false)
    }
  }

  return (
    <PhoneLayout>
      <div className="flex flex-col flex-1 gap-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-4"
        >
          <h1
            className="font-display font-black leading-none"
            style={{
              fontSize: '2.75rem',
              color: '#fde047',
              textShadow: '3px 3px 0 #92400e',
            }}
          >
            🎉 PARTY QUIPS
          </h1>
          <p className="font-label text-sm mt-2 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Join the fun!
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 flex flex-col gap-6"
        >
          {/* Room code boxes */}
          <div className="flex flex-col gap-3">
            <label className="font-label text-xs uppercase tracking-[0.2em] font-semibold text-center" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Room Code
            </label>
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {codeChars.map((char, i) => (
                <input
                  key={i}
                  ref={inputRefs[i]}
                  type="text"
                  inputMode="text"
                  maxLength={1}
                  value={char}
                  onChange={e => handleCharInput(i, e.target.value)}
                  onKeyDown={e => handleCharKeyDown(i, e)}
                  onFocus={e => e.target.select()}
                  disabled={loading}
                  className="room-code-box w-16 h-16 text-3xl font-black text-center uppercase"
                  style={{
                    caretColor: 'transparent',
                    background: '#fde047',
                    color: '#1e1b4b',
                    border: '3px solid #ca8a04',
                  }}
                  aria-label={`Room code character ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Name input */}
          <div className="flex flex-col gap-2">
            <label className="font-label text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Your Name
            </label>
            <input
              className="input-field text-center text-xl"
              placeholder="Player Name"
              value={name}
              maxLength={20}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              disabled={loading}
            />
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-2 rounded-full text-center font-label text-sm"
              style={{
                background: 'rgba(252, 165, 165, 0.15)',
                border: '1px solid rgba(252, 165, 165, 0.4)',
                color: '#fca5a5',
              }}
            >
              ⚠️ {error}
            </motion.div>
          )}

          {/* Join button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary w-full text-center"
            onClick={handleJoin}
            disabled={loading}
          >
            {loading ? '⏳ Joining...' : 'JOIN GAME →'}
          </motion.button>
        </motion.div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-2">
          <p className="font-label text-xs tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>
            No account needed
          </p>
          <button
            className="font-label text-sm transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            onMouseOver={e => ((e.target as HTMLElement).style.color = '#fde047')}
            onMouseOut={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.5)')}
            onClick={() => navigate('/')}
          >
            ← Back to home
          </button>
        </div>
      </div>
    </PhoneLayout>
  )
}
