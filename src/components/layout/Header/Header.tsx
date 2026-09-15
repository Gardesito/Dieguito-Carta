import { useEffect, useState } from 'react'
import { Menu, X, MessageCircle } from 'lucide-react'
import type { SiteSettings } from '../../../types/siteContent'
import { openWhatsApp } from '../../../services/whatsapp.service'
import MobileNavigation from '../MobileNavigation/MobileNavigation'
import SearchBar from '../../catalog/SearchBar/SearchBar'
import { imageSrc } from '../../../utils/image'
import { preserveTable } from '../../../utils/navigation'
export const navigation = [
  ['Inicio', 'inicio'],
  ['Menú', 'menu'],
  ['Promociones', 'promociones'],
  ['Nosotros', 'nosotros'],
  ['Contacto', 'contacto'],
]
export default function Header({
  settings,
  search = '',
  onSearchChange,
}: {
  settings: SiteSettings
  search?: string
  onSearchChange?: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const listener = () => setScrolled(window.scrollY > 20)
    listener()
    window.addEventListener('scroll', listener, { passive: true })
    return () => window.removeEventListener('scroll', listener)
  }, [])
  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <a className="skip-link" href="#menu">
        Saltar al menú
      </a>
      <div className="container header-inner">
        <a
          className="brand"
          href={preserveTable('/#inicio')}
          aria-label={`${settings.business_name}, inicio`}
        >
          {settings.logo_url ? (
            <img
              src={imageSrc(settings.logo_url)}
              width="140"
              height="56"
              alt={settings.logo_alt}
            />
          ) : (
            <>
              <strong>{settings.business_name}</strong>
              <span>PIZZERÍA & RESTAURANTE</span>
            </>
          )}
        </a>
        {onSearchChange && (
          <div className="header-search">
            <SearchBar value={search} onChange={onSearchChange} />
          </div>
        )}
        <nav className="desktop-nav" aria-label="Navegación principal">
          {navigation.map(([name, id]) => (
            <a key={id} href={preserveTable(`/#${id}`)}>
              {name}
            </a>
          ))}
        </nav>
        <div className="row">
          <button
            className="btn whatsapp header-whatsapp"
            onClick={() => openWhatsApp(settings.whatsapp_number)}
            aria-label="Pedir por WhatsApp"
          >
            <MessageCircle size={19} />
            <span>Pedir por WhatsApp</span>
          </button>
          <button
            className="icon-btn hamburger"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && <MobileNavigation onClose={() => setOpen(false)} />}
    </header>
  )
}
