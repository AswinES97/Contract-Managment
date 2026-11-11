import "dotenv/config";
import { clearDatabase } from "../src/utils/clearDb.js";

async function main() {
  try {
    console.log("Starting database cleanup (development only)...");
    await clearDatabase();
    console.log("✅ Database cleanup finished.");
    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Failed to clear database:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}

main();

export { clearDatabase } from "../src/utils/clearDb.js";
