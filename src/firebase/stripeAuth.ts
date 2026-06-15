import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { auth } from './config'
import { getOwnedPackIds } from './purchases'
import { useAuthStore } from '../store/authStore'
import type { PackId } from '../types/addOns'

// Google OAuth client ID (Firebase auto-created web client for party-quips-2026)
const GOOGLE_CLIENT_ID = '582819634867-l7716hit5r0s0reho7l881g5ee5lkmf4.apps.googleusercontent.com'

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

// Module-level GIS state — initialize() can only be called once per page load.
let gisInitialized = false
let gisErrorHandler: ((err: Error) => void) | null = null

async function onGISCredential({ credential }: { credential: string }) {
  try {
    const cred = GoogleAuthProvider.credential(credential)
    const result = await signInWithCredential(auth, cred)
    await loadAndSetUser(result.user)
  } catch (err) {
    gisErrorHandler?.(err instanceof Error ? err : new Error('Google sign-in failed'))
  }
}

function ensureGISInitialized(): boolean {
  const gis = (window as any).google?.accounts?.id
  if (!gis) return false
  if (!gisInitialized) {
    gis.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: onGISCredential,
      auto_select: false,
      cancel_on_tap_outside: false,
    })
    gisInitialized = true
  }
  return true
}

/**
 * Renders the official Google Sign-In button into `container`.
 * Returns true if GIS was ready; false if the script hasn't loaded yet
 * (caller should retry).
 */
export function renderGoogleSignInButton(
  container: HTMLElement,
  onError: (err: Error) => void
): boolean {
  if (!ensureGISInitialized()) return false
  gisErrorHandler = onError
  ;(window as any).google.accounts.id.renderButton(container, {
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    logo_alignment: 'center',
    width: container.clientWidth > 0 ? container.clientWidth : 280,
  })
  return true
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
