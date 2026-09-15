import type { Product } from '../types/product'
import { databaseError, requireSupabase } from './supabase'
export const productsService = {
  async list() {
    const { data, error } = await requireSupabase()
      .from('products')
      .select('*,product_variants(*)')
      .order('sort_order')
    if (error) throw databaseError(error)
    return data as unknown as Product[]
  },
  async save(product: Product) {
    const { product_variants, ...payload } = product
    const { error } = await requireSupabase().rpc('save_product', {
      payload,
      variants: product_variants,
    })
    if (error) throw databaseError(error)
  },
  async remove(id: string) {
    const { error } = await requireSupabase().from('products').delete().eq('id', id)
    if (error) throw databaseError(error)
  },
  async patch(id: string, values: Partial<Omit<Product, 'product_variants'>>) {
    const { error } = await requireSupabase().from('products').update(values).eq('id', id)
    if (error) throw databaseError(error)
  },
  async reorder(ids: string[]) {
    const { error } = await requireSupabase().rpc('reorder_items', {
      table_name: 'products',
      ordered_ids: ids,
    })
    if (error) throw databaseError(error)
  },
}
