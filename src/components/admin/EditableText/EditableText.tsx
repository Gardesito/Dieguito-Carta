import { Pencil } from 'lucide-react'
import type { ReactNode } from 'react'
export default function EditableText({
  label,
  onEdit,
  children,
}: {
  label: string
  onEdit?: () => void
  children: ReactNode
}) {
  return onEdit ? (
    <div className="editable-region">
      <button className="edit-badge" type="button" onClick={onEdit}>
        <Pencil size={16} />
        Editar {label}
      </button>
      {children}
    </div>
  ) : (
    <>{children}</>
  )
}
