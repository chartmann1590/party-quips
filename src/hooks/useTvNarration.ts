import { useEffect, useRef, useState } from 'react'
import { getTvNarrationSettings, speakTvNarration, subscribeToTvNarration } from '../lib/tvNarration'

export function useTvNarration(cueKey: string | null, script: string | null, active = true) {
  const lastCue = useRef<string | null>(null)
  const [enabled, setEnabled] = useState(() => getTvNarrationSettings().enabled)
  const prevEnabled = useRef(enabled)

  useEffect(() => subscribeToTvNarration(s => setEnabled(s.enabled)), [])

  useEffect(() => {
    if (!active || !cueKey || !script || !enabled) return
    if (!prevEnabled.current) lastCue.current = null  // narrator just turned on — re-speak current cue
    prevEnabled.current = enabled
    if (lastCue.current === cueKey) return
    lastCue.current = cueKey
    speakTvNarration(script)
  }, [active, cueKey, script, enabled])
}
