import type { RoleType } from "./roles";

export type CustomerStatus = "ACTIVE" | "INACTIVE";
export type ContractStatus = "DRAFT" | "ACTIVE" | "EXPIRED" | "TERMINATED";
export type BillingFrequency = "Monthly" | "Quarterly" | "Yearly";
export type BillingTiming = "In advance" | "In arrears";
export type CloudProvider = "AWS" | "AZURE";
export type InvoiceState = "PENDING" | "RAISED" | "COMPLETED";

export interface Contact {
  id?: string;
  name: string;
  role?: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface CloudAccount {
  id: string;
  provider: CloudProvider;
  externalAccountId: string;
}

export interface ServiceDiscount {
  id: string;
  percentage: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface ContractService {
  id: string;
  serviceTypeId: string;
  serviceTypeName: string;
  monthlyAmount?: number;
  startDate: string;
  endDate?: string;
  discountPercentage?: number;
}

export interface Contract {
  id: string;
  customerId: string;
  customerName: string;
  scopeDescription: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  billingFrequency: BillingFrequency;
  billingTiming: BillingTiming;
  onboardingCompleted: boolean;
  onboardingStep?: number;
  services: ContractService[];
  cloudAccounts?: CloudAccount[];
}

export interface Customer {
  id: string;
  name: string;
  status: CustomerStatus;
  billingAddress: string;
  notes: string;
  contacts: Contact[];
  cloudAccounts: CloudAccount[];
  contractCount?: number;
}

export interface CloudUsageMonthly {
  id: string;
  customerName: string;
  provider: CloudProvider;
  externalAccountId: string;
  billingMonth: string;
  amount: number;
  currency: string;
  fetchedAt: string;
  discountPercentage: number;
  netAmount: number;
}

export interface BillLineItem {
  id: string;
  description: string;
  sourceType: "FIXED_SERVICE" | "CLOUD_USAGE";
  unitAmount: number;
  discountPercentage: number;
  finalAmount: number;
}

export interface InvoiceStatusInfo {
  status: InvoiceState;
  invoiceNumber?: string;
  invoiceDate?: string;
  checkedAt: string;
}

export interface Bill {
  id: string;
  contractId: string;
  customerName: string;
  periodStart: string;
  periodEnd: string;
  billingMonth: string;
  currency: string;
  fixedAmount: number;
  cloudUsageAmount: number;
  cloudDiscountAmount: number;
  totalAmount: number;
  lineItems: BillLineItem[];
  invoiceStatus: InvoiceStatusInfo;
}

export interface ServiceTypeItem {
  id: string;
  name: string;
  monthlyPrice?: number;
  isVariable?: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  isActive: boolean;
  createdAt: string;
}
