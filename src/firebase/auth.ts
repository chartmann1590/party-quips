import { signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from './config'
import { getOwnedPackIds } from './purchases'
import { useAuthStore } from '../store/authStore'

const PLAYER_ID_KEY = 'party_quips_player_id'

export function getStoredPlayerId(): string | null {
  return localStorage.getItem(PLAYER_ID_KEY)
}

function storePlayerId(uid: string) {
  localStorage.setItem(PLAYER_ID_KEY, uid)
}

let currentUser: User | null = null
let authPromise: Promise<User> | null = null

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
  if (authPromise) return authPromise

  authPromise = new Promise((resolve, reject) => {
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
      } finally {
        authPromise = null
      }
    })
  })

  return authPromise
}

// Subscribe to auth state changes — also loads purchases for named accounts
onAuthStateChanged(auth, async (user) => {
  currentUser = user
  if (user) {
    storePlayerId(user.uid)
    if (!user.isAnonymous) {
      const packIds = await getOwnedPackIds(user.uid)
      useAuthStore.getState().setSignedIn(user.uid, user.displayName, user.email, packIds)
    }
  }
})
