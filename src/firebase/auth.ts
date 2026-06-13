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

async function setAuthenticatedUser(user: User): Promise<User> {
  await user.getIdToken()
  currentUser = user
  storePlayerId(user.uid)
  return user
}

export function getCurrentUser(): User | null {
  return currentUser
}

export function getCurrentUserId(): string {
  if (!currentUser) throw new Error('Not authenticated')
  return currentUser.uid
}

export async function ensureAuthenticated(): Promise<User> {
  if (currentUser) return setAuthenticatedUser(currentUser)

  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub()
      try {
        if (user) {
          resolve(await setAuthenticatedUser(user))
        } else {
          const cred = await signInAnonymously(auth)
          resolve(await setAuthenticatedUser(cred.user))
        }
      } catch (err) {
        reject(err)
      }
    })
  })
}

// Subscribe to auth state changes
onAuthStateChanged(auth, (user) => {
  currentUser = user
  if (user) storePlayerId(user.uid)
})
