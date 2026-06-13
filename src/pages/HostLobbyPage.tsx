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
      <div className="flex flex-col flex-1 p-8 gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="font-display font-black text-4xl text-white">🎉 PARTY QUIPS</h1>
            <p className="font-label text-pq-muted text-base mt-0.5">
              Game:{' '}
              <span className="text-pq-pink font-semibold">{GAME_LABELS[game]}</span>
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <div
              className="px-4 py-2 rounded-full font-label text-sm font-semibold"
              style={{
                background: 'rgba(250, 204, 21, 0.15)',
                border: '1px solid rgba(250, 204, 21, 0.4)',
                color: '#facc15',
              }}
            >
              {nonHostPlayers.length}/8 players joined
            </div>
          </motion.div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 gap-8 items-start">

          {/* Left 60%: Room code + QR */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center gap-8 flex-[3]"
          >
            <RoomCode code={code} size="large" />
            <div className="glass-card p-4">
              <QRCodeDisplay url={joinUrl} size={180} />
            </div>
          </motion.div>

          {/* Divider */}
          <div className="self-stretch w-px opacity-20" style={{ background: 'rgba(255,255,255,0.3)' }} />

          {/* Right 40%: Players + start */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col flex-[2] gap-6"
          >
            <h2 className="font-display font-black text-3xl text-white">
              Players{' '}
              <span style={{ color: '#facc15' }}>({nonHostPlayers.length})</span>
            </h2>

            {nonHostPlayers.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <span className="text-5xl">🎮🎮</span>
                <p className="text-pq-muted font-label text-base">Waiting for players...</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <PlayerList players={nonHostPlayers} />
              </div>
            )}

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
