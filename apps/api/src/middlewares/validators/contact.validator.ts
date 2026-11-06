// validators/contact.validator.ts

import type { RequestHandler } from "express";
import {
  body,
  validationResult,
  type ValidationChain,
} from "express-validator";
import { hasOnlyAllowedFields, isObject } from "./common.js";

const allowedFields = new Set([
  "name",
  "role",
  "email",
  "phone",
  "isPrimary",
]);

export const createContactValidator: ValidationChain[] = [
  body()
    .custom((value: unknown) => isObject(value))
    .withMessage("Request body must be a JSON object")
    .bail({ level: "request" })
    .custom((value: Record<string, unknown>) =>
      hasOnlyAllowedFields(value, allowedFields),
    )
    .withMessage("Request contains unsupported customer fields")
    .bail({ level: "request" }),

  body("name")
    .exists({ values: "null" })
    .withMessage("Contact name is required")
    .bail()
    .isString()
    .withMessage("Contact name must be a string")
    .bail()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Contact name must contain between 1 and 200 characters"),

  body("role")
    .optional()
    .isString()
    .withMessage("Contact role must be a string")
    .bail()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Contact role must contain between 1 and 100 characters"),

  body("email")
    .optional({ values: "null" })
    .isString()
    .withMessage("Email must be a string")
    .bail()
    .trim()
    .isLength({ max: 254 })
    .withMessage("Email must not exceed 254 characters")
    .bail()
    .isEmail()
    .withMessage("Provide a valid email address"),

  body("phone")
    .optional({ values: "null" })
    .isString()
    .withMessage("Phone must be a string")
    .bail()
    .trim()
    .isLength({ min: 1, max: 40 })
    .withMessage("Phone must contain between 1 and 40 characters"),

  body("isPrimary")
    .optional()
    .isBoolean({ strict: true })
    .withMessage("isPrimary must be true or false"),
];
