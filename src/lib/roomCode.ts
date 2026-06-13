import { get } from 'firebase/database'
import { roomMetaRef } from '../firebase/database'

const CONSONANTS = 'BCDFGHJKLMNPQRSTVWXYZ'
const VOWELS = 'AEIOU'

function generateCode(): string {
  const c = (s: string) => s[Math.floor(Math.random() * s.length)]
  return c(CONSONANTS) + c(VOWELS) + c(CONSONANTS) + c(VOWELS)
}

export async function createUniqueRoomCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateCode()
    const snap = await get(roomMetaRef(code))
    if (!snap.exists()) return code
  }
  throw new Error('Could not generate a unique room code. Try again.')
}

export function isValidRoomCode(code: string): boolean {
  return /^[A-Z]{4}$/.test(code)
}
