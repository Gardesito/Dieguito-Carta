import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { localized } from '../../i18n'
import { useLocation } from 'react-router-dom'
import { useCatalog } from '../../hooks/useCatalog'
import { normalizePhone } from '../../utils/whatsapp'
import { safeUrl } from '../../utils/image'
export default function Seo() {
  const { i18n } = useTranslation()
  const {
    data: { settings, content },
  } = useCatalog()
  const { pathname } = useLocation()
  useEffect(() => {
    const privatePage = pathname.startsWith('/admin') || pathname === '/login'
    document.title = privatePage
      ? 'Administración | Dieguito'
      : `Dieguito Ushuaia | ${localized(content.find((c) => c.content_key === 'hero') || { title: 'Dieguito', translations: {} }).title}`
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement('meta')
      robots.name = 'robots'
      document.head.append(robots)
    }
    robots.content =
      privatePage || !import.meta.env.VITE_SITE_URL ? 'noindex, nofollow' : 'index, follow'
    let structured = document.getElementById('restaurant-schema')
    if (!structured) {
      structured = document.createElement('script')
      structured.id = 'restaurant-schema'
      structured.setAttribute('type', 'application/ld+json')
      document.head.append(structured)
    }
    const phone = normalizePhone(settings.whatsapp_number)
    const site = safeUrl(import.meta.env.VITE_SITE_URL || '')
    const days: Record<string, string> = {
      Lunes: 'Monday',
      Martes: 'Tuesday',
      Miércoles: 'Wednesday',
      Jueves: 'Thursday',
      Viernes: 'Friday',
      Sábado: 'Saturday',
      Domingo: 'Sunday',
    }
    const hours = settings.opening_hours.flatMap((h) => {
      if (h.closed) return []
      return Array.from(h.hours.matchAll(/(\d{2}:\d{2})\s*[-–]\s*(\d{2}:\d{2})/g)).map((m) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${days[h.day]}`,
        opens: m[1],
        closes: m[2],
      }))
    })
    structured.textContent = privatePage
      ? ''
      : JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Restaurant',
          name: settings.business_name,
          servesCuisine: ['Pizza', 'Argentina', 'Parrilla'],
          address: {
            '@type': 'PostalAddress',
            streetAddress: settings.address,
            addressLocality: 'Ushuaia',
            addressRegion: 'Tierra del Fuego',
            addressCountry: 'AR',
          },
          ...(phone ? { telephone: `+${phone}` } : {}),
          ...(site ? { url: site, hasMenu: `${site.replace(/\/$/, '')}/#menu` } : {}),
          image: safeUrl(content.find((c) => c.content_key === 'hero')?.image_url || ''),
          sameAs: [settings.instagram_url, settings.facebook_url]
            .map((v) => safeUrl(v))
            .filter(Boolean),
          ...(hours.length ? { openingHoursSpecification: hours } : {}),
        })
    return () => {
      structured?.remove()
    }
  }, [settings, content, pathname, i18n.resolvedLanguage])
  return null
}
