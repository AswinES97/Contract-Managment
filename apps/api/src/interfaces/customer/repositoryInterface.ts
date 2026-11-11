import {
  ICreateCustomerInput,
  ICustomerListFilter,
  ICustomerRecord,
  IUpdateCustomerInput,
} from "./commonInterface.js";

export interface ICustomerRepository {
  findById(id: string): Promise<ICustomerRecord | null>;
  getAll(filter?: ICustomerListFilter): Promise<ICustomerRecord[]>;
  create(input: ICreateCustomerInput): Promise<ICustomerRecord>;
  update(
    id: string,
    input: IUpdateCustomerInput,
  ): Promise<ICustomerRecord | null>;
}
