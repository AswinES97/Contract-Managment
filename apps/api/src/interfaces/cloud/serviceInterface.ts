import type {
  IBaseCloudAccountBody,
  ICloudAccountResponse,
  ICloudUsageRecord,
  IRecordAzureUsageItem,
  ISyncAwsResult,
} from "./commonInterface.js";

export interface ICloudService {
  createCloudDetails(
    body: IBaseCloudAccountBody,
  ): Promise<ICloudAccountResponse>;
  getAllAccounts(): Promise<ICloudAccountResponse[]>;
  getAllUsage(): Promise<ICloudUsageRecord[]>;
  syncAwsUsage(): Promise<ISyncAwsResult>;
  recordAzureUsage(
    items: IRecordAzureUsageItem | IRecordAzureUsageItem[],
  ): Promise<ICloudUsageRecord[]>;
}
