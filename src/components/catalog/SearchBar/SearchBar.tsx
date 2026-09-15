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
        aria-label="Buscar productos"
        placeholder="Buscar productos, ingredientes..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button className="icon-btn" aria-label="Borrar búsqueda" onClick={() => onChange('')}>
          <X size={18} />
        </button>
      )}
    </div>
  )
}
