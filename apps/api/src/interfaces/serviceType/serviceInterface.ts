import {
  IServiceType,
  ICreateServiceTypeInput,
  IUpdateServiceTypeInput,
} from "./commonInterface.js";

export interface IServiceTypeService {
  createServiceType(data: ICreateServiceTypeInput): Promise<IServiceType>;
  getAllServiceTypes(): Promise<IServiceType[]>;
  getServiceTypeById(id: string): Promise<IServiceType | null>;
  updateServiceType(
    id: string,
    data: IUpdateServiceTypeInput,
  ): Promise<IServiceType>;
}
