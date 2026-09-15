import { useCatalog } from './useCatalog'
export function useCategories() {
  const c = useCatalog()
  return { categories: c.data.categories, loading: c.loading, error: c.error }
}
