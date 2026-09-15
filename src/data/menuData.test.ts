import { describe, expect, it } from 'vitest'
import { menuCategories as categories, menuProducts as products } from './menuData'
import { canOrder, filterProducts, priceOptions, selectedPrice } from '../utils/products'
import { currency } from '../utils/currency'
import { productMessage } from '../utils/whatsapp'

describe('Carta completa de Dieguito', () => {
  it('contiene 184 artículos en las 14 categorías ordenadas, sin duplicados ni huérfanos', () => {
    expect(categories.map((c) => c.name)).toEqual([
      'Sándwiches',
      'Parrillada',
      'Del Mar',
      'Platos Especiales',
      'Empanadas',
      'Minutas',
      'Pizzas',
      'Pizzas de la Bahía',
      'Hamburguesas Caseras',
      'Pastas',
      'Postres',
      'Bebidas',
      'Cervezas',
      'Vinos',
    ])
    expect(categories.map((c) => products.filter((p) => p.category_id === c.id).length)).toEqual([
      10, 9, 10, 7, 20, 10, 22, 6, 10, 10, 8, 7, 15, 40,
    ])
    expect(products).toHaveLength(184)
    expect(new Set(products.map((p) => p.slug)).size).toBe(184)
    expect(new Set(products.map((p) => p.id)).size).toBe(184)
    for (const p of products) {
      expect(categories.some((c) => c.id === p.category_id)).toBe(true)
      expect(p.is_available && p.is_visible && !p.is_featured).toBe(true)
      for (const price of [p.price, p.small_price, p.large_price])
        expect(price === null || (typeof price === 'number' && price >= 0)).toBe(true)
      expect(p.image_url).toBe('')
    }
    for (const c of categories)
      expect(products.filter((p) => p.category_id === c.id).map((p) => p.sort_order)).toEqual(
        Array.from({ length: products.filter((p) => p.category_id === c.id).length }, (_, i) => i),
      )
  })
  it('conserva las excepciones, los registros compuestos y los dos Vacío', () => {
    expect(products.filter((p) => p.name === 'Vacío').map((p) => [p.slug, p.price])).toEqual([
      ['sandwich-vacio', 24000],
      ['parrillada-vacio', 27000],
    ])
    const unknown = products.filter(
      (p) => p.price === null && p.small_price === null && p.large_price === null,
    )
    expect(unknown.map((p) => p.name)).toEqual([
      'Merluza Negra',
      'Bombón Calafate',
      'Bombón Suizo',
      'Budín de Pan',
      'Choco Oreo',
      'Flan Casero',
      'Tiramisú',
      'Vigilante',
      'Adicional',
    ])
    expect(unknown.every((p) => p.price_label === 'Consultar precio')).toBe(true)
    expect(products.find((p) => p.name === 'Fond de Cave / La Linda')?.price).toBe(14500)
    expect(products.find((p) => p.name === 'Fond de Cave')?.price).toBe(19500)
    expect(products.filter((p) => p.small_price !== null)).toHaveLength(27)
    expect(
      products.some((p) =>
        ['Rabas', 'Promo 19', 'Hamburguesa Dieguito', 'Empanada de carne'].includes(p.name),
      ),
    ).toBe(false)
  })
  it('busca por nombre, ingredientes, descripción y categoría sin tildes ni mayúsculas', () => {
    expect(filterProducts(products, categories, 'SALMON', '').length).toBeGreaterThan(0)
    expect(
      filterProducts(products, categories, 'RUCULA', '').some((p) => p.name === 'Rúcula'),
    ).toBe(true)
    expect(filterProducts(products, categories, 'PURE', '')).toHaveLength(27)
    expect(filterProducts(products, categories, 'VINOS', '')).toHaveLength(40)
  })
  it('exige tamaño incluso para la pizza sin precio y formatea ARS', () => {
    for (const p of products.filter((p) => p.slug.startsWith('pizzas-'))) {
      expect(priceOptions(p).map((v) => v.name)).toEqual(['Chico', 'Grande'])
      expect(canOrder(p, '')).toBe(false)
      expect(canOrder(p, 'large')).toBe(true)
      expect(selectedPrice(p, 'large')).toBe(p.large_price)
    }
    expect(currency(20000)).toBe('$20.000')
  })
  it('suma solo la salsa seleccionada, respeta agotados e incluye el total en WhatsApp', () => {
    const pastas = products.filter((p) => p.product_variants.length)
    expect(pastas).toHaveLength(10)
    for (const p of pastas) {
      expect(p.product_variants.map((v) => [v.name, v.price])).toEqual([
        ['Fileto', 2000],
        ['Roquefort', 5000],
        ['Bolognesa', 5000],
        ['Estofado', 5000],
        ['4 Quesos', 5000],
        ['Blanca', 5000],
        ['Roja', 5000],
        ['Verdeo', 5000],
        ['Langostino', 8000],
      ])
      expect(selectedPrice(p, '')).toBe(p.price)
      expect(priceOptions(p)).toEqual([])
      expect(canOrder(p, '')).toBe(true)
      const v = p.product_variants[0]
      expect(selectedPrice(p, v.id)).toBe(p.price! + 2000)
      expect(canOrder({ ...p, product_variants: [{ ...v, is_available: false }] }, v.id)).toBe(
        false,
      )
    }
    expect(
      productMessage({
        name: pastas[0].name,
        category: 'Pastas',
        option: 'Fileto',
        price: selectedPrice(pastas[0], pastas[0].product_variants[0].id),
        table: '12',
      }),
    ).toContain('Opción: Fileto\nPrecio: $21.000\nMesa: 12')
  })
})
