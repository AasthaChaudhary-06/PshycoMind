import { Navigate, Outlet } from 'react-router'
import { useSelector } from 'react-redux'
import { selectIsFaculty } from '../features/auth/authSelectors'
import { ROUTES } from '../constants'

export default function FacultyRoute() {
  const isFaculty = useSelector(selectIsFaculty)

  if (!isFaculty) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}
