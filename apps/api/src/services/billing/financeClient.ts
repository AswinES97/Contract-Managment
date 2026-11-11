import type { InvoiceState } from "../../interfaces/billing/commonInterface.js";

export interface IFinanceCheckRequest {
  customerName: string;
  billingMonth: string;
  amount: number;
  currentStatus?: InvoiceState;
  invoiceNumber?: string;
}

export interface IFinanceCheckResponse {
  status: InvoiceState;
  invoiceNumber: string;
  invoiceDate: string; // YYYY-MM-DD
  checkedAt: string;
  source: string;
}

export interface IFinanceSystemClient {
  checkInvoiceStatus(
    request: IFinanceCheckRequest,
  ): Promise<IFinanceCheckResponse>;
}
export class FinanceSystemStubClient implements IFinanceSystemClient {
  async checkInvoiceStatus(
    request: IFinanceCheckRequest,
  ): Promise<IFinanceCheckResponse> {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const checkedAtStr = now.toISOString().replace("T", " ").slice(0, 19);

    if (request.currentStatus === "COMPLETED") {
      return {
        status: "COMPLETED",
        invoiceNumber:
          request.invoiceNumber ||
          `INV-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        invoiceDate: todayStr,
        checkedAt: checkedAtStr,
        source: "ERP REST API (Token Auth)",
      };
    }

    const nextStatus: InvoiceState =
      request.currentStatus === "RAISED" ? "COMPLETED" : "RAISED";

    const invoiceNumber =
      request.invoiceNumber ||
      `INV-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      status: nextStatus,
      invoiceNumber,
      invoiceDate: todayStr,
      checkedAt: checkedAtStr,
      source: "ERP REST API (Token Auth)",
    };
  }
}
