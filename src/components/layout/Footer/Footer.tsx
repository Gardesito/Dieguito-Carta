import { tr } from '../../../i18n'
import { Link } from 'react-router-dom'
import { preserveTable } from '../../../utils/navigation'
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container row">
        <a href={preserveTable('/#inicio')} className="footer-brand">
          Dieguito
        </a>
        <span>{tr('Hecho con sabor, en el fin del mundo.')}</span>
        <small>© {new Date().getFullYear()} Dieguito Ushuaia</small>
        <Link to="/login">{tr('Administración')}</Link>
        <a href="/creditos.html">{tr('Créditos de fotografías')}</a>
      </div>
    </footer>
  )
}
