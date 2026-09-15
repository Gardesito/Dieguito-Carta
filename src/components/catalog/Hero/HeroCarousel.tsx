import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play, ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { SiteContent } from '../../../types/siteContent'
import FoodImage from '../../common/FoodImage'
import { localized } from '../../../i18n'
import { safeUrl } from '../../../utils/image'
import { preserveTable } from '../../../utils/navigation'

export default function HeroCarousel({
  slides,
  onCategory,
}: {
  slides: SiteContent[]
  onCategory: (slug: string) => void
}) {
  const { t, i18n } = useTranslation()
  const visible = slides
    .filter((s) => s.is_visible)
    .sort((a, b) => (a.metadata.sort_order || 0) - (b.metadata.sort_order || 0))
  const [index, setIndex] = useState(0),
    [paused, setPaused] = useState(false),
    [interacting, setInteracting] = useState(false),
    [tick, setTick] = useState(0)
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [hidden, setHidden] = useState(document.hidden)
  const touch = useRef<number | null>(null)
  const active = index % (visible.length || 1)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    const update = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])
  useEffect(() => {
    if (paused || interacting || reduced || hidden || visible.length < 2) return
    const timer = setTimeout(() => setIndex((i) => (i + 1) % visible.length), 5000)
    return () => clearTimeout(timer)
  }, [active, tick, paused, interacting, reduced, hidden, visible.length])
  function go(next: number) {
    setIndex((next + visible.length) % visible.length)
    setTick((t) => t + 1)
  }
  if (!visible.length) return null
  return (
    <section
      className="hero-carousel container"
      aria-roledescription="carousel"
      aria-label={t('Especialidades de Dieguito')}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => {
        setInteracting(false)
        setTick((t) => t + 1)
      }}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setInteracting(false)
          setTick((t) => t + 1)
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          go(active + 1)
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          go(active - 1)
        }
      }}
      onTouchStart={(e) => {
        touch.current = e.touches[0].clientX
        setInteracting(true)
      }}
      onTouchEnd={(e) => {
        if (touch.current !== null) {
          const delta = e.changedTouches[0].clientX - touch.current
          if (Math.abs(delta) > 45) go(active + (delta < 0 ? 1 : -1))
        }
        touch.current = null
        setInteracting(false)
        setTick((t) => t + 1)
      }}
      onTouchCancel={() => {
        touch.current = null
        setInteracting(false)
      }}
    >
      <div className="hero-slides" aria-live={paused || interacting ? 'polite' : 'off'}>
        {visible.map((raw, i) => {
          const s = localized(raw, i18n.resolvedLanguage)
          return (
            <article
              key={s.id}
              className={`hero-slide ${i === active ? 'is-current' : ''}`}
              aria-hidden={i !== active}
              inert={i !== active}
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${visible.length}`}
            >
              <div className="hero-slide-copy">
                <p className="eyebrow">DIEGUITO · USHUAIA</p>
                <h1>{s.title}</h1>
                <p>{s.body}</p>
                <a
                  className="btn"
                  href={preserveTable(safeUrl(s.button_url, true) || '/#menu')}
                  onClick={(e) => {
                    if (s.metadata.category_slug) {
                      e.preventDefault()
                      onCategory(s.metadata.category_slug)
                    }
                    setTick((t) => t + 1)
                  }}
                >
                  {s.button_label}
                  <ArrowUpRight size={20} />
                </a>
              </div>
              <div className="hero-slide-photo">
                <FoodImage src={s.image_url} alt={s.image_alt || s.title} priority={i === 0} />
              </div>
            </article>
          )
        })}
      </div>
      <div className="hero-controls">
        <button
          className="icon-btn hero-arrow"
          aria-label={t('Anterior')}
          onClick={() => go(active - 1)}
        >
          <ChevronLeft />
        </button>
        <div className="hero-dots">
          {visible.map((s, i) => (
            <button
              key={s.id}
              aria-label={`${t('Ir al slide')} ${i + 1}`}
              aria-current={active === i ? 'true' : undefined}
              onClick={() => go(i)}
            >
              <span />
            </button>
          ))}
        </div>
        <button
          className="icon-btn"
          aria-label={t(paused ? 'Reproducir carrusel' : 'Pausar carrusel')}
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? <Play size={16} /> : <Pause size={16} />}
        </button>
        <button
          className="icon-btn hero-arrow"
          aria-label={t('Siguiente')}
          onClick={() => go(active + 1)}
        >
          <ChevronRight />
        </button>
      </div>
    </section>
  )
}
