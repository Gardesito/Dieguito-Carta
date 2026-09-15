import type { Product } from '../types/product'
import type { Category } from '../types/category'
export const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
export function filterProducts(
  products: Product[],
  categories: Category[],
  query: string,
  category: string,
) {
  return products.filter(
    (p) =>
      p.is_visible &&
      categories.some((c) => c.id === p.category_id && c.is_active) &&
      (!category || p.category_id === category) &&
      normalize(
        [
          p.name,
          p.description,
          p.ingredients,
          categories.find((c) => c.id === p.category_id)?.name,
        ].join(' '),
      ).includes(normalize(query.trim())),
  )
}
export function priceOptions(p: Product) {
  const variants = p.product_variants.filter((v) => !v.is_addon)
  if (variants.length)
    return variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: v.price,
      available: v.is_available,
    }))
  const options = []
  const unknownPizza = p.slug === 'pizzas-de-la-bahia-merluza-negra' && p.price === null
  if (p.small_price !== null || unknownPizza)
    options.push({ id: 'small', name: 'Chico', price: p.small_price, available: true })
  if (p.large_price !== null || unknownPizza)
    options.push({ id: 'large', name: 'Grande', price: p.large_price, available: true })
  return options
}
export function selectedPrice(p: Product, id: string) {
  const addon = p.product_variants.find((v) => v.is_addon && v.id === id)
  if (addon) return p.price === null ? null : p.price + addon.price
  const options = priceOptions(p)
  return options.length ? (options.find((v) => v.id === id)?.price ?? null) : p.price
}
export function canOrder(p: Product, id: string) {
  const options = priceOptions(p)
  return (
    p.is_available &&
    p.is_visible &&
    (!id || !p.product_variants.some((v) => v.is_addon && v.id === id && !v.is_available)) &&
    (!options.length || options.some((v) => v.id === id && v.available))
  )
}
export const slugify = (s: string) =>
  normalize(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
