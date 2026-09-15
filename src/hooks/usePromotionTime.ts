import { useEffect, useState } from 'react'
import type { Promotion } from '../types/promotion'
// Wake at the next scheduled boundary, including when a page stays open.
export function usePromotionTime(promotions: Promotion[]) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const current = Date.now()
    const next = promotions
      .flatMap((p) => [p.starts_at, p.ends_at])
      .filter((s): s is string => Boolean(s))
      .map(Date.parse)
      .filter((t) => t > current)
      .sort((a, b) => a - b)[0]
    if (!next) return
    const timer = setTimeout(() => setNow(Date.now()), Math.min(next - current + 10, 2147483647))
    return () => clearTimeout(timer)
  }, [promotions, now])
  return Date.now()
}
