import { useState } from 'react'
import { toast } from 'sonner'
import type { Promotion } from '../../types/promotion'
import { promotionsService } from '../../services/promotions.service'
import { productsService } from '../../services/products.service'
import { useAdminData } from '../../hooks/useAdminData'
import { useCatalog } from '../../hooks/useCatalog'
import { isPromotionActive } from '../../utils/promotions'
import { currency } from '../../utils/currency'
import PromotionForm from '../../components/admin/PromotionForm/PromotionForm'
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog'
import ErrorState from '../../components/common/ErrorState/ErrorState'
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner'
import FoodImage from '../../components/common/FoodImage'
import { removeImageIfUnused } from '../../services/storage.service'
export default function PromotionsPage() {
  const { data, loading, error, reload } = useAdminData(
    async () => {
      const [promotions, products] = await Promise.all([
        promotionsService.list(),
        productsService.list(),
      ])
      return { promotions, products }
    },
    { promotions: [], products: [] },
  )
  const catalog = useCatalog()
  const [editing, setEditing] = useState<Promotion | null>(null)
  const [deleting, setDeleting] = useState<Promotion | null>(null)
  const [busy, setBusy] = useState(false)
  const refresh = async () => {
    await reload()
    await catalog.reload()
  }
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Promociones</h1>
          <p className="muted">Ofertas de hoy y novedades que se vienen.</p>
        </div>
        <button
          className="btn"
          disabled={loading || !!error}
          onClick={() =>
            setEditing({
              id: crypto.randomUUID(),
              product_id: null,
              title: '',
              description: '',
              image_url: '',
              image_alt: '',
              previous_price: null,
              current_price: null,
              starts_at: null,
              ends_at: null,
              is_active: true,
              sort_order: data.promotions.length,
            })
          }
        >
          + Crear promoción
        </button>
      </div>
      {error ? (
        <ErrorState message={error} retry={() => void reload()} />
      ) : loading ? (
        <LoadingSpinner />
      ) : (
        <div className="admin-promo-grid">
          {data.promotions.map((p) => (
            <article className="admin-panel" key={p.id}>
              <FoodImage src={p.image_url} alt={p.image_alt || p.title} />
              <span className="status-label">
                {isPromotionActive(p)
                  ? 'Activa y vigente'
                  : !p.is_active
                    ? 'Desactivada'
                    : p.starts_at && Date.parse(p.starts_at) > Date.now()
                      ? 'Programada'
                      : 'Vencida'}
              </span>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <strong>{currency(p.current_price)}</strong>
              <div className="row">
                <button className="btn secondary" disabled={busy} onClick={() => setEditing(p)}>
                  Editar
                </button>
                <button
                  className="btn secondary"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true)
                    try {
                      await promotionsService.save({ ...p, is_active: !p.is_active })
                      toast.success('Estado actualizado')
                      await refresh()
                    } catch (e) {
                      toast.error((e as Error).message)
                    } finally {
                      setBusy(false)
                    }
                  }}
                >
                  {p.is_active ? 'Desactivar' : 'Activar'}
                </button>
                <button className="btn secondary" disabled={busy} onClick={() => setDeleting(p)}>
                  Eliminar
                </button>
              </div>
            </article>
          ))}
          {!data.promotions.length && <p>No hay promociones. Creá la primera.</p>}
        </div>
      )}
      {editing && (
        <PromotionForm
          promotion={editing}
          products={data.products}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            void refresh()
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          busy={busy}
          message={`Se eliminará la promoción “${deleting.title}”.`}
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            setBusy(true)
            try {
              await promotionsService.remove(deleting.id)
              await removeImageIfUnused(deleting.image_url).catch(() =>
                toast.warning('La fotografía quedó pendiente de limpieza.'),
              )
              setDeleting(null)
              toast.success('Promoción eliminada')
              await refresh()
            } catch (e) {
              toast.error((e as Error).message)
            } finally {
              setBusy(false)
            }
          }}
        />
      )}
    </>
  )
}
