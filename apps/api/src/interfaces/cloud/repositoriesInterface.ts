import {
  IBaseCloudAccountBody,
  ICloudAccountResponse,
} from "./commonInterface.js";

export interface ICloudRepository {
  createCloudDetails(
    body: IBaseCloudAccountBody,
  ): Promise<ICloudAccountResponse>;
}
