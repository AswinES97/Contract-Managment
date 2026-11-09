import { Router } from "express";
import prisma from "../config/prismaConfig.js";
import JwtTokenService from "../services/tokens/jwtTokenService.js";
import { checkRole } from "../middlewares/roleCheck.js";
import UserRoles from "../constants/users.js";
import { CloudRepositories } from "../repositories/cloudRepositories.js";
import { CloudService } from "../services/cloud/cloudService.js";
import { CloudController } from "../controllers/cloudController.js";

const jwtService = new JwtTokenService();

const cloudRepository = new CloudRepositories(prisma);
const cloudService = new CloudService(cloudRepository);
const cloudController = new CloudController(cloudService);

const cloudRouter = Router();

const readRoles = [
  jwtService.verifyToken,
  checkRole(UserRoles.ADMIN, UserRoles.END_USER, UserRoles.VIEWER),
];

const writeRoles = [
  jwtService.verifyToken,
  checkRole(UserRoles.ADMIN, UserRoles.END_USER),
];

cloudRouter.get("/", ...readRoles, cloudController.getUsage);
cloudRouter.get("/usage", ...readRoles, cloudController.getUsage);
cloudRouter.get("/accounts", ...readRoles, cloudController.getAccounts);
cloudRouter.post("/sync-aws", ...writeRoles, cloudController.syncAws);
cloudRouter.post("/azure", ...writeRoles, cloudController.recordAzure);

export default cloudRouter;
