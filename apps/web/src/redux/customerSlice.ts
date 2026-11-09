import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Customer } from "@/types/contractManagement";
import {
  fetchCustomers,
  fetchCustomerById,
  createCustomer,
  updateCustomer,
  updateCustomerStatus,
} from "./customerThunk";

export interface ICustomerState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  loading: boolean;
  updateLoading: boolean;
  error: string | null;
}

const initialState: ICustomerState = {
  customers: [],
  selectedCustomer: null,
  loading: false,
  updateLoading: false,
  error: null,
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    setCustomers(state, action: PayloadAction<Customer[]>) {
      state.customers = action.payload;
    },
    setSelectedCustomer(state, action: PayloadAction<Customer | null>) {
      state.selectedCustomer = action.payload;
    },
    clearCustomerError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchCustomers
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.length > 0) {
          state.customers = action.payload;
        }
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch customers";
      });

    // fetchCustomerById
    builder
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCustomer = action.payload;
        const index = state.customers.findIndex(
          (c) => c.id === action.payload.id,
        );
        if (index >= 0) {
          state.customers[index] = action.payload;
        } else {
          state.customers.push(action.payload);
        }
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch customer";
      });

    // createCustomer
    builder
      .addCase(createCustomer.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.customers = [action.payload, ...state.customers];
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload ?? "Failed to create customer";
      });

    // updateCustomer
    builder
      .addCase(updateCustomer.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.updateLoading = false;
        const target = state.customers.find((c) => c.id === action.payload.id);
        if (target) {
          target.name = action.payload.name;
          target.billingAddress = action.payload.billingAddress;
          target.notes = action.payload.notes;
          target.status = action.payload.status;
          target.contacts = action.payload.contacts;
          if (action.payload.cloudAccounts) {
            target.cloudAccounts = action.payload.cloudAccounts;
          }
        }
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer = action.payload;
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload ?? "Failed to update customer";
      });

    // updateCustomerStatus
    builder
      .addCase(updateCustomerStatus.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateCustomerStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        const target = state.customers.find((c) => c.id === action.payload.id);
        if (target) {
          target.status = action.payload.status;
        }
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer.status = action.payload.status;
        }
      })
      .addCase(updateCustomerStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload ?? "Failed to update customer status";
      });
  },
});

export const { setCustomers, setSelectedCustomer, clearCustomerError } =
  customerSlice.actions;
export default customerSlice.reducer;
