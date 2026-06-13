import { create } from 'zustand'

interface GameStore {
  // Current authenticated player
  playerId: string | null
  playerName: string | null
  roomCode: string | null

  setPlayer: (id: string, name: string) => void
  setRoomCode: (code: string) => void
  clearSession: () => void
}

const SESSION_KEY = 'pq_session'

function loadSession(): Pick<GameStore, 'playerId' | 'playerName' | 'roomCode'> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { playerId: null, playerName: null, roomCode: null }
}

export const useGameStore = create<GameStore>((set) => ({
  ...loadSession(),

  setPlayer: (id, name) => {
    set({ playerId: id, playerName: name })
    const current = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}')
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...current, playerId: id, playerName: name }))
  },

  setRoomCode: (code) => {
    set({ roomCode: code })
    const current = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}')
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...current, roomCode: code }))
  },

  clearSession: () => {
    set({ playerId: null, playerName: null, roomCode: null })
    sessionStorage.removeItem(SESSION_KEY)
  },
}))
