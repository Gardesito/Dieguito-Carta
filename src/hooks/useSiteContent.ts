import { useCatalog } from './useCatalog'
export function useSiteContent() {
  const c = useCatalog()
  return { content: c.data.content, settings: c.data.settings, loading: c.loading, error: c.error }
}
