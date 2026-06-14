import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import TVLayout from '../components/layout/TVLayout'
import PackCard from '../components/store/PackCard'
import PaymentModal from '../components/store/PaymentModal'
import { CONTENT_PACKS, PACK_ORDER } from '../lib/contentPacks'
import { useAuthStore } from '../store/authStore'
import { getOwnedPackIds } from '../firebase/purchases'
import { auth } from '../firebase/config'
import type { PackId } from '../types/addOns'

const isCapacitor = !!(window as unknown as { Capacitor?: unknown }).Capacitor
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

interface PurchaseModalState {
  packId: PackId
  clientSecret: string
  paymentIntentId: string
}

async function apiPost<T>(path: string, body: Record<string, string>): Promise<T> {
  const idToken = await auth.currentUser?.getIdToken()
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify(body),
  })
  const data = await res.json() as T & { error?: string }
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`)
  return data
}

export default function StorePage() {
  const navigate = useNavigate()
  const { isSignedIn, ownedPackIds, setOwnedPacks } = useAuthStore()
  const [buyingPackId, setBuyingPackId] = useState<string | null>(null)
  const [purchaseError, setPurchaseError] = useState('')
  const [modal, setModal] = useState<PurchaseModalState | null>(null)
  const [successPackId, setSuccessPackId] = useState<string | null>(null)

  async function handleBuy(packId: string) {
    if (!isSignedIn) {
      navigate('/account')
      return
    }

    setBuyingPackId(packId)
    setPurchaseError('')

    try {
      const { clientSecret } = await apiPost<{ clientSecret: string; paymentIntentId?: string }>(
        '/api/create-payment-intent',
        { packId }
      )
      // Extract paymentIntentId from the clientSecret (format: pi_xxx_secret_yyy)
      const paymentIntentId = clientSecret.split('_secret_')[0]
      setModal({ packId: packId as PackId, clientSecret, paymentIntentId })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not start purchase — please try again'
      if (msg === 'already-owned') {
        const uid = auth.currentUser?.uid
        if (uid) setOwnedPacks(await getOwnedPackIds(uid))
      } else {
        setPurchaseError(msg)
      }
    } finally {
      setBuyingPackId(null)
    }
  }

  async function handlePaymentSuccess() {
    const snap = modal
    setModal(null)
    if (!snap) return

    try {
      // Verify with server and record the purchase in Firestore
      await apiPost<{ packId: string }>('/api/record-purchase', {
        paymentIntentId: snap.paymentIntentId,
      })
      setSuccessPackId(snap.packId)
      const uid = auth.currentUser?.uid
      if (uid) setOwnedPacks(await getOwnedPackIds(uid))
    } catch {
      setPurchaseError('Payment went through but we had trouble recording it — please refresh')
    }
  }

  if (isCapacitor) {
    return (
      <TVLayout>
        <div className="flex flex-col flex-1 items-center justify-center gap-6 p-8 text-center">
          <span style={{ fontSize: '4rem' }}>🛍️</span>
          <h1 className="font-display font-black text-4xl" style={{ color: '#fde047' }}>
            Party Quips Store
          </h1>
          <p className="font-label text-lg max-w-md" style={{ color: 'rgba(255,255,255,0.7)' }}>
            To purchase add-on packs, open Party Quips in your browser at:
          </p>
          <div
            className="px-6 py-3 rounded-2xl font-display font-bold text-lg"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fde047' }}
          >
            chartmann1590.github.io/party-quips
          </div>
          <p className="font-label text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Purchases sync to your account automatically
          </p>
          <button onClick={() => navigate(-1)} className="btn-primary mt-4">
            ← Back
          </button>
        </div>
      </TVLayout>
    )
  }

  return (
    <TVLayout>
      <div className="flex flex-col flex-1 p-8 gap-6 overflow-y-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1
              className="font-display font-black text-4xl"
              style={{ color: '#fde047', textShadow: '3px 3px 0 #92400e' }}
            >
              🛍️ Add-On Store
            </h1>
            <p className="font-label text-base mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Unlock more content for every game • $9.99 per pack • Lifetime access
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isSignedIn && (
              <button
                onClick={() => navigate('/account')}
                className="px-5 py-2.5 rounded-full font-display font-black text-sm"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '2px solid rgba(255,255,255,0.25)' }}
              >
                Sign In to Purchase
              </button>
            )}
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-full font-label font-bold text-sm transition-opacity hover:opacity-70"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              ← Back
            </button>
          </div>
        </motion.div>

        {/* Sign-in nudge */}
        {!isSignedIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl px-5 py-4 flex items-center gap-4"
            style={{ background: 'rgba(253,224,71,0.1)', border: '1px solid rgba(253,224,71,0.3)' }}
          >
            <span style={{ fontSize: '1.5rem' }}>💡</span>
            <p className="font-label text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
              <strong style={{ color: '#fde047' }}>Sign in</strong> to purchase packs. Only the host needs to own a pack — everyone in the game benefits!
            </p>
            <button
              onClick={() => navigate('/account')}
              className="flex-none px-4 py-2 rounded-xl font-label font-bold text-sm"
              style={{ background: '#fde047', color: '#1e1b4b' }}
            >
              Sign In →
            </button>
          </motion.div>
        )}

        {/* Success toast */}
        {successPackId && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl px-5 py-4 flex items-center gap-3"
            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)' }}
          >
            <span style={{ fontSize: '1.4rem' }}>🎉</span>
            <p className="font-label text-sm font-bold" style={{ color: '#34d399' }}>
              {CONTENT_PACKS[successPackId as PackId]?.name} unlocked! Head to the lobby to activate it.
            </p>
          </motion.div>
        )}

        {/* Packs grid */}
        <div className="grid grid-cols-3 gap-5 flex-1">
          {PACK_ORDER.map((packId, i) => {
            const pack = CONTENT_PACKS[packId]
            return (
              <motion.div
                key={packId}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.07 }}
              >
                <PackCard
                  pack={pack}
                  owned={ownedPackIds.includes(packId)}
                  onBuy={() => handleBuy(packId)}
                  buyLoading={buyingPackId === packId}
                />
              </motion.div>
            )
          })}
        </div>

        {purchaseError && (
          <p className="text-center font-label text-sm" style={{ color: '#f87171' }}>
            ⚠️ {purchaseError}
          </p>
        )}

        {/* Footer note */}
        <p className="font-label text-xs text-center pb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Purchases are non-refundable. Only the host needs to own a pack for the whole party to enjoy it.
        </p>
      </div>

      {/* Payment modal */}
      {modal && (
        <PaymentModal
          packName={CONTENT_PACKS[modal.packId].name}
          packEmoji={CONTENT_PACKS[modal.packId].emoji}
          accentColor={CONTENT_PACKS[modal.packId].accentColor}
          clientSecret={modal.clientSecret}
          onSuccess={handlePaymentSuccess}
          onClose={() => { setModal(null); setBuyingPackId(null) }}
        />
      )}
    </TVLayout>
  )
}
