import type {
  IBaseCloudAccountBody,
  ICloudAccountResponse,
  ICloudUsageRecord,
  IRecordAzureUsageItem,
  ISyncAwsResult,
} from "../../interfaces/cloud/commonInterface.js";
import type { ICloudRepository } from "../../interfaces/cloud/repositoriesInterface.js";
import type { ICloudService } from "../../interfaces/cloud/serviceInterface.js";
import { AwsCostExplorerService } from "./awsCostExplorerService.js";

export class CloudService implements ICloudService {
  private cloudRepository: ICloudRepository;
  private awsService: AwsCostExplorerService;

  constructor(
    cloudRepository: ICloudRepository,
    awsService: AwsCostExplorerService = new AwsCostExplorerService(),
  ) {
    this.cloudRepository = cloudRepository;
    this.awsService = awsService;
  }

  createCloudDetails = async (
    body: IBaseCloudAccountBody,
  ): Promise<ICloudAccountResponse> => {
    return this.cloudRepository.createCloudDetails(body);
  };

  getAllAccounts = async (): Promise<ICloudAccountResponse[]> => {
    return this.cloudRepository.getAllCloudAccounts();
  };
  getAllUsage = async (): Promise<ICloudUsageRecord[]> => {
    return this.cloudRepository.getAllCloudUsage();
  };

  // todo: add a python script to get the details from aws directly, save to db/file for real-time
  // todo: also update the fetch time to db
  syncAwsUsage = async (): Promise<ISyncAwsResult> => {
    let awsAccounts = await this.cloudRepository.getAwsAccounts();

    if (awsAccounts.length === 0) {
      const allAccounts = await this.cloudRepository.getAllCloudAccounts();
      const firstAccount = allAccounts[0];
      if (firstAccount) {
        await this.cloudRepository.ensureCloudAccount(
          firstAccount.customerId,
          "AWS",
          "123456789012",
        );
        awsAccounts = await this.cloudRepository.getAwsAccounts();
      }
    }

    if (awsAccounts.length === 0) {
      return {
        syncedAccounts: 0,
        recordsCount: 0,
        records: await this.cloudRepository.getAllCloudUsage(),
      };
    }

    const accountIds = awsAccounts.map((a) => a.externalAccountId);
    const costResults = await this.awsService.getCostAndUsage(accountIds);

    const now = new Date();
    for (const cost of costResults) {
      const account = awsAccounts.find(
        (a) => a.externalAccountId === cost.accountId,
      );
      if (account) {
        const billingDate = new Date(`${cost.month}-01`);
        await this.cloudRepository.upsertUsageRecord(
          account.id,
          billingDate,
          cost.amount,
          cost.currency,
          now,
        );
      }
    }

    const updatedRecords = await this.cloudRepository.getAllCloudUsage();

    return {
      syncedAccounts: awsAccounts.length,
      recordsCount: costResults.length,
      records: updatedRecords,
    };
  };

  recordAzureUsage = async (
    items: IRecordAzureUsageItem | IRecordAzureUsageItem[],
  ): Promise<ICloudUsageRecord[]> => {
    const list = Array.isArray(items) ? items : [items];
    const results: ICloudUsageRecord[] = [];

    for (const item of list) {
      if (
        !item.externalAccountId ||
        !item.billingMonth ||
        item.amount === undefined
      ) {
        continue;
      }
      const record = await this.cloudRepository.upsertAzureUsage(item);
      results.push(record);
    }

    return results;
  };
}
