import type { KokoroTTS as KokoroTTSType } from 'kokoro-js'

// Use the ungated public version — v1.0_ONNX is gated (401) for unauthenticated users
const MODEL_ID = 'onnx-community/Kokoro-82M-ONNX'
// q4f16 maps to model_q4f16.onnx (~154MB) which exists in this public model
const MODEL_DTYPE = 'q4f16' as const
const VOICE = 'am_michael'  // American male, available in this model

type ProgressCallback = (pct: number) => void

let tts: KokoroTTSType | null = null
let loadPromise: Promise<KokoroTTSType | null> | null = null
let loadProgress = 0
const progressListeners = new Set<ProgressCallback>()

let currentSource: AudioBufferSourceNode | null = null
let audioCtx: AudioContext | null = null

export function isKokoroLoaded(): boolean {
  return tts !== null
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

export async function loadKokoro(): Promise<KokoroTTSType | null> {
  if (tts) return tts
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    try {
      const { KokoroTTS } = await import('kokoro-js')
      const instance = await KokoroTTS.from_pretrained(MODEL_ID, {
        dtype: MODEL_DTYPE,
        device: 'wasm',
        progress_callback: (info: any) => {
          if (info.status === 'progress' && info.total) {
            notifyProgress((info.loaded / info.total) * 0.98)
          }
        },
      })
      tts = instance
      notifyProgress(1)
      return instance
    } catch (e) {
      console.warn('[Kokoro] Model load failed, falling back to Web Speech API:', e)
      loadPromise = null
      loadProgress = 0
      return null
    }
  })()

  return loadPromise
}

function getAudioContext(sampleRate: number): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContext({ sampleRate })
  }
  return audioCtx
}

export async function speakWithKokoro(text: string): Promise<boolean> {
  if (!tts) return false

  try {
    stopKokoro()

    const output = await tts.generate(text, { voice: VOICE, speed: 1.05 })

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
    console.warn('[Kokoro] Speech generation failed:', e)
    return false
  }
}

export function stopKokoro(): void {
  try { currentSource?.stop() } catch {}
  currentSource = null
}
