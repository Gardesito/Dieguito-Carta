import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'
const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
export const isConfigured = Boolean(url && /^https?:\/\//.test(url) && key)
export const supabase = isConfigured
  ? createClient<Database>(url!, key!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null
export function requireSupabase() {
  if (!supabase) throw new Error('Configurá Supabase en .env.local para administrar el sitio.')
  return supabase
}
export function databaseError(error: { message: string; code?: string }) {
  if (error.code === '23505')
    return new Error('Ya existe un registro con ese nombre o identificador.')
  if (error.code === '23503')
    return new Error('Este registro tiene productos asociados. Reasignalos antes de eliminarlo.')
  if (error.code === '42501') return new Error('No tenés permiso para realizar esta acción.')
  return new Error(error.message)
}
