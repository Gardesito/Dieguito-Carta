import type { Promotion } from '../types/promotion'
export const isPromotionActive = (p: Promotion, now = Date.now()) =>
  p.is_active &&
  (!p.starts_at || Date.parse(p.starts_at) <= now) &&
  (!p.ends_at || Date.parse(p.ends_at) > now)
