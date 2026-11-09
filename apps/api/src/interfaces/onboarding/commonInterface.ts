import { ICustomerRecord } from "../customer/commonInterface.js";

export type OnboardingStatus = "PENDING" | "COMPLETED";

export interface IOnboardingStepRecord {
  id: string;
  customerId: string;
  contractId?: string | null;
  step: number;
  status: OnboardingStatus;
  completed: boolean;
  completedAt: string | null;
  contract?: IOnboardingContractTerms;
}

export interface ISaveOnboardingStepInput {
  customerId: string;
  contractId?: string | null;
  step: number;
  status?: OnboardingStatus;
  completed?: boolean;
  contract?: IOnboardingContractTerms;
  services?: IOnboardingServiceComponent[];
  cloud?: IOnboardingCloudDetails;
}

export interface IOnboardingServiceComponent {
  serviceTypeId: string;
  serviceTypeName: string;
  monthlyAmount: number;
  startDate: string;
  endDate: string;
}

export interface IOnboardingContractTerms {
  scopeDescription: string;
  startDate: string;
  endDate: string;
  billingFrequency: "MONTHLY" | "QUARTERLY" | "ANNUALLY" | string;
  billingTiming: "ADVANCE" | "ARREARS" | string;
}

export interface IOnboardingCloudDetails {
  provider: "AWS" | "AZURE";
  externalAccountId: string;
  discountPercentage?: number;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export interface ICompleteOnboardingInput {
  customerId?: string;
  contractId?: string | null;
  customerName?: string;
  billingAddress?: string;
  notes?: string;
  contacts?: Array<{
    name: string;
    role?: string;
    email?: string | null;
    phone?: string | null;
    isPrimary?: boolean;
  }>;
  contract: IOnboardingContractTerms;
  services: IOnboardingServiceComponent[];
  cloud?: IOnboardingCloudDetails;
}

export interface IOnboardingResult {
  customer: ICustomerRecord;
  contractId?: string | null;
  steps: IOnboardingStepRecord[];
  cloudAccount?: {
    id: string;
    provider: string;
    externalAccountId: string;
  } | null;
  contractSummary: {
    scopeDescription: string;
    startDate: string;
    endDate: string;
    billingFrequency: string;
    billingTiming: string;
    services: IOnboardingServiceComponent[];
    cloudDiscountPercentage?: number;
  };
}
