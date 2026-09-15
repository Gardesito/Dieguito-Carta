import { useState } from 'react'
import { toast } from 'sonner'
import type { Category } from '../../types/category'
import { categoriesService } from '../../services/categories.service'
import { useAdminData } from '../../hooks/useAdminData'
import { useCatalog } from '../../hooks/useCatalog'
import CategoryForm from '../../components/admin/CategoryForm/CategoryForm'
import SortableList from '../../components/admin/SortableList'
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog'
import ErrorState from '../../components/common/ErrorState/ErrorState'
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner'
import { removeImageIfUnused } from '../../services/storage.service'
export default function CategoriesPage() {
  const { data, loading, error, reload } = useAdminData(categoriesService.list, [])
  const catalog = useCatalog()
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [busy, setBusy] = useState(false)
  const refresh = async () => {
    await reload()
    await catalog.reload()
  }
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Categorías</h1>
          <p className="muted">Organizá el menú. Arrastrá las categorías para ordenarlas.</p>
        </div>
        <button
          className="btn"
          disabled={loading || !!error}
          onClick={() =>
            setEditing({
              id: crypto.randomUUID(),
              name: '',
              slug: '',
              description: '',
              image_url: '',
              image_alt: '',
              icon: '',
              sort_order: data.length,
              is_active: true,
            })
          }
        >
          + Crear categoría
        </button>
      </div>
      {error ? (
        <ErrorState message={error} retry={() => void reload()} />
      ) : loading ? (
        <LoadingSpinner />
      ) : (
        <div className="admin-panel">
          <SortableList
            items={data}
            disabled={busy}
            onReorder={async (ids) => {
              setBusy(true)
              try {
                await categoriesService.reorder(ids)
                toast.success('Orden guardado')
                await refresh()
              } catch (e) {
                toast.error((e as Error).message)
              } finally {
                setBusy(false)
              }
            }}
            render={(id) => {
              const c = data.find((c) => c.id === id)!
              return (
                <>
                  <div className="grow">
                    <strong>{c.name}</strong>
                    <small>{c.is_active ? 'Visible' : 'Oculta'}</small>
                  </div>
                  <button className="btn secondary" disabled={busy} onClick={() => setEditing(c)}>
                    Editar
                  </button>
                  <button className="btn secondary" disabled={busy} onClick={() => setDeleting(c)}>
                    Eliminar
                  </button>
                </>
              )
            }}
          />
          {!data.length && <p>No hay categorías. Creá la primera.</p>}
        </div>
      )}
      {editing && (
        <CategoryForm
          category={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            void refresh()
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          message={`Se eliminará “${deleting.name}”. Si tiene productos, primero deberás moverlos a otra categoría.`}
          busy={busy}
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            setBusy(true)
            try {
              await categoriesService.remove(deleting.id)
              await removeImageIfUnused(deleting.image_url).catch(() =>
                toast.warning('La fotografía quedó pendiente de limpieza.'),
              )
              setDeleting(null)
              toast.success('Categoría eliminada')
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
