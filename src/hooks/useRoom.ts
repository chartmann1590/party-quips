import { useMemo } from 'react'
import { useFirebaseValue } from './useFirebaseValue'
import { roomMetaRef, playersRef } from '../firebase/database'
import type { RoomMeta, Player } from '../types/room'

export function useRoomMeta(roomCode: string | null) {
  const refFn = useMemo(
    () => roomCode ? () => roomMetaRef(roomCode) : null,
    [roomCode]
  )
  return useFirebaseValue<RoomMeta>(refFn)
}

export function usePlayers(roomCode: string | null) {
  const refFn = useMemo(
    () => roomCode ? () => playersRef(roomCode) : null,
    [roomCode]
  )
  const { data, loading, error } = useFirebaseValue<Record<string, Player>>(refFn)
  const playerList = data ? Object.values(data).sort((a, b) => a.joinedAt - b.joinedAt) : []
  return { data, playerList, loading, error }
}
