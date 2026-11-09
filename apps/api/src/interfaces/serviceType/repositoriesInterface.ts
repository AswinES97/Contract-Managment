import {
  IServiceType,
  ICreateServiceTypeInput,
  IUpdateServiceTypeInput,
} from "./commonInterface.js";

export interface IServiceTypeRepository {
  create(data: ICreateServiceTypeInput): Promise<IServiceType>;
  getAll(): Promise<IServiceType[]>;
  getById(id: string): Promise<IServiceType | null>;
  update(id: string, data: IUpdateServiceTypeInput): Promise<IServiceType>;
}
