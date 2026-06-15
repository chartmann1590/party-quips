import { useEffect, useState } from 'react'
import { CLOUD_VOICES } from '../../lib/kokoroTts'
import {
  VoiceMode,
  getBrowserVoices,
  getTvNarrationSettings,
  isTvNarrationSupported,
  setTvNarrationSettings,
  speakTvNarration,
  stopTvNarration,
  subscribeToTvNarration,
} from '../../lib/tvNarration'

const BTN_BASE = 'rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-transform hover:scale-105 font-label'

export default function TvNarrationControls() {
  const [settings, setSettings] = useState(getTvNarrationSettings)
  const [showSettings, setShowSettings] = useState(false)
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([])
  const supported = isTvNarrationSupported()

  useEffect(() => subscribeToTvNarration(setSettings), [])

  useEffect(() => {
    const load = () => setBrowserVoices(getBrowserVoices())
    load()
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', load)
      return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
    }
  }, [])

  if (!supported) return null

  function toggleNarration() {
    const enabled = !settings.enabled
    setTvNarrationSettings({ enabled })
    if (enabled) speakTvNarration('Narrator is ready.', { force: true })
    else stopTvNarration()
  }

  function setMode(voiceMode: VoiceMode) {
    setTvNarrationSettings({ voiceMode })
  }

  function testVoice() {
    speakTvNarration('Testing one two three. This is your Party Quips narrator!', { force: true })
  }

  const panelStyle: React.CSSProperties = {
    background: 'rgba(10,8,30,0.97)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: '14px 16px',
    width: 288,
    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: '0.12em',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    marginBottom: 6,
  }

  return (
    <div className="absolute right-4 top-4 z-30 flex flex-col items-end gap-2">

      {/* Top controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleNarration}
          className={BTN_BASE}
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
            className={BTN_BASE}
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

        <button
          type="button"
          onClick={() => setShowSettings(s => !s)}
          className={BTN_BASE}
          style={{
            background: showSettings ? 'rgba(250,204,21,0.9)' : 'rgba(15,15,26,0.72)',
            border: showSettings ? '2px solid rgba(255,255,255,0.6)' : '2px solid rgba(255,255,255,0.24)',
            color: showSettings ? '#0f0f1a' : '#f0f0ff',
            boxShadow: '0 4px 18px rgba(0,0,0,0.25)',
          }}
          title="Voice settings"
        >
          ⚙ Voice
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div style={panelStyle} className="flex flex-col gap-4">

          {/* Voice Mode */}
          <div>
            <div style={sectionLabel}>Voice Mode</div>
            <div className="flex gap-1.5">
              {([
                { id: 'auto' as VoiceMode,    label: '⚡ Auto',    tip: 'Cloud → browser fallback' },
                { id: 'cloud' as VoiceMode,   label: '☁ Cloud',   tip: 'Requires internet' },
                { id: 'browser' as VoiceMode, label: '💻 Browser', tip: 'Works offline' },
              ]).map(({ id, label, tip }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  title={tip}
                  className="flex-1 rounded-lg py-1.5 text-[10px] font-bold transition-all"
                  style={{
                    background: settings.voiceMode === id ? 'rgba(99,102,241,0.8)' : 'rgba(255,255,255,0.07)',
                    border: settings.voiceMode === id ? '1px solid rgba(165,180,252,0.8)' : '1px solid rgba(255,255,255,0.12)',
                    color: settings.voiceMode === id ? '#fff' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-white/30 text-[9px] mt-1.5 leading-tight">
              {settings.voiceMode === 'auto' && 'Tries cloud voice first, falls back to browser if unavailable.'}
              {settings.voiceMode === 'cloud' && 'Only uses the cloud voice. Needs internet.'}
              {settings.voiceMode === 'browser' && "Only uses your device's built-in voices."}
            </p>
          </div>

          {/* Cloud Voices */}
          {settings.voiceMode !== 'browser' && (
            <div>
              <div style={sectionLabel}>Cloud Voice (AWS Polly)</div>
              <div className="grid grid-cols-3 gap-1.5">
                {CLOUD_VOICES.map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setTvNarrationSettings({ cloudVoice: v.id })}
                    className="rounded-lg py-1.5 px-1 text-center transition-all"
                    style={{
                      background: settings.cloudVoice === v.id ? 'rgba(99,102,241,0.8)' : 'rgba(255,255,255,0.06)',
                      border: settings.cloudVoice === v.id ? '1px solid rgba(165,180,252,0.8)' : '1px solid rgba(255,255,255,0.1)',
                      color: settings.cloudVoice === v.id ? '#fff' : 'rgba(255,255,255,0.55)',
                    }}
                  >
                    <div className="text-[10px] font-bold">{v.label}</div>
                    <div className="text-[8px] opacity-60">{v.accent} {v.gender === 'M' ? '♂' : '♀'}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Browser Voices */}
          {settings.voiceMode !== 'cloud' && (
            <div>
              <div style={sectionLabel}>Browser Voice</div>
              {browserVoices.length === 0 ? (
                <p className="text-white/30 text-[9px]">No browser voices found.</p>
              ) : (
                <>
                  <select
                    value={settings.browserVoiceName ?? ''}
                    onChange={e => setTvNarrationSettings({ browserVoiceName: e.target.value || null })}
                    className="w-full rounded-lg px-2 py-1.5 text-[10px] font-bold focus:outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                    }}
                  >
                    <option value="">Auto-select best available</option>
                    {browserVoices.map(v => (
                      <option key={v.name} value={v.name} style={{ background: '#1a1535' }}>
                        {v.name}{!v.localService ? ' ★' : ''} ({v.lang})
                      </option>
                    ))}
                  </select>
                  <p className="text-white/25 text-[8px] mt-1">★ = online/neural voice</p>
                </>
              )}
            </div>
          )}

          {/* Test button */}
          <button
            type="button"
            onClick={testVoice}
            className="w-full rounded-full py-2 text-xs font-bold uppercase tracking-wide transition-transform hover:scale-105 font-label"
            style={{
              background: 'rgba(250,204,21,0.9)',
              border: '2px solid rgba(255,255,255,0.5)',
              color: '#0f0f1a',
              boxShadow: '0 4px 18px rgba(0,0,0,0.3)',
            }}
          >
            🔊 Test Voice
          </button>

        </div>
      )}
    </div>
  )
}
