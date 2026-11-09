import type {
  IBillRecord,
  IGenerateBillsResult,
} from "./commonInterface.js";

export interface ICalculateBillsOptions {
  billingMonth?: string;
  periodStart?: Date;
  periodEnd?: Date;
}

export interface IBillService {
  getAllBills(filter?: {
    contractId?: string;
    customerId?: string;
  }): Promise<IBillRecord[]>;
  getBillById(id: string): Promise<IBillRecord | null>;
  calculateBills(options?: ICalculateBillsOptions): Promise<IGenerateBillsResult>;
  syncInvoiceStatus(billId: string): Promise<IBillRecord>;
}
