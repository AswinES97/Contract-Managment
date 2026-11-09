import type { Request, Response } from "express";
import type { IDashboardService } from "../interfaces/dashboard/serviceInterface.js";

export class DashboardController {
  private service: IDashboardService;

  constructor(service: IDashboardService) {
    this.service = service;
  }

  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.service.getStats();
      res.status(200).json({ message: "Dashboard stats fetched", data: stats });
    } catch (err) {
      console.error("DashboardController.getStats error:", err);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  };
}
