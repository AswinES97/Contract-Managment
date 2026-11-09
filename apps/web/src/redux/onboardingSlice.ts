import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  completeOnboarding,
  fetchOnboardingSteps,
  saveOnboardingStep,
  type OnboardingStepItem,
  type OnboardingResult,
} from "./onboardingThunk";

export interface IOnboardingState {
  currentStep: number;
  steps: OnboardingStepItem[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  success: boolean;
  result: OnboardingResult | null;
}

const initialState: IOnboardingState = {
  currentStep: 1,
  steps: [],
  loading: false,
  submitting: false,
  error: null,
  success: false,
  result: null,
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    setCurrentStep(state, action: PayloadAction<number>) {
      state.currentStep = action.payload;
    },
    clearOnboardingError(state) {
      state.error = null;
    },
    resetOnboarding(state) {
      state.currentStep = 1;
      state.steps = [];
      state.loading = false;
      state.submitting = false;
      state.error = null;
      state.success = false;
      state.result = null;
    },
  },
  extraReducers: (builder) => {
    // completeOnboarding
    builder
      .addCase(completeOnboarding.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(completeOnboarding.fulfilled, (state, action) => {
        state.submitting = false;
        state.success = true;
        state.result = action.payload;
        state.steps = action.payload.steps;
      })
      .addCase(completeOnboarding.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? "Failed to complete onboarding";
      });

    // fetchOnboardingSteps
    builder
      .addCase(fetchOnboardingSteps.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOnboardingSteps.fulfilled, (state, action) => {
        state.loading = false;
        state.steps = action.payload;
      })
      .addCase(fetchOnboardingSteps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch steps";
      });

    // saveOnboardingStep
    builder
      .addCase(saveOnboardingStep.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveOnboardingStep.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.steps.findIndex(
          (s) => s.step === action.payload.step,
        );
        if (index >= 0) {
          state.steps[index] = action.payload;
        } else {
          state.steps.push(action.payload);
        }
      })
      .addCase(saveOnboardingStep.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to save step";
      });
  },
});

export const { setCurrentStep, clearOnboardingError, resetOnboarding } =
  onboardingSlice.actions;

export default onboardingSlice.reducer;
