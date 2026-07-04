import { createClient } from "@libsql/client";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const mysqlUrl = process.env.DATABASE_URL || "mysql://admin:admin123@localhost:3306/teatro-erp";
const mysqlDatabase = process.env.MYSQL_DATABASE || new URL(mysqlUrl).pathname.replace(/^\//, "");
const adapter = new PrismaMariaDb(mysqlUrl, { database: mysqlDatabase });
const prisma = new PrismaClient({ adapter });

const sqliteUrl = process.env.SQLITE_DATABASE_URL || "file:./dev.db";
const sqlite = createClient({ url: sqliteUrl });

type TableConfig = {
  table: string;
  model: string;
  booleans?: string[];
  dates?: string[];
};

type ModelDelegate = {
  count: () => Promise<number>;
  createMany: (args: { data: Record<string, unknown>[]; skipDuplicates: boolean }) => Promise<unknown>;
};

const prismaModels: Record<string, ModelDelegate> = {
  user: prisma.user as unknown as ModelDelegate,
  student: prisma.student as unknown as ModelDelegate,
  teacher: prisma.teacher as unknown as ModelDelegate,
  course: prisma.course as unknown as ModelDelegate,
  class: prisma.class as unknown as ModelDelegate,
  enrollment: prisma.enrollment as unknown as ModelDelegate,
  attendance: prisma.attendance as unknown as ModelDelegate,
  payment: prisma.payment as unknown as ModelDelegate,
  expense: prisma.expense as unknown as ModelDelegate,
  event: prisma.event as unknown as ModelDelegate,
  communication: prisma.communication as unknown as ModelDelegate,
  message: prisma.message as unknown as ModelDelegate,
  document: prisma.document as unknown as ModelDelegate,
  auditLog: prisma.auditLog as unknown as ModelDelegate,
  settings: prisma.settings as unknown as ModelDelegate,
};

const tables: TableConfig[] = [
  { table: "users", model: "user", booleans: ["active"], dates: ["createdAt", "updatedAt"] },
  { table: "students", model: "student", dates: ["birthDate", "createdAt", "updatedAt"] },
  { table: "teachers", model: "teacher", dates: ["createdAt", "updatedAt"] },
  { table: "courses", model: "course", dates: ["createdAt", "updatedAt"] },
  { table: "classes", model: "class", dates: ["createdAt", "updatedAt"] },
  { table: "enrollments", model: "enrollment", dates: ["contractDate", "startDate", "endDate", "createdAt", "updatedAt"] },
  { table: "attendances", model: "attendance", dates: ["date", "createdAt", "updatedAt"] },
  { table: "payments", model: "payment", dates: ["dueDate", "paidDate", "createdAt", "updatedAt"] },
  { table: "expenses", model: "expense", dates: ["dueDate", "paidDate", "createdAt", "updatedAt"] },
  { table: "events", model: "event", booleans: ["allDay"], dates: ["startDate", "endDate", "createdAt", "updatedAt"] },
  { table: "communications", model: "communication", dates: ["scheduledFor", "sentAt", "createdAt", "updatedAt"] },
  { table: "messages", model: "message", dates: ["readAt", "createdAt"] },
  { table: "documents", model: "document", booleans: ["archived"], dates: ["createdAt", "updatedAt"] },
  { table: "audit_logs", model: "auditLog", dates: ["createdAt"] },
  { table: "settings", model: "settings", booleans: ["allowOnlineRegistration", "enableSmsNotifications", "enableEmailNotifications"], dates: ["createdAt", "updatedAt"] },
];

function normalizeValue(value: unknown, key: string, config: TableConfig) {
  if (value === undefined) return null;
  if (value === null) return null;

  if (config.booleans?.includes(key)) {
    return value === true || value === 1 || value === "1";
  }

  if (config.dates?.includes(key)) {
    return new Date(String(value));
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  return value;
}

async function main() {
  console.log(`Migrating SQLite data from ${sqliteUrl} to MySQL ${mysqlDatabase}...`);

  for (const config of tables) {
    const model = prismaModels[config.model];
    const targetCount = await model.count();

    if (targetCount > 0) {
      console.log(`Skipping ${config.table}: target already has ${targetCount} rows.`);
      continue;
    }

    const result = await sqlite.execute(`SELECT * FROM ${config.table}`);
    const rows = result.rows.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key, normalizeValue(value, key, config)]),
      ),
    );

    if (rows.length === 0) {
      console.log(`Skipping ${config.table}: source is empty.`);
      continue;
    }

    await model.createMany({ data: rows, skipDuplicates: true });
    console.log(`Migrated ${rows.length} rows from ${config.table}.`);
  }

  console.log("SQLite to MySQL data migration complete.");
}

main()
  .catch((error) => {
    console.error("Data migration error:", error);
    process.exit(1);
  })
  .finally(async () => {
    sqlite.close();
    await prisma.$disconnect();
  });
