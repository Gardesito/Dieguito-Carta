import type { SiteContent, SiteSettings } from '../types/siteContent'
import { databaseError, requireSupabase } from './supabase'
export const contentService = {
  async list() {
    const { data, error } = await requireSupabase()
      .from('site_content')
      .select('*')
      .order('content_key')
    if (error) throw databaseError(error)
    return data
  },
  async save(item: SiteContent) {
    const { error } = await requireSupabase().from('site_content').upsert(item)
    if (error) throw databaseError(error)
  },
  async settings() {
    const { data, error } = await requireSupabase()
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle()
    if (error) throw databaseError(error)
    return data
  },
  async saveSettings(item: SiteSettings) {
    const { error } = await requireSupabase().from('site_settings').upsert(item)
    if (error) throw databaseError(error)
  },
}
