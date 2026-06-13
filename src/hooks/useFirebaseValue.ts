import { useEffect, useState } from 'react'
import { onValue, type DatabaseReference } from 'firebase/database'

export function useFirebaseValue<T>(
  refFn: (() => DatabaseReference) | null
): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!refFn) {
      setLoading(false)
      return
    }

    let r: DatabaseReference
    try {
      r = refFn()
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
      setLoading(false)
      return
    }

    const unsub = onValue(
      r,
      (snap) => {
        setData(snap.val() as T | null)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )

    return () => unsub()
  }, [refFn])

  return { data, loading, error }
}
