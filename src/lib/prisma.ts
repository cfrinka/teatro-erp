import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl =
  process.env.DATABASE_URL ||
  "mysql://admin:admin123@banco-teatro:3306/banco-teatro-erp?allowPublicKeyRetrieval=true";
const databaseName =
  process.env.MYSQL_DATABASE || new URL(databaseUrl).pathname.replace(/^\//, "");

function createPrismaClient() {
  try {
    const adapter = new PrismaMariaDb(databaseUrl, { database: databaseName });
    return new PrismaClient({ adapter });
  } catch (error) {
    console.error("[Prisma] Failed to initialize database adapter:", error);
    // Return a PrismaClient without adapter as fallback — queries will fail
    // with a clear error instead of crashing the whole app
    return new PrismaClient();
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
