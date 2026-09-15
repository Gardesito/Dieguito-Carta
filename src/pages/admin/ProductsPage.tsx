import { useState } from 'react'
import { toast } from 'sonner'
import type { Product } from '../../types/product'
import { productsService } from '../../services/products.service'
import { categoriesService } from '../../services/categories.service'
import { useAdminData } from '../../hooks/useAdminData'
import { useCatalog } from '../../hooks/useCatalog'
import { normalize } from '../../utils/products'
import ProductForm, { newProduct } from '../../components/admin/ProductForm/ProductForm'
import ProductTable from '../../components/admin/ProductTable/ProductTable'
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog'
import ErrorState from '../../components/common/ErrorState/ErrorState'
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner'
import { removeImageIfUnused } from '../../services/storage.service'
export default function ProductsPage() {
  const { data, loading, error, reload } = useAdminData(
    async () => {
      const [products, categories] = await Promise.all([
        productsService.list(),
        categoriesService.list(),
      ])
      return { products, categories }
    },
    { products: [], categories: [] },
  )
  const catalog = useCatalog()
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)
  const [busy, setBusy] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [availability, setAvailability] = useState('')
  const refresh = async () => {
    await reload()
    await catalog.reload()
  }
  const action = async (fn: () => Promise<void>, message: string) => {
    setBusy(true)
    try {
      await fn()
      toast.success(message)
      await refresh()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  const filtered = data.products.filter(
    (p) =>
      normalize(`${p.name} ${p.ingredients} ${p.description}`).includes(normalize(query)) &&
      (!category || category === p.category_id) &&
      (!availability || (availability === 'yes') === p.is_available),
  )
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Productos</h1>
          <p className="muted">Tu menú, siempre actualizado.</p>
        </div>
        <button
          className="btn"
          disabled={loading || !!error}
          onClick={() => setEditing(newProduct(data.categories[0]?.id))}
        >
          + Crear producto
        </button>
      </div>
      <div className="admin-filters">
        <input
          className="input"
          placeholder="Buscar producto…"
          aria-label="Buscar producto"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="input"
          aria-label="Filtrar categoría"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {data.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="input"
          aria-label="Filtrar disponibilidad"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        >
          <option value="">Cualquier disponibilidad</option>
          <option value="yes">Disponibles</option>
          <option value="no">Agotados</option>
        </select>
      </div>
      <p className="form-hint muted">
        Para ordenar, quitá los filtros. Arrastrá el asa o usá Espacio y las flechas del teclado.
      </p>
      {error ? (
        <ErrorState message={error} retry={() => void reload()} />
      ) : loading ? (
        <LoadingSpinner />
      ) : filtered.length ? (
        <ProductTable
          products={filtered}
          categories={data.categories}
          disabled={busy}
          sortable={!query && !category && !availability}
          onEdit={setEditing}
          onDelete={setDeleting}
          onDuplicate={(p) => {
            const id = crypto.randomUUID()
            setEditing({
              ...p,
              id,
              name: `${p.name} (copia)`,
              slug: `${p.slug}-copia-${id.slice(0, 6)}`,
              is_visible: false,
              product_variants: p.product_variants.map((v) => ({
                ...v,
                id: crypto.randomUUID(),
                product_id: id,
              })),
            })
          }}
          onToggle={(p) =>
            void action(
              () => productsService.patch(p.id, { is_visible: !p.is_visible }),
              p.is_visible ? 'Producto oculto' : 'Producto visible',
            )
          }
          onReorder={(ids) => void action(() => productsService.reorder(ids), 'Orden guardado')}
        />
      ) : (
        <p className="empty">No hay productos para mostrar.</p>
      )}
      {editing && (
        <ProductForm
          key={editing.id}
          product={editing}
          categories={data.categories}
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
          message={`Se eliminará “${deleting.name}” y sus variantes. Esta acción no se puede deshacer.`}
          onClose={() => setDeleting(null)}
          onConfirm={() =>
            void action(async () => {
              await productsService.remove(deleting.id)
              await removeImageIfUnused(deleting.image_url).catch(() =>
                toast.warning('La fotografía anterior quedó pendiente de limpieza.'),
              )
              setDeleting(null)
            }, 'Producto eliminado')
          }
        />
      )}
    </>
  )
}
