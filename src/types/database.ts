import type { Category } from './category'
import type { Product, ProductVariant } from './product'
import type { Promotion } from './promotion'
import type { SiteContent, SiteSettings } from './siteContent'
export interface Profile {
  id: string
  full_name: string
  role: 'admin' | 'editor'
}
export interface Media {
  id: string
  file_name: string
  storage_path: string
  public_url: string
  alt_text: string
  mime_type: string
  size_bytes: number
}
type Table<T> = {
  Row: { [K in keyof T]: T[K] }
  Insert: { [K in keyof T]?: T[K] }
  Update: { [K in keyof T]?: T[K] }
  Relationships: []
}
export interface Database {
  public: {
    Tables: {
      profiles: Table<Profile>
      categories: Table<Category>
      products: Table<Omit<Product, 'product_variants'>>
      product_variants: Table<ProductVariant>
      promotions: Table<Promotion>
      site_content: Table<SiteContent>
      site_settings: Table<SiteSettings>
      media: Table<Media>
    }
    Views: Record<string, never>
    Functions: {
      save_product: { Args: { payload: unknown; variants: unknown }; Returns: string }
      reorder_items: { Args: { table_name: string; ordered_ids: string[] }; Returns: undefined }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
