import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const candidateEnvPaths = [
  process.env.DOTENV_CONFIG_PATH, // allow overriding explicitly
  path.resolve(process.cwd(), ".env"),
  path.resolve(__dirname, "../../.env"), // works from both src/config and dist/config
].filter((p): p is string => typeof p === "string" && p.length > 0);

let loadedFrom: string | null = null;
for (const p of candidateEnvPaths) {
  try {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p });
      loadedFrom = p;
      break;
    }
  } catch {
    // ignore and keep trying other paths
  }
}

if (!loadedFrom) {
  // Fallback: use default dotenv behavior (may still work if cwd is correct)
  dotenv.config();
}

export const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 3001,
  ENV_TYPE: process.env.NODE_ENV || "development",
  JWT_TOKEN_SECRET: process.env.JWT_TOKEN_SECRET || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
  CRON: process.env.CRON || "",
  //   REDIS_HOST: process.env.REDIS_HOST || "localhost",
  //   REDIS_PORT: process.env.REDIS_PORT || "6379",
};

export const envKeys = {
  PORT_KEY: process.env.PORT_KEY || "",
  JWT_TOKEN_KEY: process.env.JWT_TOKEN_KEY || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
  //   REDIS_KEY: process.env.REDIS_KEY || "",
};

export const validateEnvConfig = (): void => {
  const missingVars: string[] = [];

  const keysWithDefaults = new Set(["ENV_TYPE", "CRON"]);

  for (const [key, value] of Object.entries(env)) {
    if (keysWithDefaults.has(key)) {
      continue;
    }

    if (
      value === "" ||
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "")
    ) {
      missingVars.push(key);
    }
  }

  if (missingVars.length > 0) {
    console.error("\n❌ Missing or empty required environment variables:");
    missingVars.forEach((key) => {
      console.error(`   - ${key}`);
    });
    console.error("\n⚠️  Please set these variables in your .env file.\n");

    // Fail-fast for JWT secret. If this is missing (or changes between restarts),
    if (missingVars.includes("JWT_TOKEN_SECRET")) {
      console.error(
        `❌ Critical: JWT_TOKEN_SECRET is missing/empty. This will break auth.\n` +
          `   Loaded .env from: ${loadedFrom ?? "(default dotenv search)"}\n` +
          `   CWD: ${process.cwd()}\n`,
      );

      process.exit(1);
    }
  } else {
    console.log("✅ All required environment variables are set");
  }
};
