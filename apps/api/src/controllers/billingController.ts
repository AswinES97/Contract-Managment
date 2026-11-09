import type { Request, Response } from "express";
import type { IBillService } from "../interfaces/billing/serviceInterface.js";

export class BillingController {
  private service: IBillService;

  constructor(service: IBillService) {
    this.service = service;
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const { contractId, customerId } = req.query;
      const bills = await this.service.getAllBills({
        contractId: typeof contractId === "string" ? contractId : undefined,
        customerId: typeof customerId === "string" ? customerId : undefined,
      });

      res.status(200).json({
        message: "Bills fetched successfully",
        data: bills,
      });
    } catch (err) {
      console.error("BillingController.getAll error:", err);
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const bill = await this.service.getBillById(id);
      if (!bill) {
        res.status(404).json({ message: "Bill not found" });
        return;
      }
      res.status(200).json({
        message: "Bill fetched successfully",
        data: bill,
      });
    } catch (err) {
      console.error("BillingController.getById error:", err);
      res.status(500).json({ message: "Failed to fetch bill details" });
    }
  };

  calculate = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.calculateBills();
      res.status(200).json({
        message: `Calculated ${result.generatedCount} bill(s) successfully`,
        data: result,
      });
    } catch (err) {
      console.error("BillingController.calculate error:", err);
      res.status(500).json({ message: "Failed to calculate bills" });
    }
  };

  syncInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const bill = await this.service.syncInvoiceStatus(id);
      res.status(200).json({
        message: "Invoice status refreshed via finance system stub API",
        data: bill,
      });
    } catch (err) {
      console.error("BillingController.syncInvoice error:", err);
      res.status(500).json({
        message:
          err instanceof Error
            ? err.message
            : "Failed to sync invoice status with finance system",
      });
    }
  };
}
