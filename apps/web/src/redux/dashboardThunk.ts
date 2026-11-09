import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from "@/api/axios";

export interface DashboardRecentContract {
  id: string;
  customerId: string;
  customerName: string;
  scopeDescription: string;
  status: string;
  startDate: string;
  endDate: string;
  billingFrequency: string;
  billingTiming: string;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface DashboardRecentCustomer {
  id: string;
  name: string;
  status: string;
  contractCount: number;
  createdAt: string;
}

export interface DashboardCloudUsageItem {
  id: string;
  provider: string;
  externalAccountId: string;
  customerName: string;
  billingMonth: string;
  amount: number;
  currency: string;
}

export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  totalContracts: number;
  activeContracts: number;
  draftContracts: number;
  monthlyRecurringRevenue: number;
  onboardingInProgress: number;
  recentContracts: DashboardRecentContract[];
  recentCustomers: DashboardRecentCustomer[];
  recentCloudUsage: DashboardCloudUsageItem[];
}

interface ApiResponse<T> {
  message?: string;
  data: T;
}

const extractErrorMessage = (err: unknown, defaultMsg: string): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (typeof data === "string") return data;
    if (
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
    ) {
      return (data as { message: string }).message;
    }
    return err.message || defaultMsg;
  }
  return err instanceof Error ? err.message : defaultMsg;
};

export const fetchDashboardStats = createAsyncThunk<
  DashboardStats,
  void,
  { rejectValue: string }
>("dashboard/fetchDashboardStats", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<ApiResponse<DashboardStats>>("/dashboard");
    if (!res.data?.data) {
      return rejectWithValue("Invalid response from server");
    }
    return res.data.data;
  } catch (err: unknown) {
    console.error("Error in fetchDashboardStats:", err);
    return rejectWithValue(
      extractErrorMessage(err, "Failed to load dashboard statistics")
    );
  }
});
