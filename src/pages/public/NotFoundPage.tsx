import { Link } from 'react-router-dom'
import { tr } from '../../i18n'
export default function NotFoundPage() {
  return (
    <main className="empty">
      <h1>{tr('Esta mesa está vacía.')}</h1>
      <p>{tr('No encontramos la página que buscás.')}</p>
      <Link className="btn" to="/">
        {tr('Volver al menú')}
      </Link>
    </main>
  )
}
