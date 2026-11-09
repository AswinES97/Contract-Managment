import { PrismaClient } from "../generated/prisma/client.js";
import {
  IContractRecord,
  IContractFilter,
  ContractStatus,
} from "../interfaces/contract/commonInterface.js";
import { IContractRepository } from "../interfaces/contract/repositoryInterface.js";

const contractInclude = {
  customer: {
    select: {
      id: true,
      name: true,
      cloudAccounts: {
        select: {
          id: true,
          provider: true,
          externalAccountId: true,
        },
      },
    },
  },
  services: {
    include: {
      serviceType: {
        select: {
          id: true,
          name: true,
        },
      },
      discounts: {
        orderBy: { effectiveFrom: "desc" as const },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
  onboardingSteps: {
    select: {
      step: true,
      completed: true,
      status: true,
    },
    orderBy: { step: "asc" as const },
  },
};

export class ContractRepositories implements IContractRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private formatContract(contract: any): IContractRecord {
    const completedSteps = (contract.onboardingSteps || []).filter(
      (s: any) => s.completed,
    );
    const highestStep =
      completedSteps.length > 0
        ? Math.max(...completedSteps.map((s: any) => s.step))
        : 1;

    const isOnboardingComplete =
      Boolean(contract.onboardingCompletedAt) || contract.status === "ACTIVE";

    return {
      id: contract.id,
      customerId: contract.customerId,
      customerName: contract.customer?.name || "Unknown Customer",
      scopeDescription: contract.scopeDescription || "",
      startDate: contract.startDate
        ? contract.startDate.toISOString().slice(0, 10)
        : "",
      endDate: contract.endDate
        ? contract.endDate.toISOString().slice(0, 10)
        : "",
      status: contract.status as ContractStatus,
      billingFrequency: contract.billingFrequency || "Monthly",
      billingTiming: contract.billingTiming || "In advance",
      onboardingCompleted: isOnboardingComplete,
      onboardingStep: isOnboardingComplete ? 5 : highestStep,
      createdAt:
        contract.createdAt instanceof Date
          ? contract.createdAt.toISOString()
          : String(contract.createdAt),
      updatedAt:
        contract.updatedAt instanceof Date
          ? contract.updatedAt.toISOString()
          : String(contract.updatedAt),
      services: (contract.services || []).map((s: any) => ({
        id: s.id,
        serviceTypeId: s.serviceTypeId,
        serviceTypeName: s.serviceType?.name || "Service",
        monthlyAmount:
          s.monthlyAmount !== null && s.monthlyAmount !== undefined
            ? Number(s.monthlyAmount)
            : undefined,
        startDate: s.startDate
          ? s.startDate.toISOString().slice(0, 10)
          : "",
        endDate: s.endDate ? s.endDate.toISOString().slice(0, 10) : undefined,
        discountPercentage:
          s.discounts && s.discounts.length > 0
            ? Number(s.discounts[0].percentage)
            : undefined,
      })),
      cloudAccounts: (contract.customer?.cloudAccounts || []).map((ca: any) => ({
        id: ca.id,
        provider: ca.provider,
        externalAccountId: ca.externalAccountId,
      })),
    };
  }

  async getAll(filter?: IContractFilter): Promise<IContractRecord[]> {
    const where: any = {};

    if (filter?.status && filter.status !== "ALL") {
      where.status = filter.status;
    }

    if (filter?.customerId) {
      where.customerId = filter.customerId;
    }

    if (filter?.search?.trim()) {
      const searchTerm = filter.search.trim();
      where.OR = [
        { scopeDescription: { contains: searchTerm, mode: "insensitive" } },
        { customer: { name: { contains: searchTerm, mode: "insensitive" } } },
      ];
    }

    const contracts = await this.prisma.contract.findMany({
      where,
      include: contractInclude,
      orderBy: { createdAt: "desc" },
    });

    return contracts.map((c) => this.formatContract(c));
  }

  async getById(id: string): Promise<IContractRecord | null> {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: contractInclude,
    });

    if (!contract) return null;
    return this.formatContract(contract);
  }

  async updateStatus(
    id: string,
    status: ContractStatus,
  ): Promise<IContractRecord> {
    const contract = await this.prisma.contract.update({
      where: { id },
      data: { status },
      include: contractInclude,
    });

    return this.formatContract(contract);
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.contract.delete({
      where: { id },
    });
    return true;
  }
}
