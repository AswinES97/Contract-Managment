import StatusCode from "../../constants/statusCodes.js";
import {
  ICreateServiceTypeInput,
  IServiceType,
  IUpdateServiceTypeInput,
} from "../../interfaces/serviceType/commonInterface.js";
import { IServiceTypeRepository } from "../../interfaces/serviceType/repositoriesInterface.js";
import { IServiceTypeService } from "../../interfaces/serviceType/serviceInterface.js";
import CustomError from "../../utils/customError.js";

export class ServiceTypeService implements IServiceTypeService {
  private serviceTypeRepository: IServiceTypeRepository;

  constructor(serviceTypeRepository: IServiceTypeRepository) {
    this.serviceTypeRepository = serviceTypeRepository;
  }

  async createServiceType(
    data: ICreateServiceTypeInput,
  ): Promise<IServiceType> {
    const trimmedName = data.name?.trim();
    if (!trimmedName) {
      throw new CustomError(
        "Service type name is required.",
        StatusCode.BAD_REQUEST,
      );
    }

    if (
      data.monthlyPrice !== undefined &&
      (isNaN(data.monthlyPrice) || data.monthlyPrice < 0)
    ) {
      throw new CustomError(
        "Monthly price must be a valid non-negative number.",
        StatusCode.BAD_REQUEST,
      );
    }

    return this.serviceTypeRepository.create({
      ...data,
      name: trimmedName,
      monthlyPrice:
        data.monthlyPrice !== undefined ? Number(data.monthlyPrice) : 0,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    });
  }

  async getAllServiceTypes(): Promise<IServiceType[]> {
    return this.serviceTypeRepository.getAll();
  }

  async getServiceTypeById(id: string): Promise<IServiceType | null> {
    if (!id?.trim()) {
      throw new CustomError(
        "Service type id is required.",
        StatusCode.BAD_REQUEST,
      );
    }

    const item = await this.serviceTypeRepository.getById(id.trim());
    if (!item) {
      throw new CustomError("Service type not found.", StatusCode.NOT_FOUND);
    }
    return item;
  }

  async updateServiceType(
    id: string,
    data: IUpdateServiceTypeInput,
  ): Promise<IServiceType> {
    if (!id?.trim()) {
      throw new CustomError(
        "Service type id is required.",
        StatusCode.BAD_REQUEST,
      );
    }

    const existing = await this.serviceTypeRepository.getById(id.trim());
    if (!existing) {
      throw new CustomError("Service type not found.", StatusCode.NOT_FOUND);
    }

    const updatePayload: IUpdateServiceTypeInput = {};

    if (data.name !== undefined) {
      const trimmed = data.name.trim();
      if (!trimmed) {
        throw new CustomError(
          "Service type name cannot be empty.",
          StatusCode.BAD_REQUEST,
        );
      }
      updatePayload.name = trimmed;
    }

    if (data.monthlyPrice !== undefined) {
      if (isNaN(data.monthlyPrice) || data.monthlyPrice < 0) {
        throw new CustomError(
          "Monthly price must be a valid non-negative number.",
          StatusCode.BAD_REQUEST,
        );
      }
      updatePayload.monthlyPrice = Number(data.monthlyPrice);
    }

    if (data.isActive !== undefined) {
      updatePayload.isActive = Boolean(data.isActive);
    }

    return this.serviceTypeRepository.update(id.trim(), updatePayload);
  }
}
