import { Link } from 'react-router-dom'
export default function RouteError() {
  return (
    <main className="empty">
      <h1>No pudimos abrir esta página.</h1>
      <p>Recargá para reintentar. Los cambios ya guardados permanecen en la base.</p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <button className="btn" onClick={() => window.location.reload()}>
          Reintentar
        </button>
        <Link className="btn secondary" to="/">
          Volver al menú
        </Link>
      </div>
    </main>
  )
}
