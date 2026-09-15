import { afterEach, expect, it } from 'vitest'
import i18n, { localized } from './index'
import { productMessage } from '../utils/whatsapp'
afterEach(() => {
  void i18n.changeLanguage('es')
})
it('usa español cuando faltan traducciones o hay campos vacíos', () => {
  const row = {
    name: 'Centolla',
    description: 'Descripción original',
    translations: { pt: { name: '', description: 'Tradução' } },
  }
  expect(localized(row, 'en').name).toBe('Centolla')
  expect(localized(row, 'pt')).toMatchObject({ name: 'Centolla', description: 'Tradução' })
})
it.each([
  [
    'es',
    'Hola, quiero consultar/pedir:',
    'Producto',
    'Categoría',
    'Opción',
    'Precio',
    'Mesa',
    '¿Está disponible?',
  ],
  [
    'pt',
    'Olá, gostaria de consultar/pedir:',
    'Produto',
    'Categoria',
    'Opção',
    'Preço',
    'Mesa',
    'Está disponível?',
  ],
  [
    'en',
    'Hello, I would like to ask about/order:',
    'Product',
    'Category',
    'Option',
    'Price',
    'Table',
    'Is it available?',
  ],
])(
  'genera WhatsApp en %s',
  async (lang, greeting, product, category, option, price, table, end) => {
    await i18n.changeLanguage(lang)
    expect(
      productMessage({
        name: 'Muzzarella',
        category: 'Pizzas',
        option: 'Grande',
        price: 19000,
        table: '8',
      }),
    ).toBe(
      `${greeting}\n\n${product}: Muzzarella\n${category}: Pizzas\n${option}: Grande\n${price}: $19.000\n${table}: 8\n\n${end}`,
    )
    const message = productMessage({ name: 'Muzzarella', category: 'Pizzas', price: null })
    expect(message).not.toContain(`${table}:`)
    expect(message).not.toContain(`${option}:`)
  },
)
