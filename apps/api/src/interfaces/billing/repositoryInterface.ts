import type {
  IBillRecord,
  InvoiceState,
  IInvoiceStatusRecord,
  BillLineSourceType,
} from "./commonInterface.js";

export interface ICreateBillInput {
  contractId: string;
  periodStart: Date;
  periodEnd: Date;
  billingMonth: string;
  currency?: string;
  fixedAmount: number;
  cloudUsageAmount: number;
  cloudDiscountAmount: number;
  totalAmount: number;
  lineItems: Array<{
    description: string;
    sourceType: BillLineSourceType;
    quantity: number;
    unitAmount: number;
    discountPercentage: number;
    finalAmount: number;
  }>;
  invoiceStatus?: {
    status: InvoiceState;
    invoiceNumber?: string;
    invoiceDate?: Date;
  };
}

export interface IBillRepository {
  getAll(filter?: {
    contractId?: string;
    customerId?: string;
  }): Promise<IBillRecord[]>;
  getById(id: string): Promise<IBillRecord | null>;
  createBill(data: ICreateBillInput): Promise<IBillRecord>;
  updateInvoiceStatus(
    billId: string,
    status: InvoiceState,
    invoiceNumber?: string,
    invoiceDate?: Date,
  ): Promise<IInvoiceStatusRecord>;
}
