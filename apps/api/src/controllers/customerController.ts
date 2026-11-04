import { ICustomerService } from "../interfaces/customer/serviceInterface.js";

export class CustomerController {
    private customerService: ICustomerService
    constructor(customerService: ICustomerService){
        this.customerService = customerService
    }
}
