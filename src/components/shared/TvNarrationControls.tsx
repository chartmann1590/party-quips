import { useEffect, useState } from 'react'
import {
  getTvNarrationSettings,
  isTvNarrationSupported,
  setTvNarrationSettings,
  speakTvNarration,
  stopTvNarration,
  subscribeToTvNarration,
} from '../../lib/tvNarration'
import { getKokoroProgress, isKokoroLoaded, subscribeToKokoroProgress } from '../../lib/kokoroTts'

export default function TvNarrationControls() {
  const [settings, setSettings] = useState(getTvNarrationSettings)
  const [kokoroReady, setKokoroReady] = useState(isKokoroLoaded)
  const [loadPct, setLoadPct] = useState(() => getKokoroProgress())
  const supported = isTvNarrationSupported()

  useEffect(() => subscribeToTvNarration(setSettings), [])

  useEffect(() => {
    if (kokoroReady) return
    return subscribeToKokoroProgress(pct => {
      setLoadPct(pct)
      if (pct >= 1) setKokoroReady(true)
    })
  }, [kokoroReady])

  if (!supported) return null

  function toggleNarration() {
    const enabled = !settings.enabled
    setTvNarrationSettings({ enabled })

    if (enabled) {
      speakTvNarration('TV narrator is ready.', { force: true })
    } else {
      stopTvNarration()
    }
  }

  const loading = settings.enabled && !kokoroReady
  const loadLabel = loading ? `Loading voice… ${Math.round(loadPct * 100)}%` : null

  return (
    <div className="absolute right-4 top-4 z-30 flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleNarration}
          className="font-label rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wide transition-transform hover:scale-105"
          style={{
            background: settings.enabled ? 'rgba(57,255,20,0.92)' : 'rgba(15,15,26,0.72)',
            border: settings.enabled ? '2px solid rgba(240,240,255,0.8)' : '2px solid rgba(255,255,255,0.24)',
            color: settings.enabled ? '#0f0f1a' : '#f0f0ff',
            boxShadow: '0 4px 18px rgba(0,0,0,0.25)',
          }}
          aria-pressed={settings.enabled}
        >
          Narrator {settings.enabled ? 'On' : 'Off'}
        </button>

        {settings.enabled && (
          <button
            type="button"
            onClick={stopTvNarration}
            className="font-label rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wide transition-transform hover:scale-105"
            style={{
              background: 'rgba(15,15,26,0.72)',
              border: '2px solid rgba(255,255,255,0.24)',
              color: '#f0f0ff',
              boxShadow: '0 4px 18px rgba(0,0,0,0.25)',
            }}
          >
            Stop
          </button>
        )}
      </div>

      {loadLabel && (
        <div className="flex flex-col items-end gap-1">
          <p className="text-white/60 text-xs font-mono">{loadLabel}</p>
          <div className="w-32 h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-green-400 transition-all duration-300"
              style={{ width: `${Math.round(loadPct * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
