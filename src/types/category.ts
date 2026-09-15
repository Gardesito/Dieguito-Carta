export interface Category {
  translations?: import('../i18n').Translations
  id: string
  name: string
  slug: string
  description: string
  image_url: string
  image_alt: string
  icon: string
  sort_order: number
  is_active: boolean
}
