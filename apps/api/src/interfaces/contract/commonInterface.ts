export type ContractStatus = "DRAFT" | "ACTIVE" | "EXPIRED" | "TERMINATED";

export interface IContractServiceItem {
  id: string;
  serviceTypeId: string;
  serviceTypeName: string;
  monthlyAmount?: number;
  startDate: string;
  endDate?: string;
  discountPercentage?: number;
}

export interface IContractRecord {
  id: string;
  customerId: string;
  customerName: string;
  scopeDescription: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  billingFrequency: string;
  billingTiming: string;
  onboardingCompleted: boolean;
  onboardingStep?: number;
  createdAt: string;
  updatedAt: string;
  services: IContractServiceItem[];
  cloudAccounts?: Array<{
    id: string;
    provider: "AWS" | "AZURE";
    externalAccountId: string;
  }>;
}

export interface IContractFilter {
  status?: string;
  customerId?: string;
  search?: string;
}

export interface IUpdateContractStatusInput {
  status: ContractStatus;
}
