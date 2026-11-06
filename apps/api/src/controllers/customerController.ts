import { NextFunction, Request, Response } from "express";
import StatusCode from "../constants/statusCodes.js";
import { ICustomerService } from "../interfaces/customer/serviceInterface.js";
import { ICreateCustomerInput } from "../interfaces/customer/commonInterface.js";
import { IBaseCloudAccountBody } from "../interfaces/cloud/commonInterface.js";

export class CustomerController {
  private customerService: ICustomerService;

  constructor(customerService: ICustomerService) {
    this.customerService = customerService;
  }

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = String(req.params.id);
      const customer = await this.customerService.getCustomer(customerId);
      res.status(StatusCode.OK).json({ data: customer });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await this.customerService.createCustomer(
        req.body as ICreateCustomerInput,
      );
      res
        .status(StatusCode.CREATED)
        .json({ message: "Created Successfully", data: customer });
    } catch (error) {
      next(error);
    }
  };

  addCloudDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = String(req.params.id);
      req.body.customerId = customerId;
      const cloudAcc = await this.customerService.addCloudDetails(
        req.body as IBaseCloudAccountBody,
      );
      res
        .status(StatusCode.CREATED)
        .json({ message: "Created Successfully", data: cloudAcc });
      return;
    } catch (error) {
      next(error);
    }
  };

  addContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = String(req.params.id);
      req.body.customerId = customerId;
      const customer = await this.customerService.addContact(req.body);
      res
        .status(StatusCode.CREATED)
        .json({ message: "Created Successfully", data: customer });
      return;
    } catch (error) {
      next(error);
    }
  };

  // list = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const customers = await this.customerService.listCustomers(req.query);
  //     res.status(StatusCode.OK).json({ data: customers });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  // update = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const customer = await this.customerService.updateCustomer(
  //       String(req.params.id),
  //       req.body,
  //     );
  //     res.status(StatusCode.OK).json({ data: customer });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  // deactivate = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const customer = await this.customerService.deactivateCustomer(
  //       String(req.params.id),
  //     );
  //     res.status(StatusCode.OK).json({ data: customer });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  // updateContact = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const customer = await this.customerService.updateContact(
  //       String(req.params.id),
  //       String(req.params.contactId),
  //       req.body,
  //     );
  //     res.status(StatusCode.OK).json({ data: customer });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  // removeContact = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const customer = await this.customerService.removeContact(
  //       String(req.params.id),
  //       String(req.params.contactId),
  //     );
  //     res.status(StatusCode.OK).json({ data: customer });
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}
