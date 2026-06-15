import {
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithCredential,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { Capacitor } from '@capacitor/core'
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

// On native Android: uses the native Google Sign-In SDK (no WebView/Custom Tab).
// On web: full-page redirect via Firebase auth handler (popup blocked by GitHub Pages COOP).
export async function signInWithGoogle(): Promise<User | void> {
  if (Capacitor.isNativePlatform()) {
    const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth')
    await GoogleAuth.initialize({
      clientId: '582819634867-l7716hit5r0s0reho7l881g5ee5lkmf4.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    })
    const googleUser = await GoogleAuth.signIn()
    const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken)
    const result = await signInWithCredential(auth, credential)
    return loadAndSetUser(result.user)
  }
  return signInWithRedirect(auth, googleProvider)
}

// Must be called on every page load for web — Firebase may redirect back to any route.
export async function handleGoogleRedirectResult(): Promise<User | null> {
  if (Capacitor.isNativePlatform()) return null
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
