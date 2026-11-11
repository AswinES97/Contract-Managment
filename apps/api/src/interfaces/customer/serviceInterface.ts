import { IBaseCloudAccountBody } from "../cloud/commonInterface.js";
import {
  IContactRecord,
  ICustomerRecord,
  ICreateCustomerInput,
  IUpdateCustomerInput,
  CustomerStatus,
} from "./commonInterface.js";

export interface CustomerListQuery {
  status?: unknown;
  name?: unknown;
}

export interface ICustomerService {
  getCustomer(id: string): Promise<ICustomerRecord>;
  getAllCustomers(query?: CustomerListQuery): Promise<ICustomerRecord[]>;
  createCustomer(data: ICreateCustomerInput): Promise<ICustomerRecord>;
  updateCustomer(id: string, data: IUpdateCustomerInput): Promise<ICustomerRecord>;
  updateCustomerStatus(id: string, status: CustomerStatus): Promise<ICustomerRecord>;
  addCloudDetails(body: unknown): Promise<IBaseCloudAccountBody>;
}
