import axios from "axios";
import { store } from "@/redux/store";
// import { setToken, logout } from "@/redux/authSlice";

// import { toast } from "sonner";
import { getApiUrl } from "@/utils/environment";

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (config.url && !config.url.includes("/login")) {
      const state = store.getState();
      const token = state.auth.token;
      if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// // api.interceptors.response.use(
// //   (response) => {
// //     const newAccessToken = response.headers["x-access-token"];
// //     const newRefreshToken = response.headers["x-refresh-token"];

// //     if (newAccessToken) {
// //       store.dispatch(setToken(newAccessToken));
// //     }

// //     // Handle refresh token rotation (if provided)
// //     if (newRefreshToken) {
// //       // Store new refresh token if you have a setRefreshToken action
// //       // For now, it's handled automatically by the backend
// //     }

// //     return response;
// //   },
// //   async (error) => {
// //     const errorData = error.response?.data;
// //     const errMsg = errorData?.message;
// //     const errorCode = errorData?.errorCode;
// //     const errorType = errorData?.errorType;

// //     // Only logout on authentication errors, NOT permission errors
// //     const isAuthenticationError =
// //       errorType === "authentication" ||
// //       errorCode === "REFRESH_TOKEN_EXPIRED" ||
// //       errorCode === "TOKEN_INVALIDATED" ||
// //       errorCode === "AUTH_REQUIRED" ||
// //       errorCode === "INVALID_TOKEN" ||
// //       errorCode === "ACCOUNT_BLOCKED" ||
// //       errorCode === "REFRESH_TOKEN_MISSING";

// //     const isPermissionError =
// //       errorType === "permission" || errorCode === "PERMISSION_DENIED";

// //     // Handle permission errors - show warning toast, don't logout
// //     if (isPermissionError) {
// //       toast.warning(
// //         errMsg || "You don't have permission to perform this action",
// //         {
// //           duration: 4000,
// //         },
// //       );
// //       return Promise.reject(error);
// //     }

// //     // Handle authentication errors - logout only if refresh token expired
// //     if (isAuthenticationError) {
// //       // Only logout if it's a critical auth error (refresh token expired, invalidated, etc.)
// //       const shouldLogout =
// //         errorCode === "REFRESH_TOKEN_EXPIRED" ||
// //         errorCode === "TOKEN_INVALIDATED" ||
// //         errorCode === "ACCOUNT_BLOCKED" ||
// //         errorCode === "REFRESH_TOKEN_MISSING" ||
// //         (errorCode === "AUTH_REQUIRED" && error.response?.status === 401);

// //       if (shouldLogout) {
// //         await callLogoutApi();
// //         store.dispatch(logout());
// //         toast.error(errMsg || "Session expired. Please log in again.", {
// //           duration: 5000,
// //         });
// //       } else {
// //         // For other auth errors, just show error (token refresh should handle it)
// //         toast.error(errMsg || "Authentication error", {
// //           duration: 3000,
// //         });
// //       }
// //     } else if (
// //       error.response?.status === 401 ||
// //       error.response?.status === 403
// //     ) {
// //       // Fallback for errors without errorType/errorCode
// //       // If it's a 401/403 without specific error type, check message
// //       if (
// //         errMsg === "Refresh token expired or invalid. Please log in again." ||
// //         errMsg === "Token has been invalidated. Please log in again."
// //       ) {
// //         await callLogoutApi();
// //         store.dispatch(logout());
// //         toast.error(errMsg || "Session expired. Please log in again.", {
// //           duration: 5000,
// //         });
// //       } else {
// //         // Unknown 401/403 - show error but don't logout
// //         toast.error(errMsg || "Access denied", {
// //           duration: 3000,
// //         });
// //       }
// //     }

// //     return Promise.reject(error);
// //   },
// // );

// // Helper to call logout API
// async function callLogoutApi() {
//   const state = store.getState();
//   const hasAdmin = !!state.auth.user?.id;

//   // Only call backend logout if we still have an authenticated admin
//   if (!hasAdmin) return;

//   try {
//     // Admin ID is now derived server-side from the (possibly expired) token.
//     // We don't need to send admin_id in the body anymore.
//     await api.post("/admin/logout");
//   } catch (e) {
//     // Ignore errors – frontend will still clear local state
//   }
// }

export default api;
