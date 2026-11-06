import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { RoleType } from "@/types/roles";

interface ProtectedRouteProps {
  allowedRoles?: RoleType[];
  redirectTo?: string;
  unauthorizedRedirectTo?: string;
  children?: ReactNode;
}

export default function ProtectedRoute({
  allowedRoles,
  redirectTo = "/login",
  unauthorizedRedirectTo = "/unauthorized",
  children,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, hasAnyRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const isAuthorized = hasAnyRole(allowedRoles);
    if (!isAuthorized) {
      return <Navigate to={unauthorizedRedirectTo} replace />;
    }
  }
 
  return children ? <>{children}</> : <Outlet />;
}
