import { tr } from '../../../i18n'
import { Search, X } from 'lucide-react'
export default function SearchBar({
  value,
  onChange,
}: {
  value: string
  onChange: (s: string) => void
}) {
  return (
    <div className="search">
      <Search size={20} />
      <input
        aria-label={tr('Buscar productos')}
        placeholder={tr('Buscar productos, ingredientes...')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          className="icon-btn"
          aria-label={tr('Borrar búsqueda')}
          onClick={() => onChange('')}
        >
          <X size={18} />
        </button>
      )}
    </div>
  )
}
