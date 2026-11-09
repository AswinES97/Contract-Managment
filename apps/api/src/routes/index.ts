import { Router } from "express";
import authRouter from "./auth.routes.js";
import userRouter from "./user.routes.js";
import customerRouter from "./customer.routes.js";
import serviceTypeRouter from "./serviceType.routes.js";
import onboardingRouter from "./onboarding.routes.js";
import contractRouter from "./contract.routes.js";
import dashboardRouter from "./dashboard.routes.js";
import cloudRouter from "./cloud.routes.js";
import billingRouter from "./billing.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/customer", customerRouter);
router.use("/contracts", contractRouter);
router.use("/contract", contractRouter);
router.use("/service-types", serviceTypeRouter);
router.use("/onboarding", onboardingRouter);
router.use("/dashboard", dashboardRouter);
router.use("/cloud-usage", cloudRouter);
router.use("/cloud", cloudRouter);
router.use("/billing", billingRouter);
router.use("/bill", billingRouter);

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

export default router;
