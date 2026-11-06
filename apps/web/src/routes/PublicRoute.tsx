import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface PublicRouteProps {
  redirectTo?: string;
  children?: ReactNode;
}

/**
 * PublicRoute prevents authenticated users from viewing guest-only pages like /login.
 * Redirects to the dashboard or home if already logged in.
 */
export default function PublicRoute({
  redirectTo = "/",
  children,
}: PublicRouteProps) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
