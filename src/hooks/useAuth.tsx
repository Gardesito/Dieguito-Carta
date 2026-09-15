import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '../types/database'
import { requireSupabase, supabase } from '../services/supabase'
interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string
  signOut: () => Promise<void>
}
const Context = createContext<AuthState | null>(null)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [error, setError] = useState('')
  useEffect(() => {
    if (!supabase) return
    let alive = true
    let revision = 0
    let activeId: string | null | undefined
    const apply = async (next: User | null) => {
      const nextId = next?.id || null
      // Auth broadcasts from the preview iframe must not remount the editor
      // or discard its draft when the same user still has a valid session.
      if (activeId === nextId) return
      activeId = nextId
      const current = ++revision
      setUser(next)
      setProfile(null)
      setLoading(true)
      setError('')
      if (next) {
        const { data, error: failure } = await requireSupabase()
          .from('profiles')
          .select('*')
          .eq('id', next.id)
          .maybeSingle()
        if (!alive || current !== revision) return
        if (failure)
          setError('No pudimos comprobar tus permisos. Recargá la página para reintentar.')
        else if (!data) setError('Tu usuario no tiene un perfil de administrador o editor.')
        else setProfile(data)
      }
      if (alive && current === revision) setLoading(false)
    }
    void supabase.auth.getSession().then(({ data, error: failure }) => {
      if (!alive) return
      if (failure) {
        setError('No pudimos recuperar tu sesión.')
        setLoading(false)
      } else void apply(data.session?.user || null)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      queueMicrotask(() => {
        if (alive) void apply(session?.user || null)
      })
    })
    return () => {
      alive = false
      subscription.unsubscribe()
    }
  }, [])
  const signOut = useCallback(async () => {
    const { error: failure } = await requireSupabase().auth.signOut()
    if (failure) throw failure
    setUser(null)
    setProfile(null)
  }, [])
  return (
    <Context.Provider value={{ user, profile, loading, error, signOut }}>
      {children}
    </Context.Provider>
  )
}
export function useAuth() {
  const c = useContext(Context)
  if (!c) throw new Error('Falta AuthProvider')
  return c
}
