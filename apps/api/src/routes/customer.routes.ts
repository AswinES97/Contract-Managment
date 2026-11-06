import { Router } from "express";
import prisma from "../config/prismaConfig.js";
import JwtTokenService from "../services/tokens/jwtTokenService.js";
import { checkRole } from "../middlewares/roleCheck.js";
import UserRoles from "../constants/users.js";
import { CustomerRepositories } from "../repositories/customerRepositories.js";
import { CustomerService } from "../services/customer/customerService.js";
import { CustomerController } from "../controllers/customerController.js";
import { createCustomerValidator } from "../middlewares/validators/customer.validator.js";
import { validateRequest } from "../middlewares/reqValidator.js";
import { createCloudAccountValidator } from "../middlewares/validators/cloud.validator.js";
import { CloudService } from "../services/cloud/cloudService.js";
import { CloudRepositories } from "../repositories/cloudRepositories.js";
import { createContactValidator } from "../middlewares/validators/contact.validator.js";

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

customerRouter.post(
  "/",
  ...writeRoles,
  createCustomerValidator,
  validateRequest,
  customerController.create,
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

customerRouter.get("/:id", ...readRoles, customerController.getById);

// customerRouter.get("/", ...readRoles, customerController.list);
// customerRouter.patch("/:id", ...writeRoles, customerController.update);
// customerRouter.post(
//   "/:id/deactivate",
//   ...writeRoles,
//   customerController.deactivate,
// );
// customerRouter.patch(
//   "/:id/contacts/:contactId",
//   ...writeRoles,
//   customerController.updateContact,
// );
// customerRouter.delete(
//   "/:id/contacts/:contactId",
//   ...writeRoles,
//   customerController.removeContact,
// );

export default customerRouter;
