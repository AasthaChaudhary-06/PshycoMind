import { Navigate, Outlet } from 'react-router'
import { useSelector } from 'react-redux'
import { selectIsAdmin } from '../features/auth/authSelectors'
import { ROUTES } from '../constants'

export default function AdminRoute() {
  const isAdmin = useSelector(selectIsAdmin)

  if (!isAdmin) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}
