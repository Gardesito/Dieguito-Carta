import { describe, expect, it } from 'vitest'
import { currency } from './currency'
import { normalizePhone, productMessage, tableFromSearch, whatsappUrl } from './whatsapp'
import { canOrder, filterProducts, priceOptions, selectedPrice } from './products'
import { isPromotionActive } from './promotions'
import { demoProducts, demoCategories, demoPromotions } from '../../tests/fixtures/demo'
import { safeUrl } from './image'
import { preserveTable } from './navigation'
it('conserva la mesa al navegar y no la envía a sitios externos', () => {
  expect(preserveTable('/#menu', '?mesa=12')).toBe('/?mesa=12#menu')
  expect(preserveTable('/#menu', '?mesa=<b>')).toBe('/#menu')
  expect(preserveTable('https://example.com', '?mesa=12')).toBe('https://example.com')
})
describe('Moneda argentina', () => {
  it('separa miles sin centavos ficticios', () => expect(currency(32000)).toBe('$32.000'))
  it('mantiene centavos reales', () => expect(currency(1234.5)).toBe('$1.234,50'))
  it('acepta cero y precio por consultar', () => {
    expect(currency(0)).toBe('$0')
    expect(currency(null)).toBe('Consultar')
  })
})
describe('Mesa y WhatsApp', () => {
  it.each(['12', 'A-8', 'abc123', 'a'.repeat(20)])('acepta mesa válida %s', (s) =>
    expect(tableFromSearch('?mesa=' + s)).toBe(s),
  )
  it.each(['', '<script>', '1 2', 'a'.repeat(21), 'á', '1/2'])('rechaza mesa inválida %s', (s) =>
    expect(tableFromSearch('?mesa=' + encodeURIComponent(s))).toBeNull(),
  )
  it('no agrega mesa ausente', () => {
    expect(tableFromSearch('')).toBeNull()
    expect(productMessage({ name: 'Pizza', category: 'Pizzas', price: 12000 })).not.toContain(
      'Mesa:',
    )
  })
  it('incluye opción, precio y mesa seguros', () => {
    const message = productMessage({
      name: 'Muzzarella & más',
      category: 'Pizzas',
      option: 'Grande',
      price: 19000,
      table: '12',
    })
    const url = whatsappUrl('+54 9 2901 123456', message)
    expect(url).toBe('https://wa.me/5492901123456?text=' + encodeURIComponent(message))
    expect(new URL(url).searchParams.get('text')).toContain(
      'Opción: Grande\nPrecio: $19.000\nMesa: 12',
    )
    expect(new URL(url).searchParams.get('text')).toContain('Muzzarella & más')
  })
  it('rechaza número sin configurar', () => {
    expect(() => whatsappUrl('[NUMERO_WHATSAPP]', 'Hola')).toThrow()
    expect(normalizePhone('123abc123')).toBeNull()
  })
  it('no agrega mesa inválida al mensaje aunque llegue directamente', () =>
    expect(
      productMessage({ name: 'Pizza', category: 'Pizzas', price: 1, table: '<b>' }),
    ).not.toContain('Mesa:'))
})
describe('Catálogo', () => {
  it('ignora acentos y mayúsculas en ingredientes', () =>
    expect(filterProducts(demoProducts, demoCategories, 'OREGANO', '').map((p) => p.name)).toEqual([
      'Muzzarella',
    ]))
  it('busca por categoría', () =>
    expect(filterProducts(demoProducts, demoCategories, 'entradas', '')[0].name).toBe('Rabas'))
  it('combina categoría y búsqueda', () =>
    expect(
      filterProducts(demoProducts, demoCategories, 'carne', demoProducts[0].category_id),
    ).toHaveLength(0))
  it('oculta productos y categorías inactivas', () => {
    expect(
      filterProducts([{ ...demoProducts[0], is_visible: false }], demoCategories, '', ''),
    ).toHaveLength(0)
    expect(
      filterProducts(
        demoProducts,
        demoCategories.map((c) => ({ ...c, is_active: false })),
        '',
        '',
      ),
    ).toHaveLength(0)
  })
  it('mantiene agotados visibles pero no permite pedir', () => {
    const p = { ...demoProducts[0], is_available: false }
    expect(filterProducts([p], demoCategories, '', '')).toHaveLength(1)
    expect(canOrder(p, 'large')).toBe(false)
  })
  it('requiere elegir tamaño', () => {
    expect(canOrder(demoProducts[0], '')).toBe(false)
    expect(selectedPrice(demoProducts[0], 'large')).toBe(19000)
    expect(selectedPrice(demoProducts[0], 'small')).toBe(12000)
    expect(canOrder(demoProducts[0], 'large')).toBe(true)
  })
  it('las variantes tienen prioridad y respetan disponibilidad', () => {
    const p = {
      ...demoProducts[0],
      product_variants: [
        {
          id: 'v',
          product_id: 'p',
          name: 'Especial',
          price: 23000,
          sort_order: 0,
          is_available: false,
        },
      ],
    }
    expect(priceOptions(p)).toHaveLength(1)
    expect(selectedPrice(p, 'v')).toBe(23000)
    expect(canOrder(p, 'v')).toBe(false)
    expect(canOrder(p, 'large')).toBe(false)
  })
  it('precio único y consulta sin precio', () => {
    expect(selectedPrice(demoProducts[1], '')).toBe(20000)
    expect(canOrder({ ...demoProducts[1], price: null }, '')).toBe(true)
  })
})
describe('Promociones y enlaces', () => {
  it('excluye vencidas, futuras e inactivas', () => {
    const p = demoPromotions[0],
      now = Date.parse('2026-09-14T12:00:00Z')
    expect(isPromotionActive({ ...p, ends_at: '2026-09-14T12:00:00Z' }, now)).toBe(false)
    expect(isPromotionActive({ ...p, starts_at: '2026-09-15T12:00:00Z' }, now)).toBe(false)
    expect(isPromotionActive({ ...p, is_active: false }, now)).toBe(false)
    expect(isPromotionActive(p, now)).toBe(true)
  })
  it('impide ejecutar enlaces de código', () => {
    expect(safeUrl('javascript:alert(1)', true)).toBe('')
    expect(safeUrl('//evil.test', true)).toBe('')
    expect(safeUrl('/#menu', true)).toBe('/#menu')
  })
})
