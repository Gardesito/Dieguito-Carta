import { useCallback, useEffect, useRef, useState } from 'react'
export function useAdminData<T>(loader: () => Promise<T>, initial: T) {
  const ref = useRef(loader)
  ref.current = loader
  const [data, setData] = useState<T>(initial)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setData(await ref.current())
      setError('')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    void reload()
  }, [reload])
  return { data, setData, loading, error, reload }
}
