import { Router } from "express";
import prisma from "../config/prismaConfig.js";
import { CustomerRepositories } from "../repositories/customerRepositories.js";
import { CustomerService } from "../services/customer/customerService.js";
import { CustomerController } from "../controllers/customerController.js";
import { createCloudAccountValidator } from "../middlewares/validators/cloud.validator.js";
import { CloudService } from "../services/cloud/cloudService.js";
import { CloudRepositories } from "../repositories/cloudRepositories.js";
import { validateRequest } from "../middlewares/reqValidator.js";
import { readRoles, writeRoles } from "../config/rolesConfig.js";

const cloudRepositories = new CloudRepositories(prisma);
const cloudService = new CloudService(cloudRepositories);
const customerRepositories = new CustomerRepositories(prisma);
const customerService = new CustomerService(customerRepositories, cloudService);
const customerController = new CustomerController(customerService);

const customerRouter = Router();

customerRouter.get("/", ...readRoles, customerController.getAll);
customerRouter.get("/:id", ...readRoles, customerController.getById);
customerRouter.post("/", ...writeRoles, customerController.create);
customerRouter.patch("/:id", ...writeRoles, customerController.update);
customerRouter.patch(
  "/:id/status",
  ...writeRoles,
  customerController.updateStatus,
);
customerRouter.post(
  "/:id/cloud-details",
  ...writeRoles,
  createCloudAccountValidator,
  validateRequest,
  customerController.addCloudDetails,
);

export default customerRouter;
