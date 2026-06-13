import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PhoneLayout from '../components/layout/PhoneLayout'
import { useGameStore } from '../store/gameStore'
import { useRoomMeta, usePlayers } from '../hooks/useRoom'

export default function PlayerLobbyPage() {
  const navigate = useNavigate()
  const { roomCode, playerId } = useGameStore()

  const { data: meta } = useRoomMeta(roomCode)
  const { playerList } = usePlayers(roomCode)

  const myPlayer = playerList.find(p => p.id === playerId)
  const others = playerList.filter(p => !p.isHost && p.id !== playerId)

  useEffect(() => {
    if (!meta) return
    if (meta.state === 'answering' || meta.state === 'voting') navigate('/play/game')
    if (meta.state === 'done') navigate('/')
  }, [meta?.state])

  if (!roomCode || !playerId) {
    navigate('/')
    return null
  }

  return (
    <PhoneLayout>
      <div className="flex flex-col flex-1 items-center gap-6 pt-4">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1
            className="font-display font-black text-3xl text-white"
            style={{ textShadow: '0 0 20px rgba(236,72,153,0.4)' }}
          >
            🎉 PARTY QUIPS
          </h1>
        </motion.div>

        {/* My avatar */}
        {myPlayer && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            className="glass-card p-8 flex flex-col items-center gap-4 w-full"
          >
            {/* Avatar circle */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-28 h-28 rounded-full flex items-center justify-center font-display font-black text-5xl text-white"
              style={{
                backgroundColor: myPlayer.avatarColor,
                boxShadow: `0 0 30px ${myPlayer.avatarColor}80, 0 8px 25px ${myPlayer.avatarColor}60`,
              }}
            >
              {myPlayer.name.charAt(0).toUpperCase()}
            </motion.div>

            <p className="font-display font-black text-2xl text-white">{myPlayer.name}</p>

            {/* "You're in!" badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}
              className="px-5 py-2 rounded-full font-label font-semibold text-sm"
              style={{
                background: 'rgba(250, 204, 21, 0.2)',
                border: '1px solid rgba(250, 204, 21, 0.5)',
                color: '#facc15',
              }}
            >
              You're in! 🎉
            </motion.div>
          </motion.div>
        )}

        {/* Other players */}
        {others.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full"
          >
            <p className="font-label text-xs uppercase tracking-[0.15em] text-pq-muted text-center mb-3">
              Also here
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {others.map(p => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full font-label text-sm font-semibold"
                  style={{
                    background: `${p.avatarColor}25`,
                    border: `1px solid ${p.avatarColor}50`,
                    color: p.avatarColor,
                  }}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-black"
                    style={{ backgroundColor: p.avatarColor }}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </span>
                  {p.name}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Waiting indicator */}
        <div className="flex flex-col items-center gap-3 flex-1 justify-end pb-8">
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: '#ec4899' }}
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <p className="text-pq-muted font-label text-sm text-center">
            Waiting for host to start...
          </p>
          <p className="font-label text-xs text-pq-muted">
            Room:{' '}
            <span className="font-display font-black text-pq-pink text-base tracking-wider">
              {roomCode}
            </span>
          </p>
        </div>
      </div>
    </PhoneLayout>
  )
}
