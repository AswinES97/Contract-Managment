import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Contract } from "@/types/contractManagement";
import {
  fetchContracts,
  fetchContractById,
  updateContractStatus,
} from "./contractThunk";

export interface IContractState {
  contracts: Contract[];
  selectedContract: Contract | null;
  loading: boolean;
  error: string | null;
  statusFilter: string;
}

const initialState: IContractState = {
  contracts: [],
  selectedContract: null,
  loading: false,
  error: null,
  statusFilter: "ALL",
};

const contractSlice = createSlice({
  name: "contract",
  initialState,
  reducers: {
    setStatusFilter(state, action: PayloadAction<string>) {
      state.statusFilter = action.payload;
    },
    setSelectedContract(state, action: PayloadAction<Contract | null>) {
      state.selectedContract = action.payload;
    },
    clearContractError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchContracts
    builder
      .addCase(fetchContracts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContracts.fulfilled, (state, action) => {
        state.loading = false;
        state.contracts = action.payload;
      })
      .addCase(fetchContracts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch contracts";
      });

    // fetchContractById
    builder
      .addCase(fetchContractById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContractById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedContract = action.payload;
        // update in list if present
        const idx = state.contracts.findIndex((c) => c.id === action.payload.id);
        if (idx >= 0) {
          state.contracts[idx] = action.payload;
        }
      })
      .addCase(fetchContractById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch contract details";
      });

    // updateContractStatus
    builder.addCase(updateContractStatus.fulfilled, (state, action) => {
      const updated = action.payload;
      const idx = state.contracts.findIndex((c) => c.id === updated.id);
      if (idx >= 0) {
        state.contracts[idx] = updated;
      }
      if (state.selectedContract?.id === updated.id) {
        state.selectedContract = updated;
      }
    });
  },
});

export const { setStatusFilter, setSelectedContract, clearContractError } =
  contractSlice.actions;

export default contractSlice.reducer;
