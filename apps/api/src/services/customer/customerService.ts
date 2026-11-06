import StatusCode from "../../constants/statusCodes.js";
import { IBaseCloudAccountBody } from "../../interfaces/cloud/commonInterface.js";
import { ICloudService } from "../../interfaces/cloud/serviceInterface.js";
import {
  CUSTOMER_STATUSES,
  // ContactUpdate,
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

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new CustomError("Customer not found.", StatusCode.NOT_FOUND);
    }
    return customer;
  }

  createCustomer = async (
    data: ICreateCustomerInput,
  ): Promise<ICustomerRecord> => {
    data.status = "INACTIVE";
    return this.customerRepository.create(data);
  };

  addCloudDetails = async (
    body: IBaseCloudAccountBody,
  ): Promise<IBaseCloudAccountBody> => {
    return this.cloudService.createCloudDetails(body);
  };

  addContact = async (body: unknown): Promise<IContactRecord> => {
    const contact = body as IContactWrite;
    const result = await this.customerRepository.addContact(contact);
    return this.unwrap(result);
  };

  // async listCustomers(query: CustomerListQuery): Promise<CustomerRecord[]> {
  //   const status =
  //     query.status === undefined || query.status === ""
  //       ? undefined
  //       : this.parseStatus(query.status);
  //   const name =
  //     query.name === undefined ? undefined : this.queryText(query.name, "Name");

  //   return this.customerRepository.list({
  //     ...(status ? { status } : {}),
  //     ...(name ? { name } : {}),
  //   });
  // }

  // async updateCustomer(id: string, body: unknown): Promise<CustomerRecord> {
  //   const record = this.asRecord(body);
  //   const input: UpdateCustomerInput = {};

  //   if ("name" in record) input.name = this.requiredText(record.name, "Name");
  //   if ("billingAddress" in record) {
  //     input.billingAddress = this.optionalText(
  //       record.billingAddress,
  //       "Billing address",
  //     );
  //   }
  //   if ("notes" in record)
  //     input.notes = this.optionalText(record.notes, "Notes");
  //   if ("status" in record) input.status = this.parseStatus(record.status);

  //   if (Object.keys(input).length === 0) {
  //     throw new CustomError(
  //       "Provide a name, billing address, notes, or status to update.",
  //       StatusCode.BAD_REQUEST,
  //     );
  //   }

  //   const customer = await this.customerRepository.update(
  //     this.parseId(id),
  //     input,
  //   );
  //   if (!customer) {
  //     throw new CustomError("Customer not found.", StatusCode.NOT_FOUND);
  //   }
  //   return customer;
  // }

  // async deactivateCustomer(id: string): Promise<CustomerRecord> {
  //   const customer = await this.customerRepository.update(this.parseId(id), {
  //     status: "INACTIVE",
  //   });
  //   if (!customer) {
  //     throw new CustomError("Customer not found.", StatusCode.NOT_FOUND);
  //   }
  //   return customer;
  // }

  // async updateContact(
  //   customerId: string,
  //   contactId: string,
  //   body: unknown,
  // ): Promise<CustomerRecord> {
  //   const record = this.asRecord(body);
  //   const input: ContactUpdate = {};

  //   if ("name" in record)
  //     input.name = this.requiredText(record.name, "Contact name");
  //   if ("role" in record)
  //     input.role = this.requiredText(record.role, "Contact role");
  //   if ("email" in record) input.email = this.optionalEmail(record.email);
  //   if ("phone" in record)
  //     input.phone = this.optionalText(record.phone, "Phone");
  //   if ("isPrimary" in record)
  //     input.isPrimary = this.requiredBoolean(record.isPrimary);

  //   if (Object.keys(input).length === 0) {
  //     throw new CustomError(
  //       "Provide a contact field to update.",
  //       StatusCode.BAD_REQUEST,
  //     );
  //   }

  //   const result = await this.customerRepository.updateContact(
  //     this.parseId(customerId, "Customer id"),
  //     this.parseId(contactId, "Contact id"),
  //     input,
  //   );
  //   return this.unwrap(result, true);
  // }

  // async removeContact(
  //   customerId: string,
  //   contactId: string,
  // ): Promise<CustomerRecord> {
  //   const result = await this.customerRepository.removeContact(
  //     this.parseId(customerId, "Customer id"),
  //     this.parseId(contactId, "Contact id"),
  //   );
  //   return this.unwrap(result, true);
  // }

  private unwrap(
    result: CustomerMutationResult,
    removingPrimary = false,
  ): IContactRecord {
    switch (result.status) {
      case "ok":
        return result.contact;
      case "customer_not_found":
        throw new CustomError("Customer not found.", StatusCode.NOT_FOUND);
      case "contact_not_found":
        throw new CustomError("Contact not found.", StatusCode.NOT_FOUND);
      case "last_contact":
        throw new CustomError(
          "A customer must keep at least one contact.",
          StatusCode.CONFLICT,
        );
      case "primary_required":
        throw new CustomError(
          removingPrimary
            ? "Mark another contact as primary before changing this one."
            : "Mark exactly one contact as primary.",
          StatusCode.CONFLICT,
        );
    }
  }

  // private parseContacts(value: unknown): ContactWrite[] {
  //   if (!Array.isArray(value) || value.length === 0) {
  //     throw new CustomError(
  //       "A customer needs at least one contact.",
  //       StatusCode.BAD_REQUEST,
  //     );
  //   }

  //   const contacts = value.map((item) => this.parseContact(item));
  //   const primaryCount = contacts.filter((contact) => contact.isPrimary).length;
  //   if (primaryCount !== 1) {
  //     throw new CustomError(
  //       "Mark exactly one contact as primary.",
  //       StatusCode.BAD_REQUEST,
  //     );
  //   }
  //   return contacts;
  // }

  // private parseContact(value: unknown): ContactWrite {
  //   const record = this.asRecord(value);
  //   const isPrimary =
  //     record.isPrimary === undefined
  //       ? false
  //       : this.requiredBoolean(record.isPrimary);

  //   return {
  //     name: this.requiredText(record.name, "Contact name"),
  //     role: this.requiredText(record.role, "Contact role"),
  //     email: this.optionalEmail(record.email),
  //     phone: this.optionalText(record.phone, "Phone"),
  //     isPrimary,
  //   };
  // }

  // private parseStatus(
  //   value: unknown,
  //   fallback?: CustomerStatus,
  // ): CustomerStatus {
  //   if (value === undefined || value === null || value === "") {
  //     if (fallback) return fallback;
  //   }
  //   if (typeof value !== "string" || !this.isCustomerStatus(value)) {
  //     throw new CustomError(
  //       "Status must be ACTIVE or INACTIVE.",
  //       StatusCode.BAD_REQUEST,
  //     );
  //   }
  //   return value;
  // }

  // private isCustomerStatus(value: string): value is CustomerStatus {
  //   return CUSTOMER_STATUSES.some((status) => status === value);
  // }

  // private parseId(value: string, label = "Customer id"): string {
  //   if (!UUID_PATTERN.test(value)) {
  //     throw new CustomError(`${label} must be a UUID.`, StatusCode.BAD_REQUEST);
  //   }
  //   return value;
  // }

  // private asRecord(value: unknown): Record<string, unknown> {
  //   if (!value || typeof value !== "object" || Array.isArray(value)) {
  //     throw new CustomError(
  //       "Request body must be a JSON object.",
  //       StatusCode.BAD_REQUEST,
  //     );
  //   }
  //   return value as Record<string, unknown>;
  // }

  // private requiredText(value: unknown, field: string): string {
  //   if (typeof value !== "string" || value.trim().length === 0) {
  //     throw new CustomError(`${field} is required.`, StatusCode.BAD_REQUEST);
  //   }
  //   return value.trim();
  // }

  // private optionalText(value: unknown, field: string): string | null {
  //   if (value === undefined || value === null) return null;
  //   if (typeof value !== "string") {
  //     throw new CustomError(
  //       `${field} must be a string.`,
  //       StatusCode.BAD_REQUEST,
  //     );
  //   }
  //   const trimmed = value.trim();
  //   return trimmed.length > 0 ? trimmed : null;
  // }

  // private queryText(value: unknown, field: string): string | undefined {
  //   if (Array.isArray(value)) {
  //     throw new CustomError(
  //       `Provide a single ${field.toLowerCase()} filter.`,
  //       StatusCode.BAD_REQUEST,
  //     );
  //   }
  //   if (value === undefined || value === "") return undefined;
  //   return this.requiredText(value, field);
  // }

  // private optionalEmail(value: unknown): string | null {
  //   const email = this.optionalText(value, "Email");
  //   if (email && !EMAIL_PATTERN.test(email)) {
  //     throw new CustomError(
  //       "Email must be a valid email address.",
  //       StatusCode.BAD_REQUEST,
  //     );
  //   }
  //   return email ? email.toLowerCase() : null;
  // }

  // private requiredBoolean(value: unknown): boolean {
  //   if (typeof value !== "boolean") {
  //     throw new CustomError(
  //       "isPrimary must be true or false.",
  //       StatusCode.BAD_REQUEST,
  //     );
  //   }
  //   return value;
  // }
}
