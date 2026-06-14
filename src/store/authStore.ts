import { create } from 'zustand'
import type { PackId } from '../types/addOns'

interface AuthStore {
  isSignedIn: boolean
  uid: string | null
  displayName: string | null
  email: string | null
  ownedPackIds: PackId[]
  purchasesLoading: boolean

  setSignedIn: (uid: string, displayName: string | null, email: string | null, packIds: PackId[]) => void
  setOwnedPacks: (packIds: PackId[]) => void
  setAnonymous: () => void
}

const AUTH_KEY = 'pq_auth'

function loadAuth(): Pick<AuthStore, 'isSignedIn' | 'uid' | 'displayName' | 'email' | 'ownedPackIds'> {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { isSignedIn: false, uid: null, displayName: null, email: null, ownedPackIds: [] }
}

function saveAuth(state: Pick<AuthStore, 'isSignedIn' | 'uid' | 'displayName' | 'email' | 'ownedPackIds'>) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(state))
}

export const useAuthStore = create<AuthStore>((set) => ({
  ...loadAuth(),
  purchasesLoading: false,

  setSignedIn: (uid, displayName, email, packIds) => {
    const next = { isSignedIn: true, uid, displayName, email, ownedPackIds: packIds }
    set({ ...next, purchasesLoading: false })
    saveAuth(next)
  },

  setOwnedPacks: (packIds) => {
    set(state => {
      const next = { ...state, ownedPackIds: packIds }
      saveAuth({ isSignedIn: next.isSignedIn, uid: next.uid, displayName: next.displayName, email: next.email, ownedPackIds: packIds })
      return next
    })
  },

  setAnonymous: () => {
    const next = { isSignedIn: false, uid: null, displayName: null, email: null, ownedPackIds: [] as PackId[] }
    set({ ...next, purchasesLoading: false })
    saveAuth(next)
  },
}))
