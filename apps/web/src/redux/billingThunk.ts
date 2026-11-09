import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from "@/api/axios";
import type { Bill } from "@/types/contractManagement";

interface ApiResponse<T> {
  message?: string;
  data: T;
}

export interface FetchBillsFilter {
  contractId?: string;
  customerId?: string;
}

export interface CalculateBillsResponse {
  generatedCount: number;
  bills: Bill[];
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

export const fetchBills = createAsyncThunk<
  Bill[],
  FetchBillsFilter | void,
  { rejectValue: string }
>("billing/fetchBills", async (filter, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    if (filter?.contractId) params.append("contractId", filter.contractId);
    if (filter?.customerId) params.append("customerId", filter.customerId);

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await api.get<ApiResponse<Bill[]>>(`/billing${query}`);
    return res.data?.data || [];
  } catch (err: unknown) {
    console.error("Error in fetchBills:", err);
    return rejectWithValue(extractErrorMessage(err, "Failed to fetch bills"));
  }
});

export const fetchBillById = createAsyncThunk<
  Bill,
  string,
  { rejectValue: string }
>("billing/fetchBillById", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get<ApiResponse<Bill>>(`/billing/${id}`);
    if (!res.data?.data) {
      return rejectWithValue("Bill not found");
    }
    return res.data.data;
  } catch (err: unknown) {
    console.error("Error in fetchBillById:", err);
    return rejectWithValue(
      extractErrorMessage(err, "Failed to fetch bill details"),
    );
  }
});

export const calculateBills = createAsyncThunk<
  Bill[],
  void,
  { rejectValue: string }
>("billing/calculateBills", async (_, { rejectWithValue }) => {
  try {
    const res = await api.post<ApiResponse<CalculateBillsResponse>>(
      "/billing/calculate",
      {},
    );
    return res.data?.data?.bills || [];
  } catch (err: unknown) {
    console.error("Error in calculateBills:", err);
    return rejectWithValue(
      extractErrorMessage(err, "Failed to calculate bills"),
    );
  }
});

export const syncInvoiceStatus = createAsyncThunk<
  Bill,
  string,
  { rejectValue: string }
>("billing/syncInvoiceStatus", async (billId, { rejectWithValue }) => {
  try {
    const res = await api.post<ApiResponse<Bill>>(
      `/billing/${billId}/sync-invoice`,
      {},
    );
    if (!res.data?.data) {
      return rejectWithValue("Failed to sync invoice status");
    }
    return res.data.data;
  } catch (err: unknown) {
    console.error("Error in syncInvoiceStatus:", err);
    return rejectWithValue(
      extractErrorMessage(err, "Failed to sync invoice status with ERP"),
    );
  }
});
