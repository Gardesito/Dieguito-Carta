import { Link } from 'react-router-dom'
import { preserveTable } from '../../../utils/navigation'
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container row">
        <a href={preserveTable('/#inicio')} className="footer-brand">
          Dieguito
        </a>
        <span>Hecho con sabor, en el fin del mundo.</span>
        <small>© {new Date().getFullYear()} Dieguito Ushuaia</small>
        <Link to="/login">Administración</Link>
        <a href="/creditos.html">Créditos de fotografías</a>
      </div>
    </footer>
  )
}
