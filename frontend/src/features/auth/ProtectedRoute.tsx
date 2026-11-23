import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '../../components/ui/Spinner'
import { useAuth } from './AuthContext'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page px-4">
        <Spinner label="Verifying staff session..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/staff/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  }

  return <Outlet />
}
