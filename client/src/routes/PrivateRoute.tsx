import { Navigate, Outlet, useLocation } from 'react-router'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '../features/auth/authSelectors'
import { ROUTES } from '../constants'

export default function PrivateRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return <Outlet />
}
