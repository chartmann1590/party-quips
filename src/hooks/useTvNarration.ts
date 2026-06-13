import { useEffect, useRef } from 'react'
import { getTvNarrationSettings, speakTvNarration } from '../lib/tvNarration'

export function useTvNarration(cueKey: string | null, script: string | null, active = true) {
  const lastCue = useRef<string | null>(null)

  useEffect(() => {
    if (!active || !cueKey || !script) return
    if (!getTvNarrationSettings().enabled) return
    if (lastCue.current === cueKey) return

    lastCue.current = cueKey
    speakTvNarration(script)
  }, [active, cueKey, script])
}
