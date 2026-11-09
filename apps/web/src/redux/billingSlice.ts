import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Bill } from "@/types/contractManagement";
import {
  fetchBills,
  fetchBillById,
  calculateBills,
  syncInvoiceStatus,
} from "./billingThunk";

interface BillingState {
  bills: Bill[];
  selectedBill: Bill | null;
  loading: boolean;
  isCalculating: boolean;
  syncingBillId: string | null;
  error: string | null;
}

const initialState: BillingState = {
  bills: [],
  selectedBill: null,
  loading: false,
  isCalculating: false,
  syncingBillId: null,
  error: null,
};

export const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    setSelectedBill: (state, action: PayloadAction<Bill | null>) => {
      state.selectedBill = action.payload;
    },
    clearBillingError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchBills
    builder
      .addCase(fetchBills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = action.payload;
      })
      .addCase(fetchBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load bills";
      });

    // fetchBillById
    builder
      .addCase(fetchBillById.fulfilled, (state, action) => {
        state.selectedBill = action.payload;
      });

    // calculateBills
    builder
      .addCase(calculateBills.pending, (state) => {
        state.isCalculating = true;
        state.error = null;
      })
      .addCase(calculateBills.fulfilled, (state, action) => {
        state.isCalculating = false;
        if (action.payload && action.payload.length > 0) {
          state.bills = action.payload;
        }
      })
      .addCase(calculateBills.rejected, (state, action) => {
        state.isCalculating = false;
        state.error = action.payload || "Failed to calculate bills";
      });

    // syncInvoiceStatus
    builder
      .addCase(syncInvoiceStatus.pending, (state, action) => {
        state.syncingBillId = action.meta.arg;
        state.error = null;
      })
      .addCase(syncInvoiceStatus.fulfilled, (state, action) => {
        state.syncingBillId = null;
        const updatedBill = action.payload;
        state.bills = state.bills.map((b) =>
          b.id === updatedBill.id ? updatedBill : b,
        );
        if (state.selectedBill?.id === updatedBill.id) {
          state.selectedBill = updatedBill;
        }
      })
      .addCase(syncInvoiceStatus.rejected, (state, action) => {
        state.syncingBillId = null;
        state.error = action.payload || "Failed to sync invoice status";
      });
  },
});

export const { setSelectedBill, clearBillingError } = billingSlice.actions;
export default billingSlice.reducer;
