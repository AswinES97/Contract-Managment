import { Router } from "express";
import prisma from "../config/prismaConfig.js";
import { ServiceTypeRepositories } from "../repositories/serviceTypeRepositories.js";
import { ServiceTypeService } from "../services/serviceType/serviceTypeService.js";
import { ServiceTypeController } from "../controllers/serviceTypeController.js";
import { adminRoles, readRoles } from "../config/rolesConfig.js";

const serviceTypeRepository = new ServiceTypeRepositories(prisma);
const serviceTypeService = new ServiceTypeService(serviceTypeRepository);
const serviceTypeController = new ServiceTypeController(serviceTypeService);

const serviceTypeRouter = Router();

// todo: while updating deactivate old and create new with updated amount

serviceTypeRouter.get("/", ...readRoles, serviceTypeController.getAll);
serviceTypeRouter.post("/", ...adminRoles, serviceTypeController.create);
serviceTypeRouter.patch("/:id", ...adminRoles, serviceTypeController.update);

export default serviceTypeRouter;
