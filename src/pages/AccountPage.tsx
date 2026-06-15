import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PhoneLayout from '../components/layout/PhoneLayout'
import { useAuthStore } from '../store/authStore'
import { renderGoogleSignInButton, signInWithEmail, createEmailAccount, signOut } from '../firebase/stripeAuth'
import { CONTENT_PACKS, PACK_ORDER } from '../lib/contentPacks'

type AuthView = 'choose' | 'signin' | 'signup'

export default function AccountPage() {
  const navigate = useNavigate()
  const { isSignedIn, displayName, email, ownedPackIds } = useAuthStore()
  const [view, setView] = useState<AuthView>('choose')
  const [emailInput, setEmailInput] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const wasSignedInOnMount = useRef(isSignedIn)
  const googleBtnRef = useRef<HTMLDivElement>(null)

  // When GIS completes sign-in, the auth store updates isSignedIn.
  // Navigate back only when the user was NOT already signed in on mount.
  useEffect(() => {
    if (!wasSignedInOnMount.current && isSignedIn) {
      navigate(-1)
    }
  }, [isSignedIn, navigate])

  // Render the GIS Google Sign-In button when the choose view is shown.
  // Poll until the GIS script is loaded (it's async/defer).
  useEffect(() => {
    if (view !== 'choose' || !googleBtnRef.current) return
    const container = googleBtnRef.current
    let intervalId: ReturnType<typeof setInterval>

    const tryRender = () => {
      if (renderGoogleSignInButton(container, (err) => setError(err.message))) {
        clearInterval(intervalId)
      }
    }

    tryRender()
    intervalId = setInterval(tryRender, 100)
    const timeoutId = setTimeout(() => clearInterval(intervalId), 10_000)

    return () => {
      clearInterval(intervalId)
      clearTimeout(timeoutId)
    }
  }, [view])

  async function handleEmail() {
    if (!emailInput.trim() || !password) { setError('Enter email and password'); return }
    setLoading(true)
    setError('')
    try {
      if (view === 'signin') {
        await signInWithEmail(emailInput.trim(), password)
      } else {
        await createEmailAccount(emailInput.trim(), password)
      }
      navigate(-1)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    await signOut()
  }

  if (isSignedIn) {
    return (
      <PhoneLayout>
        <div className="flex flex-col flex-1 gap-5 pt-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div style={{ fontSize: '3rem' }}>👤</div>
            <h1 className="font-display font-black text-2xl mt-2" style={{ color: '#fde047' }}>
              Your Account
            </h1>
            <p className="font-label text-sm mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {displayName ?? email ?? 'Signed in'}
            </p>
          </motion.div>

          {/* Owned packs */}
          <div className="flex flex-col gap-3">
            <p className="font-label text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Your Add-On Packs
            </p>
            {PACK_ORDER.map(packId => {
              const pack = CONTENT_PACKS[packId]
              const owned = ownedPackIds.includes(packId)
              return (
                <div
                  key={packId}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3"
                  style={{
                    background: owned ? `${pack.accentColor}20` : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${owned ? pack.accentColor + '60' : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{pack.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm" style={{ color: owned ? '#ffffff' : 'rgba(255,255,255,0.5)' }}>
                      {pack.name}
                    </p>
                    <p className="font-label text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {pack.tagline}
                    </p>
                  </div>
                  {owned ? (
                    <span className="font-label text-xs font-bold px-2 py-1 rounded-full" style={{ background: pack.accentColor, color: '#fff' }}>
                      ✓ Owned
                    </span>
                  ) : (
                    <button
                      onClick={() => navigate('/store')}
                      className="font-label text-xs font-bold px-2 py-1 rounded-full transition-opacity hover:opacity-80"
                      style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                    >
                      $9.99
                    </button>
                  )}
                </div>
              )
            })}
            {ownedPackIds.length === 0 && (
              <div className="text-center py-4">
                <p className="font-label text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  No packs yet — visit the Store to unlock more content!
                </p>
                <button
                  onClick={() => navigate('/store')}
                  className="mt-3 btn-primary text-sm py-2 px-6"
                >
                  🛍️ Visit Store
                </button>
              </div>
            )}
          </div>

          <div className="mt-auto pb-4">
            <button
              onClick={handleSignOut}
              className="w-full font-label text-sm py-3 rounded-xl transition-opacity hover:opacity-70"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}
            >
              Sign Out
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full font-label text-sm py-2 mt-2 transition-opacity hover:opacity-70"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              ← Back
            </button>
          </div>
        </div>
      </PhoneLayout>
    )
  }

  return (
    <PhoneLayout>
      <div className="flex flex-col flex-1 gap-5 pt-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div style={{ fontSize: '3rem' }}>🔐</div>
          <h1 className="font-display font-black text-2xl mt-2" style={{ color: '#fde047' }}>
            Sign In
          </h1>
          <p className="font-label text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Sign in to purchase and use add-on packs
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: '#ffffff', boxShadow: '0 8px 0 rgba(0,0,0,0.25)' }}
        >
          <div className="p-6 flex flex-col gap-4">
            {view === 'choose' && (
              <>
                {/* Google Sign-In button — rendered by Google Identity Services */}
                <div
                  ref={googleBtnRef}
                  className="w-full flex justify-center"
                  style={{ minHeight: '44px' }}
                />
                {error && (
                  <p className="text-xs text-center font-label" style={{ color: '#dc2626' }}>
                    ⚠️ {error}
                  </p>
                )}

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
                  <span className="font-label text-xs" style={{ color: '#9ca3af' }}>or</span>
                  <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
                </div>

                <button
                  onClick={() => setView('signin')}
                  className="w-full py-3 rounded-xl font-label font-bold text-sm transition-all hover:opacity-90"
                  style={{ background: '#f3f4f6', color: '#1e1b4b' }}
                >
                  Sign in with email
                </button>
                <button
                  onClick={() => setView('signup')}
                  className="w-full py-3 rounded-xl font-label font-bold text-sm transition-all hover:opacity-90"
                  style={{ background: '#ede9fe', color: '#6d28d9' }}
                >
                  Create account
                </button>
              </>
            )}

            {(view === 'signin' || view === 'signup') && (
              <>
                <p className="font-display font-bold text-center" style={{ color: '#1e1b4b' }}>
                  {view === 'signin' ? 'Sign In' : 'Create Account'}
                </p>
                <input
                  type="email"
                  placeholder="Email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl font-label text-sm outline-none"
                  style={{ background: '#f3f4f6', border: '2px solid #e5e7eb', color: '#1e1b4b' }}
                  onFocus={e => (e.target.style.borderColor = '#fbbf24')}
                  onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleEmail()}
                  className="w-full px-4 py-3 rounded-xl font-label text-sm outline-none"
                  style={{ background: '#f3f4f6', border: '2px solid #e5e7eb', color: '#1e1b4b' }}
                  onFocus={e => (e.target.style.borderColor = '#fbbf24')}
                  onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                />
                {error && (
                  <p className="text-xs text-center font-label" style={{ color: '#dc2626' }}>
                    ⚠️ {error}
                  </p>
                )}
                <button
                  onClick={handleEmail}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? '...' : view === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
                <button
                  onClick={() => { setView('choose'); setError('') }}
                  className="font-label text-xs text-center transition-opacity hover:opacity-70"
                  style={{ color: '#9ca3af' }}
                >
                  ← Back
                </button>
              </>
            )}
          </div>
        </motion.div>

        <button
          onClick={() => navigate(-1)}
          className="font-label text-xs text-center transition-opacity hover:opacity-70"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          Skip for now — play without an account
        </button>
      </div>
    </PhoneLayout>
  )
}
