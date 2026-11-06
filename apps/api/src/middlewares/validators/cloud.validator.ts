import {
  body,
  type ValidationChain,
} from "express-validator";
import { hasOnlyAllowedFields, isObject } from "./common.js";

const allowedFields = new Set([
  "provider",
  "externalAccountId",
  "isActive",
  "accessKeyId",
  "secretAccessKey",
]);

export const createCloudAccountValidator: ValidationChain[] = [
  body()
    .custom((value: unknown) => isObject(value))
    .withMessage("Request body must be a JSON object")
    .bail({ level: "request" })
    .custom((value: Record<string, unknown>) =>
      hasOnlyAllowedFields(value, allowedFields)
    )
    .withMessage("Request contains unsupported customer fields")
    .bail({ level: "request" }),

  body("provider")
    .exists({ values: "null" })
    .withMessage("Cloud provider is required")
    .bail({ level: "request" })
    .isString()
    .withMessage("Cloud provider must be a string")
    .bail({ level: "request" })
    .isIn(["AWS", "AZURE"])
    .withMessage("Cloud provider must be AWS or AZURE")
    .bail({ level: "request" }),

  body("externalAccountId")
    .exists({ values: "null" })
    .withMessage("External account ID is required")
    .bail()
    .isString()
    .withMessage("External account ID must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("External account ID cannot be empty")
    .bail()
    .custom((value: string, { req }) => {
      if (req.body.provider === "AWS") {
        if (!/^\d{12}$/.test(value)) {
          throw new Error("AWS account ID must contain exactly 12 digits");
        }
      } else {
        // Azure externalAccountId represents the subscription ID.
        const uuidPattern =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (!uuidPattern.test(value)) {
          throw new Error("Azure subscription ID must be a valid UUID");
        }
      }

      return true;
    })
    .customSanitizer((value: string, { req }) =>
      req.body.provider === "AZURE" ? value.toLowerCase() : value,
    ),

  body("isActive")
    .optional()
    .isBoolean({ strict: true })
    .withMessage("isActive must be a boolean"),

  body("accessKeyId")
    .if((_value, { req }) => req.body.provider === "AWS")
    .exists({ values: "null" })
    .withMessage("AWS access key ID is required")
    .bail()
    .isString()
    .withMessage("AWS access key ID must be a string")
    .bail()
    .custom((value: string) => {
      // Basic input validation; AWS must verify the actual credentials.
      return (
        value.length >= 16 && value.length <= 128 && /^[A-Z0-9]+$/.test(value)
      );
    })
    .withMessage("Invalid AWS access key ID"),

  body("secretAccessKey")
    .if((_value, { req }) => req.body.provider === "AWS")
    .exists({ values: "null" })
    .withMessage("AWS secret access key is required")
    .bail()
    .isString()
    .withMessage("AWS secret access key must be a string")
    .bail()
    .custom((value: string) => {
      // Do not trim, escape, or otherwise modify credentials.
      return value.length > 0 && value.length <= 256 && !/\s/.test(value);
    })
    .withMessage("Invalid AWS secret access key"),

  body().custom((value) => {
    if (
      value.provider === "AZURE" &&
      (Object.hasOwn(value, "accessKeyId") ||
        Object.hasOwn(value, "secretAccessKey"))
    ) {
      throw new Error("AWS credentials must not be supplied for Azure");
    }

    return true;
  }),
];
