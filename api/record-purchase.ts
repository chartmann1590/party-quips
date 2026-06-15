import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { importX509, jwtVerify } from 'jose'

const PROJECT_ID = 'party-quips-2026'
const VALID_PACK_IDS = new Set(['after-dark', 'nerd-pack', 'world-tour', 'sketch-bluff', 'pop-culture', 'sports-games'])

async function verifyToken(idToken: string): Promise<string> {
  const [b64] = idToken.split('.')
  const pad = '='.repeat((4 - (b64.length % 4)) % 4)
  const { kid } = JSON.parse(Buffer.from(b64 + pad, 'base64').toString()) as { kid: string }
  const certs = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com').then(r => r.json()) as Record<string, string>
  const key = await importX509(certs[kid], 'RS256')
  const { payload } = await jwtVerify(idToken, key, { audience: PROJECT_ID, issuer: `https://securetoken.google.com/${PROJECT_ID}` })
  if (typeof payload.sub !== 'string') throw new Error('no uid')
  return payload.sub
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') { res.status(200).end(); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }

  const idToken = (req.headers.authorization ?? '').replace('Bearer ', '')
  if (!idToken) { res.status(401).json({ error: 'Must be signed in' }); return }

  let uid: string
  try { uid = await verifyToken(idToken) }
  catch { res.status(401).json({ error: 'Invalid token' }); return }

  const { paymentIntentId } = (req.body ?? {}) as { paymentIntentId?: string }
  if (!paymentIntentId) { res.status(400).json({ error: 'Missing paymentIntentId' }); return }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' })

  let intent: Stripe.PaymentIntent
  try { intent = await stripe.paymentIntents.retrieve(paymentIntentId) }
  catch { res.status(400).json({ error: 'Invalid payment intent' }); return }

  if (intent.status !== 'succeeded') { res.status(402).json({ error: 'Payment not completed' }); return }

  const { packId, uid: metaUid } = intent.metadata
  if (!packId || !VALID_PACK_IDS.has(packId) || metaUid !== uid) { res.status(400).json({ error: 'Invalid purchase' }); return }

  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}/purchases/${packId}`
  const r = await fetch(url, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: {
      packId:                { stringValue: packId },
      purchasedAt:           { integerValue: String(Date.now()) },
      stripePaymentIntentId: { stringValue: intent.id },
      priceUsdCents:         { integerValue: '999' },
      platform:              { stringValue: 'web' },
    }}),
  })
  if (!r.ok) { res.status(500).json({ error: 'Failed to record purchase' }); return }

  res.json({ packId })
}
