import { test, expect, type Page } from '@playwright/test'
import { menuCategories, menuProducts } from '../../src/data/menuData'
const uid = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const cid = '00000000-0000-4000-8000-000000000001'
const base = 'https://dieguito-test.supabase.co'
const user = {
  id: uid,
  aud: 'authenticated',
  role: 'authenticated',
  email: 'admin@dieguito.test',
  email_confirmed_at: new Date().toISOString(),
  app_metadata: { provider: 'email' },
  user_metadata: {},
  created_at: new Date().toISOString(),
}
type Row = Record<string, unknown>
async function fixture(page: Page) {
  const tables: Record<string, Row[]> = {
    profiles: [{ id: uid, role: 'admin', full_name: 'Equipo de prueba' }],
    categories: [
      {
        id: cid,
        name: 'Pizzas',
        slug: 'pizzas',
        description: '',
        image_url: '',
        image_alt: '',
        icon: '',
        sort_order: 0,
        is_active: true,
      },
    ],
    products: [],
    promotions: [],
    site_content: [
      {
        id: '30000000-0000-4000-8000-000000000001',
        content_key: 'hero',
        title: 'El sabor de Ushuaia',
        subtitle: 'USHUAIA',
        body: 'Pizzas a la piedra',
        image_url: '',
        image_alt: '',
        button_label: 'Ver menú',
        button_url: '/#menu',
        metadata: {},
        is_visible: true,
      },
      {
        id: '30000000-0000-4000-8000-000000000002',
        content_key: 'about',
        title: 'Una buena mesa',
        subtitle: 'NOSOTROS',
        body: 'Te esperamos',
        image_url: '',
        image_alt: '',
        button_label: 'Ver menú',
        button_url: '/#menu',
        metadata: {},
        is_visible: true,
      },
    ],
    site_settings: [
      {
        id: '40000000-0000-4000-8000-000000000001',
        business_name: 'Dieguito',
        whatsapp_number: '5492901123456',
        address: 'Magallanes 967, Ushuaia',
        maps_url: '',
        instagram_url: '',
        facebook_url: '',
        opening_hours: [{ day: 'Lunes', hours: '12:00–23:00', closed: false }],
        logo_url: '',
        logo_alt: 'Dieguito',
      },
    ],
    media: [],
  }
  const writes: { path: string; body: unknown }[] = []
  await page.route(`${base}/**`, async (route) => {
    const request = route.request(),
      url = new URL(request.url()),
      path = url.pathname
    const headers = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': 'GET,POST,PATCH,DELETE,HEAD,OPTIONS',
      'content-type': 'application/json',
    }
    const send = (body: unknown, status = 200) =>
      route.fulfill({ status, headers, body: JSON.stringify(body) })
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    if (path.includes('/auth/v1/token'))
      return send({
        access_token: `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ sub: uid, role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.test`,
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'test-refresh',
        user,
      })
    if (path.includes('/auth/v1/user')) return send(user)
    if (path.includes('/auth/v1/logout')) return route.fulfill({ status: 204, headers })
    if (path.includes('/storage/v1/object/') && request.method() === 'POST') {
      writes.push({ path, body: 'upload' })
      return send({ Key: 'product-images/uploads/test.png' })
    }
    if (path.includes('/storage/v1/object/public/')) return route.fulfill({ status: 404 })
    const body = request.postData() ? request.postDataJSON() : null
    if (request.method() !== 'GET' && request.method() !== 'HEAD') writes.push({ path, body })
    if (path.endsWith('/rpc/save_product')) {
      const p = { ...body.payload, product_variants: body.variants }
      tables.products = tables.products.filter((v) => v.id !== p.id).concat(p)
      return send(p.id)
    }
    if (path.endsWith('/rpc/reorder_items')) return send(null)
    const table = path.split('/').pop()!
    if (!tables[table]) return send({ message: 'Unknown test endpoint' }, 404)
    let rows = tables[table]
    for (const [k, v] of url.searchParams)
      if (v.startsWith('eq.')) rows = rows.filter((r) => String(r[k]) === v.slice(3))
    if (request.method() === 'GET')
      return send(request.headers().accept?.includes('vnd.pgrst.object') ? rows[0] || null : rows)
    if (request.method() === 'HEAD')
      return route.fulfill({
        status: 200,
        headers: { ...headers, 'content-range': `0-${rows.length}/${rows.length}` },
      })
    if (request.method() === 'POST') {
      const values = Array.isArray(body) ? body : [body]
      for (const v of values) {
        const next = { id: v.id || crypto.randomUUID(), ...v }
        tables[table] = tables[table].filter((r) => r.id !== next.id).concat(next)
      }
      return route.fulfill({ status: 201, headers, body: '' })
    }
    if (request.method() === 'PATCH') {
      for (const r of rows) Object.assign(r, body)
      return route.fulfill({ status: 204, headers })
    }
    if (request.method() === 'DELETE') {
      tables[table] = tables[table].filter((r) => !rows.includes(r))
      return route.fulfill({ status: 204, headers })
    }
    return send(null)
  })
  return { tables, writes }
}
async function login(page: Page) {
  await page.goto('/admin/productos')
  await page.getByRole('textbox', { name: 'Correo electrónico' }).fill('admin@dieguito.test')
  await page.getByLabel('Contraseña', { exact: true }).fill('password-for-test')
  await page.getByRole('button', { name: 'Ingresar al administrador' }).click()
  await expect(page).toHaveURL(/\/admin\/productos$/)
  await expect(page.getByRole('heading', { name: 'Productos', exact: true })).toBeVisible()
}
test('administra los 184 artículos, conserva slugs y edita salsas y precios pendientes', async ({
  page,
}) => {
  const { tables } = await fixture(page)
  tables.categories = structuredClone(menuCategories)
  tables.products = structuredClone(menuProducts)
  await login(page)
  await expect(page.locator('.admin-product-row')).toHaveCount(184)
  await page.getByRole('textbox', { name: 'Buscar producto', exact: true }).fill('Vacío')
  const row = page.locator('.admin-product-row').filter({ hasText: 'Sándwiches' })
  await row.getByRole('button', { name: 'Editar Vacío' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Precio ($)', { exact: true }).fill('25000')
  await dialog.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(dialog).toHaveCount(0)
  expect(tables.products.find((p) => p.slug === 'sandwich-vacio')?.price).toBe(25000)
  expect(tables.products.find((p) => p.slug === 'parrillada-vacio')?.price).toBe(27000)
  await page.getByRole('textbox', { name: 'Buscar producto', exact: true }).fill('Ñoquis')
  await page.getByRole('button', { name: 'Editar Ñoquis' }).click()
  await expect(dialog.locator('.variant-admin')).toHaveCount(9)
  await expect(
    dialog.locator('.variant-admin').first().getByLabel('Adicional al precio base'),
  ).toBeChecked()
  await dialog.locator('.variant-admin').first().getByLabel('Precio', { exact: true }).fill('3000')
  await dialog.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(dialog).toHaveCount(0)
  const pasta = tables.products.find((p) => p.name === 'Ñoquis')!
  expect((pasta.product_variants as Row[])[0]).toMatchObject({ price: 3000, is_addon: true })
  await page.getByRole('textbox', { name: 'Buscar producto', exact: true }).fill('Merluza Negra')
  await page.getByRole('button', { name: 'Editar Merluza Negra', exact: true }).click()
  await dialog.getByLabel('Precio chico ($)').fill('20000')
  await dialog.getByLabel('Precio grande ($)').fill('30000')
  await dialog.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(dialog).toHaveCount(0)
  expect(tables.products.find((p) => p.slug === 'pizzas-de-la-bahia-merluza-negra')).toMatchObject({
    small_price: 20000,
    large_price: 30000,
  })
  await page.getByRole('textbox', { name: 'Buscar producto', exact: true }).fill('Flan Casero')
  await page.getByRole('button', { name: 'Editar Flan Casero' }).click()
  await dialog.getByLabel('Precio ($)', { exact: true }).fill('5000')
  await dialog.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(dialog).toHaveCount(0)
  expect(tables.products.find((p) => p.name === 'Flan Casero')?.price).toBe(5000)
})
test('login, producto, foto, edición, ocultar, duplicar, eliminar y logout con API simulada', async ({
  page,
}) => {
  const { tables, writes } = await fixture(page)
  await login(page)
  await page.getByRole('button', { name: 'Crear producto' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Nombre', { exact: true }).fill('Pizza de prueba')
  await dialog.getByLabel('Precio ($)', { exact: true }).fill('15000')
  await dialog.getByLabel('Descripción', { exact: true }).fill('Muzzarella y albahaca')
  await dialog.locator('input[type=file]').setInputFiles({
    name: 'foto.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aY1sAAAAASUVORK5CYII=',
      'base64',
    ),
  })
  await dialog.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(dialog).toHaveCount(0)
  await expect(page.getByText('Pizza de prueba', { exact: true })).toBeVisible()
  expect(tables.products[0].price).toBe(15000)
  expect(writes.some((w) => w.path.includes('/storage/v1/object/'))).toBe(true)
  await page.getByRole('button', { name: 'Editar Pizza de prueba' }).click()
  await dialog.getByLabel('Precio ($)', { exact: true }).fill('17000')
  await dialog.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(dialog).toHaveCount(0)
  expect(tables.products[0].price).toBe(17000)
  await page.getByRole('button', { name: 'Ocultar Pizza de prueba' }).click()
  await expect(page.getByText('Disponible · Oculto')).toBeVisible()
  await page.getByRole('button', { name: 'Duplicar Pizza de prueba' }).click()
  await dialog.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(dialog).toHaveCount(0)
  expect(tables.products).toHaveLength(2)
  await page.getByRole('button', { name: 'Eliminar Pizza de prueba', exact: true }).click()
  await page.getByRole('button', { name: 'Sí, eliminar' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(tables.products).toHaveLength(1)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Productos', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  await expect(page).toHaveURL(/\/login$/)
})
test('categorías, promociones, editor visual y configuración con API simulada', async ({
  page,
}) => {
  const { tables } = await fixture(page)
  await login(page)
  await page.getByRole('link', { name: 'Categorías', exact: true }).click()
  await page.getByRole('button', { name: 'Crear categoría' }).click()
  await page.getByRole('dialog').getByLabel('Nombre', { exact: true }).fill('Postres')
  await page.getByRole('dialog').getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(tables.categories).toHaveLength(2)
  await page.getByRole('link', { name: 'Promociones', exact: true }).click()
  await page.getByRole('button', { name: 'Crear promoción' }).click()
  await page.getByRole('dialog').getByLabel('Título').fill('Promo de prueba')
  await page.getByRole('dialog').getByLabel('Precio actual ($)').fill('25000')
  await page.getByRole('dialog').getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(tables.promotions[0].current_price).toBe(25000)
  await page.getByRole('link', { name: 'Editar página', exact: true }).click()
  await page.getByLabel('Título', { exact: true }).fill('Nuestra nueva portada')
  await expect(
    page.frameLocator('iframe').getByRole('heading', { name: 'Nuestra nueva portada' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Mobile', exact: true }).click()
  await page.getByRole('button', { name: 'Guardar sección' }).click()
  await expect(page.getByText('Sección publicada')).toBeVisible()
  await expect(
    page.frameLocator('iframe').getByRole('heading', { name: 'Nuestra nueva portada' }),
  ).toBeVisible()
  expect(
    tables.site_content[0].title === 'Nuestra nueva portada' ||
      tables.site_content[1].title === 'Nuestra nueva portada',
  ).toBe(true)
  await page.getByRole('link', { name: 'Configuración', exact: true }).click()
  await page.getByLabel('WhatsApp (código de país + área + número)').fill('5492901654321')
  await page.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(page.getByText('Configuración guardada')).toBeVisible()
  expect(tables.site_settings[0].whatsapp_number).toBe('5492901654321')
})
test('WhatsApp genera el mensaje y el precio elegidos al abrir una pestaña', async ({ page }) => {
  const { tables } = await fixture(page)
  tables.products = [
    {
      id: '10000000-0000-4000-8000-000000000001',
      category_id: cid,
      name: 'Muzzarella',
      slug: 'muzzarella',
      description: 'Pizza',
      ingredients: '',
      image_url: '',
      image_alt: '',
      price: null,
      small_price: 12000,
      large_price: 19000,
      price_label: '',
      is_available: true,
      is_featured: true,
      is_visible: true,
      sort_order: 0,
      product_variants: [],
    },
  ]
  await page.goto('/?mesa=12')
  await page.getByRole('button', { name: 'Ver Muzzarella, disponible' }).click()
  await page.getByRole('radio', { name: /Grande/ }).check()
  await page
    .context()
    .route('https://wa.me/**', (r) => r.fulfill({ status: 200, body: 'WhatsApp de prueba' }))
  const popup = page.context().waitForEvent('page')
  await page.getByRole('button', { name: 'Pedir en la mesa / Dudas' }).click()
  const tab = await popup
  await tab.waitForURL(/wa.me/)
  const url = new URL(tab.url())
  expect(url.pathname).toBe('/5492901123456')
  expect(url.searchParams.get('text')).toContain('Opción: Grande\nPrecio: $19.000\nMesa: 12')
  await tab.close()
})
