import { PrismaClient } from "../generated/prisma/client.js";
import { IServiceTypeRepository } from "../interfaces/serviceType/repositoriesInterface.js";
import {
  IServiceType,
  ICreateServiceTypeInput,
  IUpdateServiceTypeInput,
} from "../interfaces/serviceType/commonInterface.js";

export class ServiceTypeRepositories implements IServiceTypeRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  create = async (data: ICreateServiceTypeInput): Promise<IServiceType> => {
    const created = await this.prisma.serviceType.create({
      data: {
        name: data.name,
        monthlyPrice: data.monthlyPrice !== undefined ? data.monthlyPrice : 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    return {
      id: created.id,
      name: created.name,
      monthlyPrice:
        created.monthlyPrice !== null ? Number(created.monthlyPrice) : 0,
      isActive: created.isActive,
    };
  };

  getAll = async (): Promise<IServiceType[]> => {
    const list = await this.prisma.serviceType.findMany({
      orderBy: { createdAt: "asc" },
    });

    return list.map((item) => ({
      id: item.id,
      name: item.name,
      monthlyPrice: item.monthlyPrice !== null ? Number(item.monthlyPrice) : 0,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  };

  getById = async (id: string): Promise<IServiceType | null> => {
    const item = await this.prisma.serviceType.findUnique({
      where: { id },
    });

    if (!item) return null;

    return {
      id: item.id,
      name: item.name,
      monthlyPrice: item.monthlyPrice !== null ? Number(item.monthlyPrice) : 0,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  };

  update = async (
    id: string,
    data: IUpdateServiceTypeInput,
  ): Promise<IServiceType> => {
    const updated = await this.prisma.serviceType.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.monthlyPrice !== undefined && {
          monthlyPrice: data.monthlyPrice,
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      monthlyPrice:
        updated.monthlyPrice !== null ? Number(updated.monthlyPrice) : 0,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  };
}
