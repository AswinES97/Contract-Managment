import { Router } from "express";
import authRouter from "./auth.routes.js";
import userRouter from "./user.routes.js";
import customerRouter from "./customer.routes.js";

const router = Router();

// Todo: check on the returned errors, sometimes returning primsa error

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/customer", customerRouter);
// router.use("/contract-services")
// router.use("/bill")
// router.use("/dashboard",)

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

export default router;
