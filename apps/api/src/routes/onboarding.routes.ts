import { Router } from "express";
import prisma from "../config/prismaConfig.js";
import JwtTokenService from "../services/tokens/jwtTokenService.js";
import { checkRole } from "../middlewares/roleCheck.js";
import UserRoles from "../constants/users.js";
import { OnboardingRepositories } from "../repositories/onboardingRepositories.js";
import { OnboardingService } from "../services/onboarding/onboardingService.js";
import { OnboardingController } from "../controllers/onboardingController.js";

const jwtService = new JwtTokenService();

const onboardingRepository = new OnboardingRepositories(prisma);
const onboardingService = new OnboardingService(onboardingRepository);
const onboardingController = new OnboardingController(onboardingService);

const onboardingRouter = Router();

const readRoles = [
  jwtService.verifyToken,
  checkRole(UserRoles.ADMIN, UserRoles.END_USER, UserRoles.VIEWER),
];

const writeRoles = [
  jwtService.verifyToken,
  checkRole(UserRoles.ADMIN, UserRoles.END_USER),
];

// Complete the onboarding flow (creates customer, cloud account, marks all 5 steps complete, activates billing)
onboardingRouter.post("/complete", ...writeRoles, onboardingController.complete);
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
