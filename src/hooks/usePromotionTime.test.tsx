// @vitest-environment jsdom
import { renderHook, act, cleanup } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { usePromotionTime } from './usePromotionTime'
import { isPromotionActive } from '../utils/promotions'
import { demoPromotions } from '../../tests/fixtures/demo'
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})
it('actualiza la vigencia aunque el visitante deje abierta la página', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-14T12:00:00Z'))
  const p = { ...demoPromotions[0], ends_at: '2026-09-14T12:00:01Z' }
  const list = [p]
  const { result } = renderHook(() => usePromotionTime(list))
  expect(isPromotionActive(p, result.current)).toBe(true)
  act(() => {
    vi.advanceTimersByTime(1010)
  })
  expect(isPromotionActive(p, result.current)).toBe(false)
})
