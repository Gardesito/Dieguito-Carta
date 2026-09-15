export interface ProductVariant {
  id: string
  product_id: string
  name: string
  price: number
  sort_order: number
  is_available: boolean
  is_addon?: boolean
}
export interface Product {
  id: string
  category_id: string
  name: string
  slug: string
  description: string
  ingredients: string
  image_url: string
  image_alt: string
  price: number | null
  small_price: number | null
  large_price: number | null
  price_label: string
  is_available: boolean
  is_featured: boolean
  is_visible: boolean
  sort_order: number
  product_variants: ProductVariant[]
}
