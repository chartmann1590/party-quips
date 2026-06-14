import type { KokoroTTS as KokoroTTSType } from 'kokoro-js'

const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0_ONNX'
const VOICE = 'am_fenrir'  // American male — dramatic and fun for a game show host

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
      // hf-mirror.com is a public HuggingFace mirror — no login required
      const { env: hfEnv } = await import('@huggingface/transformers')
      hfEnv.remoteHost = 'https://hf-mirror.com/'
      const instance = await KokoroTTS.from_pretrained(MODEL_ID, {
        dtype: 'q8',
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
