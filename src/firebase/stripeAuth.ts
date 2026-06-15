import {
  GoogleAuthProvider,
  signInWithRedirect,
  linkWithRedirect,
  getRedirectResult,
  signInWithCredential,
  OAuthCredential,
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

// Initiates Google sign-in via redirect (popup fails on GitHub Pages due to COOP headers)
export async function signInWithGoogle(): Promise<void> {
  const currentUser = auth.currentUser
  if (currentUser?.isAnonymous) {
    return linkWithRedirect(currentUser, googleProvider)
  }
  return signInWithRedirect(auth, googleProvider)
}

// Call this on app load to process the result after returning from Google redirect
export async function handleGoogleRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth)
    if (result?.user) {
      return loadAndSetUser(result.user)
    }
    return null
  } catch (e: unknown) {
    const err = e as { code?: string; credential?: unknown }
    // If the Google account is already linked to another Firebase account, sign in as that account
    if (err.code === 'auth/credential-already-in-use' && err.credential) {
      const cred = await signInWithCredential(auth, err.credential as OAuthCredential)
      return loadAndSetUser(cred.user)
    }
    throw e
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
