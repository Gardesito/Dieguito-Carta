import { tr } from '../../../i18n'
import { navigation } from '../Header/Header'
import { preserveTable } from '../../../utils/navigation'
export default function MobileNavigation({ onClose }: { onClose: () => void }) {
  return (
    <nav
      id="mobile-menu"
      className="mobile-menu"
      aria-label={tr('Navegación móvil')}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      {navigation.map(([name, id]) => (
        <a key={id} href={preserveTable(`/#${id}`)} onClick={onClose}>
          {tr(name)}
        </a>
      ))}
    </nav>
  )
}
