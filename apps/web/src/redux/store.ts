import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import userReducer from "./userSlice";
import serviceTypesReducer from "./serviceTypeSlice";
import customerReducer from "./customerSlice";
import onboardingReducer from "./onboardingSlice";
import contractReducer from "./contractSlice";
import dashboardReducer from "./dashboardSlice";
import cloudUsageReducer from "./cloudUsageSlice";
import billingReducer from "./billingSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    serviceTypes: serviceTypesReducer,
    customer: customerReducer,
    onboarding: onboardingReducer,
    contract: contractReducer,
    dashboard: dashboardReducer,
    cloudUsage: cloudUsageReducer,
    billing: billingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
