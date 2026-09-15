// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import HeroCarousel from './HeroCarousel'
import { homeContent } from '../../../data/homeData'
import i18n from '../../../i18n'
const slides = homeContent.filter((c) => c.content_key.startsWith('hero'))
beforeEach(() => {
  vi.useFakeTimers()
  void i18n.changeLanguage('es')
  Object.defineProperty(document, 'hidden', { value: false, configurable: true })
  window.matchMedia = vi
    .fn()
    .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})
it('avanza cada 5 segundos y pausa durante interacción, reiniciando el plazo', () => {
  render(<HeroCarousel slides={slides} onCategory={() => {}} />)
  expect(screen.getByRole('heading', { name: 'Pizzas a la piedra' })).toBeTruthy()
  act(() => vi.advanceTimersByTime(5000))
  expect(screen.getByRole('heading', { name: 'El sabor de nuestra parrilla' })).toBeTruthy()
  const carousel = screen.getByRole('region')
  fireEvent.mouseEnter(carousel)
  act(() => vi.advanceTimersByTime(15000))
  expect(screen.getByRole('heading', { name: 'El sabor de nuestra parrilla' })).toBeTruthy()
  fireEvent.mouseLeave(carousel)
  act(() => vi.advanceTimersByTime(4999))
  expect(screen.getByRole('heading', { name: 'El sabor de nuestra parrilla' })).toBeTruthy()
  act(() => vi.advanceTimersByTime(1))
  expect(screen.getByRole('heading', { name: 'Sabores del fin del mundo' })).toBeTruthy()
})
it('navega por flechas, puntos, teclado y gestos y conecta cada categoría', () => {
  const select = vi.fn()
  render(<HeroCarousel slides={slides} onCategory={select} />)
  fireEvent.click(screen.getByRole('link', { name: 'Ver pizzas' }))
  expect(select).toHaveBeenLastCalledWith('pizzas')
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
  fireEvent.click(screen.getByRole('link', { name: 'Ver parrillada' }))
  expect(select).toHaveBeenLastCalledWith('parrillada')
  fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' })
  fireEvent.click(screen.getByRole('link', { name: 'Ver platos del mar' }))
  expect(select).toHaveBeenLastCalledWith('del-mar')
  fireEvent.click(screen.getByRole('button', { name: 'Ir al slide 1' }))
  fireEvent.touchStart(screen.getByRole('region'), { touches: [{ clientX: 250 }] })
  fireEvent.touchEnd(screen.getByRole('region'), { changedTouches: [{ clientX: 50 }] })
  expect(screen.getByRole('heading', { name: 'El sabor de nuestra parrilla' })).toBeTruthy()
})
it('respeta movimiento reducido y permite navegación manual', () => {
  window.matchMedia = vi
    .fn()
    .mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })
  render(<HeroCarousel slides={slides} onCategory={() => {}} />)
  act(() => vi.advanceTimersByTime(20000))
  expect(screen.getByRole('heading', { name: 'Pizzas a la piedra' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
  expect(screen.getByRole('heading', { name: 'El sabor de nuestra parrilla' })).toBeTruthy()
})
