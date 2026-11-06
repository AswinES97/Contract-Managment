import { IBaseCloudAccountBody } from "../cloud/commonInterface.js";
import { IContactRecord, ICustomerRecord } from "./commonInterface.js";

export interface CustomerListQuery {
  status?: unknown;
  name?: unknown;
}

export interface ICustomerService {
  getCustomer(id: string): Promise<ICustomerRecord>;
  createCustomer(body: unknown): Promise<ICustomerRecord>;
  addCloudDetails(body: unknown): Promise<IBaseCloudAccountBody>;
  addContact(body: unknown): Promise<IContactRecord>;
  // listCustomers(query: CustomerListQuery): Promise<CustomerRecord[]>;
  // updateCustomer(id: string, body: unknown): Promise<CustomerRecord>;
  // deactivateCustomer(id: string): Promise<CustomerRecord>;
  // updateContact(
  //   customerId: string,
  //   contactId: string,
  //   body: unknown,
  // ): Promise<CustomerRecord>;
  // removeContact(customerId: string, contactId: string): Promise<CustomerRecord>;
}
