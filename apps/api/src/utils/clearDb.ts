import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

export async function clearDatabase(
  client?: PrismaClient,
): Promise<{ clearedTables: string[] }> {
  const nodeEnv = process.env.NODE_ENV?.trim();
  if (nodeEnv !== "development") {
    throw new Error(
      `Database clear is only allowed when NODE_ENV is 'development'. Current NODE_ENV is '${process.env.NODE_ENV}'.`,
    );
  }

  let prisma = client;
  let shouldDisconnect = false;

  if (!prisma) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL environment variable is required to clear the database.",
      );
    }
    const adapter = new PrismaPg({ connectionString });
    prisma = new PrismaClient({ adapter });
    shouldDisconnect = true;
  }

  try {
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename != '_prisma_migrations' AND tablename !='users';
    `;

    if (tables.length === 0) {
      console.log("No tables found in public schema to clear.");
      return { clearedTables: [] };
    }

    const tableNames = tables.map((t) => `"${t.tablename}"`).join(", ");
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`,
    );

    const clearedTables = tables.map((t) => t.tablename);
    console.log(
      `Successfully cleared ${clearedTables.length} table(s):\n- ${clearedTables.join(",\n- ")}`,
    );
    return { clearedTables };
  } finally {
    if (shouldDisconnect && prisma) {
      await prisma.$disconnect();
    }
  }
}

export const clearDevDatabase = clearDatabase;
