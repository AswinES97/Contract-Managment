import { createSlice } from "@reduxjs/toolkit";
import type { CloudUsageMonthly } from "@/types/contractManagement";
import {
  fetchCloudUsage,
  fetchCloudAccounts,
  syncAwsUsage,
  type CloudAccountItem,
} from "./cloudUsageThunk";

interface CloudUsageState {
  usageList: CloudUsageMonthly[];
  accounts: CloudAccountItem[];
  loading: boolean;
  isSyncing: boolean;
  isSavingAzure: boolean;
  error: string | null;
}

const initialState: CloudUsageState = {
  usageList: [],
  accounts: [],
  loading: false,
  isSyncing: false,
  isSavingAzure: false,
  error: null,
};

export const cloudUsageSlice = createSlice({
  name: "cloudUsage",
  initialState,
  reducers: {
    clearCloudError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchCloudUsage
    builder
      .addCase(fetchCloudUsage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCloudUsage.fulfilled, (state, action) => {
        state.loading = false;
        state.usageList = action.payload;
      })
      .addCase(fetchCloudUsage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load cloud usage";
      });

    // fetchCloudAccounts
    builder.addCase(fetchCloudAccounts.fulfilled, (state, action) => {
      state.accounts = action.payload;
    });

    // syncAwsUsage
    builder
      .addCase(syncAwsUsage.pending, (state) => {
        state.isSyncing = true;
        state.error = null;
      })
      .addCase(syncAwsUsage.fulfilled, (state, action) => {
        state.isSyncing = false;
        if (action.payload?.records) {
          state.usageList = action.payload.records;
        }
      })
      .addCase(syncAwsUsage.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.payload || "Failed to sync AWS usage";
      });
  },
});

export const { clearCloudError } = cloudUsageSlice.actions;
export default cloudUsageSlice.reducer;
