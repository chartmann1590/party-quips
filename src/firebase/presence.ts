import { ref, set, onDisconnect as fbOnDisconnect } from 'firebase/database'
import { db } from './config'
import { playerConnectedRef, roomMetaRef } from './database'

export function registerPresence(roomCode: string, playerId: string, isHost: boolean) {
  const connectedRef = playerConnectedRef(roomCode, playerId)

  // Mark as connected immediately
  set(connectedRef, true)

  // Firebase server will set to false when WebSocket drops
  fbOnDisconnect(connectedRef).set(false)

  // If host disconnects, mark the room as done so players aren't stranded
  if (isHost) {
    const metaRef = roomMetaRef(roomCode)
    fbOnDisconnect(metaRef).update({ state: 'done' })
  }
}

export function unregisterPresence(roomCode: string, playerId: string) {
  const connectedRef = playerConnectedRef(roomCode, playerId)
  fbOnDisconnect(connectedRef).cancel()
  set(connectedRef, false)
}
