import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { StatusCode } from "../constants/statusCodes.js";
import CustomError from "../utils/customError.js";
import { env } from "../config/envConfig.js";
import { logErr } from "../config/logger.js";


const logError = (err: any, req: Request) => {
  const isDevelopment = env.ENV_TYPE === "development";
  const errorInfo: any = {
    message: err?.message || "Unknown error",
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  };

  // Only include stack trace in development
  if (isDevelopment && err?.stack) {
    errorInfo.stack = err.stack;
  }

  logErr("❌ERROR~ in error handler:", err, errorInfo);
};

const errorHandler: ErrorRequestHandler = (
  err:
    | CustomError
    | Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  logError(err, req);

  if (err instanceof CustomError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  const message =
    env.ENV_TYPE === "development" && err instanceof Error
      ? err.message
      : "Something went wrong. Please try again later.";

  res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
    message,
  });
};

export default errorHandler;
