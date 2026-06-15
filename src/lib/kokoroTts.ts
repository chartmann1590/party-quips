// Cloud TTS via Vercel API proxy — AWS Polly voices, no download, no WASM.
const TTS_API = 'https://party-quips-api-six.vercel.app/api/tts'

export const CLOUD_VOICES = [
  { id: 'Matthew', label: 'Matthew', accent: 'US', gender: 'M' },
  { id: 'Joey',    label: 'Joey',    accent: 'US', gender: 'M' },
  { id: 'Justin',  label: 'Justin',  accent: 'US', gender: 'M' },
  { id: 'Joanna',  label: 'Joanna',  accent: 'US', gender: 'F' },
  { id: 'Kendra',  label: 'Kendra',  accent: 'US', gender: 'F' },
  { id: 'Kimberly',label: 'Kimberly',accent: 'US', gender: 'F' },
  { id: 'Salli',   label: 'Salli',   accent: 'US', gender: 'F' },
  { id: 'Brian',   label: 'Brian',   accent: 'UK', gender: 'M' },
  { id: 'Amy',     label: 'Amy',     accent: 'UK', gender: 'F' },
  { id: 'Emma',    label: 'Emma',    accent: 'UK', gender: 'F' },
  { id: 'Russell', label: 'Russell', accent: 'AU', gender: 'M' },
  { id: 'Nicole',  label: 'Nicole',  accent: 'AU', gender: 'F' },
] as const

export type CloudVoiceId = typeof CLOUD_VOICES[number]['id']

let current: HTMLAudioElement | null = null

export const isKokoroLoaded = (): boolean => true
export const getKokoroProgress = (): number => 1
export const loadKokoro = async (): Promise<true> => true

export function subscribeToKokoroProgress(cb: (pct: number) => void): () => void {
  cb(1)
  return () => {}
}

export async function speakWithKokoro(text: string, voice: string = 'Matthew'): Promise<boolean> {
  try {
    stopKokoro()
    const url = `${TTS_API}?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return false
    const blob = await res.blob()
    if (!blob.size) return false
    const objUrl = URL.createObjectURL(blob)
    const audio = new Audio(objUrl)
    current = audio
    audio.onended = () => { URL.revokeObjectURL(objUrl); current = null }
    // Do NOT await play() — it throws NotAllowedError on autoplay restriction
    // which would cause a false-negative and trigger a double-speak fallback.
    audio.play().catch(() => {})
    return true
  } catch {
    return false
  }
}

export function stopKokoro(): void {
  if (current) {
    current.pause()
    current = null
  }
}

// Pre-warm serverless function on page open so first speech fires fast.
if (typeof window !== 'undefined') {
  fetch(`${TTS_API}?text=welcome&voice=Matthew`, { cache: 'force-cache' }).catch(() => {})
}
