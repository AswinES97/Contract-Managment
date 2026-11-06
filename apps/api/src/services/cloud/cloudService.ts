import {
  IBaseCloudAccountBody,
  ICloudAccountResponse,
} from "../../interfaces/cloud/commonInterface.js";
import { ICloudRepository } from "../../interfaces/cloud/repositoriesInterface.js";
import { ICloudService } from "../../interfaces/cloud/serviceInterface.js";

export class CloudService implements ICloudService {
  private cloudRepository: ICloudRepository;
  constructor(cloudRepository: ICloudRepository) {
    this.cloudRepository = cloudRepository;
  }
  createCloudDetails = async (
    body: IBaseCloudAccountBody,
  ): Promise<ICloudAccountResponse> => {
    // todo: upload api and key to aws secret manager and get their arn
    return this.cloudRepository.createCloudDetails(body);
  };
}
