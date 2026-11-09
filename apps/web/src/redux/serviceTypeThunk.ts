import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from "@/api/axios";

export interface RawServiceTyperResponse {
  id: string;
  name?: string;
  serviceName?: string;
  monthlyPrice?: number | string;
  monthlyBaseCharge?: number | string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceTypeData {
  id: string;
  name: string;
  serviceName: string;
  monthlyPrice: number;
  monthlyBaseCharge: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateServiceTypePayload {
  name?: string;
  serviceName?: string;
  monthlyPrice?: number | string;
  monthlyBaseCharge?: number | string;
  isActive?: boolean;
}

export interface IUpdateServiceTypePayload {
  id: string;
  name?: string;
  serviceName?: string;
  monthlyPrice?: number | string;
  monthlyBaseCharge?: number | string;
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
  const name = raw.name || raw.serviceName || "";
  const rawPrice = raw.monthlyPrice ?? raw.monthlyBaseCharge;
  const numPrice =
    typeof rawPrice === "number" ? rawPrice : parseFloat(String(rawPrice || 0));
  const finalPrice = isNaN(numPrice) ? 0 : numPrice;

  return {
    id: raw.id,
    name,
    serviceName: name,
    monthlyPrice: finalPrice,
    monthlyBaseCharge: finalPrice,
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
    const resolvedName = payload.name ?? payload.serviceName;
    const rawPrice = payload.monthlyPrice ?? payload.monthlyBaseCharge;
    const numPrice =
      typeof rawPrice === "number"
        ? rawPrice
        : parseFloat(String(rawPrice || 0));

    const res = await api.post<{
      data?: RawServiceTyperResponse;
    }>("/service-types", {
      name: resolvedName,
      serviceName: resolvedName,
      monthlyPrice: isNaN(numPrice) ? 0 : numPrice,
      monthlyBaseCharge: isNaN(numPrice) ? 0 : numPrice,
      isActive: payload.isActive !== undefined ? payload.isActive : true,
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
    const resolvedName = payload.name ?? payload.serviceName;
    const rawPrice = payload.monthlyPrice ?? payload.monthlyBaseCharge;
    const body: Record<string, unknown> = {};

    if (resolvedName !== undefined) {
      body.name = resolvedName;
      body.serviceName = resolvedName;
    }
    if (rawPrice !== undefined) {
      const numPrice =
        typeof rawPrice === "number" ? rawPrice : parseFloat(String(rawPrice));
      body.monthlyPrice = isNaN(numPrice) ? 0 : numPrice;
      body.monthlyBaseCharge = isNaN(numPrice) ? 0 : numPrice;
    }
    if (payload.isActive !== undefined) {
      body.isActive = payload.isActive;
    }

    const res = await api.patch<{ data?: RawServiceTyperResponse }>(
      `/service-types/${payload.id}`,
      body,
    );

    const updated = res.data?.data;
    if (!updated) {
      return normalizeServiceType({
        id: payload.id,
        name: resolvedName,
        serviceName: resolvedName,
        monthlyPrice: rawPrice !== undefined ? Number(rawPrice) : undefined,
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

export const deleteServiceType = createAsyncThunk<
  { id: string },
  string,
  { rejectValue: string }
>("serviceTypes/deleteServiceType", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/service-types/${id}`);
    return { id };
  } catch (err: unknown) {
    console.error("Error in deleteServiceType:", err);
    return rejectWithValue(
      extractErrorMessage(err, "Failed to delete service type"),
    );
  }
});
export const removeServiceType = deleteServiceType;
