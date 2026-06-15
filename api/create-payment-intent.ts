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

async function docExists(path: string, token: string): Promise<boolean> {
  const r = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`, { headers: { Authorization: `Bearer ${token}` } })
  return r.status === 200
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') { res.status(200).end(); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }

  try {
    return await handlePost(req, res)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Unhandled error:', msg)
    res.status(500).json({ error: 'Server error: ' + msg })
  }
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  const idToken = (req.headers.authorization ?? '').replace('Bearer ', '')
  if (!idToken) { res.status(401).json({ error: 'Must be signed in' }); return }

  let uid: string
  try { uid = await verifyToken(idToken) }
  catch { res.status(401).json({ error: 'Invalid or expired token' }); return }

  const { packId } = (req.body ?? {}) as { packId?: string }
  if (!packId || !VALID_PACK_IDS.has(packId)) { res.status(400).json({ error: 'Invalid pack ID' }); return }

  let alreadyOwned = false
  try {
    alreadyOwned = await docExists(`users/${uid}/purchases/${packId}`, idToken)
  } catch (err: unknown) {
    console.error('Firestore check error:', err instanceof Error ? err.message : String(err))
  }
  if (alreadyOwned) { res.status(409).json({ error: 'already-owned' }); return }

  let intent
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' })
    intent = await stripe.paymentIntents.create({
      amount: 999,
      currency: 'usd',
      metadata: { packId, uid },
      automatic_payment_methods: { enabled: true },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Stripe error:', msg)
    res.status(500).json({ error: 'Payment service error: ' + msg })
    return
  }
  res.json({ clientSecret: intent.client_secret })
}

