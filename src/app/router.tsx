import { createBrowserRouter } from 'react-router-dom'
import Providers from './providers'
import HomePage from '../pages/public/HomePage'
import NotFoundPage from '../pages/public/NotFoundPage'
import { lazy, Suspense, type ComponentType } from 'react'
import ProtectedRoute from '../components/admin/ProtectedRoute'
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner'
import RouteError from '../components/common/RouteError'
const Login = lazy(() => import('../pages/admin/LoginPage'))
const Admin = lazy(() => import('../components/layout/AdminSidebar/AdminSidebar'))
const Dashboard = lazy(() => import('../pages/admin/DashboardPage'))
const Products = lazy(() => import('../pages/admin/ProductsPage'))
const Categories = lazy(() => import('../pages/admin/CategoriesPage'))
const Promotions = lazy(() => import('../pages/admin/PromotionsPage'))
const Content = lazy(() => import('../pages/admin/ContentEditorPage'))
const Settings = lazy(() => import('../pages/admin/SettingsPage'))
const Preview = lazy(() => import('../pages/admin/PreviewPage'))
const deferred = (Component: ComponentType) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
)
export const router = createBrowserRouter([
  {
    element: <Providers />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/menu', element: <HomePage /> },
      { path: '/login', element: deferred(Login) },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/admin/vista-previa', element: deferred(Preview) },
          {
            path: '/admin',
            element: deferred(Admin),
            children: [
              { index: true, element: deferred(Dashboard) },
              { path: 'productos', element: deferred(Products) },
              { path: 'categorias', element: deferred(Categories) },
              { path: 'promociones', element: deferred(Promotions) },
              { path: 'contenido', element: deferred(Content) },
              { path: 'configuracion', element: deferred(Settings) },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
