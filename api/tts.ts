import type { VercelRequest, VercelResponse } from '@vercel/node'

const ALLOWED_VOICES = new Set([
  'Matthew','Joey','Justin','Joanna','Kendra','Kimberly','Salli',
  'Brian','Amy','Emma','Russell','Nicole',
])

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') { res.status(200).end(); return }

  const text = String(req.query.text ?? '').trim().slice(0, 400)
  if (!text) { res.status(400).json({ error: 'text is required' }); return }

  const voice = ALLOWED_VOICES.has(String(req.query.voice ?? ''))
    ? String(req.query.voice)
    : 'Matthew'

  // Primary: StreamElements (proxies AWS Polly)
  try {
    const url = `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodeURIComponent(text)}`
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PartyQuips/1.0)' },
      signal: AbortSignal.timeout(5000),
    })
    if (r.ok) {
      const buf = Buffer.from(await r.arrayBuffer())
      res.setHeader('Content-Type', 'audio/mpeg')
      res.setHeader('Cache-Control', 'public, max-age=300')
      res.send(buf)
      return
    }
    console.warn('[TTS] StreamElements returned', r.status)
  } catch (err) {
    console.warn('[TTS] StreamElements error:', err instanceof Error ? err.message : err)
  }

  // Fallback: Google Translate TTS
  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en-US&client=tw-ob`
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      },
      signal: AbortSignal.timeout(5000),
    })
    if (r.ok) {
      const buf = Buffer.from(await r.arrayBuffer())
      res.setHeader('Content-Type', 'audio/mpeg')
      res.setHeader('Cache-Control', 'public, max-age=300')
      res.send(buf)
      return
    }
    console.warn('[TTS] Google Translate returned', r.status)
  } catch (err) {
    console.warn('[TTS] Google Translate error:', err instanceof Error ? err.message : err)
  }

  res.status(503).json({ error: 'TTS unavailable' })
}
