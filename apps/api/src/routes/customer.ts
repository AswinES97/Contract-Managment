import { Router } from "express";
import prisma from "../config/prismaConfig.js";
import JwtTokenService from "../services/tokens/jwtTokenService.js";
import { checkRole } from "../middlewares/roleCheck.js";
import UserRoles from "../constants/users.js";
import { CustomerRepositories } from "../repositories/customerRepositories.js";
import { CustomerService } from "../services/customer/customerService.js";
import { CustomerController } from "../controllers/customerController.js";

const jwtService = new JwtTokenService();

const customerRepositories = new CustomerRepositories(prisma);
const customerService = new CustomerService(customerRepositories);
const customerController = new CustomerController(customerService);

const customerRouter = Router();

customerRouter.get(
  "/",
  jwtService.verifyToken,
  checkRole(UserRoles.ADMIN, UserRoles.END_USER),
);

customerRouter.post(
  "/",
  jwtService.verifyToken,
  checkRole(UserRoles.ADMIN, UserRoles.END_USER),
);

// customerRouter.use("/contact")

export default customerRouter;
