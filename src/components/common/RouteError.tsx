import { Link } from 'react-router-dom'
import { tr } from '../../i18n'
export default function RouteError() {
  return (
    <main className="empty">
      <h1>{tr('No pudimos abrir esta página.')}</h1>
      <p>{tr('Recargá para reintentar. Los cambios ya guardados permanecen en la base.')}</p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <button className="btn" onClick={() => window.location.reload()}>
          {tr('Reintentar')}
        </button>
        <Link className="btn secondary" to="/">
          {tr('Volver al menú')}
        </Link>
      </div>
    </main>
  )
}
