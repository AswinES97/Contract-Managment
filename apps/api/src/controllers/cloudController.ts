import type { Request, Response } from "express";
import type { ICloudService } from "../interfaces/cloud/serviceInterface.js";

export class CloudController {
  private service: ICloudService;

  constructor(service: ICloudService) {
    this.service = service;
  }

  getUsage = async (req: Request, res: Response): Promise<void> => {
    try {
      const records = await this.service.getAllUsage();
      res.status(200).json({
        message: "Cloud usage records fetched successfully",
        data: records,
      });
    } catch (err) {
      console.error("CloudController.getUsage error:", err);
      res.status(500).json({ message: "Failed to fetch cloud usage records" });
    }
  };

  getAccounts = async (req: Request, res: Response): Promise<void> => {
    try {
      const accounts = await this.service.getAllAccounts();
      res.status(200).json({
        message: "Cloud accounts fetched successfully",
        data: accounts,
      });
    } catch (err) {
      console.error("CloudController.getAccounts error:", err);
      res.status(500).json({ message: "Failed to fetch cloud accounts" });
    }
  };

  syncAws = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.syncAwsUsage();
      res.status(200).json({
        message: `AWS cloud usage synchronized for ${result.syncedAccounts} account(s)`,
        data: result,
      });
    } catch (err) {
      console.error("CloudController.syncAws error:", err);
      res.status(500).json({ message: "Failed to sync AWS cloud usage" });
    }
  };

  recordAzure = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = req.body.records || req.body;
      const records = await this.service.recordAzureUsage(payload);
      res.status(201).json({
        message: "Azure cloud usage recorded successfully",
        data: records,
      });
    } catch (err) {
      console.error("CloudController.recordAzure error:", err);
      res.status(500).json({
        message:
          err instanceof Error
            ? err.message
            : "Failed to record Azure cloud usage",
      });
    }
  };
}
