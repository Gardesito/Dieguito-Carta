export interface Promotion {
  id: string
  product_id: string | null
  title: string
  description: string
  image_url: string
  image_alt: string
  previous_price: number | null
  current_price: number | null
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
  sort_order: number
}
