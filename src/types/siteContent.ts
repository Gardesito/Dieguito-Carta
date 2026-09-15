export interface SiteContent {
  translations?: import('../i18n').Translations
  id: string
  content_key: string
  title: string
  subtitle: string
  body: string
  image_url: string
  image_alt: string
  button_label: string
  button_url: string
  metadata: { promotion_id?: string; category_slug?: string; sort_order?: number }
  is_visible: boolean
}
export interface OpeningHours {
  translations?: import('../i18n').Translations
  day: string
  hours: string
  closed: boolean
}
export interface SiteSettings {
  translations?: import('../i18n').Translations
  id: string
  business_name: string
  whatsapp_number: string
  address: string
  maps_url: string
  instagram_url: string
  facebook_url: string
  opening_hours: OpeningHours[]
  logo_url: string
  logo_alt: string
}
