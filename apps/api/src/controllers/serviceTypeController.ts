import { NextFunction, Request, Response } from "express";
import StatusCode from "../constants/statusCodes.js";
import { IServiceTypeService } from "../interfaces/serviceType/serviceInterface.js";
import { IServiceType } from "../interfaces/serviceType/commonInterface.js";

const formatServiceType = (item: IServiceType) => ({
  id: item.id,
  name: item.name,
  serviceName: item.name,
  monthlyPrice:
    item.monthlyPrice !== null && item.monthlyPrice !== undefined
      ? Number(item.monthlyPrice)
      : 0,
  monthlyBaseCharge:
    item.monthlyPrice !== null && item.monthlyPrice !== undefined
      ? Number(item.monthlyPrice)
      : 0,
  isActive: item.isActive,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

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
        data: data.map(formatServiceType),
      });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, serviceName, monthlyPrice, monthlyBaseCharge, isActive } =
        req.body;
      const resolvedName = name ?? serviceName;
      const rawPrice = monthlyPrice ?? monthlyBaseCharge;

      const data = await this.serviceTypeService.createServiceType({
        name: resolvedName,
        monthlyPrice:
          rawPrice !== undefined && rawPrice !== null && rawPrice !== ""
            ? Number(rawPrice)
            : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      });
      return res.status(StatusCode.CREATED).json({
        message: "Service type created successfully",
        data: formatServiceType(data),
      });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, serviceName, monthlyPrice, monthlyBaseCharge, isActive } =
        req.body;
      const resolvedName = name ?? serviceName;
      const rawPrice = monthlyPrice ?? monthlyBaseCharge;

      const data = await this.serviceTypeService.updateServiceType(
        id as string,
        {
          ...(resolvedName !== undefined && { name: resolvedName }),
          ...(rawPrice !== undefined &&
            rawPrice !== null &&
            rawPrice !== "" && {
              monthlyPrice: Number(rawPrice),
            }),
          ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        },
      );
      return res.status(StatusCode.OK).json({
        message: "Service type updated successfully",
        data: formatServiceType(data),
      });
    } catch (err) {
      next(err);
    }
  };
}
