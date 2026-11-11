import { Router } from "express";
import prisma from "../config/prismaConfig.js";
import { BillingRepository } from "../repositories/billingRepository.js";
import { BillingService } from "../services/billing/billingService.js";
import { BillingController } from "../controllers/billingController.js";
import { readRoles, writeRoles } from "../config/rolesConfig.js";

const billingRepository = new BillingRepository(prisma);
const billingService = new BillingService(billingRepository, prisma);
const billingController = new BillingController(billingService);

const billingRouter = Router();

billingRouter.get("/", ...readRoles, billingController.getAll);
billingRouter.get("/:id", ...readRoles, billingController.getById);
billingRouter.post("/calculate", ...writeRoles, billingController.calculate);
billingRouter.post(
  "/:id/sync-invoice",
  ...writeRoles,
  billingController.syncInvoice,
);

export default billingRouter;
