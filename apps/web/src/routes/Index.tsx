import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import MainLayout from "@/layouts/MainLayout";
import { Roles } from "@/types/roles";

import LoginPage from "@/pages/Login";
import UnauthorizedPage from "@/pages/Unauthorized";
import DashboardPage from "@/pages/Dashboard";
import CustomersPage from "@/pages/Customers";
import ContractsPage from "@/pages/Contracts";
import OnboardingPage from "@/pages/Onboarding";
import BillingPage from "@/pages/Billing";
import CloudUsagePage from "@/pages/CloudUsage";
import UserManagementPage from "@/pages/admin/UserManagement";
import DropdownSettingsPage from "@/pages/admin/DropdownSettings";

export const routes: RouteObject[] = [
  {
    element: <PublicRoute />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },

  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },

  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "/customers", element: <CustomersPage /> },
      { path: "/contracts", element: <ContractsPage /> },
      { path: "/billing", element: <BillingPage /> },
      { path: "/cloud-usage", element: <CloudUsagePage /> },

      // onboarding
      {
        element: (
          <ProtectedRoute allowedRoles={[Roles.ADMIN, Roles.END_USER]} />
        ),
        children: [{ path: "/onboarding", element: <OnboardingPage /> }],
      },

      // Admin Section
      {
        element: <ProtectedRoute allowedRoles={[Roles.ADMIN]} />,
        children: [
          { path: "/admin/users", element: <UserManagementPage /> },
          { path: "/admin/dropdowns", element: <DropdownSettingsPage /> },
        ],
      },
    ],
  },

  // 4. Catch-all fallback
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];
