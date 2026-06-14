// Uses @huggingface/transformers pipeline directly — no kokoro-js needed.
// Xenova/mms-tts-eng quantized = 37MB (vs 154MB Kokoro) so it loads ~4x faster.
// Model is cached by the browser Cache API after first download.

type ProgressCallback = (pct: number) => void

const MODEL_ID = 'Xenova/mms-tts-eng'

let pipe: any = null
let loadPromise: Promise<any | null> | null = null
let loadProgress = 0
const progressListeners = new Set<ProgressCallback>()

let currentSource: AudioBufferSourceNode | null = null
let audioCtx: AudioContext | null = null

export function isKokoroLoaded(): boolean {
  return pipe !== null
}

export function getKokoroProgress(): number {
  return loadProgress
}

export function subscribeToKokoroProgress(cb: ProgressCallback): () => void {
  progressListeners.add(cb)
  return () => progressListeners.delete(cb)
}

function notifyProgress(pct: number) {
  loadProgress = pct
  progressListeners.forEach(cb => cb(pct))
}

function getAudioContext(sampleRate: number): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContext({ sampleRate })
  }
  return audioCtx
}

export async function loadKokoro(): Promise<any | null> {
  if (pipe) return pipe
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    try {
      const { pipeline } = await import('@huggingface/transformers')
      const instance = await (pipeline as any)('text-to-speech', MODEL_ID, {
        dtype: 'quantized',
        device: 'wasm',
        progress_callback: (info: any) => {
          if (info.status === 'progress' && info.total) {
            notifyProgress((info.loaded / info.total) * 0.98)
          } else if (info.status === 'ready') {
            notifyProgress(1)
          }
        },
      })
      pipe = instance
      notifyProgress(1)
      return instance
    } catch (e) {
      console.warn('[TTS] Model load failed, falling back to Web Speech API:', e)
      loadPromise = null
      loadProgress = 0
      return null
    }
  })()

  return loadPromise
}

export async function speakWithKokoro(text: string): Promise<boolean> {
  if (!pipe) return false
  try {
    stopKokoro()
    const output = await pipe(text)
    const ctx = getAudioContext(output.sampling_rate)
    if (ctx.state === 'suspended') await ctx.resume()
    const samples = Float32Array.from(output.audio)
    const buffer = ctx.createBuffer(1, samples.length, output.sampling_rate)
    buffer.copyToChannel(samples, 0)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    currentSource = source
    source.onended = () => { currentSource = null }
    source.start()
    return true
  } catch (e) {
    console.warn('[TTS] Speech generation failed:', e)
    return false
  }
}

export function stopKokoro(): void {
  try { currentSource?.stop() } catch {}
  currentSource = null
}

// Pre-load immediately on page open so model is hot by game time.
// 37MB cached by browser Cache API — subsequent sessions load from cache instantly.
if (typeof window !== 'undefined') loadKokoro()
