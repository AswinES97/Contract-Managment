import { PrismaClient } from "../../generated/prisma/client.js";
import type { IBillRepository } from "../../interfaces/billing/repositoryInterface.js";
import type { IBillService } from "../../interfaces/billing/serviceInterface.js";
import type {
  IBillRecord,
  IGenerateBillsResult,
} from "../../interfaces/billing/commonInterface.js";
import type { ICalculateBillsOptions } from "../../interfaces/billing/serviceInterface.js";
import {
  FinanceSystemStubClient,
  type IFinanceSystemClient,
} from "./financeClient.js";

export class BillingService implements IBillService {
  private repository: IBillRepository;
  private prisma: PrismaClient;
  private financeClient: IFinanceSystemClient;

  constructor(
    repository: IBillRepository,
    prisma: PrismaClient,
    financeClient: IFinanceSystemClient = new FinanceSystemStubClient(),
  ) {
    this.repository = repository;
    this.prisma = prisma;
    this.financeClient = financeClient;
  }

  getAllBills = async (filter?: {
    contractId?: string;
    customerId?: string;
  }): Promise<IBillRecord[]> => {
    let bills = await this.repository.getAll(filter);
    if (bills.length === 0) {
      await this.calculateBills();
      bills = await this.repository.getAll(filter);
    }
    return bills;
  };

  getBillById = async (id: string): Promise<IBillRecord | null> => {
    return this.repository.getById(id);
  };

  calculateBills = async (
    options?: ICalculateBillsOptions,
  ): Promise<IGenerateBillsResult> => {

    const contracts = await this.prisma.contract.findMany({
      where: {
        status: "ACTIVE",
        customer: {
          status: "ACTIVE",
        },
        OR: [
          { onboardingCompletedAt: { not: null } },
          {
            AND: [
              { onboardingSteps: { some: { completed: true } } },
              { onboardingSteps: { none: { completed: false } } },
            ],
          },
        ],
      },
      include: {
        customer: {
          include: {
            cloudAccounts: {
              include: {
                usage: {
                  orderBy: { billingMonth: "desc" },
                },
              },
            },
          },
        },
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
    });

    const generatedBills: IBillRecord[] = [];

    for (const contract of contracts) {
      const lineItems: Array<{
        description: string;
        sourceType: "FIXED_SERVICE" | "CLOUD_USAGE";
        quantity: number;
        unitAmount: number;
        discountPercentage: number;
        finalAmount: number;
      }> = [];

      let fixedTotal = 0;
      let cloudUsageTotal = 0;
      let cloudDiscountTotal = 0;


      for (const service of contract.services) {
        if (service.monthlyAmount && Number(service.monthlyAmount) > 0) {
          const monthlyFee = Number(service.monthlyAmount);

          const freq = contract.billingFrequency || "Monthly";
          const multiplier = freq === "Quarterly" ? 3 : freq === "Yearly" ? 12 : 1;
          const totalFee = monthlyFee * multiplier;

          lineItems.push({
            description: `${service.serviceType.name} (${freq} - ${contract.billingTiming || "In advance"})`,
            sourceType: "FIXED_SERVICE",
            quantity: multiplier,
            unitAmount: monthlyFee,
            discountPercentage: 0,
            finalAmount: totalFee,
          });

          fixedTotal += totalFee;
        }
      }

      for (const account of contract.customer.cloudAccounts || []) {
        for (const usage of account.usage || []) {
          const rawAmount = Number(usage.amount);
          // Find discount for this provider
          const providerKeyword = account.provider.toLowerCase();
          const cloudService = contract.services.find(
            (s) =>
              s.serviceType.name.toLowerCase().includes(providerKeyword) ||
              (providerKeyword === "aws" &&
                s.serviceType.name.toLowerCase().includes("aws")) ||
              (providerKeyword === "azure" &&
                s.serviceType.name.toLowerCase().includes("azure")),
          );

          const discountPct =
            cloudService &&
            cloudService.discounts &&
            cloudService.discounts.length > 0
              ? Number(cloudService.discounts[0].percentage)
              : 0;

          const discountAmount = Math.round((rawAmount * discountPct) / 100);
          const finalAmount = rawAmount - discountAmount;

          const monthLabel = usage.billingMonth.toISOString().slice(0, 7);

          lineItems.push({
            description: `${account.provider} Cloud Usage (${monthLabel} - Account: ${account.externalAccountId})`,
            sourceType: "CLOUD_USAGE",
            quantity: 1,
            unitAmount: rawAmount,
            discountPercentage: discountPct,
            finalAmount,
          });

          cloudUsageTotal += rawAmount;
          cloudDiscountTotal += discountAmount;
        }
      }

      if (lineItems.length === 0) {
        lineItems.push({
          description: `${contract.scopeDescription || "Managed Services Base Agreement"}`,
          sourceType: "FIXED_SERVICE",
          quantity: 1,
          unitAmount: 2500,
          discountPercentage: 0,
          finalAmount: 2500,
        });
        fixedTotal = 2500;
      }

      const totalAmount = fixedTotal + (cloudUsageTotal - cloudDiscountTotal);

      const periodStart =
        options?.periodStart || contract.startDate || new Date("2026-10-01");
      const periodEnd =
        options?.periodEnd || contract.endDate || new Date("2026-12-31");
      const billingMonth = options?.billingMonth || "Q4 2026";

      const created = await this.repository.createBill({
        contractId: contract.id,
        periodStart,
        periodEnd,
        billingMonth,
        currency: "AED",
        fixedAmount: fixedTotal,
        cloudUsageAmount: cloudUsageTotal,
        cloudDiscountAmount: cloudDiscountTotal,
        totalAmount,
        lineItems,
        invoiceStatus: {
          status: "PENDING",
        },
      });

      generatedBills.push(created);
    }

    return {
      generatedCount: generatedBills.length,
      bills: generatedBills,
    };
  };

  syncInvoiceStatus = async (billId: string): Promise<IBillRecord> => {
    const bill = await this.repository.getById(billId);
    if (!bill) {
      throw new Error(`Bill not found with ID ${billId}`);
    }

    const financeResponse = await this.financeClient.checkInvoiceStatus({
      customerName: bill.customerName,
      billingMonth: bill.billingMonth,
      amount: bill.totalAmount,
      currentStatus: bill.invoiceStatus.status,
      invoiceNumber: bill.invoiceStatus.invoiceNumber,
    });

    const invoiceDate = financeResponse.invoiceDate
      ? new Date(financeResponse.invoiceDate)
      : undefined;

    await this.repository.updateInvoiceStatus(
      billId,
      financeResponse.status,
      financeResponse.invoiceNumber,
      invoiceDate,
    );

    const updated = await this.repository.getById(billId);
    return updated!;
  };
}
