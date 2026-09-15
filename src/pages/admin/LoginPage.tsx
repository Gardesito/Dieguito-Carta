import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { isConfigured, requireSupabase } from '../../services/supabase'
import '../../styles/admin.css'
export default function LoginPage() {
  const { user, profile, loading, error: authError, signOut } = useAuth()
  const location = useLocation()
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const target = location.state?.from
  const from = typeof target === 'string' && /^\/admin(?:\/|$)/.test(target) ? target : '/admin'
  if (!loading && user && profile) return <Navigate to={from} replace />
  return (
    <main className="login-page">
      <Link to="/" className="row">
        <ArrowLeft size={18} />
        Volver al sitio
      </Link>
      <div className="login-card">
        <span className="login-brand">Dieguito</span>
        <p className="eyebrow primary">TU RESTAURANTE, EN TUS MANOS</p>
        <h1>Bienvenido a casa.</h1>
        <p className="muted">Ingresá para actualizar el menú y las novedades.</p>
        {!isConfigured && (
          <p className="notice">
            Modo demostración. Para iniciar sesión, completá las variables de Supabase y creá tu
            usuario según el README.
          </p>
        )}
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setBusy(true)
            setError('')
            const form = new FormData(e.currentTarget)
            try {
              const { error: failure } = await requireSupabase().auth.signInWithPassword({
                email: String(form.get('email')),
                password: String(form.get('password')),
              })
              if (failure) throw failure
            } catch {
              setError('No pudimos iniciar sesión. Revisá el correo, la contraseña y la conexión.')
            } finally {
              setBusy(false)
            }
          }}
        >
          <label className="field">
            Correo electrónico
            <input type="email" name="email" required autoComplete="username" disabled={busy} />
          </label>
          <label className="field">
            Contraseña
            <div className="password-field">
              <input
                name="password"
                required
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                disabled={busy}
              />
              <button
                type="button"
                className="icon-btn"
                aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>
          {(error || authError) && (
            <p className="error" role="alert">
              {error || authError}
            </p>
          )}
          <button className="btn wide" disabled={!isConfigured || busy || loading}>
            {busy || loading ? 'Ingresando…' : 'Ingresar al administrador'}
          </button>
        </form>
        {user && !profile && (
          <button
            className="btn secondary"
            onClick={() => void signOut().catch(() => setError('No pudimos cerrar la sesión.'))}
          >
            Cerrar sesión actual
          </button>
        )}
        <small>Acceso exclusivo para el equipo de Dieguito.</small>
      </div>
    </main>
  )
}
