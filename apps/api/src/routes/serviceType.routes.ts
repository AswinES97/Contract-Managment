import { Router } from "express";
import prisma from "../config/prismaConfig.js";
import JwtTokenService from "../services/tokens/jwtTokenService.js";
import { checkRole } from "../middlewares/roleCheck.js";
import UserRoles from "../constants/users.js";
import { ServiceTypeRepositories } from "../repositories/serviceTypeRepositories.js";
import { ServiceTypeService } from "../services/serviceType/serviceTypeService.js";
import { ServiceTypeController } from "../controllers/serviceTypeController.js";

const jwtService = new JwtTokenService();

const serviceTypeRepository = new ServiceTypeRepositories(prisma);
const serviceTypeService = new ServiceTypeService(serviceTypeRepository);
const serviceTypeController = new ServiceTypeController(serviceTypeService);

const serviceTypeRouter = Router();

const readRoles = [
  jwtService.verifyToken,
  checkRole(UserRoles.ADMIN, UserRoles.END_USER, UserRoles.VIEWER),
];

const adminRoles = [
  jwtService.verifyToken,
  checkRole(UserRoles.ADMIN, UserRoles.END_USER),
];

serviceTypeRouter.get("/", ...readRoles, serviceTypeController.getAll);
serviceTypeRouter.post("/", ...adminRoles, serviceTypeController.create);
serviceTypeRouter.patch("/:id", ...adminRoles, serviceTypeController.update);

export default serviceTypeRouter;
