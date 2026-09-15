import { navigation } from '../Header/Header'
import { preserveTable } from '../../../utils/navigation'
export default function MobileNavigation({ onClose }: { onClose: () => void }) {
  return (
    <nav
      id="mobile-menu"
      className="mobile-menu"
      aria-label="Navegación móvil"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      {navigation.map(([name, id]) => (
        <a key={id} href={preserveTable(`/#${id}`)} onClick={onClose}>
          {name}
        </a>
      ))}
    </nav>
  )
}
