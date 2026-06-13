import { signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from './config'

const PLAYER_ID_KEY = 'party_quips_player_id'

export function getStoredPlayerId(): string | null {
  return localStorage.getItem(PLAYER_ID_KEY)
}

function storePlayerId(uid: string) {
  localStorage.setItem(PLAYER_ID_KEY, uid)
}

let currentUser: User | null = null

export function getCurrentUser(): User | null {
  return currentUser
}

export function getCurrentUserId(): string {
  if (!currentUser) throw new Error('Not authenticated')
  return currentUser.uid
}

export async function ensureAuthenticated(): Promise<User> {
  if (currentUser) return currentUser

  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub()
      if (user) {
        currentUser = user
        storePlayerId(user.uid)
        resolve(user)
      } else {
        try {
          const cred = await signInAnonymously(auth)
          currentUser = cred.user
          storePlayerId(cred.user.uid)
          resolve(cred.user)
        } catch (err) {
          reject(err)
        }
      }
    })
  })
}

// Subscribe to auth state changes
onAuthStateChanged(auth, (user) => {
  currentUser = user
  if (user) storePlayerId(user.uid)
})
