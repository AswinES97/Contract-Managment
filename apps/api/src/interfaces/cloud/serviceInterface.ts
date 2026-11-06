import { IBaseCloudAccountBody, ICloudAccountResponse } from "./commonInterface.js";

export interface ICloudService {
  createCloudDetails(body: IBaseCloudAccountBody): Promise<ICloudAccountResponse>;
}
