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
let fetchAbort: AbortController | null = null

// Resolves when the current narration finishes (or is stopped/aborted).
// Always reflects the most recently-started narration.
let narrationResolve: () => void = () => {}
let narrationPromise: Promise<void> = Promise.resolve()

export function waitForNarration(): Promise<void> {
  return narrationPromise
}

export const isKokoroLoaded = (): boolean => true
export const getKokoroProgress = (): number => 1
export const loadKokoro = async (): Promise<true> => true

export function subscribeToKokoroProgress(cb: (pct: number) => void): () => void {
  cb(1)
  return () => {}
}

export async function speakWithKokoro(text: string, voice: string = 'Matthew'): Promise<boolean> {
  // Abort any in-flight fetch and stop any currently playing audio.
  // This prevents two overlapping narrations when phases transition quickly.
  fetchAbort?.abort()
  stopKokoro()

  const ac = new AbortController()
  fetchAbort = ac
  const timeout = setTimeout(() => ac.abort(), 8000)

  // Set up a new narration promise for this invocation.
  // Capture myResolve locally so abort/end events for THIS call resolve the right promise.
  narrationPromise = new Promise<void>(r => { narrationResolve = r })
  const myResolve = narrationResolve

  try {
    const url = `${TTS_API}?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}`
    const res = await fetch(url, { signal: ac.signal })
    clearTimeout(timeout)

    // Check if a newer call superseded us
    if (!res.ok || fetchAbort !== ac) {
      myResolve()
      return false
    }
    const blob = await res.blob()
    if (!blob.size || fetchAbort !== ac) {
      myResolve()
      return false
    }

    fetchAbort = null
    const objUrl = URL.createObjectURL(blob)
    const audio = new Audio(objUrl)
    current = audio
    audio.onended = () => {
      URL.revokeObjectURL(objUrl)
      current = null
      myResolve()
    }
    // Do NOT await play() — autoplay restrictions throw NotAllowedError
    // which would cause a false-negative and trigger double-speak fallback.
    audio.play().catch(() => myResolve())
    return true
  } catch {
    clearTimeout(timeout)
    myResolve()
    return false
  }
}

export function stopKokoro(): void {
  if (current) {
    current.pause()
    current = null
    narrationResolve()
  }
}

// Pre-warm serverless function on page open so first speech fires fast.
if (typeof window !== 'undefined') {
  fetch(`${TTS_API}?text=welcome&voice=Matthew`, { cache: 'force-cache' }).catch(() => {})
}
