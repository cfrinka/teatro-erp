import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl = process.env.DATABASE_URL || "mysql://admin:admin123@banco-teatro:3306/banco-teatro-erp";
const databaseName = process.env.MYSQL_DATABASE || new URL(databaseUrl).pathname.replace(/^\//, "");
const adapter = new PrismaMariaDb(databaseUrl, { database: databaseName });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
