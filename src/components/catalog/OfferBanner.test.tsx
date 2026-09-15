// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import OfferBanner from './OfferBanner'
import { homeContent } from '../../data/homeData'
import type { Promotion } from '../../types/promotion'
afterEach(cleanup)
const p: Promotion = {
  id: 'test',
  product_id: null,
  title: 'Oferta confirmada',
  description: 'Consultar al local',
  image_url: '',
  image_alt: '',
  previous_price: null,
  current_price: null,
  starts_at: null,
  ends_at: null,
  is_active: true,
  sort_order: 0,
}
const general = homeContent.find((c) => c.content_key === 'offer')!
it('muestra una promoción vigente sin inventar precios', () => {
  render(<OfferBanner promotions={[p]} general={general} phone="" />)
  expect(screen.getByRole('heading', { name: p.title })).toBeTruthy()
  expect(document.querySelector('.offer-prices')?.textContent).toBe('')
})
it('excluye vencidas y muestra el banner general', () => {
  render(
    <OfferBanner
      promotions={[{ ...p, ends_at: '2000-01-01T00:00:00Z' }]}
      general={general}
      phone=""
    />,
  )
  expect(screen.queryByText(p.title)).toBeNull()
  expect(screen.getByRole('link', { name: 'Ver promociones' })).toBeTruthy()
})
it('permite ocultar el banner general', () => {
  const { container } = render(
    <OfferBanner promotions={[]} general={{ ...general, is_visible: false }} phone="" />,
  )
  expect(container.innerHTML).toBe('')
})
