import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PhoneLayout from '../components/layout/PhoneLayout'
import { useAuthStore } from '../store/authStore'
import { signInWithGoogle, signInWithEmail, createEmailAccount, signOut } from '../firebase/stripeAuth'
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

  // After Google redirect completes, App.tsx processes the result and isSignedIn flips true.
  // Navigate back only when the user was NOT already signed in when this page mounted.
  useEffect(() => {
    if (!wasSignedInOnMount.current && isSignedIn) {
      navigate(-1)
    }
  }, [isSignedIn, navigate])

  async function handleGoogle() {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
      // signInWithGoogle triggers a full-page redirect — execution stops here
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign-in failed')
      setLoading(false)
    }
  }

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
                <button
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-label font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                  style={{ background: '#4285F4', color: '#fff', border: 'none' }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#fff"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#fff"/>
                    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#fff"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#fff"/>
                  </svg>
                  {loading ? 'Signing in...' : 'Continue with Google'}
                </button>

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
