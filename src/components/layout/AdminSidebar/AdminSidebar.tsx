import { NavLink, Link, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Pizza,
  Layers,
  BadgePercent,
  PanelTop,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'
import { toast } from 'sonner'
import '../../../styles/admin.css'
const links = [
  ['/admin', 'Resumen', LayoutDashboard],
  ['/admin/productos', 'Productos', Pizza],
  ['/admin/categorias', 'Categorías', Layers],
  ['/admin/promociones', 'Promociones', BadgePercent],
  ['/admin/contenido', 'Editar página', PanelTop],
  ['/admin/configuracion', 'Configuración', Settings],
] as const
export default function AdminSidebar() {
  const { profile, signOut } = useAuth()
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="login-brand" to="/">
          Dieguito
        </Link>
        <span className="eyebrow">ADMINISTRACIÓN</span>
        <nav aria-label="Administración">
          {links.map(([path, label, Icon]) => (
            <NavLink key={path} to={path} end={path === '/admin'}>
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link to="/" target="_blank">
            <ExternalLink size={18} /> Ver sitio
          </Link>
          <p>
            {profile?.full_name || 'Equipo Dieguito'} <small>({profile?.role})</small>
          </p>
          <button
            onClick={() =>
              void signOut().catch(() => toast.error('No pudimos cerrar la sesión. Reintentá.'))
            }
          >
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
