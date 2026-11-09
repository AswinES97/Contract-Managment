import { Router } from "express";
import prisma from "../config/prismaConfig.js";
import JwtTokenService from "../services/tokens/jwtTokenService.js";
import { checkRole } from "../middlewares/roleCheck.js";
import UserRoles from "../constants/users.js";
import { CustomerRepositories } from "../repositories/customerRepositories.js";
import { CustomerService } from "../services/customer/customerService.js";
import { CustomerController } from "../controllers/customerController.js";
import { createCloudAccountValidator } from "../middlewares/validators/cloud.validator.js";
import { CloudService } from "../services/cloud/cloudService.js";
import { CloudRepositories } from "../repositories/cloudRepositories.js";
import { createContactValidator } from "../middlewares/validators/contact.validator.js";
import { validateRequest } from "../middlewares/reqValidator.js";

const jwtService = new JwtTokenService();

const cloudRepositories = new CloudRepositories(prisma);
const cloudService = new CloudService(cloudRepositories);

const customerRepositories = new CustomerRepositories(prisma);
const customerService = new CustomerService(customerRepositories, cloudService);
const customerController = new CustomerController(customerService);

const customerRouter = Router();

const readRoles = [
  jwtService.verifyToken,
  checkRole(UserRoles.ADMIN, UserRoles.END_USER, UserRoles.VIEWER),
];
const writeRoles = [
  jwtService.verifyToken,
  checkRole(UserRoles.ADMIN, UserRoles.END_USER),
];

customerRouter.get("/", ...readRoles, customerController.getAll);
customerRouter.get("/:id", ...readRoles, customerController.getById);

customerRouter.post(
  "/",
  ...writeRoles,
  customerController.create,
);

customerRouter.patch(
  "/:id/status",
  ...writeRoles,
  customerController.updateStatus,
);

customerRouter.patch(
  "/:id",
  ...writeRoles,
  customerController.update,
);

customerRouter.post(
  "/:id/cloud-details",
  ...writeRoles,
  createCloudAccountValidator,
  validateRequest,
  customerController.addCloudDetails,
);

customerRouter.post(
  "/:id/contact",
  ...writeRoles,
  createContactValidator,
  validateRequest,
  customerController.addContact,
);

export default customerRouter;
