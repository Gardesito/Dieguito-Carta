import { tr } from '../../../i18n'
export default function LoadingSpinner() {
  return (
    <div className="empty" role="status">
      {tr('Cargando el menú…')}
    </div>
  )
}
export function ProductSkeletons() {
  return (
    <div className="product-grid" aria-label={tr('Cargando el menú')} role="status">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton" />
      ))}
    </div>
  )
}
