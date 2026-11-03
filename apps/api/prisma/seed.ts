import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!connectionString || !email || !password) {
    throw new Error(
      "DATABASE_URL, SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required.",
    );
  }

  if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
    throw new Error(
      "Seed password must be at least 12 characters and at most 72 bytes.",
    );
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.upsert({
      where: { email },
      update: {}, // Preserve an existing user's password, role and status.
      create: {
        email,
        password: passwordHash,
        role: "ADMIN",
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (user.role !== "ADMIN") {
      throw new Error(
        "The seed email already belongs to a non-admin user. No changes were made.",
      );
    }

    console.log("Admin account ready:", user);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exitCode = 1;
});
