export type CloudProvider = "AWS" | "AZURE";

export interface IBaseCloudAccountBody {
  customerId: string;
  externalAccountId: string;
  isActive?: boolean;
  provider: CloudProvider;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export interface ICloudAccountResponse {
  id: string;
  customerId: string;
  customerName?: string;
  provider: CloudProvider;
  externalAccountId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICloudUsageRecord {
  id: string;
  cloudAccountId: string;
  customerId: string;
  customerName: string;
  provider: CloudProvider;
  externalAccountId: string;
  billingMonth: string; // YYYY-MM
  amount: number;
  currency: string;
  fetchedAt: string;
  discountPercentage: number;
  netAmount: number;
}

export interface IRecordAzureUsageItem {
  customerId?: string;
  customerName?: string;
  externalAccountId: string;
  billingMonth: string; // YYYY-MM
  amount: number;
  currency?: string;
}

export interface ISyncAwsResult {
  syncedAccounts: number;
  recordsCount: number;
  records: ICloudUsageRecord[];
}
