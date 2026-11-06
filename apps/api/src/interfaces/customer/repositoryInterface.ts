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
  create(input: ICreateCustomerInput): Promise<ICustomerRecord>;
  addContact(input: IContactWrite): Promise<CustomerMutationResult>;
  // list(filter: CustomerListFilter): Promise<CustomerRecord[]>;
  // update(
  //   id: string,
  //   input: UpdateCustomerInput,
  // ): Promise<CustomerRecord | null>;
  // updateContact(
  //   customerId: string,
  //   contactId: string,
  //   input: ContactUpdate,
  // ): Promise<CustomerMutationResult>;
  // removeContact(
  //   customerId: string,
  //   contactId: string,
  // ): Promise<CustomerMutationResult>;
}
