import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/axios";
import { isAxiosError } from "axios";
import type { Customer, Contact } from "@/types/contractManagement";

export interface OnboardingStepItem {
  id: string;
  customerId: string;
  contractId?: string | null;
  step: number;
  status?: "PENDING" | "COMPLETED";
  completed: boolean;
  completedAt: string | null;
  contract?: OnboardingContractTerms;
  services?: OnboardingServiceItem[];
  cloud?: OnboardingCloudDetails;
  customer?: {
    id: string;
    name: string;
    billingAddress?: string;
    notes?: string;
    contacts: Array<{
      id?: string;
      name: string;
      role?: string;
      email?: string | null;
      phone?: string | null;
      isPrimary?: boolean;
    }>;
  };
}

export interface OnboardingServiceItem {
  serviceTypeId: string;
  serviceTypeName: string;
  monthlyAmount: number;
  startDate: string;
  endDate: string;
}

export interface OnboardingContractTerms {
  scopeDescription: string;
  startDate: string;
  endDate: string;
  billingFrequency: "MONTHLY" | "QUARTERLY" | "ANNUALLY" | string;
  billingTiming: "ADVANCE" | "ARREARS" | string;
}

export interface OnboardingCloudDetails {
  provider: "AWS" | "AZURE";
  externalAccountId: string;
  discountPercentage?: number;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export interface CompleteOnboardingPayload {
  customerId?: string;
  contractId?: string | null;
  customerName?: string;
  billingAddress?: string;
  notes?: string;
  contacts?: Contact[];
  contract: OnboardingContractTerms;
  services: OnboardingServiceItem[];
  cloud?: OnboardingCloudDetails;
}

export interface OnboardingResult {
  customer: Customer;
  contractId?: string | null;
  steps: OnboardingStepItem[];
  cloudAccount?: {
    id: string;
    provider: "AWS" | "AZURE";
    externalAccountId: string;
  } | null;
  contractSummary: {
    scopeDescription: string;
    startDate: string;
    endDate: string;
    billingFrequency: string;
    billingTiming: string;
    services: OnboardingServiceItem[];
    cloudDiscountPercentage?: number;
  };
}

export interface SaveOnboardingStepPayload {
  customerId: string;
  contractId?: string | null;
  step: number;
  completed?: boolean;
  contract?: OnboardingContractTerms;
  services?: OnboardingServiceItem[];
  cloud?: OnboardingCloudDetails;
}

const extractErrorMessage = (err: unknown, fallback: string): string => {
  if (isAxiosError(err)) {
    return (
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      fallback
    );
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
};

export const completeOnboarding = createAsyncThunk<
  OnboardingResult,
  CompleteOnboardingPayload,
  { rejectValue: string }
>("onboarding/complete", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post<{ message?: string; data?: OnboardingResult }>(
      "/onboarding/complete",
      payload,
    );
    if (!res.data?.data) {
      return rejectWithValue("Failed to complete onboarding");
    }
    return res.data.data;
  } catch (err: unknown) {
    console.error("Error in completeOnboarding:", err);
    return rejectWithValue(
      extractErrorMessage(err, "Failed to complete customer onboarding"),
    );
  }
});

export const fetchOnboardingSteps = createAsyncThunk<
  OnboardingStepItem[],
  { customerId: string },
  { rejectValue: string }
>("onboarding/fetchSteps", async ({ customerId }, { rejectWithValue }) => {
  try {
    const url = `/onboarding/${customerId}/steps`;
    const res = await api.get<{
      message?: string;
      data?: OnboardingStepItem[];
    }>(url);
    return res.data?.data || [];
  } catch (err: unknown) {
    console.error("Error in fetchOnboardingSteps:", err);
    return rejectWithValue(
      extractErrorMessage(err, "Failed to fetch onboarding steps"),
    );
  }
});

export const saveOnboardingStep = createAsyncThunk<
  OnboardingStepItem,
  SaveOnboardingStepPayload,
  { rejectValue: string }
>("onboarding/saveStep", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post<{ message?: string; data?: OnboardingStepItem }>(
      `/onboarding/${payload.customerId}/step`,
      payload,
    );
    if (!res.data?.data) {
      return rejectWithValue("Failed to save step");
    }
    return res.data.data;
  } catch (err: unknown) {
    console.error("Error in saveOnboardingStep:", err);
    return rejectWithValue(
      extractErrorMessage(err, "Failed to save onboarding step"),
    );
  }
});
