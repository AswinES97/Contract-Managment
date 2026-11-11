import { Router } from "express";
import prisma from "../config/prismaConfig.js";
import { ContractRepositories } from "../repositories/contractRepositories.js";
import { ContractService } from "../services/contract/contractService.js";
import { ContractController } from "../controllers/contractController.js";
import { adminRoles, readRoles, writeRoles } from "../config/rolesConfig.js";

const contractRepository = new ContractRepositories(prisma);
const contractService = new ContractService(contractRepository);
const contractController = new ContractController(contractService);

const contractRouter = Router();

contractRouter.get("/", ...readRoles, contractController.getAll);
contractRouter.get("/:id", ...readRoles, contractController.getById);
contractRouter.patch(
  "/:id/status",
  ...writeRoles,
  contractController.updateStatus,
);
contractRouter.delete("/:id", ...adminRoles, contractController.delete);

export default contractRouter;
