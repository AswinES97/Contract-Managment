import { PrismaClient } from "../generated/prisma/client.js";
import type {
  IDashboardStats,
  IDashboardRecentContract,
  IDashboardRecentCustomer,
  IDashboardCloudUsageItem,
} from "../interfaces/dashboard/commonInterface.js";
import type { IDashboardRepository } from "../interfaces/dashboard/repositoryInterface.js";

export class DashboardRepository implements IDashboardRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getStats(): Promise<IDashboardStats> {
    const [
      totalCustomers,
      activeCustomers,
      totalContracts,
      activeContracts,
      draftContracts,
      mrrResult,
      onboardingInProgressContracts,
      recentContractsRaw,
      recentCustomersRaw,
      recentCloudUsageRaw,
    ] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.customer.count({ where: { status: "ACTIVE" } }),
      this.prisma.contract.count(),
      this.prisma.contract.count({ where: { status: "ACTIVE" } }),
      this.prisma.contract.count({ where: { status: "DRAFT" } }),
      // Sum monthly_amount for active contract services on active contracts
      this.prisma.contractService.aggregate({
        _sum: { monthlyAmount: true },
        where: {
          contract: { status: "ACTIVE" },
          monthlyAmount: { not: null },
        },
      }),
      // Contracts that have at least one PENDING onboarding step
      this.prisma.contract.count({
        where: {
          onboardingSteps: {
            some: { status: "PENDING" },
          },
        },
      }),
      this.prisma.contract.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { id: true, name: true } },
          onboardingSteps: { select: { completed: true } },
        },
      }),
      this.prisma.customer.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { contracts: true } },
        },
      }),
      this.prisma.cloudUsageMonthly.findMany({
        take: 10,
        orderBy: { billingMonth: "desc" },
        include: {
          cloudAccount: {
            include: {
              customer: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    const recentContracts: IDashboardRecentContract[] = recentContractsRaw.map(
      (c) => ({
        id: c.id,
        customerId: c.customerId,
        customerName: c.customer?.name ?? "Unknown",
        scopeDescription: c.scopeDescription ?? "",
        status: c.status,
        startDate: c.startDate ? c.startDate.toISOString().slice(0, 10) : "",
        endDate: c.endDate ? c.endDate.toISOString().slice(0, 10) : "",
        billingFrequency: c.billingFrequency ?? "Monthly",
        billingTiming: c.billingTiming ?? "In advance",
        onboardingCompleted:
          Boolean(c.onboardingCompletedAt) || c.status === "ACTIVE",
        createdAt: c.createdAt.toISOString(),
      }),
    );

    const recentCustomers: IDashboardRecentCustomer[] = recentCustomersRaw.map(
      (c) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        contractCount: c._count.contracts,
        createdAt: c.createdAt.toISOString(),
      }),
    );

    const recentCloudUsage: IDashboardCloudUsageItem[] = recentCloudUsageRaw.map(
      (u) => ({
        id: u.id,
        provider: u.cloudAccount.provider,
        externalAccountId: u.cloudAccount.externalAccountId,
        customerName: u.cloudAccount.customer?.name ?? "Unknown",
        billingMonth: u.billingMonth.toISOString().slice(0, 7),
        amount: Number(u.amount),
        currency: u.currency,
      }),
    );

    return {
      totalCustomers,
      activeCustomers,
      totalContracts,
      activeContracts,
      draftContracts,
      monthlyRecurringRevenue: Number(mrrResult._sum.monthlyAmount ?? 0),
      onboardingInProgress: onboardingInProgressContracts,
      recentContracts,
      recentCustomers,
      recentCloudUsage,
    };
  }
}
