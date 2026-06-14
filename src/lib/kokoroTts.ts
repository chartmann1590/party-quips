// Cloud TTS via Vercel API proxy — no local model, no WASM, no download.
// Audio is streamed from AWS Polly (Matthew voice) via StreamElements.
const TTS_API = 'https://party-quips.vercel.app/api/tts'

let current: HTMLAudioElement | null = null

export const isKokoroLoaded = (): boolean => true
export const getKokoroProgress = (): number => 1
export const loadKokoro = async (): Promise<true> => true

export function subscribeToKokoroProgress(cb: (pct: number) => void): () => void {
  cb(1)
  return () => {}
}

export async function speakWithKokoro(text: string): Promise<boolean> {
  try {
    stopKokoro()
    const res = await fetch(`${TTS_API}?text=${encodeURIComponent(text)}`, {
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return false
    const blob = await res.blob()
    const objUrl = URL.createObjectURL(blob)
    const audio = new Audio(objUrl)
    current = audio
    audio.onended = () => { URL.revokeObjectURL(objUrl); current = null }
    await audio.play()
    return true
  } catch {
    return false
  }
}

export function stopKokoro(): void {
  current?.pause()
  current = null
}

// Pre-warm the serverless function so the first speech fires fast.
if (typeof window !== 'undefined') {
  fetch(`${TTS_API}?text=welcome+to+party+quips`, { cache: 'force-cache' }).catch(() => {})
}
