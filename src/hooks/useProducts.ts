import { useCatalog } from './useCatalog'
export function useProducts() {
  const c = useCatalog()
  return { products: c.data.products, loading: c.loading, error: c.error, reload: c.reload }
}
