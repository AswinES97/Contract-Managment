import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import StatusCode from "../constants/statusCodes.js";
import CustomError from "../utils/customError.js";
import { env } from "../config/envConfig.js";
import { logDebugSimple, logErr } from "../config/logger.js";

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
  err: CustomError | Error,
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

function handleError(error: unknown): CustomError {
  try {
    const summary: any = {
      type: typeof error,
    };

    if (error instanceof Error) {
      summary.name = error.name;
      summary.message = error.message;
    }

    // Handle common HTTP / Axios-like error shapes without dumping the full object
    const anyError: any = error;
    if (anyError && typeof anyError === "object") {
      if (anyError.code) summary.code = anyError.code;
      if (anyError.response) {
        summary.httpStatus = anyError.response.status;
        summary.httpStatusText = anyError.response.statusText;
        summary.responseData = anyError.response.data;
      }
    }

    logDebugSimple("🔍 handleError summary:", summary);
  } catch {
    // If logging itself fails, avoid breaking the app
    logErr("❌ Failed to summarize error in handleError");
  }

  if (error instanceof CustomError) {
    return error;
  }

  if (error === undefined || error === null) {
    logErr("❌ Error is undefined/null, creating generic error");
    return new CustomError(
      "An undefined error occurred",
      StatusCode.INTERNAL_SERVER_ERROR,
    );
  }

  return new CustomError(
    error instanceof Error ? error.message : "Unknown error",
    StatusCode.INTERNAL_SERVER_ERROR,
  );
}

export { errorHandler, handleError };
