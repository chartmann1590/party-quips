import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { auth } from './config'
import { getOwnedPackIds } from './purchases'
import { useAuthStore } from '../store/authStore'
import type { PackId } from '../types/addOns'

const googleProvider = new GoogleAuthProvider()

async function loadAndSetUser(user: User) {
  const packIds = await getOwnedPackIds(user.uid)
  useAuthStore.getState().setSignedIn(
    user.uid,
    user.displayName,
    user.email,
    packIds as PackId[]
  )
  return user
}

// Initiates Google sign-in via full-page redirect (popup fails on GitHub Pages due to COOP headers).
// Always does a fresh sign-in — never linkWithRedirect, which breaks when the Google account
// already exists in Firebase under a different uid.
export async function signInWithGoogle(): Promise<void> {
  return signInWithRedirect(auth, googleProvider)
}

// Processes the result after returning from Google redirect. Must be called on every page load
// (not just AccountPage) because Firebase may redirect back to any page depending on hash routing.
export async function handleGoogleRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth)
    if (result?.user) {
      return loadAndSetUser(result.user)
    }
    return null
  } catch {
    return null
  }
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return loadAndSetUser(cred.user)
}

export async function createEmailAccount(email: string, password: string): Promise<User> {
  const currentUser = auth.currentUser
  if (currentUser?.isAnonymous) {
    const { EmailAuthProvider, linkWithCredential } = await import('firebase/auth')
    const credential = EmailAuthProvider.credential(email, password)
    const linked = await linkWithCredential(currentUser, credential)
    return loadAndSetUser(linked.user)
  }
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  return loadAndSetUser(cred.user)
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
  useAuthStore.getState().setAnonymous()
}
