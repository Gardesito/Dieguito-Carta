import { Link } from 'react-router-dom'
export default function NotFoundPage() {
  return (
    <main className="empty">
      <h1>Esta mesa está vacía.</h1>
      <p>No encontramos la página que buscás.</p>
      <Link className="btn" to="/">
        Volver al menú
      </Link>
    </main>
  )
}
