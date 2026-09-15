import { test, expect } from '@playwright/test'
test('cambia idiomas, persiste la preferencia, mantiene precios y respaldo español', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  await page.getByRole('combobox', { name: 'Idioma' }).selectOption('pt')
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  await expect(page.getByRole('heading', { name: 'Os mais pedidos' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Buscar produtos' })).toBeVisible()
  await expect(page.locator('.popular-section')).toContainText('$12.000')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  await page.getByRole('combobox', { name: 'Idioma' }).selectOption('en')
  await expect(page.getByRole('heading', { name: 'Popular picks' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await page.getByRole('textbox', { name: 'Search products' }).fill('Cazador')
  await expect(
    page.locator('#menu').getByRole('button', { name: 'View Cazador, available' }),
  ).toBeVisible()
  await page.getByRole('combobox', { name: 'Language' }).selectOption('es')
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
})
test('populares y accesos del hero llevan al modal y a la categoría correcta', async ({ page }) => {
  await page.goto('/?mesa=14')
  await expect(page.locator('.popular-section .product-card')).toHaveCount(3)
  await expect(page.locator('.popular-section h3')).toHaveText([
    'Muzzarella',
    'Dieguito Casera con Fritas',
    'Carne',
  ])
  await page.getByRole('link', { name: 'Ver pizzas', exact: true }).click()
  await expect(page.locator('#menu .product-card')).toHaveCount(22)
  await page.locator('.hero-carousel').getByRole('button', { name: 'Ir al slide 2' }).click()
  await page.getByRole('link', { name: 'Ver parrillada', exact: true }).click()
  await expect(page.locator('#menu .product-card')).toHaveCount(9)
  await page.locator('.hero-carousel').getByRole('button', { name: 'Ir al slide 3' }).click()
  await page.getByRole('link', { name: 'Ver platos del mar', exact: true }).click()
  await expect(page.locator('#menu .product-card')).toHaveCount(10)
  await page.getByRole('link', { name: 'Ver todo el menú' }).click()
  await expect(page.locator('#menu .product-card')).toHaveCount(184)
  await page.locator('.popular-section .product-card').first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
})
for (const width of [390, 768, 1440])
  test(`portada y tres idiomas a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/')
    for (const language of ['es', 'pt', 'en']) {
      await page.locator('.language-selector select').selectOption(language)
      await expect(page.locator('.hero-carousel')).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      await page.screenshot({ path: `test-results/home-${width}-${language}.png` })
      if (language === 'es') {
        await page
          .locator('.popular-section')
          .screenshot({ path: `test-results/popular-${width}.png` })
        await page.locator('.offer-banner').screenshot({ path: `test-results/offer-${width}.png` })
        const height = (await page.locator('.hero-carousel').boundingBox())!.height
        for (const slide of [2, 3]) {
          await page
            .locator('.hero-carousel')
            .getByRole('button', { name: `Ir al slide ${slide}` })
            .click()
          await expect(page.locator('.hero-slide.is-current img')).toBeVisible()
          await expect(page.locator('.hero-slide.is-current')).toHaveCSS('opacity', '1')
          await page.evaluate(() => window.scrollTo(0, 0))
          expect((await page.locator('.hero-carousel').boundingBox())!.height).toBe(height)
          await page
            .locator('.hero-carousel')
            .screenshot({ path: `test-results/hero-${width}-${slide}.png` })
        }
      }
    }
  })
test('muestra el primer slide cuando JavaScript está deshabilitado', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('http://127.0.0.1:5173/')
  await expect(page.getByRole('heading', { name: 'Pizzas a la piedra' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver pizzas' })).toBeVisible()
  await context.close()
})
