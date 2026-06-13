import { useState, useEffect } from 'react'
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

  const [code, setCode] = useState(params.get('room')?.toUpperCase() ?? '')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleJoin() {
    if (!code.trim() || code.length !== 4) { setError('Enter a 4-letter room code'); return }
    if (!name.trim()) { setError('Enter your name'); return }

    setLoading(true)
    setError('')

    try {
      const user = await ensureAuthenticated()

      // Check room exists
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
          className="text-center pt-6"
        >
          <h1 className="font-display text-5xl neon-text-purple">PARTY QUIPS</h1>
          <p className="text-text-muted font-body mt-1">Join the fun!</p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <label className="text-text-muted font-body uppercase text-sm tracking-wider">Room Code</label>
            <input
              className="input-field uppercase tracking-[0.3em] font-display text-center text-3xl"
              placeholder="ABCD"
              value={code}
              maxLength={4}
              onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-text-muted font-body uppercase text-sm tracking-wider">Your Name</label>
            <input
              className="input-field text-center text-2xl"
              placeholder="Player Name"
              value={name}
              maxLength={20}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              disabled={loading}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-neon-pink font-body text-center text-sm"
            >
              ⚠️ {error}
            </motion.p>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="btn-primary mt-2"
            onClick={handleJoin}
            disabled={loading}
          >
            {loading ? '⏳ Joining...' : '🎮 JOIN GAME'}
          </motion.button>
        </motion.div>

        <div className="text-center">
          <button
            className="text-text-muted font-body text-sm underline"
            onClick={() => navigate('/')}
          >
            ← Back to home
          </button>
        </div>
      </div>
    </PhoneLayout>
  )
}
