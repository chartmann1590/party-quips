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

  // Primary: ttsmp3.com (free AWS Polly proxy, multiple voices, no auth required)
  try {
    const body = new URLSearchParams({ msg: text, lang: voice, source: 'ttsmp3' })
    const jsonRes = await fetch('https://ttsmp3.com/makemp3_new.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      signal: AbortSignal.timeout(6000),
    })
    if (jsonRes.ok) {
      const json = await jsonRes.json() as { Error?: number; URL?: string }
      if (json.Error === 0 && json.URL) {
        const mp3 = await fetch(json.URL, { signal: AbortSignal.timeout(5000) })
        if (mp3.ok) {
          const buf = Buffer.from(await mp3.arrayBuffer())
          res.setHeader('Content-Type', 'audio/mpeg')
          res.setHeader('Cache-Control', 'public, max-age=300')
          res.send(buf)
          return
        }
      }
    }
    console.warn('[TTS] ttsmp3.com failed')
  } catch (err) {
    console.warn('[TTS] ttsmp3.com error:', err instanceof Error ? err.message : err)
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
