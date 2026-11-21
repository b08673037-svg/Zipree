import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";

export default function AdminRoute() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div style={{ minHeight: "100vh", background: "var(--color-charcoal)" }} />;
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}