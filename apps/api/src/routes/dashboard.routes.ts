import { Router } from "express";
import prisma from "../config/prismaConfig.js";
import JwtTokenService from "../services/tokens/jwtTokenService.js";
import { checkRole } from "../middlewares/roleCheck.js";
import UserRoles from "../constants/users.js";
import { DashboardRepository } from "../repositories/dashboardRepository.js";
import { DashboardService } from "../services/dashboard/dashboardService.js";
import { DashboardController } from "../controllers/dashboardController.js";

const jwtService = new JwtTokenService();

const dashboardRepository = new DashboardRepository(prisma);
const dashboardService = new DashboardService(dashboardRepository);
const dashboardController = new DashboardController(dashboardService);

const dashboardRouter = Router();

const readRoles = [
  jwtService.verifyToken,
  checkRole(UserRoles.ADMIN, UserRoles.END_USER, UserRoles.VIEWER),
];

dashboardRouter.get("/", ...readRoles, dashboardController.getStats);

export default dashboardRouter;
