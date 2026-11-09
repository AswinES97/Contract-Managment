import { NextFunction, Request, Response } from "express";
import StatusCode from "../constants/statusCodes.js";
import { IContractService } from "../interfaces/contract/serviceInterface.js";
import { ContractStatus } from "../interfaces/contract/commonInterface.js";

export class ContractController {
  private contractService: IContractService;

  constructor(contractService: IContractService) {
    this.contractService = contractService;
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, customerId, search } = req.query;
      const filter = {
        status: status ? String(status) : undefined,
        customerId: customerId ? String(customerId) : undefined,
        search: search ? String(search) : undefined,
      };

      const contracts = await this.contractService.getAllContracts(filter);
      return res.status(StatusCode.OK).json({
        message: "Contracts retrieved successfully",
        data: contracts,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const contract = await this.contractService.getContractById(id);
      return res.status(StatusCode.OK).json({
        message: "Contract retrieved successfully",
        data: contract,
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const status = req.body.status as ContractStatus;
      const contract = await this.contractService.updateContractStatus(
        id,
        status,
      );
      return res.status(StatusCode.OK).json({
        message: "Contract status updated successfully",
        data: contract,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      await this.contractService.deleteContract(id);
      return res.status(StatusCode.OK).json({
        message: "Contract deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
