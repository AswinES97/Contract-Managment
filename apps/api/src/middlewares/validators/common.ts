import { body, ValidationChain } from "express-validator";

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function optionalText(
  field: string,
  label: string,
  max: number,
): ValidationChain {
  return body(field)
    .optional({ values: "null" })
    .isString()
    .withMessage(`${label} must be a string`)
    .bail()
    .trim()
    .isLength({ max })
    .withMessage(`${label} must not exceed ${max} characters`);
}

export function requiredText(
  field: string,
  label: string,
  max: number,
): ValidationChain {
  return body(field)
    .exists({ values: "null" })
    .withMessage(`${label} is required`)
    .bail()
    .isString()
    .withMessage(`${label} must be a string`)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(`${label} cannot be empty`)
    .bail()
    .isLength({ max })
    .withMessage(`${label} must not exceed ${max} characters`);
}

export function hasOnlyAllowedFields(
  value: Record<string, unknown>,
  allowed: Set<string>,
): boolean {
  return Object.keys(value).every((key) => allowed.has(key));
}
