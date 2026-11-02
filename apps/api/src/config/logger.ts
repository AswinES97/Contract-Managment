import * as winston from "winston";
import { env } from "./envConfig.js";
import * as path from "path";
import * as fs from "fs";

// Extend Express Request type to include request ID
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

// Tell winston to use colors
winston.addColors(colors);

// Define format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define format for file output (JSON)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define transports
const transports: winston.transport[] = [
  // Console transport (always enabled)
  new winston.transports.Console({
    format: consoleFormat,
  }),
  // File transport for errors
  new winston.transports.File({
    filename: path.join(logsDir, "error.log"),
    level: "error",
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(logsDir, "combined.log"),
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Create logger instance
export const logger = winston.createLogger({
  level: env.ENV_TYPE === "development" ? "debug" : "info",
  levels,
  format: fileFormat,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

/**
 * Helper function to sanitize sensitive data from logs
 * Removes passwords, tokens, secrets, and other sensitive information
 */
export const sanitizeForLogging = (data: any): any => {
  if (!data) return data;

  const sensitiveFields = [
    "password",
    "token",
    "secret",
    "key",
    "authorization",
    "refreshToken",
    "accessToken",
    "mpin",
    "otp",
    "pin",
    "apiKey",
    "apikey",
    "api_key",
    "privateKey",
    "private_key",
    "secretKey",
    "secret_key",
    "authToken",
    "auth_token",
    "sessionToken",
    "session_token",
    "creditCard",
    "credit_card",
    "cardNumber",
    "card_number",
    "cvv",
    "cvc",
    "ssn",
    "aadhar",
    "pan",
    "bankAccount",
    "bank_account",
    "accountNumber",
    "account_number",
    "ifsc",
    "signature",
  ];

  if (typeof data === "object") {
    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => sanitizeForLogging(item));
    }

    // Handle objects
    const sanitized = { ...data };
    for (const key in sanitized) {
      const lowerKey = key.toLowerCase();
      // Check if key contains any sensitive field
      if (sensitiveFields.some((field) => lowerKey.includes(field))) {
        sanitized[key] = "***REDACTED***";
      } else if (
        typeof sanitized[key] === "object" &&
        sanitized[key] !== null
      ) {
        // Recursively sanitize nested objects
        sanitized[key] = sanitizeForLogging(sanitized[key]);
      }
    }
    return sanitized;
  }

  return data;
};

/**
 * Create a child logger with default metadata
 * Useful for adding context (like request ID, module name) to all logs
 * @param defaultMeta - Default metadata to include in all logs
 * @returns Child logger with helper functions
 */
export const createChildLogger = (defaultMeta: Record<string, any>) => {
  const childLogger = logger.child(defaultMeta);

  return {
    info: (message: string, meta?: any) => {
      childLogger.info(message, meta ? sanitizeForLogging(meta) : undefined);
    },
    error: (message: string, error?: any, meta?: any) => {
      const errorInfo: any = {
        ...(meta ? sanitizeForLogging(meta) : {}),
      };

      if (error) {
        if (error instanceof Error) {
          errorInfo.error = {
            message: error.message,
            stack: env.ENV_TYPE === "development" ? error.stack : undefined,
            name: error.name,
          };
        } else {
          errorInfo.error = sanitizeForLogging(error);
        }
      }

      childLogger.error(message, errorInfo);
    },
    warn: (message: string, meta?: any) => {
      childLogger.warn(message, meta ? sanitizeForLogging(meta) : undefined);
    },
    debug: (message: string, meta?: any) => {
      if (env.ENV_TYPE === "development") {
        childLogger.debug(message, meta ? sanitizeForLogging(meta) : undefined);
      }
    },
    http: (message: string, meta?: any) => {
      childLogger.http(message, meta ? sanitizeForLogging(meta) : undefined);
    },
  };
};

/**
 * Log info level message
 * @param message - Log message
 * @param meta - Optional metadata (will be sanitized)
 */
export const logInfo = (message: string, meta?: any): void => {
  logger.info(message, meta ? sanitizeForLogging(meta) : undefined);
};

/**
 * Log error level message
 * @param message - Log message
 * @param error - Optional error object
 * @param meta - Optional metadata (will be sanitized)
 */
export const logError = (message: string, error?: any, meta?: any): void => {
  const errorInfo: any = {
    ...(meta ? sanitizeForLogging(meta) : {}),
  };

  if (error) {
    if (error instanceof Error) {
      errorInfo.error = {
        message: error.message,
        stack: env.ENV_TYPE === "development" ? error.stack : undefined,
        name: error.name,
      };
    } else {
      errorInfo.error = sanitizeForLogging(error);
    }
  }

  logger.error(message, errorInfo);
};

/**
 * Log warn level message
 * @param message - Log message
 * @param meta - Optional metadata (will be sanitized)
 */
export const logWarn = (message: string, meta?: any): void => {
  logger.warn(message, meta ? sanitizeForLogging(meta) : undefined);
};

/**
 * Log debug level message (only in development)
 * @param message - Log message
 * @param meta - Optional metadata (will be sanitized)
 */
export const logDebug = (message: string, meta?: any): void => {
  if (env.ENV_TYPE === "development") {
    logger.debug(message, meta ? sanitizeForLogging(meta) : undefined);
  }
};

/**
 * Log HTTP request (info level)
 * @param message - Log message
 * @param meta - Optional metadata (will be sanitized)
 */
export const logHttp = (message: string, meta?: any): void => {
  logger.http(message, meta ? sanitizeForLogging(meta) : undefined);
};

/**
 * Performance logging helper
 * Logs the time taken for an operation
 * @param operationName - Name of the operation being timed
 * @param fn - Function to execute and time
 * @param meta - Optional metadata to include in log
 * @returns Result of the function execution
 */
export const logPerformance = async <T>(
  operationName: string,
  fn: () => Promise<T>,
  meta?: any
): Promise<T> => {
  const startTime = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    if (duration > 1000) {
      // Log as warning if operation takes more than 1 second
      logWarn(`Slow operation: ${operationName}`, {
        ...meta,
        duration: `${duration}ms`,
        operation: operationName,
      });
    } else {
      logDebug(`Operation completed: ${operationName}`, {
        ...meta,
        duration: `${duration}ms`,
        operation: operationName,
      });
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(`Operation failed: ${operationName}`, error, {
      ...meta,
      duration: `${duration}ms`,
      operation: operationName,
    });
    throw error;
  }
};

/**
 * Synchronous version of performance logging
 * @param operationName - Name of the operation being timed
 * @param fn - Function to execute and time
 * @param meta - Optional metadata to include in log
 * @returns Result of the function execution
 */
export const logPerformanceSync = <T>(
  operationName: string,
  fn: () => T,
  meta?: any
): T => {
  const startTime = Date.now();
  try {
    const result = fn();
    const duration = Date.now() - startTime;

    if (duration > 1000) {
      logWarn(`Slow operation: ${operationName}`, {
        ...meta,
        duration: `${duration}ms`,
        operation: operationName,
      });
    } else {
      logDebug(`Operation completed: ${operationName}`, {
        ...meta,
        duration: `${duration}ms`,
        operation: operationName,
      });
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(`Operation failed: ${operationName}`, error, {
      ...meta,
      duration: `${duration}ms`,
      operation: operationName,
    });
    throw error;
  }
};

/**
 * Create a logger with request context
 * Automatically includes request ID if available
 * @param req - Express request object (optional)
 * @param additionalMeta - Additional metadata to include
 * @returns Child logger with request context
 */
export const createRequestLogger = (
  req?: { id?: string; path?: string; method?: string },
  additionalMeta?: Record<string, any>
) => {
  const meta: Record<string, any> = {
    ...additionalMeta,
  };

  if (req?.id) {
    meta.requestId = req.id;
  }
  if (req?.path) {
    meta.path = req.path;
  }
  if (req?.method) {
    meta.method = req.method;
  }

  return createChildLogger(meta);
};

// Export default logger instance
export default logger;

/**
 * ========================================
 * SIMPLE DROP-IN REPLACEMENTS FOR console.log
 * ========================================
 *
 * These functions work exactly like console.log/error/warn
 * but with all security features and structured logging.
 *
 * Usage: Just replace console.log with log, console.error with logErr, etc.
 */

/**
 * Simple console.log replacement - drop-in replacement
 * Works exactly like console.log but with security and structured logging
 *
 * @example
 * log("Processing payment:", { userId, amount });
 * log("User logged in", userId, timestamp);
 * log("Simple message");
 */
export const log = (message: string, ...args: any[]): void => {
  // Handle different argument patterns
  let meta: any = undefined;

  if (args.length === 0) {
    // Just a message, no metadata
    logger.info(message);
  } else if (args.length === 1) {
    // Single argument - could be object or primitive
    if (
      typeof args[0] === "object" &&
      args[0] !== null &&
      !(args[0] instanceof Error)
    ) {
      meta = args[0];
    } else {
      meta = { value: args[0] };
    }
    logger.info(message, sanitizeForLogging(meta));
  } else {
    // Multiple arguments - combine them
    meta = {
      args: args.map((arg) => {
        if (arg instanceof Error) {
          return { error: arg.message, name: arg.name };
        }
        return arg;
      }),
    };
    logger.info(message, sanitizeForLogging(meta));
  }
};

/**
 * Simple console.error replacement
 * Automatically detects Error objects and handles them properly
 *
 * @example
 * logErr("Payment failed:", error);
 * logErr("Error occurred:", error, { userId, transactionId });
 * logErr("Simple error message");
 */
export const logErr = (message: string, ...args: any[]): void => {
  let error: Error | undefined = undefined;
  let meta: any = undefined;

  // Find Error object in arguments
  const errorIndex = args.findIndex((arg) => arg instanceof Error);
  if (errorIndex !== -1) {
    error = args[errorIndex] as Error;
    args = args.filter((_, index) => index !== errorIndex);
  }

  // Handle remaining arguments
  if (args.length === 0) {
    // No additional metadata
    if (error) {
      logError(message, error);
    } else {
      logger.error(message);
    }
  } else if (args.length === 1) {
    // Single argument
    if (typeof args[0] === "object" && args[0] !== null) {
      meta = args[0];
    } else {
      meta = { value: args[0] };
    }
    logError(message, error, meta);
  } else {
    // Multiple arguments
    meta = { args: args };
    logError(message, error, meta);
  }
};

/**
 * Simple console.warn replacement
 *
 * @example
 * logWarnSimple("Rate limit approaching:", { userId, requests: 95 });
 * logWarnSimple("Warning message");
 */
export const logWarnSimple = (message: string, ...args: any[]): void => {
  let meta: any = undefined;

  if (args.length === 0) {
    logger.warn(message);
  } else if (args.length === 1) {
    if (
      typeof args[0] === "object" &&
      args[0] !== null &&
      !(args[0] instanceof Error)
    ) {
      meta = args[0];
    } else {
      meta = { value: args[0] };
    }
    logger.warn(message, sanitizeForLogging(meta));
  } else {
    meta = { args: args };
    logger.warn(message, sanitizeForLogging(meta));
  }
};

/**
 * Simple console.debug replacement (only logs in development)
 *
 * @example
 * logDebugSimple("Debug info:", { step: 1, data });
 */
export const logDebugSimple = (message: string, ...args: any[]): void => {
  if (env.ENV_TYPE !== "development") return;

  let meta: any = undefined;

  if (args.length === 0) {
    logger.debug(message);
  } else if (args.length === 1) {
    if (
      typeof args[0] === "object" &&
      args[0] !== null &&
      !(args[0] instanceof Error)
    ) {
      meta = args[0];
    } else {
      meta = { value: args[0] };
    }
    logger.debug(message, sanitizeForLogging(meta));
  } else {
    meta = { args: args };
    logger.debug(message, sanitizeForLogging(meta));
  }
};
