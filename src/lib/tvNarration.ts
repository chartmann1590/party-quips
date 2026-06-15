import { loadKokoro, speakWithKokoro, stopKokoro, waitForNarration } from './kokoroTts'

export type VoiceMode = 'cloud' | 'browser' | 'auto'

export interface TvNarrationSettings {
  enabled: boolean
  rate: number
  pitch: number
  volume: number
  voiceMode: VoiceMode
  cloudVoice: string
  browserVoiceName: string | null
}

const STORAGE_KEY = 'pq_tv_narration'
const DEFAULT_SETTINGS: TvNarrationSettings = {
  enabled: false,
  rate: 0.92,
  pitch: 1,
  volume: 1,
  voiceMode: 'auto',
  cloudVoice: 'Matthew',
  browserVoiceName: null,
}

const NATURAL_VOICE_HINTS = [
  'natural', 'neural', 'premium', 'online',
  'google us english', 'microsoft aria', 'microsoft jenny',
  'microsoft guy', 'samantha',
]

let settings = loadSettings()
const listeners = new Set<(next: TvNarrationSettings) => void>()

function getSynth(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
    ? window.speechSynthesis
    : null
}

function loadSettings(): TvNarrationSettings {
  if (typeof localStorage === 'undefined') return DEFAULT_SETTINGS
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function saveSettings(next: TvNarrationSettings) {
  settings = next
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
  listeners.forEach(l => l(next))
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').replace(/&/g, ' and ').trim()
}

function voiceScore(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase()
  const lang = voice.lang.toLowerCase()
  let score = 0
  if (lang.startsWith('en-us')) score += 20
  else if (lang.startsWith('en')) score += 10
  for (const hint of NATURAL_VOICE_HINTS) {
    if (name.includes(hint)) score += 18
  }
  if (!voice.localService) score += 4
  if (name.includes('female')) score += 2
  return score
}

function pickBestBrowserVoice(): SpeechSynthesisVoice | null {
  const synth = getSynth()
  if (!synth) return null
  return synth.getVoices()
    .filter(v => v.lang.toLowerCase().startsWith('en'))
    .sort((a, b) => voiceScore(b) - voiceScore(a))[0] ?? null
}

function getSelectedBrowserVoice(): SpeechSynthesisVoice | null {
  const synth = getSynth()
  if (!synth) return null
  if (settings.browserVoiceName) {
    const match = synth.getVoices().find(v => v.name === settings.browserVoiceName)
    if (match) return match
  }
  return pickBestBrowserVoice()
}

// Resolves when the current narration (cloud or browser) finishes.
// Host pages await this before advancing to the next phase.
let _narrationDone: Promise<void> = Promise.resolve()

export function waitForCurrentNarration(): Promise<void> {
  return _narrationDone
}

export function getTvNarrationSettings(): TvNarrationSettings {
  return settings
}

export function setTvNarrationSettings(patch: Partial<TvNarrationSettings>) {
  saveSettings({ ...settings, ...patch })
  if (patch.enabled) loadKokoro()
}

export function subscribeToTvNarration(listener: (next: TvNarrationSettings) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function isTvNarrationSupported(): boolean {
  return getSynth() !== null
}

export function stopTvNarration() {
  stopKokoro()
  getSynth()?.cancel()
}

export function getBrowserVoices(): SpeechSynthesisVoice[] {
  return getSynth()?.getVoices().filter(v => v.lang.toLowerCase().startsWith('en')) ?? []
}

function speakWebSpeech(script: string): Promise<void> {
  const synth = getSynth()
  if (!synth) return Promise.resolve()
  synth.cancel()
  return new Promise<void>(resolve => {
    // Chrome silently drops speak() called immediately after cancel() — 50ms gap fixes it
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(script)
      utterance.voice = getSelectedBrowserVoice()
      utterance.rate = settings.rate
      utterance.pitch = settings.pitch
      utterance.volume = settings.volume
      utterance.onend = () => resolve()
      utterance.onerror = () => resolve()
      synth.speak(utterance)
    }, 50)
  })
}

export function speakTvNarration(text: string, options: { force?: boolean } = {}) {
  if (!settings.enabled && !options.force) return
  const script = normalize(text)
  if (!script) return

  const mode = settings.voiceMode

  if (mode === 'browser') {
    _narrationDone = speakWebSpeech(script)
    return
  }

  if (mode === 'cloud') {
    // speakWithKokoro sets up narrationPromise synchronously before its first await,
    // so waitForNarration() captures the correct promise here.
    speakWithKokoro(script, settings.cloudVoice).catch(() => {})
    _narrationDone = waitForNarration()
    return
  }

  // auto: try cloud first, fall back to browser on failure
  _narrationDone = speakWithKokoro(script, settings.cloudVoice)
    .then(ok => ok ? waitForNarration() : speakWebSpeech(script))
    .catch(() => speakWebSpeech(script))
}

// Chrome/Edge return [] from getVoices() until voiceschanged fires — trigger early load
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices()
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    window.speechSynthesis.getVoices()
  })
}
