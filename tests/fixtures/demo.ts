import type { Category } from '../../src/types/category'
import type { Product } from '../../src/types/product'
import type { Promotion } from '../../src/types/promotion'
import type { SiteContent, SiteSettings } from '../../src/types/siteContent'
import { siteConfig } from '../../src/config/site'
import { slugify } from '../../src/utils/products'
export const photos = {
  pizza:
    'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1000&q=85',
  burger:
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80',
  empanada:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Empanadas_argentinas_de_carne_hechas_al_horno.jpg/960px-Empanadas_argentinas_de_carne_hechas_al_horno.jpg',
  rabas:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Calamares_a_la_Romana-2009.jpg/960px-Calamares_a_la_Romana-2009.jpg',
  chicken:
    'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=700&q=80',
}
const names = [
  'Promos',
  'Entradas',
  'Empanadas',
  'Pizzas',
  'Pizzas de la Bahía',
  'Sándwiches',
  'Hamburguesas caseras',
  'Parrillada',
  'Del mar',
  'Milanesas del bodegón',
  'Minutas',
  'Pastas',
  'Calzones',
  'Platos especiales',
  'Postres',
  'Bebidas',
  'Cervezas',
  'Vinos',
  'Menú del día',
]
export const demoCategories: Category[] = names.map((name, i) => ({
  id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
  name,
  slug: slugify(name),
  description: '',
  image_url: '',
  image_alt: '',
  icon: '',
  sort_order: i,
  is_active: true,
}))
const makeProduct = (
  name: string,
  cat: string,
  price: number | null,
  description: string,
  image_url: string,
  index: number,
): Product => ({
  id: `10000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
  name,
  slug: slugify(name),
  category_id: demoCategories.find((c) => c.name === cat)!.id,
  description,
  ingredients: description,
  image_url,
  image_alt: name,
  price,
  small_price: null,
  large_price: null,
  price_label: '',
  is_available: true,
  is_featured: true,
  is_visible: true,
  sort_order: index,
  product_variants: [],
})
export const demoProducts: Product[] = [
  {
    ...makeProduct(
      'Muzzarella',
      'Pizzas',
      null,
      'Salsa, muzzarella, orégano y aceitunas.',
      photos.pizza,
      1,
    ),
    small_price: 12000,
    large_price: 19000,
  },
  makeProduct(
    'Hamburguesa Dieguito',
    'Hamburguesas caseras',
    20000,
    'Carne, doble cheddar, tomate, lechuga, panceta, cebolla, huevo y papas fritas.',
    photos.burger,
    2,
  ),
  {
    ...makeProduct(
      'Empanada de carne',
      'Empanadas',
      4000,
      'Un clásico que nunca falla.',
      photos.empanada,
      3,
    ),
    price_label: 'c/u',
  },
  makeProduct('Rabas', 'Entradas', 17500, 'Para compartir y empezar bien.', photos.rabas, 4),
  {
    ...makeProduct('Promo 19', 'Promos', 32000, '1 pollo con fritas.', photos.chicken, 5),
    is_featured: false,
  },
]
export const demoPromotions: Promotion[] = [
  {
    id: '20000000-0000-4000-8000-000000000001',
    product_id: demoProducts[4].id,
    title: 'Hoy se comparte',
    description: '1 pollo con fritas. La excusa perfecta para juntarse.',
    image_url: photos.chicken,
    image_alt: 'Pollo dorado al horno',
    previous_price: null,
    current_price: 32000,
    starts_at: null,
    ends_at: null,
    is_active: true,
    sort_order: 0,
  },
]
