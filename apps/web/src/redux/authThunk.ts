import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { login } from "./authSlice";
import api from "@/api/axios";

export const userLogin = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });
      const { token, data } = res.data;
      dispatch(
        login({
          user: data,
          token,
        }),
      );
      return res.data;
    } catch (err: unknown) {
      console.log("err in userLogin", err);
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data || err.message);
      }
      return rejectWithValue(
        err instanceof Error ? err.message : "Login failed",
      );
    }
  },
);
