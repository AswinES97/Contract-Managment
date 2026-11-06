// import React, { createContext, useContext, useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import type { RootState } from "../redux/store";

// // import { DEFAULT_ADMIN_PERMISSIONS } from "../types/admin";
// import type { AdminPermissions } from "../types/Permission";

// interface PermissionContextType {
//   permissions: AdminPermissions | null;
//   hasPermission: (module: string, action: string) => boolean;
//   hasSpecialPermission: (
//     permission: keyof AdminPermissions["specialPermissions"]
//   ) => boolean;
//   loading: boolean;
// }

// const PermissionContext = createContext<PermissionContextType | undefined>(
//   undefined
// );

// export const usePermissions = () => {
//   const context = useContext(PermissionContext);
//   if (context === undefined) {
//     throw new Error("usePermissions must be used within a PermissionProvider");
//   }
//   return context;
// };

// interface PermissionProviderProps {
//   children: React.ReactNode;
// }

// export const PermissionProvider: React.FC<PermissionProviderProps> = ({
//   children,
// }) => {
//   const user = useSelector((state: RootState) => state.auth.user);
//   const [permissions, setPermissions] = useState<AdminPermissions | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchPermissions = async () => {
//       if (!user?.id) {
//         setPermissions(null);
//         setLoading(false);
//         return;
//       }

//       try {
//         // Use the permissions from the admin object for all admins
//         if (admin.permissions) {
//           // Validate permissions structure
//           if (
//             admin.permissions &&
//             typeof admin.permissions === "object" &&
//             admin.permissions.modules &&
//             admin.permissions.specialPermissions &&
//             typeof admin.permissions.modules === "object" &&
//             typeof admin.permissions.specialPermissions === "object"
//           ) {
//             setPermissions(admin.permissions as AdminPermissions);
//           } else {
//             // Invalid permissions structure, fallback to default
//             console.error(
//               "Invalid permissions structure, falling back to default permissions",
//               admin.permissions
//             );
//             setPermissions(DEFAULT_ADMIN_PERMISSIONS);
//           }
//         } else {
//           // No permissions found, use default
//           console.warn(
//             "No permissions found for admin, using default permissions"
//           );
//           setPermissions(DEFAULT_ADMIN_PERMISSIONS);
//         }
//       } catch (error) {
//         console.error("Error processing permissions:", error);
//         // Fallback to default permissions on error
//         setPermissions(DEFAULT_ADMIN_PERMISSIONS);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPermissions();
//   }, [admin]);

//   const hasPermission = (module: string, action: string): boolean => {
//     try {
//       if (!permissions) return false;

//       const modulePermissions =
//         permissions.modules[module as keyof AdminPermissions["modules"]];
      
//       // If module doesn't exist in permissions, return false
//       // This handles cases where new modules are added but admin permissions haven't been updated yet
//       if (modulePermissions === undefined) {
//         console.warn(`Module "${module}" not found in admin permissions. Admin may need to log out and log back in.`);
//         return false;
//       }
      
//       if (!Array.isArray(modulePermissions)) {
//         return false;
//       }
//       return modulePermissions.includes(action);
//     } catch (error) {
//       console.error("Error checking permission:", error);
//       return false;
//     }
//   };

//   const hasSpecialPermission = (
//     permission: keyof AdminPermissions["specialPermissions"]
//   ): boolean => {
//     try {
//       if (!permissions) return false;
//       if (
//         !permissions.specialPermissions ||
//         typeof permissions.specialPermissions[permission] !== "boolean"
//       ) {
//         return false;
//       }
//       return permissions.specialPermissions[permission];
//     } catch (error) {
//       console.error("Error checking special permission:", error);
//       return false;
//     }
//   };

//   const value: PermissionContextType = {
//     permissions,
//     hasPermission,
//     hasSpecialPermission,
//     loading,
//   };

//   return (
//     <PermissionContext.Provider value={value}>
//       {children}
//     </PermissionContext.Provider>
//   );
// };
