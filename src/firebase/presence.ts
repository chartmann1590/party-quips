import { ref, set, onDisconnect as fbOnDisconnect } from 'firebase/database'
import { db } from './config'
import { playerConnectedRef } from './database'

export function registerPresence(roomCode: string, playerId: string, isHost: boolean) {
  if (isHost) {
    // Track host online status separately — do NOT touch room state on disconnect.
    // Setting state:'done' on disconnect was too aggressive: any brief network
    // hiccup (phone switching towers, page refresh) would permanently kill the
    // room before players could join. The room only reaches 'done' when the
    // host explicitly ends the game via the UI.
    const hostOnlineRef = ref(db, `rooms/${roomCode}/meta/hostOnline`)
    set(hostOnlineRef, true)
    fbOnDisconnect(hostOnlineRef).set(false)
    return
  }

  const connectedRef = playerConnectedRef(roomCode, playerId)

  set(connectedRef, true)
  fbOnDisconnect(connectedRef).set(false)
}

export function unregisterPresence(roomCode: string, playerId: string) {
  const connectedRef = playerConnectedRef(roomCode, playerId)
  fbOnDisconnect(connectedRef).cancel()
  set(connectedRef, false)
}
