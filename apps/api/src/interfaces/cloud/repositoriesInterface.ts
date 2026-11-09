import type {
  IBaseCloudAccountBody,
  ICloudAccountResponse,
  ICloudUsageRecord,
  IRecordAzureUsageItem,
  CloudProvider,
} from "./commonInterface.js";

export interface ICloudRepository {
  createCloudDetails(
    body: IBaseCloudAccountBody,
  ): Promise<ICloudAccountResponse>;
  getAllCloudAccounts(): Promise<ICloudAccountResponse[]>;
  getAllCloudUsage(): Promise<ICloudUsageRecord[]>;
  upsertUsageRecord(
    cloudAccountId: string,
    billingMonth: Date,
    amount: number,
    currency?: string,
    fetchedAt?: Date,
  ): Promise<void>;
  upsertAzureUsage(item: IRecordAzureUsageItem): Promise<ICloudUsageRecord>;
  findCloudAccount(
    provider: CloudProvider,
    externalAccountId: string,
  ): Promise<{ id: string; customerId: string; customerName: string } | null>;
  ensureCloudAccount(
    customerId: string,
    provider: CloudProvider,
    externalAccountId: string,
  ): Promise<{ id: string; customerId: string; customerName: string }>;
  getAwsAccounts(): Promise<
    Array<{
      id: string;
      customerId: string;
      customerName: string;
      externalAccountId: string;
    }>
  >;
}
