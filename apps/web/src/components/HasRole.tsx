import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { RoleType } from "@/types/roles";

interface HasRoleProps {
  allowedRoles: RoleType[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Conditionally renders children if the current user has any of the allowed roles.
 */
export default function HasRole({
  allowedRoles,
  children,
  fallback = null,
}: HasRoleProps) {
  const { hasAnyRole } = useAuth();

  if (!hasAnyRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
