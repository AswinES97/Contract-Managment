import { Router } from "express";
import prisma from "../config/prismaConfig.js";
import JwtTokenService from "../services/tokens/jwtTokenService.js";
import { checkRole } from "../middlewares/roleCheck.js";
import UserRoles from "../constants/users.js";
import { ContractRepositories } from "../repositories/contractRepositories.js";
import { ContractService } from "../services/contract/contractService.js";
import { ContractController } from "../controllers/contractController.js";

const jwtService = new JwtTokenService();

const contractRepository = new ContractRepositories(prisma);
const contractService = new ContractService(contractRepository);
const contractController = new ContractController(contractService);

const contractRouter = Router();

const readRoles = [
  jwtService.verifyToken,
  checkRole(UserRoles.ADMIN, UserRoles.END_USER, UserRoles.VIEWER),
];

const writeRoles = [
  jwtService.verifyToken,
  checkRole(UserRoles.ADMIN, UserRoles.END_USER),
];

const adminRoles = [
  jwtService.verifyToken,
  checkRole(UserRoles.ADMIN),
];

contractRouter.get("/", ...readRoles, contractController.getAll);
contractRouter.get("/:id", ...readRoles, contractController.getById);
contractRouter.patch("/:id/status", ...writeRoles, contractController.updateStatus);
contractRouter.delete("/:id", ...adminRoles, contractController.delete);

export default contractRouter;
