import { NextFunction, Request, Response } from "express";
import StatusCode from "../constants/statusCodes.js";
import { IServiceTypeService } from "../interfaces/serviceType/serviceInterface.js";

export class ServiceTypeController {
  private serviceTypeService: IServiceTypeService;

  constructor(serviceTypeService: IServiceTypeService) {
    this.serviceTypeService = serviceTypeService;
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.serviceTypeService.getAllServiceTypes();
      return res.status(StatusCode.OK).json({
        message: "Fetched service types successfully",
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, monthlyPrice, isVariable, isActive } = req.body;
      const data = await this.serviceTypeService.createServiceType({
        name,
        monthlyPrice,
        isVariable,
        isActive,
      });
      return res.status(StatusCode.CREATED).json({
        message: "Service type created successfully",
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, monthlyPrice, isVariable, isActive } = req.body;

      const data = await this.serviceTypeService.updateServiceType(
        id as string,
        {
          name,
          monthlyPrice,
          isVariable,
          isActive,
        },
      );
      return res.status(StatusCode.OK).json({
        message: "Service type updated successfully",
        data,
      });
    } catch (err) {
      next(err);
    }
  };
}
