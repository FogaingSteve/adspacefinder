import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  role?: "admin";
}

export const ProtectedRoute = ({ role }: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  if (role === "admin" && user.user_metadata?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};