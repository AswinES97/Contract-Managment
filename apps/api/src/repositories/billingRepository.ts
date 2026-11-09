import { PrismaClient } from "../generated/prisma/client.js";
import type {
  IBillRecord,
  InvoiceState,
  IInvoiceStatusRecord,
  IBillLineItemRecord,
  BillLineSourceType,
} from "../interfaces/billing/commonInterface.js";
import type {
  IBillRepository,
  ICreateBillInput,
} from "../interfaces/billing/repositoryInterface.js";

const billInclude = {
  contract: {
    select: {
      id: true,
      customerId: true,
      customer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  lineItems: {
    orderBy: { createdAt: "asc" as const },
  },
  invoiceStatus: true,
};

export class BillingRepository implements IBillRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private formatBill(bill: any): IBillRecord {
    return {
      id: bill.id,
      contractId: bill.contractId,
      customerId: bill.contract.customerId,
      customerName: bill.contract.customer?.name || "Unknown Customer",
      periodStart: bill.periodStart
        ? bill.periodStart.toISOString().slice(0, 10)
        : "",
      periodEnd: bill.periodEnd
        ? bill.periodEnd.toISOString().slice(0, 10)
        : "",
      billingMonth: bill.billingMonth,
      currency: bill.currency,
      fixedAmount: Number(bill.fixedAmount),
      cloudUsageAmount: Number(bill.cloudUsageAmount),
      cloudDiscountAmount: Number(bill.cloudDiscountAmount),
      totalAmount: Number(bill.totalAmount),
      createdAt: bill.createdAt.toISOString(),
      invoiceStatus: {
        status: (bill.invoiceStatus?.status || "PENDING") as InvoiceState,
        invoiceNumber: bill.invoiceStatus?.invoiceNumber || undefined,
        invoiceDate: bill.invoiceStatus?.invoiceDate
          ? bill.invoiceStatus.invoiceDate.toISOString().slice(0, 10)
          : undefined,
        checkedAt: bill.invoiceStatus?.checkedAt
          ? bill.invoiceStatus.checkedAt
              .toISOString()
              .replace("T", " ")
              .slice(0, 19)
          : new Date().toISOString().replace("T", " ").slice(0, 19),
      },
      lineItems: (bill.lineItems || []).map((li: any): IBillLineItemRecord => ({
        id: li.id,
        description: li.description,
        sourceType: li.sourceType as BillLineSourceType,
        quantity: Number(li.quantity),
        unitAmount: Number(li.unitAmount),
        discountPercentage: Number(li.discountPercentage),
        finalAmount: Number(li.finalAmount),
      })),
    };
  }

  getAll = async (filter?: {
    contractId?: string;
    customerId?: string;
  }): Promise<IBillRecord[]> => {
    const where: any = {};
    if (filter?.contractId) {
      where.contractId = filter.contractId;
    }
    if (filter?.customerId) {
      where.contract = { customerId: filter.customerId };
    }

    const bills = await this.prisma.bill.findMany({
      where,
      include: billInclude,
      orderBy: [{ periodEnd: "desc" }, { createdAt: "desc" }],
    });

    return bills.map((b) => this.formatBill(b));
  };

  getById = async (id: string): Promise<IBillRecord | null> => {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
      include: billInclude,
    });

    if (!bill) return null;
    return this.formatBill(bill);
  };

  createBill = async (data: ICreateBillInput): Promise<IBillRecord> => {
    const existing = await this.prisma.bill.findUnique({
      where: {
        contractId_periodStart_periodEnd: {
          contractId: data.contractId,
          periodStart: data.periodStart,
          periodEnd: data.periodEnd,
        },
      },
      include: billInclude,
    });

    if (existing) {
      return this.formatBill(existing);
    }

    const bill = await this.prisma.bill.create({
      data: {
        contractId: data.contractId,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        billingMonth: data.billingMonth,
        currency: data.currency || "AED",
        fixedAmount: data.fixedAmount,
        cloudUsageAmount: data.cloudUsageAmount,
        cloudDiscountAmount: data.cloudDiscountAmount,
        totalAmount: data.totalAmount,
        lineItems: {
          create: data.lineItems.map((li) => ({
            description: li.description,
            sourceType: li.sourceType,
            quantity: li.quantity,
            unitAmount: li.unitAmount,
            discountPercentage: li.discountPercentage,
            finalAmount: li.finalAmount,
          })),
        },
        invoiceStatus: {
          create: {
            status: data.invoiceStatus?.status || "PENDING",
            invoiceNumber: data.invoiceStatus?.invoiceNumber,
            invoiceDate: data.invoiceStatus?.invoiceDate,
          },
        },
      },
      include: billInclude,
    });

    return this.formatBill(bill);
  };

  updateInvoiceStatus = async (
    billId: string,
    status: InvoiceState,
    invoiceNumber?: string,
    invoiceDate?: Date,
  ): Promise<IInvoiceStatusRecord> => {
    const now = new Date();
    const inv = await this.prisma.invoiceStatus.upsert({
      where: { billId },
      create: {
        billId,
        status,
        invoiceNumber,
        invoiceDate,
        checkedAt: now,
      },
      update: {
        status,
        invoiceNumber: invoiceNumber !== undefined ? invoiceNumber : undefined,
        invoiceDate: invoiceDate !== undefined ? invoiceDate : undefined,
        checkedAt: now,
      },
    });

    return {
      status: inv.status as InvoiceState,
      invoiceNumber: inv.invoiceNumber || undefined,
      invoiceDate: inv.invoiceDate
        ? inv.invoiceDate.toISOString().slice(0, 10)
        : undefined,
      checkedAt: inv.checkedAt.toISOString().replace("T", " ").slice(0, 19),
    };
  };
}
