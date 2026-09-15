import { requireSupabase, isConfigured, databaseError } from './supabase'
import {
  demoCategories,
  demoProducts,
  demoPromotions,
  demoContent,
  demoSettings,
} from '../data/demo'
import type { Category } from '../types/category'
import type { Product } from '../types/product'
import type { Promotion } from '../types/promotion'
import type { SiteContent, SiteSettings } from '../types/siteContent'
import { siteConfig } from '../config/site'
export interface Catalog {
  categories: Category[]
  products: Product[]
  promotions: Promotion[]
  content: SiteContent[]
  settings: SiteSettings
}
export const fallbackCatalog: Catalog = {
  categories: demoCategories,
  products: demoProducts,
  promotions: demoPromotions,
  content: demoContent,
  settings: demoSettings,
}
const cacheKey = `dieguito:public:menu-v2:${import.meta.env.VITE_SUPABASE_URL || 'demo'}`
export function readCache(): Catalog | null {
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null')
    if (
      !cached ||
      cached.version !== 1 ||
      !Array.isArray(cached.data?.products) ||
      !Array.isArray(cached.data?.categories) ||
      !Array.isArray(cached.data?.content) ||
      !Array.isArray(cached.data?.promotions) ||
      !Array.isArray(cached.data?.settings?.opening_hours)
    )
      return null
    return cached.data
  } catch {
    return null
  }
}
export function writeCache(data: Catalog) {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ version: 1, data }))
  } catch {
    /* Storage may be full or disabled. */
  }
}
let pending: Promise<Catalog> | null = null
export function fetchCatalog(): Promise<Catalog> {
  if (!isConfigured) return Promise.resolve(fallbackCatalog)
  if (pending) return pending
  pending = loadCatalog().finally(() => {
    pending = null
  })
  return pending
}
async function loadCatalog(): Promise<Catalog> {
  const db = requireSupabase()
  const results = await Promise.all([
    db.from('categories').select('*').eq('is_active', true).order('sort_order'),
    db.from('products').select('*,product_variants(*)').eq('is_visible', true).order('sort_order'),
    db.from('promotions').select('*').eq('is_active', true).order('sort_order'),
    db.from('site_content').select('*').eq('is_visible', true),
    db.from('site_settings').select('*').limit(1),
  ])
  for (const r of results) if (r.error) throw databaseError(r.error)
  const [categories, products, promotions, content, settings] = results.map((r) => r.data)
  const setting = (settings as SiteSettings[])[0]
  return {
    categories: categories as Category[],
    products: (products as unknown as Product[]).map((p) => ({
      ...p,
      product_variants: (p.product_variants || []).sort((a, b) => a.sort_order - b.sort_order),
    })),
    promotions: promotions as Promotion[],
    content: content as SiteContent[],
    settings: setting
      ? {
          ...setting,
          whatsapp_number: setting.whatsapp_number || siteConfig.whatsapp,
          logo_url: setting.logo_url || siteConfig.logoUrl,
          logo_alt: setting.logo_alt || siteConfig.name,
        }
      : demoSettings,
  }
}
