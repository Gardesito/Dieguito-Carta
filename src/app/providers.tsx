import { Toaster } from 'sonner'
import { Outlet } from 'react-router-dom'
import { CatalogProvider } from '../hooks/useCatalog'
import { AuthProvider } from '../hooks/useAuth'
import Seo from '../components/common/Seo'
export default function Providers() {
  return (
    <AuthProvider>
      <CatalogProvider>
        <Seo />
        <Outlet />
        <Toaster richColors position="top-center" closeButton />
      </CatalogProvider>
    </AuthProvider>
  )
}
