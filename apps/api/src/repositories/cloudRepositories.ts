import { PrismaClient } from "../generated/prisma/client.js";
import type { ICloudRepository } from "../interfaces/cloud/repositoriesInterface.js";
import type {
  IBaseCloudAccountBody,
  ICloudAccountResponse,
  ICloudUsageRecord,
  IRecordAzureUsageItem,
  CloudProvider,
} from "../interfaces/cloud/commonInterface.js";

export class CloudRepositories implements ICloudRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  createCloudDetails = async (
    body: IBaseCloudAccountBody,
  ): Promise<ICloudAccountResponse> => {
    const cloudAccount = await this.prisma.cloudAccount.create({
      data: {
        customer: {
          connect: {
            id: body.customerId,
          },
        },
        provider: body.provider,
        externalAccountId: body.externalAccountId,
        isActive: body.isActive ?? true,
      },
      select: {
        id: true,
        customerId: true,
        provider: true,
        externalAccountId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      id: cloudAccount.id,
      customerId: cloudAccount.customerId,
      customerName: cloudAccount.customer?.name,
      provider: cloudAccount.provider as CloudProvider,
      externalAccountId: cloudAccount.externalAccountId,
      isActive: cloudAccount.isActive,
      createdAt: cloudAccount.createdAt.toISOString(),
      updatedAt: cloudAccount.updatedAt.toISOString(),
    };
  };

  getAllCloudAccounts = async (): Promise<ICloudAccountResponse[]> => {
    const accounts = await this.prisma.cloudAccount.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return accounts.map((a) => ({
      id: a.id,
      customerId: a.customerId,
      customerName: a.customer.name,
      provider: a.provider as CloudProvider,
      externalAccountId: a.externalAccountId,
      isActive: a.isActive,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));
  };

  private getDiscountForProvider(
    contracts: Array<{
      services: Array<{
        serviceType: { name: string };
        discounts: Array<{ percentage: unknown }>;
      }>;
    }>,
    provider: CloudProvider,
  ): number {
    const providerKeyword = provider.toLowerCase();
    for (const contract of contracts) {
      for (const service of contract.services) {
        if (
          service.serviceType.name.toLowerCase().includes(providerKeyword) ||
          (providerKeyword === "aws" && service.serviceType.name.toLowerCase().includes("aws")) ||
          (providerKeyword === "azure" && service.serviceType.name.toLowerCase().includes("azure"))
        ) {
          if (service.discounts && service.discounts.length > 0) {
            return Number(service.discounts[0].percentage);
          }
        }
      }
    }
    return 0;
  }

  getAllCloudUsage = async (): Promise<ICloudUsageRecord[]> => {
    const usages = await this.prisma.cloudUsageMonthly.findMany({
      include: {
        cloudAccount: {
          include: {
            customer: {
              include: {
                contracts: {
                  where: { status: "ACTIVE" },
                  include: {
                    services: {
                      include: {
                        serviceType: { select: { name: true } },
                        discounts: {
                          orderBy: { effectiveFrom: "desc" },
                          take: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ billingMonth: "desc" }, { fetchedAt: "desc" }],
    });

    return usages.map((u) => {
      const provider = u.cloudAccount.provider as CloudProvider;
      const contracts = u.cloudAccount.customer.contracts || [];
      const discount = this.getDiscountForProvider(contracts, provider);
      const amount = Number(u.amount);
      const discountAmount = Math.round((amount * discount) / 100);
      const netAmount = amount - discountAmount;

      return {
        id: u.id,
        cloudAccountId: u.cloudAccountId,
        customerId: u.cloudAccount.customerId,
        customerName: u.cloudAccount.customer.name,
        provider,
        externalAccountId: u.cloudAccount.externalAccountId,
        billingMonth: u.billingMonth.toISOString().slice(0, 7),
        amount,
        currency: u.currency,
        fetchedAt: u.fetchedAt.toISOString().replace("T", " ").slice(0, 19),
        discountPercentage: discount,
        netAmount,
      };
    });
  };

  upsertUsageRecord = async (
    cloudAccountId: string,
    billingMonth: Date,
    amount: number,
    currency?: string,
    fetchedAt?: Date,
  ): Promise<void> => {
    await this.prisma.cloudUsageMonthly.upsert({
      where: {
        cloudAccountId_billingMonth: {
          cloudAccountId,
          billingMonth,
        },
      },
      create: {
        cloudAccountId,
        billingMonth,
        amount,
        currency: currency || "AED",
        fetchedAt: fetchedAt || new Date(),
      },
      update: {
        amount,
        currency: currency || "AED",
        fetchedAt: fetchedAt || new Date(),
      },
    });
  };

  findCloudAccount = async (
    provider: CloudProvider,
    externalAccountId: string,
  ): Promise<{ id: string; customerId: string; customerName: string } | null> => {
    const account = await this.prisma.cloudAccount.findUnique({
      where: {
        provider_externalAccountId: {
          provider,
          externalAccountId,
        },
      },
      include: {
        customer: { select: { id: true, name: true } },
      },
    });

    if (!account) return null;
    return {
      id: account.id,
      customerId: account.customerId,
      customerName: account.customer.name,
    };
  };

  ensureCloudAccount = async (
    customerId: string,
    provider: CloudProvider,
    externalAccountId: string,
  ): Promise<{ id: string; customerId: string; customerName: string }> => {
    const existing = await this.findCloudAccount(provider, externalAccountId);
    if (existing) return existing;

    const created = await this.prisma.cloudAccount.create({
      data: {
        customerId,
        provider,
        externalAccountId,
        isActive: true,
      },
      include: {
        customer: { select: { id: true, name: true } },
      },
    });

    return {
      id: created.id,
      customerId: created.customerId,
      customerName: created.customer.name,
    };
  };

  getAwsAccounts = async (): Promise<
    Array<{
      id: string;
      customerId: string;
      customerName: string;
      externalAccountId: string;
    }>
  > => {
    const accounts = await this.prisma.cloudAccount.findMany({
      where: {
        provider: "AWS",
        isActive: true,
      },
      include: {
        customer: { select: { id: true, name: true } },
      },
    });

    return accounts.map((a) => ({
      id: a.id,
      customerId: a.customerId,
      customerName: a.customer.name,
      externalAccountId: a.externalAccountId,
    }));
  };

  upsertAzureUsage = async (
    item: IRecordAzureUsageItem,
  ): Promise<ICloudUsageRecord> => {
    // 1. Resolve Customer
    let customerId = item.customerId;
    if (!customerId) {
      if (item.customerName) {
        const found = await this.prisma.customer.findFirst({
          where: { name: { contains: item.customerName, mode: "insensitive" } },
        });
        if (found) {
          customerId = found.id;
        }
      }
    }

    if (!customerId) {
      // Find customer from existing cloud account with this account id
      const existingAccount = await this.findCloudAccount(
        "AZURE",
        item.externalAccountId,
      );
      if (existingAccount) {
        customerId = existingAccount.customerId;
      }
    }

    if (!customerId) {
      // Pick first active customer or fallback customer
      const fallbackCustomer = await this.prisma.customer.findFirst({
        where: { status: "ACTIVE" },
      });
      if (!fallbackCustomer) {
        throw new Error(
          "No active customer found to associate Azure cloud account",
        );
      }
      customerId = fallbackCustomer.id;
    }

    // 2. Ensure cloud account exists
    const cloudAccount = await this.ensureCloudAccount(
      customerId,
      "AZURE",
      item.externalAccountId,
    );

    // 3. Normalize billing month (YYYY-MM to YYYY-MM-01 Date)
    const monthStr = item.billingMonth.includes("-")
      ? item.billingMonth.length === 7
        ? `${item.billingMonth}-01`
        : item.billingMonth
      : `${item.billingMonth.slice(0, 4)}-${item.billingMonth.slice(4, 6)}-01`;
    const billingDate = new Date(monthStr);

    const now = new Date();
    await this.upsertUsageRecord(
      cloudAccount.id,
      billingDate,
      Number(item.amount),
      item.currency || "AED",
      now,
    );

    // 4. Return formatted record with discount
    const customerWithContracts = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        contracts: {
          where: { status: "ACTIVE" },
          include: {
            services: {
              include: {
                serviceType: true,
                discounts: {
                  orderBy: { effectiveFrom: "desc" },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    const contracts = customerWithContracts?.contracts || [];
    const discount = this.getDiscountForProvider(contracts, "AZURE");
    const amount = Number(item.amount);
    const netAmount = amount - Math.round((amount * discount) / 100);

    return {
      id: `${cloudAccount.id}-${monthStr}`,
      cloudAccountId: cloudAccount.id,
      customerId,
      customerName: cloudAccount.customerName,
      provider: "AZURE",
      externalAccountId: item.externalAccountId,
      billingMonth: monthStr.slice(0, 7),
      amount,
      currency: item.currency || "AED",
      fetchedAt: now.toISOString().replace("T", " ").slice(0, 19),
      discountPercentage: discount,
      netAmount,
    };
  };
}
