import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from "@/api/axios";
import type {
  Customer,
  CustomerStatus,
  Contact,
  CloudAccount,
} from "@/types/contractManagement";

export interface CreateCustomerPayload {
  name: string;
  billingAddress?: string;
  notes?: string;
  status?: CustomerStatus;
  contacts?: Contact[];
}

export interface UpdateCustomerPayload {
  id: string;
  name?: string;
  billingAddress?: string;
  notes?: string;
  status?: CustomerStatus;
  contacts?: Contact[];
}

export interface UpdateCustomerStatusPayload {
  id: string;
  status: CustomerStatus;
}

export interface AddCloudDetailsPayload {
  customerId: string;
  provider: "AWS" | "AZURE";
  externalAccountId: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export interface AddContactPayload {
  customerId: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  isPrimary?: boolean;
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

export const normalizeCustomer = (raw: {
  id: string;
  name?: string;
  status?: CustomerStatus;
  billingAddress?: string | null;
  notes?: string | null;
  contacts?: Array<{
    id?: string;
    name?: string;
    role?: string | null;
    email?: string | null;
    phone?: string | null;
    isPrimary?: boolean;
  }>;
  cloudAccounts?: Array<{
    id: string;
    provider: "AWS" | "AZURE";
    externalAccountId: string;
  }>;
  contractCount?: number;
  contracts?: unknown[];
}): Customer => {
  return {
    id: raw.id,
    name: raw.name || "Unnamed Customer",
    status:
      raw.status === "ACTIVE" || raw.status === "INACTIVE"
        ? raw.status
        : "ACTIVE",
    billingAddress: raw.billingAddress || "",
    notes: raw.notes || "",
    contacts: Array.isArray(raw.contacts)
      ? raw.contacts.map((c) => ({
          id: c.id || "con-" + Math.random().toString(36).slice(2, 7),
          name: c.name || "",
          role: c.role || "",
          email: c.email || "",
          phone: c.phone || "",
          isPrimary: Boolean(c.isPrimary),
        }))
      : [],
    cloudAccounts: Array.isArray(raw.cloudAccounts)
      ? (raw.cloudAccounts as CloudAccount[])
      : [],
    contractCount: raw.contractCount ?? (raw.contracts?.length || 0),
  };
};

export const fetchCustomers = createAsyncThunk<
  Customer[],
  void,
  { rejectValue: string }
>("customer/fetchCustomers", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<{ data?: Parameters<typeof normalizeCustomer>[0][] }>("/customer");
    const rawData = res.data?.data || [];
    return rawData.map(normalizeCustomer);
  } catch (err: unknown) {
    console.error("Error in fetchCustomers:", err);
    return rejectWithValue(
      extractErrorMessage(err, "Failed to fetch customers"),
    );
  }
});

export const fetchCustomerById = createAsyncThunk<
  Customer,
  string,
  { rejectValue: string }
>("customer/fetchCustomerById", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get<{ data?: Parameters<typeof normalizeCustomer>[0] }>(`/customer/${id}`);
    if (!res.data?.data) {
      return rejectWithValue("Customer not found");
    }
    return normalizeCustomer(res.data.data);
  } catch (err: unknown) {
    console.error("Error in fetchCustomerById:", err);
    return rejectWithValue(
      extractErrorMessage(err, "Failed to fetch customer"),
    );
  }
});

export const createCustomer = createAsyncThunk<
  Customer,
  CreateCustomerPayload,
  { rejectValue: string }
>("customer/createCustomer", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post<{ data?: Parameters<typeof normalizeCustomer>[0] }>("/customer", payload);
    if (!res.data?.data) {
      return rejectWithValue("No customer returned by server");
    }
    return normalizeCustomer(res.data.data);
  } catch (err: unknown) {
    console.error("Error in createCustomer:", err);
    return rejectWithValue(
      extractErrorMessage(err, "Failed to create customer"),
    );
  }
});

export const updateCustomer = createAsyncThunk<
  Customer,
  UpdateCustomerPayload,
  { rejectValue: string }
>("customer/updateCustomer", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.patch<{ data?: Parameters<typeof normalizeCustomer>[0] }>(
      `/customer/${payload.id}`,
      payload,
    );
    if (!res.data?.data) {
      return normalizeCustomer({
        id: payload.id,
        name: payload.name,
        billingAddress: payload.billingAddress,
        notes: payload.notes,
        status: payload.status,
        contacts: payload.contacts,
      });
    }
    return normalizeCustomer(res.data.data);
  } catch (err: unknown) {
    console.error("Error in updateCustomer:", err);
    return rejectWithValue(
      extractErrorMessage(err, "Failed to update customer"),
    );
  }
});

export const updateCustomerStatus = createAsyncThunk<
  { id: string; status: CustomerStatus },
  UpdateCustomerStatusPayload,
  { rejectValue: string }
>("customer/updateCustomerStatus", async (payload, { rejectWithValue }) => {
  try {
    await api.patch(`/customer/${payload.id}/status`, {
      status: payload.status,
    });
    return payload;
  } catch (err: unknown) {
    console.error("Error in updateCustomerStatus:", err);
    return rejectWithValue(
      extractErrorMessage(err, "Failed to update customer status"),
    );
  }
});

export const addCustomerCloudAccount = createAsyncThunk<
  CloudAccount,
  AddCloudDetailsPayload,
  { rejectValue: string }
>("customer/addCloudAccount", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post<{ data?: CloudAccount }>(
      `/customer/${payload.customerId}/cloud-details`,
      {
        provider: payload.provider,
        externalAccountId: payload.externalAccountId,
        ...(payload.accessKeyId && { accessKeyId: payload.accessKeyId }),
        ...(payload.secretAccessKey && {
          secretAccessKey: payload.secretAccessKey,
        }),
      },
    );
    if (!res.data?.data) {
      return rejectWithValue("Failed to add cloud account");
    }
    return res.data.data;
  } catch (err: unknown) {
    console.error("Error in addCustomerCloudAccount:", err);
    return rejectWithValue(
      extractErrorMessage(err, "Failed to add cloud account"),
    );
  }
});

export const addCustomerContact = createAsyncThunk<
  Contact,
  AddContactPayload,
  { rejectValue: string }
>("customer/addContact", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post<{ data?: Contact }>(
      `/customer/${payload.customerId}/contact`,
      payload,
    );
    if (!res.data?.data) {
      return rejectWithValue("Failed to add contact");
    }
    return res.data.data;
  } catch (err: unknown) {
    console.error("Error in addCustomerContact:", err);
    return rejectWithValue(
      extractErrorMessage(err, "Failed to add contact"),
    );
  }
});
