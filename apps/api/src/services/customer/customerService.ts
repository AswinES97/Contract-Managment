import StatusCode from "../../constants/statusCodes.js";
import { IBaseCloudAccountBody } from "../../interfaces/cloud/commonInterface.js";
import { ICloudService } from "../../interfaces/cloud/serviceInterface.js";
import {
  CUSTOMER_STATUSES,
  IContactWrite,
  ICreateCustomerInput,
  CustomerMutationResult,
  ICustomerRecord,
  CustomerStatus,
  IUpdateCustomerInput,
  IContactRecord,
} from "../../interfaces/customer/commonInterface.js";
import { ICustomerRepository } from "../../interfaces/customer/repositoryInterface.js";
import {
  CustomerListQuery,
  ICustomerService,
} from "../../interfaces/customer/serviceInterface.js";
import CustomError from "../../utils/customError.js";

export class CustomerService implements ICustomerService {
  private customerRepository: ICustomerRepository;
  private cloudService: ICloudService;

  constructor(
    customerRepository: ICustomerRepository,
    cloudService: ICloudService,
  ) {
    this.customerRepository = customerRepository;
    this.cloudService = cloudService;
  }

  async getCustomer(id: string): Promise<ICustomerRecord> {
    if (!id?.trim()) {
      throw new CustomError("Customer ID is required", StatusCode.BAD_REQUEST);
    }
    const customer = await this.customerRepository.findById(id.trim());
    if (!customer) {
      throw new CustomError("Customer not found.", StatusCode.NOT_FOUND);
    }
    return customer;
  }

  async getAllCustomers(query?: CustomerListQuery): Promise<ICustomerRecord[]> {
    const status =
      typeof query?.status === "string" &&
      CUSTOMER_STATUSES.includes(query.status as CustomerStatus)
        ? (query.status as CustomerStatus)
        : undefined;
    const name =
      typeof query?.name === "string" ? query.name.trim() : undefined;

    return this.customerRepository.getAll({
      ...(status ? { status } : {}),
      ...(name ? { name } : {}),
    });
  }

  createCustomer = async (
    data: ICreateCustomerInput,
  ): Promise<ICustomerRecord> => {
    if (!data.name?.trim()) {
      throw new CustomError(
        "Customer name is required",
        StatusCode.BAD_REQUEST,
      );
    }
    return this.customerRepository.create({
      ...data,
      name: data.name.trim(),
      status: data.status || "ACTIVE",
    });
  };

  async updateCustomer(
    id: string,
    data: IUpdateCustomerInput,
  ): Promise<ICustomerRecord> {
    if (!id?.trim()) {
      throw new CustomError("Customer ID is required", StatusCode.BAD_REQUEST);
    }
    const updated = await this.customerRepository.update(id.trim(), data);
    if (!updated) {
      throw new CustomError("Customer not found.", StatusCode.NOT_FOUND);
    }
    return updated;
  }

  async updateCustomerStatus(
    id: string,
    status: CustomerStatus,
  ): Promise<ICustomerRecord> {
    if (!id?.trim()) {
      throw new CustomError("Customer ID is required", StatusCode.BAD_REQUEST);
    }
    if (!status || !CUSTOMER_STATUSES.includes(status)) {
      throw new CustomError(
        "Valid status (ACTIVE or INACTIVE) is required",
        StatusCode.BAD_REQUEST,
      );
    }
    const updated = await this.customerRepository.update(id.trim(), { status });
    if (!updated) {
      throw new CustomError("Customer not found.", StatusCode.NOT_FOUND);
    }
    return updated;
  }

  addCloudDetails = async (
    body: unknown,
  ): Promise<IBaseCloudAccountBody> => {
    return this.cloudService.createCloudDetails(body as IBaseCloudAccountBody);
  };

  addContact = async (body: unknown): Promise<IContactRecord> => {
    const contact = body as IContactWrite;
    const result = await this.customerRepository.addContact(contact);
    return this.unwrap(result);
  };

  private unwrap(result: CustomerMutationResult): IContactRecord {
    switch (result.status) {
      case "ok":
        return result.contact;
      case "customer_not_found":
        throw new CustomError("Customer not found.", StatusCode.NOT_FOUND);
      case "contact_not_found":
        throw new CustomError("Contact not found.", StatusCode.NOT_FOUND);
      case "primary_required":
        throw new CustomError(
          "Customer must have a primary contact.",
          StatusCode.BAD_REQUEST,
        );
      case "last_contact":
        throw new CustomError(
          "Customer must have at least one contact.",
          StatusCode.BAD_REQUEST,
        );
      default:
        throw new CustomError(
          "Failed to mutate contact.",
          StatusCode.INTERNAL_SERVER_ERROR,
        );
    }
  }
}
