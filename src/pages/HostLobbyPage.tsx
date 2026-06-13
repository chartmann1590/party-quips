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
import { setRoomState } from '../firebase/database'
import { initRoom } from '../lib/gameEngine'
import { addComputerPlayerForTwoHumans } from '../lib/computerPlayer'
import { registerPresence } from '../firebase/presence'
import { createUniqueRoomCode } from '../lib/roomCode'
import { useGameStore } from '../store/gameStore'
import { usePlayers, useRoomMeta } from '../hooks/useRoom'
import { GAME_LABELS, type GameType } from '../types/room'

const BASE_URL = `${window.location.origin}${import.meta.env.BASE_URL}`

const GAME_ICONS: Record<GameType, string> = {
  quiplash: '😂',
  fibbage: '🤥',
  trivia: '💀',
}

export default function HostLobbyPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const game = (params.get('game') ?? 'quiplash') as GameType
  const { setPlayer, setRoomCode, roomCode } = useGameStore()

  const [code, setCode] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)

  const { data: meta } = useRoomMeta(code)
  const { playerList } = usePlayers(code)

  useEffect(() => {
    const setup = async () => {
      const user = await ensureAuthenticated()
      const newCode = await createUniqueRoomCode()

      await initRoom(newCode, user.uid, 'Host', game)

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
    await addComputerPlayerForTwoHumans(code, playerList)
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
            <h1
              className="font-display font-black text-4xl"
              style={{ color: '#fde047', textShadow: '3px 3px 0 #92400e' }}
            >
              🎉 PARTY QUIPS
            </h1>
            <p className="font-label text-base mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {GAME_ICONS[game]} {GAME_LABELS[game]}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <div
              className="px-5 py-2.5 rounded-full font-display font-black text-lg"
              style={{
                background: '#fde047',
                color: '#1e1b4b',
                boxShadow: '0 3px 0 #a16207',
              }}
            >
              {nonHostPlayers.length}/8 players
            </div>
          </motion.div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 gap-8 items-start min-h-0">

          {/* Left: Room code + QR */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center gap-6 flex-[3]"
          >
            <RoomCode code={code} size="large" />
            <div
              className="p-4 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '2px solid rgba(255,255,255,0.2)',
              }}
            >
              <QRCodeDisplay url={joinUrl} size={180} />
            </div>
          </motion.div>

          {/* Divider */}
          <div className="self-stretch w-px opacity-20" style={{ background: 'rgba(255,255,255,0.5)' }} />

          {/* Right: Players + start */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col flex-[2] gap-6"
          >
            <h2 className="font-display font-black text-3xl text-white">
              Players{' '}
              <span style={{ color: '#fde047' }}>({nonHostPlayers.length})</span>
            </h2>

            {nonHostPlayers.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <span className="text-5xl">🎮</span>
                <p className="font-label text-base" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Waiting for players to join...
                </p>
                <p className="font-label text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Scan the QR code or go to party-quips
                </p>
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
