import express from "express";
import http from "http";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morganLogger from "./config/morganConfig.js";
import cors from "cors";
import { env, validateEnvConfig } from "./config/envConfig.js";

import allRoutes from "./routes/index.js";
import { log, logErr } from "./config/logger.js";
import { initPrismaConnection } from "./config/prismaConfig.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { initBillingCron } from "./jobs/billingCron.js";

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowedOrigins = ["http://localhost:5173"];

      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes(origin.replace(/\/$/, ""))
      ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-refresh-token",
      "x-access-token",
      "Accept",
      "X-Requested-With",
      "x-admin-token",
    ],
    exposedHeaders: [
      "x-access-token",
      "x-refresh-token",
      "Content-Disposition",
    ],
  }),
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(cookieParser());
app.use(morganLogger);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.set("trust proxy", 1);

validateEnvConfig();

(async () => {
  try {
    await initPrismaConnection();
    initBillingCron();
  } catch (error) {
    logErr("❌ Failed to initialize server services:", error);
  }
})();

app.use("/api", allRoutes);

app.use(errorHandler);

const PORT = env.PORT;
server.listen(PORT, () => {
  log(`Server is running on port ${PORT}`);
  log(`Environment: ${env.ENV_TYPE}`);
});
