import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PhoneLayout from '../components/layout/PhoneLayout'
import PlayerAvatar from '../components/shared/PlayerAvatar'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import { useGameStore } from '../store/gameStore'
import { useRoomMeta, usePlayers } from '../hooks/useRoom'
import { GAME_LABELS } from '../types/room'

export default function PlayerLobbyPage() {
  const navigate = useNavigate()
  const { roomCode, playerId, playerName } = useGameStore()

  const { data: meta } = useRoomMeta(roomCode)
  const { playerList } = usePlayers(roomCode)

  const myPlayer = playerList.find(p => p.id === playerId)

  // Navigate to game when host starts
  useEffect(() => {
    if (!meta) return
    if (meta.state === 'answering' || meta.state === 'voting') {
      navigate('/play/game')
    }
    if (meta.state === 'done') {
      navigate('/')
    }
  }, [meta?.state])

  if (!roomCode || !playerId) {
    navigate('/')
    return null
  }

  return (
    <PhoneLayout>
      <div className="flex flex-col flex-1 items-center gap-8 pt-6">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="font-display text-4xl neon-text-purple">PARTY QUIPS</h1>
          {meta && (
            <p className="text-neon-cyan font-body mt-1">{GAME_LABELS[meta.game]}</p>
          )}
        </motion.div>

        {/* My avatar */}
        {myPlayer && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="flex flex-col items-center gap-3"
          >
            <PlayerAvatar name={myPlayer.name} color={myPlayer.avatarColor} size="xl" />
            <p className="font-display text-2xl text-text-primary">{myPlayer.name}</p>
            <div
              className="px-4 py-2 rounded-full font-body text-sm"
              style={{
                background: `${myPlayer.avatarColor}20`,
                border: `1px solid ${myPlayer.avatarColor}60`,
                color: myPlayer.avatarColor,
              }}
            >
              You're in! 🎉
            </div>
          </motion.div>
        )}

        {/* Waiting indicator */}
        <div className="flex flex-col items-center gap-4 flex-1 justify-center">
          <LoadingSpinner size="md" />
          <p className="text-text-muted font-body text-center">
            Waiting for the host to start...
          </p>
          <p className="text-text-muted font-body text-sm text-center">
            Room: <span className="font-display text-neon-purple text-lg">{roomCode}</span>
          </p>
        </div>

        {/* Other players */}
        <div className="w-full">
          <p className="text-text-muted font-body text-xs uppercase tracking-wider mb-3 text-center">
            {playerList.filter(p => !p.isHost).length} players ready
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {playerList.filter(p => !p.isHost).map(p => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1 rounded-full font-body text-sm"
                style={{
                  background: `${p.avatarColor}20`,
                  border: `1px solid ${p.avatarColor}40`,
                  color: p.avatarColor,
                }}
              >
                {p.name}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PhoneLayout>
  )
}
