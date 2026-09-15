import { ImagePlus } from 'lucide-react'
export default function EditableImage({ onEdit }: { onEdit: () => void }) {
  return (
    <button type="button" className="btn secondary" onClick={onEdit}>
      <ImagePlus size={18} />
      Editar imagen y texto alternativo
    </button>
  )
}
