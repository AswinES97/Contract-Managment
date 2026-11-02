import { Router } from "express";
import authRouter from "./auth.js";

const router = Router();

router.use("/auth", authRouter);

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

export default router;
