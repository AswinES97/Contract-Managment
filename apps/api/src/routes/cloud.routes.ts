import { Router } from "express";
import prisma from "../config/prismaConfig.js";
import { CloudRepositories } from "../repositories/cloudRepositories.js";
import { CloudService } from "../services/cloud/cloudService.js";
import { CloudController } from "../controllers/cloudController.js";
import { readRoles, writeRoles } from "../config/rolesConfig.js";

const cloudRepository = new CloudRepositories(prisma);
const cloudService = new CloudService(cloudRepository);
const cloudController = new CloudController(cloudService);

const cloudRouter = Router();

cloudRouter.get("/", ...readRoles, cloudController.getUsage);
cloudRouter.get("/usage", ...readRoles, cloudController.getUsage);
cloudRouter.get("/accounts", ...readRoles, cloudController.getAccounts);
cloudRouter.post("/sync-aws", ...writeRoles, cloudController.syncAws);
cloudRouter.post("/azure", ...writeRoles, cloudController.recordAzure);

export default cloudRouter;
