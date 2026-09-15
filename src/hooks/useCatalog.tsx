import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  fallbackCatalog,
  fetchCatalog,
  readCache,
  writeCache,
  type Catalog,
} from '../services/catalog.service'
import { isConfigured } from '../services/supabase'
interface CatalogState {
  data: Catalog
  loading: boolean
  error: string
  demo: boolean
  reload: () => Promise<void>
}
const Context = createContext<CatalogState | null>(null)
export function CatalogProvider({ children }: { children: ReactNode }) {
  const initial = useRef(readCache())
  const [data, setData] = useState(initial.current || fallbackCatalog)
  const [loading, setLoading] = useState(isConfigured)
  const [error, setError] = useState('')
  const [demo, setDemo] = useState(!isConfigured || !initial.current)
  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchCatalog()
      setData(result)
      setDemo(!isConfigured)
      setError('')
      if (isConfigured) {
        initial.current = result
        writeCache(result)
      }
    } catch {
      setError(
        initial.current
          ? 'No pudimos actualizar el menú. Estamos mostrando la última versión disponible.'
          : 'No pudimos actualizar el menú. Estamos mostrando la carta de respaldo local.',
      )
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    void reload()
  }, [reload])
  return (
    <Context.Provider value={{ data, loading, error, demo, reload }}>{children}</Context.Provider>
  )
}
export function useCatalog() {
  const context = useContext(Context)
  if (!context) throw new Error('Falta CatalogProvider')
  return context
}
