import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from "@/api/axios";
import type { CloudUsageMonthly, CloudProvider } from "@/types/contractManagement";

export interface CloudAccountItem {
  id: string;
  customerId: string;
  customerName?: string;
  provider: CloudProvider;
  externalAccountId: string;
  isActive: boolean;
}

export interface RecordAzureUsagePayload {
  customerId?: string;
  customerName?: string;
  externalAccountId: string;
  billingMonth: string; // YYYY-MM
  amount: number;
  currency?: string;
}

export interface SyncAwsResponse {
  syncedAccounts: number;
  recordsCount: number;
  records: CloudUsageMonthly[];
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

export const fetchCloudUsage = createAsyncThunk<
  CloudUsageMonthly[],
  void,
  { rejectValue: string }
>("cloudUsage/fetchCloudUsage", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<ApiResponse<CloudUsageMonthly[]>>("/cloud-usage");
    return res.data?.data || [];
  } catch (err: unknown) {
    console.error("Error in fetchCloudUsage:", err);
    return rejectWithValue(
      extractErrorMessage(err, "Failed to fetch cloud usage records"),
    );
  }
});

export const fetchCloudAccounts = createAsyncThunk<
  CloudAccountItem[],
  void,
  { rejectValue: string }
>("cloudUsage/fetchCloudAccounts", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<ApiResponse<CloudAccountItem[]>>(
      "/cloud-usage/accounts",
    );
    return res.data?.data || [];
  } catch (err: unknown) {
    console.error("Error in fetchCloudAccounts:", err);
    return rejectWithValue(
      extractErrorMessage(err, "Failed to fetch cloud accounts"),
    );
  }
});

export const syncAwsUsage = createAsyncThunk<
  SyncAwsResponse,
  void,
  { rejectValue: string }
>("cloudUsage/syncAwsUsage", async (_, { rejectWithValue }) => {
  try {
    const res = await api.post<ApiResponse<SyncAwsResponse>>(
      "/cloud-usage/sync-aws",
      {},
    );
    return res.data?.data;
  } catch (err: unknown) {
    console.error("Error in syncAwsUsage:", err);
    return rejectWithValue(
      extractErrorMessage(err, "Failed to synchronize AWS usage"),
    );
  }
});

export const recordAzureUsage = createAsyncThunk<
  CloudUsageMonthly[],
  RecordAzureUsagePayload | RecordAzureUsagePayload[],
  { rejectValue: string }
>("cloudUsage/recordAzureUsage", async (payload, { rejectWithValue }) => {
  try {
    const body = Array.isArray(payload) ? { records: payload } : payload;
    const res = await api.post<ApiResponse<CloudUsageMonthly[]>>(
      "/cloud-usage/azure",
      body,
    );
    return res.data?.data || [];
  } catch (err: unknown) {
    console.error("Error in recordAzureUsage:", err);
    return rejectWithValue(
      extractErrorMessage(err, "Failed to record Azure cloud usage"),
    );
  }
});
