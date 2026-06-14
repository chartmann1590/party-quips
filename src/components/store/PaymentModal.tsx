import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '')

interface PaymentModalProps {
  packName: string
  packEmoji: string
  accentColor: string
  clientSecret: string
  onSuccess: () => void
  onClose: () => void
}

function CheckoutForm({ packName, packEmoji, accentColor, onSuccess, onClose }: Omit<PaymentModalProps, 'clientSecret'>) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setSubmitting(true)
    setError('')

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: 'if_required',
    })

    if (confirmError) {
      setError(confirmError.message ?? 'Payment failed — please try again')
      setSubmitting(false)
    } else {
      // Payment succeeded (no redirect needed for cards/Google Pay)
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="text-center">
        <span style={{ fontSize: '2.5rem' }}>{packEmoji}</span>
        <h3 className="font-display font-black text-xl mt-2 text-white">{packName}</h3>
        <p className="font-label text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
          $9.99 • Lifetime access
        </p>
      </div>

      <div
        className="rounded-2xl p-4"
        style={{ background: 'rgba(255,255,255,0.96)' }}
      >
        <PaymentElement
          options={{
            layout: 'tabs',
            wallets: { googlePay: 'auto', applePay: 'auto' },
          }}
        />
      </div>

      {error && (
        <p className="font-label text-sm text-center" style={{ color: '#f87171' }}>
          ⚠️ {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full py-4 rounded-xl font-display font-black text-lg transition-all hover:opacity-90 active:scale-95"
        style={{
          background: accentColor,
          color: '#fff',
          boxShadow: `0 4px 0 ${accentColor}80`,
          opacity: (!stripe || submitting) ? 0.7 : 1,
        }}
      >
        {submitting ? '⏳ Processing...' : 'Pay $9.99'}
      </button>

      <button
        type="button"
        onClick={onClose}
        className="font-label text-sm text-center transition-opacity hover:opacity-70"
        style={{ color: 'rgba(255,255,255,0.4)' }}
      >
        Cancel
      </button>
    </form>
  )
}

export default function PaymentModal({ packName, packEmoji, accentColor, clientSecret, onSuccess, onClose }: PaymentModalProps) {
  // Close on Escape key
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-md rounded-3xl p-6"
          style={{
            background: '#1a1040',
            border: '2px solid rgba(255,255,255,0.15)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          }}
        >
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'night',
                variables: {
                  colorPrimary: accentColor,
                  colorBackground: '#ffffff',
                  colorText: '#1e1b4b',
                  borderRadius: '12px',
                  fontFamily: 'system-ui, sans-serif',
                },
              },
            }}
          >
            <CheckoutForm
              packName={packName}
              packEmoji={packEmoji}
              accentColor={accentColor}
              onSuccess={onSuccess}
              onClose={onClose}
            />
          </Elements>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
