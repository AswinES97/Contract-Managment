import type { IDashboardRepository } from "../../interfaces/dashboard/repositoryInterface.js";
import type { IDashboardService } from "../../interfaces/dashboard/serviceInterface.js";
import type { IDashboardStats } from "../../interfaces/dashboard/commonInterface.js";

export class DashboardService implements IDashboardService {
  private repository: IDashboardRepository;

  constructor(repository: IDashboardRepository) {
    this.repository = repository;
  }

  async getStats(): Promise<IDashboardStats> {
    return this.repository.getStats();
  }
}
