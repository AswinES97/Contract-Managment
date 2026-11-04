import { Router } from "express";
import authRouter from "./auth.js";
import userRouter from "./user.js";
import customerRouter from "./customer.js";

const router = Router();

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
