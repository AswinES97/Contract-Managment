import type { IDashboardStats } from "./commonInterface.js";

export interface IDashboardService {
  getStats(): Promise<IDashboardStats>;
}
