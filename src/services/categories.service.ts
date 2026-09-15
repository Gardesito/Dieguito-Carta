import type { Category } from '../types/category'
import { databaseError, requireSupabase } from './supabase'
export const categoriesService = {
  async list() {
    const { data, error } = await requireSupabase()
      .from('categories')
      .select('*')
      .order('sort_order')
    if (error) throw databaseError(error)
    return data
  },
  async save(item: Category) {
    const { error } = await requireSupabase().from('categories').upsert(item)
    if (error) throw databaseError(error)
  },
  async remove(id: string) {
    const { error } = await requireSupabase().from('categories').delete().eq('id', id)
    if (error) throw databaseError(error)
  },
  async reorder(ids: string[]) {
    const { error } = await requireSupabase().rpc('reorder_items', {
      table_name: 'categories',
      ordered_ids: ids,
    })
    if (error) throw databaseError(error)
  },
}
