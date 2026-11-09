import StatusCode from "../../constants/statusCodes.js";
import {
  ContractStatus,
  IContractFilter,
  IContractRecord,
} from "../../interfaces/contract/commonInterface.js";
import { IContractRepository } from "../../interfaces/contract/repositoryInterface.js";
import { IContractService } from "../../interfaces/contract/serviceInterface.js";
import CustomError from "../../utils/customError.js";

const VALID_STATUSES: ContractStatus[] = [
  "DRAFT",
  "ACTIVE",
  "EXPIRED",
  "TERMINATED",
];

export class ContractService implements IContractService {
  private contractRepository: IContractRepository;

  constructor(contractRepository: IContractRepository) {
    this.contractRepository = contractRepository;
  }

  async getAllContracts(filter?: IContractFilter): Promise<IContractRecord[]> {
    if (filter?.status && filter.status !== "ALL") {
      if (!VALID_STATUSES.includes(filter.status as ContractStatus)) {
        throw new CustomError(
          `Invalid contract status filter: ${filter.status}`,
          StatusCode.BAD_REQUEST,
        );
      }
    }
    return this.contractRepository.getAll(filter);
  }

  async getContractById(id: string): Promise<IContractRecord> {
    if (!id?.trim()) {
      throw new CustomError("Contract ID is required", StatusCode.BAD_REQUEST);
    }
    const contract = await this.contractRepository.getById(id.trim());
    if (!contract) {
      throw new CustomError("Contract not found", StatusCode.NOT_FOUND);
    }
    return contract;
  }

  async updateContractStatus(
    id: string,
    status: ContractStatus,
  ): Promise<IContractRecord> {
    if (!id?.trim()) {
      throw new CustomError("Contract ID is required", StatusCode.BAD_REQUEST);
    }
    if (!VALID_STATUSES.includes(status)) {
      throw new CustomError(
        `Invalid contract status: ${status}`,
        StatusCode.BAD_REQUEST,
      );
    }

    const existing = await this.contractRepository.getById(id.trim());
    if (!existing) {
      throw new CustomError("Contract not found", StatusCode.NOT_FOUND);
    }

    return this.contractRepository.updateStatus(id.trim(), status);
  }

  async deleteContract(id: string): Promise<boolean> {
    if (!id?.trim()) {
      throw new CustomError("Contract ID is required", StatusCode.BAD_REQUEST);
    }
    const existing = await this.contractRepository.getById(id.trim());
    if (!existing) {
      throw new CustomError("Contract not found", StatusCode.NOT_FOUND);
    }
    return this.contractRepository.delete(id.trim());
  }
}
