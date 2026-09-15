import { Link } from 'react-router-dom'
import { productsService } from '../../services/products.service'
import { promotionsService } from '../../services/promotions.service'
import { useAdminData } from '../../hooks/useAdminData'
import { isPromotionActive } from '../../utils/promotions'
import ErrorState from '../../components/common/ErrorState/ErrorState'
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner'
export default function DashboardPage() {
  const { data, loading, error, reload } = useAdminData(
    async () => ({
      products: await productsService.list(),
      promotions: await promotionsService.list(),
    }),
    { products: [], promotions: [] },
  )
  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="eyebrow primary">UN BUEN DÍA EMPIEZA ACÁ</p>
          <h1>Tu restaurante, al día.</h1>
          <p className="muted">Todo lo que necesitás para mantener tu menú actualizado.</p>
        </div>
        <Link className="btn secondary" to="/" target="_blank">
          Ver sitio ↗
        </Link>
      </div>
      {error ? (
        <ErrorState message={error} retry={() => void reload()} />
      ) : loading ? (
        <LoadingSpinner />
      ) : (
        <div className="stats-grid">
          {[
            ['Productos totales', data.products.length],
            ['Disponibles', data.products.filter((p) => p.is_available).length],
            ['Agotados', data.products.filter((p) => !p.is_available).length],
            ['Promociones activas', data.promotions.filter((p) => isPromotionActive(p)).length],
          ].map(([name, count]) => (
            <div className="stat" key={name}>
              <span>{name}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
      )}
      <section className="admin-panel">
        <h2>¿Qué querés hacer hoy?</h2>
        <div className="quick-links">
          <Link to="/admin/productos">
            <h3>Actualizar el menú ↗</h3>
            <p>Productos, precios y disponibilidad.</p>
          </Link>
          <Link to="/admin/contenido">
            <h3>Editar página ↗</h3>
            <p>Textos e imágenes, con vista previa.</p>
          </Link>
          <Link to="/admin/promociones">
            <h3>Crear una promoción ↗</h3>
            <p>Una buena razón para volver.</p>
          </Link>
          <Link to="/admin/configuracion">
            <h3>Datos del local ↗</h3>
            <p>WhatsApp, dirección y horarios.</p>
          </Link>
        </div>
      </section>
      <p className="notice">
        Los cambios guardados se publican inmediatamente. Revisá la vista previa antes de guardar.
      </p>
    </>
  )
}
