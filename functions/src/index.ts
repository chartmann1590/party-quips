import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import Stripe from 'stripe'

admin.initializeApp()
const db = admin.firestore()

const VALID_PACK_IDS = new Set(['after-dark', 'nerd-pack', 'world-tour'])
const PRICE_CENTS = 999

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured')
  return new Stripe(key, { apiVersion: '2025-02-24.acacia' })
}

// ── createPaymentIntent ───────────────────────────────────────────────────────
// Called by the client to start a purchase.
// Returns { clientSecret } that the browser uses with Stripe.js to confirm.
export const createPaymentIntent = functions.https.onCall(
  { cors: true },
  async (request) => {
    const uid = request.auth?.uid
    if (!uid) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in')
    }

    const { packId } = request.data as { packId?: string }
    if (!packId || !VALID_PACK_IDS.has(packId)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid pack ID')
    }

    // Idempotency: check if user already owns this pack
    const existing = await db.doc(`users/${uid}/purchases/${packId}`).get()
    if (existing.exists) {
      throw new functions.https.HttpsError('already-exists', 'You already own this pack')
    }

    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: PRICE_CENTS,
      currency: 'usd',
      metadata: { packId, uid },
      automatic_payment_methods: { enabled: true },
    })

    return { clientSecret: paymentIntent.client_secret }
  }
)

// ── stripeWebhook ─────────────────────────────────────────────────────────────
// Receives Stripe event notifications.
// On payment_intent.succeeded: writes purchase to Firestore.
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    res.status(500).send('STRIPE_WEBHOOK_SECRET not configured')
    return
  }

  const stripe = getStripe()
  const sig = req.headers['stripe-signature'] as string

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid signature'
    res.status(400).send(`Webhook signature verification failed: ${msg}`)
    return
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent
    const { packId, uid } = intent.metadata

    if (packId && uid && VALID_PACK_IDS.has(packId)) {
      await db.doc(`users/${uid}/purchases/${packId}`).set({
        packId,
        purchasedAt: Date.now(),
        stripePaymentIntentId: intent.id,
        priceUsdCents: PRICE_CENTS,
        platform: 'web',
      })
    }
  }

  res.json({ received: true })
})
