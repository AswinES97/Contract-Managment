import { body, type ValidationChain } from "express-validator";
import {
  hasOnlyAllowedFields,
  isObject,
  optionalText,
  requiredText,
} from "./common.js";

const customerFields = new Set([
  "name",
  "status",
  "billingAddress",
  "notes",
  "contacts",
]);

export const createCustomerValidator: ValidationChain[] = [
  body()
    .custom((value: unknown) => isObject(value))
    .withMessage("Request body must be a JSON object")
    .bail({ level: "request" })
    .custom((value: Record<string, unknown>) =>
      hasOnlyAllowedFields(value, customerFields),
    )
    .withMessage("Request contains unsupported customer fields")
    .bail({ level: "request" }),

  requiredText("name", "Customer name", 200),

  body("status")
    .optional()
    .isString()
    .withMessage("Status must be a string")
    .bail()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE"),

  optionalText("billingAddress", "Billing address", 2000),
  optionalText("notes", "Notes", 5000),

  requiredText("contacts.*.name", "Contact name", 200),
  optionalText("contacts.*.role", "Contact role", 100),

  body("contacts.*.email")
    .optional({ values: "null" })
    .isString()
    .withMessage("Contact email must be a string")
    .bail()
    .trim()
    .isLength({ max: 254 })
    .withMessage("Contact email must not exceed 254 characters")
    .bail()
    .isEmail()
    .withMessage("Provide a valid contact email"),

  optionalText("contacts.*.phone", "Contact phone", 40),

  body("contacts.*.isPrimary")
    .optional()
    .isBoolean({ strict: true })
    .withMessage("isPrimary must be a boolean"),
];
