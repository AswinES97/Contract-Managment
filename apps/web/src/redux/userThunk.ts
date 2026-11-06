import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from "@/api/axios";
import type { RoleType } from "@/types/roles";
import type { PlatformUser } from "@/types/contractManagement";

export interface UpdateUserPayload {
  id: string;
  name?: string;
  email?: string;
  role?: RoleType;
  isActive?: boolean;
}

export interface CreateUserPayload {
  name?: string;
  email: string;
  password?: string;
  role: RoleType;
  isActive?: boolean;
}

interface RawUserResponse {
  id: string;
  name?: string;
  email: string;
  role: RoleType;
  isActive?: boolean;
  createdAt?: string;
}

export const fetchUsers = createAsyncThunk<
  PlatformUser[],
  void,
  { rejectValue: string }
>("user/fetchUsers", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/users");
    const rawData = (res.data?.data || []) as RawUserResponse[];
    return rawData.map((u) => ({
      id: u.id,
      name: u.name || u.email.split("@")[0],
      email: u.email,
      role: u.role,
      isActive: u.isActive ?? true,
      createdAt: u.createdAt
        ? new Date(u.createdAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    }));
  } catch (err: unknown) {
    console.error("Error in fetchUsers:", err);
    if (axios.isAxiosError(err)) {
      return rejectWithValue(
        (err.response?.data as { message?: string })?.message ||
          err.response?.data ||
          err.message,
      );
    }
    return rejectWithValue(
      err instanceof Error ? err.message : "Failed to fetch users",
    );
  }
});

export const updateUserDetails = createAsyncThunk<
  UpdateUserPayload,
  UpdateUserPayload,
  { rejectValue: string }
>("user/updateUserDetails", async (payload, { rejectWithValue }) => {
  try {
    await api.patch("/users", payload);
    return payload;
  } catch (err: unknown) {
    console.error("Error in updateUserDetails:", err);
    if (axios.isAxiosError(err)) {
      return rejectWithValue(
        (err.response?.data as { message?: string })?.message ||
          err.response?.data ||
          err.message,
      );
    }
    return rejectWithValue(
      err instanceof Error ? err.message : "Failed to update user",
    );
  }
});

export const createUser = createAsyncThunk<
  PlatformUser,
  CreateUserPayload,
  { rejectValue: string }
>("user/createUser", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post("/users", {
      ...payload,
      password: payload.password || "Password123!",
    });
    const u = res.data?.data as RawUserResponse | undefined;
    if (u) {
      return {
        id: u.id,
        name: u.name || u.email.split("@")[0],
        email: u.email,
        role: u.role,
        isActive: u.isActive ?? true,
        createdAt: u.createdAt
          ? new Date(u.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      };
    }
    return {
      id: "usr-" + Date.now(),
      name: payload.name || payload.email.split("@")[0],
      email: payload.email,
      role: payload.role,
      isActive: payload.isActive ?? true,
      createdAt: new Date().toISOString().split("T")[0],
    };
  } catch (err: unknown) {
    console.error("Error in createUser:", err);
    if (axios.isAxiosError(err)) {
      return rejectWithValue(
        (err.response?.data as { message?: string })?.message ||
          err.response?.data ||
          err.message,
      );
    }
    return rejectWithValue(
      err instanceof Error ? err.message : "Failed to create user",
    );
  }
});
