import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from "@/api/axios";

export interface RawServiceTyperResponse {
  id: string;
  name?: string;
  monthlyPrice?: number | string;
  isVariable?: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceTypeData {
  id: string;
  name: string;
  monthlyPrice?: number;
  isVariable?: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateServiceTypePayload {
  name?: string;
  monthlyPrice?: number | string;
  isVariable?: boolean;
  isActive?: boolean;
}

export interface IUpdateServiceTypePayload {
  id: string;
  name?: string;
  monthlyPrice?: number | string;
  isVariable?: boolean;
  isActive?: boolean;
}

export interface IUpdateServiceTypeStatusPayload {
  id: string;
  isActive: boolean;
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

export const normalizeServiceType = (
  raw: RawServiceTyperResponse,
): ServiceTypeData => {
  const name = raw.name || "";
  const rawPrice = raw.monthlyPrice;
  const numPrice =
    typeof rawPrice === "number" ? rawPrice : parseFloat(String(rawPrice || 0));
  const finalPrice = isNaN(numPrice) ? 0 : numPrice;

  return {
    id: raw.id,
    name,
    monthlyPrice: finalPrice,
    isVariable: Boolean(raw.isVariable),
    isActive: raw.isActive ?? true,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};

export const fetchServiceTypes = createAsyncThunk<
  ServiceTypeData[],
  void,
  { rejectValue: string }
>("serviceTypes/fetchServiceTypes", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<{ data?: RawServiceTyperResponse[] }>(
      "/service-types",
    );
    const rawData = res.data?.data || [];
    return rawData.map(normalizeServiceType);
  } catch (err: unknown) {
    console.error("Error in fetchServiceTypes:", err);
    return rejectWithValue(
      extractErrorMessage(err, "Failed to fetch service types"),
    );
  }
});
export const fetchServiceType = fetchServiceTypes;

export const createServiceTypes = createAsyncThunk<
  ServiceTypeData,
  ICreateServiceTypePayload,
  { rejectValue: string }
>("serviceTypes/createServiceTypes", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post<{
      data?: RawServiceTyperResponse;
    }>("/service-types", {
      name: payload.name,
      monthlyPrice: payload.monthlyPrice,
      isVariable: payload.isVariable,
      isActive: payload.isActive,
    });

    const serviceType = res.data?.data;
    if (!serviceType) {
      return rejectWithValue("No service type returned by the server");
    }

    return normalizeServiceType(serviceType);
  } catch (err: unknown) {
    console.error("Error in createServiceTypes:", err);
    return rejectWithValue(
      extractErrorMessage(err, "Failed to create service type"),
    );
  }
});
export const createServiceType = createServiceTypes;

export const updateServiceType = createAsyncThunk<
  ServiceTypeData,
  IUpdateServiceTypePayload,
  { rejectValue: string }
>("serviceTypes/updateServiceType", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.patch<{ data?: RawServiceTyperResponse }>(
      `/service-types/${payload.id}`,
      payload,
    );

    const updated = res.data?.data;
    if (!updated) {
      return normalizeServiceType({
        id: payload.id,
        name: payload.name,
        monthlyPrice: payload.monthlyPrice,
        isVariable: payload.isVariable,
        isActive: payload.isActive ?? true,
      });
    }

    return normalizeServiceType(updated);
  } catch (err: unknown) {
    console.error("Error in updateServiceType:", err);
    return rejectWithValue(
      extractErrorMessage(err, "Failed to update service type"),
    );
  }
});

export const updateServiceTypeStatus = createAsyncThunk<
  { id: string; isActive: boolean },
  IUpdateServiceTypeStatusPayload,
  { rejectValue: string }
>(
  "serviceTypes/updateServiceTypeStatus",
  async (payload, { rejectWithValue }) => {
    try {
      await api.patch(`/service-types/${payload.id}`, {
        isActive: payload.isActive,
      });
      return payload;
    } catch (err: unknown) {
      console.error("Error in updateServiceTypeStatus:", err);
      return rejectWithValue(
        extractErrorMessage(err, "Failed to update service type status"),
      );
    }
  },
);
