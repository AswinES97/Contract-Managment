import { ICustomerRepository } from "../../interfaces/customer/repositoryInterface.js";
import { ICustomerService } from "../../interfaces/customer/serviceInterface.js";

export class CustomerService implements ICustomerService {
  private customerRepository: ICustomerRepository;
  constructor(customerRepository: ICustomerRepository) {
    this.customerRepository = customerRepository;
  }
}
