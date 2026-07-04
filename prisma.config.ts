import { defineConfig } from "@prisma/config";

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || "mysql://admin:admin123@banco-teatro:3306/banco-teatro-erp?allowPublicKeyRetrieval=true",
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});
