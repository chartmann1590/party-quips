import { useMemo } from 'react'
import { useFirebaseValue } from './useFirebaseValue'
import {
  systemRef,
  quiplashRoundRef,
  fibbageRoundRef,
  triviaRoundRef,
} from '../firebase/database'
import type { SystemData } from '../types/room'
import type { QuiplashRound } from '../types/quiplash'
import type { FibbageRound } from '../types/fibbage'
import type { TriviaRound } from '../types/trivia'

export function useSystemData(roomCode: string | null) {
  const refFn = useMemo(
    () => roomCode ? () => systemRef(roomCode) : null,
    [roomCode]
  )
  return useFirebaseValue<SystemData>(refFn)
}

export function useQuiplashRound(roomCode: string | null, round: number) {
  const refFn = useMemo(
    () => roomCode ? () => quiplashRoundRef(roomCode, round) : null,
    [roomCode, round]
  )
  return useFirebaseValue<QuiplashRound>(refFn)
}

export function useFibbageRound(roomCode: string | null, round: number) {
  const refFn = useMemo(
    () => roomCode ? () => fibbageRoundRef(roomCode, round) : null,
    [roomCode, round]
  )
  return useFirebaseValue<FibbageRound>(refFn)
}

export function useTriviaRound(roomCode: string | null, round: number) {
  const refFn = useMemo(
    () => roomCode ? () => triviaRoundRef(roomCode, round) : null,
    [roomCode, round]
  )
  return useFirebaseValue<TriviaRound>(refFn)
}

export function useRemainingTime(timerStartedAt: number | undefined, timerDuration: number | undefined): number {
  // Compute remaining time without useEffect/useState to avoid jitter
  // Callers should re-render on a 1s interval
  if (!timerStartedAt || !timerDuration) return 0
  const elapsed = (Date.now() - timerStartedAt) / 1000
  return Math.max(0, Math.ceil(timerDuration - elapsed))
}
