import type { Promotion } from '../types/promotion'
import { databaseError, requireSupabase } from './supabase'
export const promotionsService = {
  async list() {
    const { data, error } = await requireSupabase()
      .from('promotions')
      .select('*')
      .order('sort_order')
    if (error) throw databaseError(error)
    return data
  },
  async save(item: Promotion) {
    const { error } = await requireSupabase().from('promotions').upsert(item)
    if (error) throw databaseError(error)
  },
  async remove(id: string) {
    const { error } = await requireSupabase().from('promotions').delete().eq('id', id)
    if (error) throw databaseError(error)
  },
}
