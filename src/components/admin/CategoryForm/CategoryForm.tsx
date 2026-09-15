import { useState } from 'react'
import { toast } from 'sonner'
import type { Category } from '../../../types/category'
import { slugify } from '../../../utils/products'
import { categoriesService } from '../../../services/categories.service'
import { persistWithImage } from '../../../services/storage.service'
import Modal from '../../common/Modal/Modal'
import ImageUploader from '../../common/ImageUploader/ImageUploader'
import PublishBar from '../PublishBar/PublishBar'
export default function CategoryForm({
  category,
  onClose,
  onSaved,
}: {
  category: Category
  onClose: () => void
  onSaved: () => void
}) {
  const [value, setValue] = useState(category)
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const update = (key: keyof Category, v: unknown) => setValue((s) => ({ ...s, [key]: v }))
  return (
    <Modal
      titleId="category-form-title"
      onClose={() => {
        if (!busy) onClose()
      }}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          setBusy(true)
          try {
            if (!value.name.trim()) throw new Error('Escribí un nombre.')
            const result = await persistWithImage(
              file,
              category.image_url,
              value.image_url,
              value.image_alt,
              (url) =>
                categoriesService.save({
                  ...value,
                  name: value.name.trim(),
                  slug: slugify(value.name),
                  image_url: url,
                }),
            )
            toast.success('Categoría guardada')
            if (result.cleanupWarning)
              toast.warning('La imagen anterior quedó pendiente de limpieza.')
            onSaved()
          } catch (error) {
            toast.error((error as Error).message)
          } finally {
            setBusy(false)
          }
        }}
      >
        <div className="modal-body">
          <h2 id="category-form-title">{category.name ? 'Editar categoría' : 'Nueva categoría'}</h2>
          <label className="field">
            Nombre
            <input
              required
              maxLength={120}
              value={value.name}
              onChange={(e) => update('name', e.target.value)}
            />
          </label>
          <label className="field">
            Descripción
            <textarea
              value={value.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </label>
          <label className="field">
            Orden
            <input
              type="number"
              value={value.sort_order}
              onChange={(e) => update('sort_order', Number(e.target.value))}
            />
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={value.is_active}
              onChange={(e) => update('is_active', e.target.checked)}
            />
            Visible en el menú
          </label>
          <p className="form-hint">
            Al ocultar una categoría, también se ocultan sus productos en el catálogo.
          </p>
          <ImageUploader
            url={value.image_url}
            file={file}
            onFile={setFile}
            alt={value.image_alt}
            onAlt={(v) => update('image_alt', v)}
            onUrl={(v) => update('image_url', v)}
          />
        </div>
        <PublishBar busy={busy} onCancel={onClose} />
      </form>
    </Modal>
  )
}
