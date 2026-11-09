import type { IDashboardStats } from "./commonInterface.js";

export interface IDashboardRepository {
  getStats(): Promise<IDashboardStats>;
}
