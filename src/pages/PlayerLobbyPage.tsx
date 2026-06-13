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
            className="font-display font-black"
            style={{
              fontSize: '2rem',
              color: '#fde047',
              textShadow: '2px 2px 0 #92400e',
            }}
          >
            🎉 PARTY QUIPS
          </h1>
        </motion.div>

        {/* My avatar card */}
        {myPlayer && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            className="glass-card p-8 flex flex-col items-center gap-4 w-full"
          >
            {/* Avatar */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-28 h-28 rounded-full flex items-center justify-center font-display font-black text-5xl text-white"
              style={{
                backgroundColor: myPlayer.avatarColor,
                boxShadow: `0 0 35px ${myPlayer.avatarColor}90, 0 8px 0 rgba(0,0,0,0.3)`,
              }}
            >
              {myPlayer.name.charAt(0).toUpperCase()}
            </motion.div>

            <p className="font-display font-black text-2xl text-white">{myPlayer.name}</p>

            {/* Yellow "You're in!" badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}
              className="px-5 py-2 rounded-full font-display font-black text-sm uppercase"
              style={{
                background: '#fde047',
                color: '#1e1b4b',
                boxShadow: '0 3px 0 #a16207',
                letterSpacing: '0.05em',
              }}
            >
              YOU'RE IN! 🎉
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
            <p className="font-label text-xs uppercase tracking-[0.15em] text-center mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
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
                    background: `${p.avatarColor}30`,
                    border: `2px solid ${p.avatarColor}60`,
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
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full"
                style={{ background: '#fde047' }}
                animate={{ opacity: [0.25, 1, 0.25], scale: [0.7, 1, 0.7] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <p className="font-label text-sm text-center" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Waiting for host to start...
          </p>
          <p className="font-label text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Room:{' '}
            <span className="font-display font-black text-base tracking-wider" style={{ color: '#fde047' }}>
              {roomCode}
            </span>
          </p>
        </div>
      </div>
    </PhoneLayout>
  )
}
