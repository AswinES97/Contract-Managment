import {
  // ContactUpdate,
  IContactWrite,
  ICreateCustomerInput,
  ICustomerListFilter,
  CustomerMutationResult,
  ICustomerRecord,
  IUpdateCustomerInput,
  IContactRecord,
} from "./commonInterface.js";

export interface ICustomerRepository {
  findById(id: string): Promise<ICustomerRecord | null>;
  getAll(filter?: ICustomerListFilter): Promise<ICustomerRecord[]>;
  create(input: ICreateCustomerInput): Promise<ICustomerRecord>;
  update(id: string, input: IUpdateCustomerInput): Promise<ICustomerRecord | null>;
  addContact(input: IContactWrite): Promise<CustomerMutationResult>;
}
