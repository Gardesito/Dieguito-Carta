import { useCatalog } from './useCatalog'
import { isPromotionActive } from '../utils/promotions'
export function usePromotions() {
  const c = useCatalog()
  return {
    promotions: c.data.promotions.filter((p) => isPromotionActive(p)),
    loading: c.loading,
    error: c.error,
  }
}
