import type { RequestHandler } from "express";
import { validationResult } from "express-validator";

export const validateRequest: RequestHandler = (req, res, next): void => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    next();
    return;
  }

  const errors = result.array({ onlyFirstError: true }).map((error) => ({
    field: error.type === "field" ? error.path : "request",
    message: String(error.msg),
  }));

  res.status(400).json({
    success: false,
    message: "Validation failed",
    errors,
  });
};
