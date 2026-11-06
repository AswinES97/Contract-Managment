type cloudProviders = "AWS" | "AZURE";

export interface IBaseCloudAccountBody {
  customerId: string;
  externalAccountId: string;
  isActive?: boolean;
  provider: cloudProviders;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export interface ICloudAccountResponse {
  id: string;
  customerId: string;
  provider: cloudProviders;
  externalAccountId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
