import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { Roles, type RoleType } from "@/types/roles";

export const useAuth = () => {
  const { user, token, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const role = user?.role;

  const isAdmin = role === Roles.ADMIN;
  const isEndUser = role === Roles.END_USER;
  const isViewer = role === Roles.VIEWER;

  // In the PDF: Admin & End User can create/edit/sync; Viewer is strictly read-only
  const canWrite = isAdmin || isEndUser;
  const canManageUsers = isAdmin;

  const hasRole = (targetRole: RoleType): boolean => {
    if (!role) return false;
    return role === targetRole;
  };

  const hasAnyRole = (allowedRoles: RoleType[]): boolean => {
    if (!role) return false;
    return allowedRoles.includes(role);
  };

  return {
    user,
    token,
    isAuthenticated,
    role,
    isAdmin,
    isEndUser,
    isViewer,
    canWrite,
    canManageUsers,
    hasRole,
    hasAnyRole,
  };
};
