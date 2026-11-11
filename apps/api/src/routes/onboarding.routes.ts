import { Router } from "express";
import prisma from "../config/prismaConfig.js";
import { OnboardingRepositories } from "../repositories/onboardingRepositories.js";
import { OnboardingService } from "../services/onboarding/onboardingService.js";
import { OnboardingController } from "../controllers/onboardingController.js";
import { readRoles, writeRoles } from "../config/rolesConfig.js";

const onboardingRepository = new OnboardingRepositories(prisma);
const onboardingService = new OnboardingService(onboardingRepository);
const onboardingController = new OnboardingController(onboardingService);

const onboardingRouter = Router();

onboardingRouter.post(
  "/complete",
  ...writeRoles,
  onboardingController.complete,
);
onboardingRouter.post("/", ...writeRoles, onboardingController.complete);

onboardingRouter.get(
  "/:customerId/steps",
  ...readRoles,
  onboardingController.getSteps,
);
onboardingRouter.post(
  "/:customerId/step",
  ...writeRoles,
  onboardingController.saveStep,
);
onboardingRouter.post("/step", ...writeRoles, onboardingController.saveStep);

export default onboardingRouter;
