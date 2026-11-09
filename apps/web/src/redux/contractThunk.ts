import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from "@/api/axios";
import type {
  Contract,
  ContractStatus,
  BillingFrequency,
  BillingTiming,
} from "@/types/contractManagement";

export interface FetchContractsFilter {
  status?: string;
  customerId?: string;
  search?: string;
}

export interface UpdateContractStatusPayload {
  id: string;
  status: ContractStatus;
}

export interface RawContractService {
  id: string;
  serviceTypeId: string;
  serviceTypeName?: string;
  serviceType?: { id: string; name: string };
  monthlyAmount?: number | string | null;
  startDate?: string | Date;
  endDate?: string | Date | null;
  discountPercentage?: number | string | null;
  discounts?: Array<{ percentage: number | string }>;
}

export interface RawContractPayload {
  id: string;
  customerId: string;
  customerName?: string;
  customer?: {
    id: string;
    name: string;
    cloudAccounts?: Array<{
      id: string;
      provider: "AWS" | "AZURE";
      externalAccountId: string;
    }>;
  };
  scopeDescription?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  status?: string;
  billingFrequency?: string | null;
  billingTiming?: string | null;
  onboardingCompleted?: boolean;
  onboardingStep?: number;
  services?: RawContractService[];
  cloudAccounts?: Array<{
    id: string;
    provider: "AWS" | "AZURE";
    externalAccountId: string;
  }>;
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

export const normalizeContract = (raw: RawContractPayload): Contract => {
  return {
    id: raw.id,
    customerId: raw.customerId,
    customerName: raw.customerName || raw.customer?.name || "Unknown Customer",
    scopeDescription: raw.scopeDescription || "",
    startDate: raw.startDate
      ? typeof raw.startDate === "string"
        ? raw.startDate.slice(0, 10)
        : new Date(raw.startDate).toISOString().slice(0, 10)
      : "",
    endDate: raw.endDate
      ? typeof raw.endDate === "string"
        ? raw.endDate.slice(0, 10)
        : new Date(raw.endDate).toISOString().slice(0, 10)
      : "",
    status: (raw.status || "DRAFT") as ContractStatus,
    billingFrequency: (raw.billingFrequency || "Monthly") as BillingFrequency,
    billingTiming: (raw.billingTiming || "In advance") as BillingTiming,
    onboardingCompleted: Boolean(raw.onboardingCompleted),
    onboardingStep: raw.onboardingStep ?? (raw.onboardingCompleted ? 5 : 1),
    services: Array.isArray(raw.services)
      ? raw.services.map((s) => ({
          id: s.id,
          serviceTypeId: s.serviceTypeId,
          serviceTypeName: s.serviceTypeName || s.serviceType?.name || "Service",
          monthlyAmount:
            s.monthlyAmount !== null && s.monthlyAmount !== undefined
              ? Number(s.monthlyAmount)
              : undefined,
          startDate: s.startDate
            ? typeof s.startDate === "string"
              ? s.startDate.slice(0, 10)
              : new Date(s.startDate).toISOString().slice(0, 10)
            : "",
          endDate: s.endDate
            ? typeof s.endDate === "string"
              ? s.endDate.slice(0, 10)
              : new Date(s.endDate).toISOString().slice(0, 10)
            : undefined,
          discountPercentage:
            s.discountPercentage !== undefined && s.discountPercentage !== null
              ? Number(s.discountPercentage)
              : s.discounts && s.discounts.length > 0
                ? Number(s.discounts[0].percentage)
                : undefined,
        }))
      : [],
    cloudAccounts: Array.isArray(raw.cloudAccounts)
      ? raw.cloudAccounts.map((ca) => ({
          id: ca.id,
          provider: ca.provider,
          externalAccountId: ca.externalAccountId,
        }))
      : [],
  };
};

export const fetchContracts = createAsyncThunk<
  Contract[],
  FetchContractsFilter | void,
  { rejectValue: string }
>("contract/fetchContracts", async (filter, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    if (filter?.status && filter.status !== "ALL") {
      params.append("status", filter.status);
    }
    if (filter?.customerId) {
      params.append("customerId", filter.customerId);
    }
    if (filter?.search) {
      params.append("search", filter.search);
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await api.get<{ message?: string; data?: RawContractPayload[] }>(
      `/contracts${query}`,
    );

    const list = res.data?.data || [];
    return list.map(normalizeContract);
  } catch (err: unknown) {
    console.error("Error in fetchContracts:", err);
    return rejectWithValue(extractErrorMessage(err, "Failed to fetch contracts"));
  }
});

export const fetchContractById = createAsyncThunk<
  Contract,
  string,
  { rejectValue: string }
>("contract/fetchContractById", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get<{ message?: string; data?: RawContractPayload }>(
      `/contracts/${id}`,
    );
    if (!res.data?.data) {
      return rejectWithValue("Contract not found");
    }
    return normalizeContract(res.data.data);
  } catch (err: unknown) {
    console.error("Error in fetchContractById:", err);
    return rejectWithValue(extractErrorMessage(err, "Failed to fetch contract details"));
  }
});

export const updateContractStatus = createAsyncThunk<
  Contract,
  UpdateContractStatusPayload,
  { rejectValue: string }
>("contract/updateContractStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await api.patch<{ message?: string; data?: RawContractPayload }>(
      `/contracts/${id}/status`,
      { status },
    );
    if (!res.data?.data) {
      return rejectWithValue("Failed to update contract status");
    }
    return normalizeContract(res.data.data);
  } catch (err: unknown) {
    console.error("Error in updateContractStatus:", err);
    return rejectWithValue(
      extractErrorMessage(err, "Failed to update contract status"),
    );
  }
});
