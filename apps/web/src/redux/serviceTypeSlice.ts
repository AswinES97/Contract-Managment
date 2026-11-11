import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
  createServiceTypes,
  fetchServiceTypes,
  updateServiceType,
  updateServiceTypeStatus,
  type ServiceTypeData,
} from "./serviceTypeThunk";

export interface IServiceTypeState {
  serviceTypes: ServiceTypeData[];
  loading: boolean;
  updateLoading: boolean;
  error: string | null;
}

const initialState: IServiceTypeState = {
  serviceTypes: [],
  loading: false,
  updateLoading: false,
  error: null,
};

const serviceTypeSlice = createSlice({
  name: "serviceTypes",
  initialState,
  reducers: {
    setServiceTypes(state, action: PayloadAction<ServiceTypeData[]>) {
      state.serviceTypes = action.payload;
    },
    clearServiceTypeError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchServiceTypes
    builder
      .addCase(fetchServiceTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.serviceTypes = action.payload;
      })
      .addCase(fetchServiceTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch service types";
      });

    // createServiceTypes
    builder
      .addCase(createServiceTypes.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(createServiceTypes.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.serviceTypes = [action.payload, ...state.serviceTypes];
      })
      .addCase(createServiceTypes.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload ?? "Failed to create service type";
      });

    // updateServiceType
    builder
      .addCase(updateServiceType.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateServiceType.fulfilled, (state, action) => {
        state.updateLoading = false;
        const target = state.serviceTypes.find(
          (s) => s.id === action.payload.id,
        );
        if (target) {
          target.name = action.payload.name;
          target.monthlyPrice = action.payload.monthlyPrice;
          target.isVariable = action.payload.isVariable;
          target.isActive = action.payload.isActive;
        }
      })
      .addCase(updateServiceType.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload ?? "Failed to update service type";
      });

    // updateServiceTypeStatus
    builder
      .addCase(updateServiceTypeStatus.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateServiceTypeStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        const target = state.serviceTypes.find(
          (s) => s.id === action.payload.id,
        );
        if (target) {
          target.isActive = action.payload.isActive;
        }
      })
      .addCase(updateServiceTypeStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload ?? "Failed to update service type status";
      });
  },
});

export const { setServiceTypes, clearServiceTypeError } =
  serviceTypeSlice.actions;
export default serviceTypeSlice.reducer;
