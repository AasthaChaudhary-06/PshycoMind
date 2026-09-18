import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/features/auth/authSelectors';
import { Loader } from '@/components/Loader';

export function PrivateRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (isAuthenticated) return <Outlet />;

  return <Navigate to="/login" state={{ from: location.pathname }} replace />;
}

export function PublicOnlyRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

export function AdminRoute() {
  const user = useSelector((state: any) => state.auth.user);

  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

export function StudentRoute() {
  const user = useSelector((state: any) => state.auth.user);

  if (user?.role === 'admin' || user?.role === 'faculty') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export function SuspenseFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader label="Loading PhysioMind..." />
    </div>
  );
}
