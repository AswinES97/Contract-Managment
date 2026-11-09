import { NextFunction, Request, Response } from "express";
import StatusCode from "../constants/statusCodes.js";
import { ICustomerService } from "../interfaces/customer/serviceInterface.js";
import {
  ICreateCustomerInput,
  IUpdateCustomerInput,
} from "../interfaces/customer/commonInterface.js";
import { IBaseCloudAccountBody } from "../interfaces/cloud/commonInterface.js";

export class CustomerController {
  private customerService: ICustomerService;

  constructor(customerService: ICustomerService) {
    this.customerService = customerService;
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customers = await this.customerService.getAllCustomers(req.query);
      return res.status(StatusCode.OK).json({
        message: "Fetched customers successfully",
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = String(req.params.id);
      const customer = await this.customerService.getCustomer(customerId);
      return res.status(StatusCode.OK).json({
        message: "Fetched customer successfully",
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await this.customerService.createCustomer(
        req.body as ICreateCustomerInput,
      );
      return res.status(StatusCode.CREATED).json({
        message: "Created Successfully",
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = String(req.params.id);
      const customer = await this.customerService.updateCustomer(
        customerId,
        req.body as IUpdateCustomerInput,
      );
      return res.status(StatusCode.OK).json({
        message: "Updated Successfully",
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = String(req.params.id);
      const { status } = req.body;
      const customer = await this.customerService.updateCustomerStatus(
        customerId,
        status,
      );
      return res.status(StatusCode.OK).json({
        message: "Status updated successfully",
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  };

  addCloudDetails = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const customerId = String(req.params.id);
      req.body.customerId = customerId;
      const cloudAcc = await this.customerService.addCloudDetails(
        req.body as IBaseCloudAccountBody,
      );
      return res.status(StatusCode.CREATED).json({
        message: "Created Successfully",
        data: cloudAcc,
      });
    } catch (error) {
      next(error);
    }
  };

  addContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = String(req.params.id);
      req.body.customerId = customerId;
      const contact = await this.customerService.addContact(req.body);
      return res.status(StatusCode.CREATED).json({
        message: "Created Successfully",
        data: contact,
      });
    } catch (error) {
      next(error);
    }
  };
}
