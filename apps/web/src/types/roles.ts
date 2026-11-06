export const Roles = {
  ADMIN: "ADMIN",
  END_USER: "END_USER",
  VIEWER: "VIEWER",
} as const;

export type RoleType = (typeof Roles)[keyof typeof Roles];
