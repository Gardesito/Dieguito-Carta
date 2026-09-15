import { useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import type { Promotion } from '../../../types/promotion'
import type { Product } from '../../../types/product'
import { promotionsService } from '../../../services/promotions.service'
import { persistWithImage } from '../../../services/storage.service'
import Modal from '../../common/Modal/Modal'
import ImageUploader from '../../common/ImageUploader/ImageUploader'
import PublishBar from '../PublishBar/PublishBar'
export default function PromotionForm({
  promotion,
  products,
  onClose,
  onSaved,
}: {
  promotion: Promotion
  products: Product[]
  onClose: () => void
  onSaved: () => void
}) {
  const [value, setValue] = useState(promotion)
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const update = (key: keyof Promotion, v: unknown) => setValue((s) => ({ ...s, [key]: v }))
  return (
    <Modal
      titleId="promotion-form-title"
      onClose={() => {
        if (!busy) onClose()
      }}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          setBusy(true)
          try {
            if (!value.title.trim()) throw new Error('Escribí un título.')
            if (
              value.starts_at &&
              value.ends_at &&
              Date.parse(value.ends_at) <= Date.parse(value.starts_at)
            )
              throw new Error('La fecha final debe ser posterior a la inicial.')
            const result = await persistWithImage(
              file,
              promotion.image_url,
              value.image_url,
              value.image_alt,
              (url) =>
                promotionsService.save({ ...value, title: value.title.trim(), image_url: url }),
            )
            toast.success('Promoción guardada')
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
          <h2 id="promotion-form-title">
            {promotion.title ? 'Editar promoción' : 'Nueva promoción'}
          </h2>
          <label className="field">
            Título
            <input
              required
              maxLength={120}
              value={value.title}
              onChange={(e) => update('title', e.target.value)}
            />
          </label>
          <label className="field">
            Descripción
            <textarea
              value={value.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </label>
          <div className="form-columns">
            {[
              ['previous_price', 'Precio anterior'],
              ['current_price', 'Precio actual'],
            ].map(([key, label]) => (
              <label className="field" key={key}>
                {label} ($)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={value[key as 'current_price'] ?? ''}
                  onChange={(e) =>
                    update(
                      key as 'current_price',
                      e.target.value === '' ? null : Number(e.target.value),
                    )
                  }
                />
              </label>
            ))}
            {[
              ['starts_at', 'Desde'],
              ['ends_at', 'Hasta'],
            ].map(([key, label]) => (
              <label className="field" key={key}>
                {label}
                <input
                  type="datetime-local"
                  value={
                    value[key as 'starts_at']
                      ? format(new Date(value[key as 'starts_at']!), "yyyy-MM-dd'T'HH:mm")
                      : ''
                  }
                  onChange={(e) =>
                    update(
                      key as 'starts_at',
                      e.target.value ? new Date(e.target.value).toISOString() : null,
                    )
                  }
                />
              </label>
            ))}
          </div>
          <p className="form-hint">
            Las fechas usan la zona horaria de este dispositivo (
            {Intl.DateTimeFormat().resolvedOptions().timeZone}). Sin fechas, la promoción permanece
            vigente mientras esté activa.
          </p>
          <label className="field">
            Producto relacionado
            <select
              value={value.product_id || ''}
              onChange={(e) => update('product_id', e.target.value || null)}
            >
              <option value="">Sin producto asociado</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
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
            Promoción activa
          </label>
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
