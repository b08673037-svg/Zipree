import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ minHeight: "100vh", background: "var(--color-charcoal)" }} />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}