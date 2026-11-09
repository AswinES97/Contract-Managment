export type InvoiceState = "PENDING" | "RAISED" | "COMPLETED";
export type BillLineSourceType = "FIXED_SERVICE" | "CLOUD_USAGE";

export interface IBillLineItemRecord {
  id: string;
  description: string;
  sourceType: BillLineSourceType;
  quantity: number;
  unitAmount: number;
  discountPercentage: number;
  finalAmount: number;
}

export interface IInvoiceStatusRecord {
  status: InvoiceState;
  invoiceNumber?: string;
  invoiceDate?: string;
  checkedAt: string;
}

export interface IBillRecord {
  id: string;
  contractId: string;
  customerId: string;
  customerName: string;
  periodStart: string;
  periodEnd: string;
  billingMonth: string;
  currency: string;
  fixedAmount: number;
  cloudUsageAmount: number;
  cloudDiscountAmount: number;
  totalAmount: number;
  createdAt: string;
  invoiceStatus: IInvoiceStatusRecord;
  lineItems: IBillLineItemRecord[];
}

export interface IGenerateBillsResult {
  generatedCount: number;
  bills: IBillRecord[];
}
