import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function ProtectedRoute() {
  const { customer, authLoading } = useAuth();
  if (authLoading) return <div className="page-state">Checking your session…</div>;
  return customer ? <Outlet /> : <Navigate to="/login" replace />;
}
