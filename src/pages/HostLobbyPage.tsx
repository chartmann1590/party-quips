import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import TVLayout from '../components/layout/TVLayout'
import RoomCode from '../components/lobby/RoomCode'
import QRCodeDisplay from '../components/lobby/QRCodeDisplay'
import PlayerList from '../components/lobby/PlayerList'
import StartButton from '../components/lobby/StartButton'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import { ensureAuthenticated } from '../firebase/auth'
import { addPlayer, setRoomState } from '../firebase/database'
import { initRoom } from '../lib/gameEngine'
import { registerPresence } from '../firebase/presence'
import { createUniqueRoomCode } from '../lib/roomCode'
import { useGameStore } from '../store/gameStore'
import { usePlayers, useRoomMeta } from '../hooks/useRoom'
import { AVATAR_COLORS, GAME_LABELS, type GameType } from '../types/room'

const BASE_URL = `${window.location.origin}${import.meta.env.BASE_URL}`

export default function HostLobbyPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const game = (params.get('game') ?? 'quiplash') as GameType
  const { setPlayer, setRoomCode, roomCode } = useGameStore()

  const [code, setCode] = useState<string | null>(roomCode)
  const [initializing, setInitializing] = useState(!roomCode)

  const { data: meta } = useRoomMeta(code)
  const { playerList } = usePlayers(code)

  useEffect(() => {
    if (!initializing) return

    const setup = async () => {
      const user = await ensureAuthenticated()
      const newCode = await createUniqueRoomCode()

      await initRoom(newCode, user.uid, 'Host', game)
      await addPlayer(newCode, {
        id: user.uid,
        name: 'Host',
        score: 0,
        connected: true,
        isHost: true,
        avatarColor: AVATAR_COLORS[0],
        joinedAt: Date.now(),
      })

      registerPresence(newCode, user.uid, true)
      setPlayer(user.uid, 'Host')
      setRoomCode(newCode)
      setCode(newCode)
      setInitializing(false)
    }

    setup().catch(console.error)
  }, [])

  async function handleStart() {
    if (!code) return
    navigate('/host/game')
  }

  const joinUrl = code ? `${BASE_URL}#/join?room=${code}` : ''
  const nonHostPlayers = playerList.filter(p => !p.isHost)

  if (initializing || !code) {
    return (
      <TVLayout>
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner size="lg" label="Setting up your room..." />
        </div>
      </TVLayout>
    )
  }

  return (
    <TVLayout>
      <div className="flex flex-col flex-1 p-8 gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="font-display text-5xl neon-text-purple">PARTY QUIPS</h1>
            <p className="text-neon-cyan font-body text-xl mt-1">
              Game: <strong>{GAME_LABELS[game]}</strong>
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <p className="text-text-muted font-body text-right text-sm mb-1">
              {nonHostPlayers.length}/8 players joined
            </p>
          </motion.div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 gap-8 items-center">

          {/* Left: Room code + QR */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center gap-8 flex-shrink-0"
          >
            <RoomCode code={code} size="large" />
            <QRCodeDisplay url={joinUrl} size={160} />
          </motion.div>

          {/* Divider */}
          <div className="h-full w-px bg-game-border mx-4" />

          {/* Right: Players + start */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col flex-1 gap-6"
          >
            <h2 className="font-display text-3xl text-text-primary">
              Players <span className="text-neon-purple">({nonHostPlayers.length})</span>
            </h2>
            <div className="flex-1 overflow-y-auto">
              <PlayerList players={nonHostPlayers} />
            </div>
            <StartButton
              onStart={handleStart}
              playerCount={nonHostPlayers.length}
              minPlayers={2}
            />
          </motion.div>
        </div>
      </div>
    </TVLayout>
  )
}
