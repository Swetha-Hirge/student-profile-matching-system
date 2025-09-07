// src/routes/guards.js
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

export function RoleRoute({ allow }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  const ok = Array.isArray(allow) ? allow.includes(user.role) : user.role === allow;
  return ok ? <Outlet /> : <Navigate to="/app/dashboard" replace />;
}