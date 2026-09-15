import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner'
import { toast } from 'sonner'
export default function ProtectedRoute() {
  const { user, profile, loading, error, signOut } = useAuth()
  const location = useLocation()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (error || !profile)
    return (
      <main className="empty">
        <h1>No pudimos habilitar el panel</h1>
        <p>{error || 'Se requiere un perfil admin o editor.'}</p>
        <button className="btn" onClick={() => location && window.location.reload()}>
          Reintentar
        </button>{' '}
        <button
          className="btn secondary"
          onClick={() => void signOut().catch(() => toast.error('No pudimos cerrar la sesión.'))}
        >
          Cerrar sesión
        </button>
      </main>
    )
  return <Outlet />
}
