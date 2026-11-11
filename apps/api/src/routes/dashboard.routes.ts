import { Router } from "express";
import prisma from "../config/prismaConfig.js";
import { DashboardRepository } from "../repositories/dashboardRepository.js";
import { DashboardService } from "../services/dashboard/dashboardService.js";
import { DashboardController } from "../controllers/dashboardController.js";
import { readRoles } from "../config/rolesConfig.js";

const dashboardRepository = new DashboardRepository(prisma);
const dashboardService = new DashboardService(dashboardRepository);
const dashboardController = new DashboardController(dashboardService);

const dashboardRouter = Router();

dashboardRouter.get("/", ...readRoles, dashboardController.getStats);

export default dashboardRouter;
