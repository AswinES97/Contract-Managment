import { Router } from "express";
import prisma from "../config/prismaConfig.js";
import JwtTokenService from "../services/tokens/jwtTokenService.js";
import { checkRole } from "../middlewares/roleCheck.js";
import UserRoles from "../constants/users.js";
import { BillingRepository } from "../repositories/billingRepository.js";
import { BillingService } from "../services/billing/billingService.js";
import { BillingController } from "../controllers/billingController.js";

const jwtService = new JwtTokenService();

const billingRepository = new BillingRepository(prisma);
const billingService = new BillingService(billingRepository, prisma);
const billingController = new BillingController(billingService);

const billingRouter = Router();

const readRoles = [
  jwtService.verifyToken,
  checkRole(UserRoles.ADMIN, UserRoles.END_USER, UserRoles.VIEWER),
];

const writeRoles = [
  jwtService.verifyToken,
  checkRole(UserRoles.ADMIN, UserRoles.END_USER),
];

billingRouter.get("/", ...readRoles, billingController.getAll);
billingRouter.get("/:id", ...readRoles, billingController.getById);
billingRouter.post("/calculate", ...writeRoles, billingController.calculate);
billingRouter.post(
  "/:id/sync-invoice",
  ...writeRoles,
  billingController.syncInvoice,
);

export default billingRouter;
