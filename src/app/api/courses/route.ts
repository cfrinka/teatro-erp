import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const createSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional().nullable(),
  workload: z.number().optional().default(0),
  enrollmentFee: z.number().optional().default(0),
  monthlyFee: z.number().optional().default(0),
  minAge: z.number().optional().nullable(),
  maxAge: z.number().optional().nullable(),
  maxStudents: z.number().optional().default(30),
});

export async function GET(request: Request) {
  const { authorized, response } = await requireAuth();
  if (!authorized) return response as any;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  const where: Prisma.CourseWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [total, courses] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { classes: true } } },
    }),
  ]);

  return successResponse({ data: courses, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

export async function POST(request: Request) {
  const { authorized, response, user } = await requireAuth(["ADMIN", "COORDINATION"]);
  if (!authorized) return response as any;

  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const existing = await prisma.course.findFirst({ where: { name: data.name } });
    if (existing) return errorResponse("Curso já existe");

    const course = await prisma.course.create({ data });

    await prisma.auditLog.create({
      data: { userId: user!.id, action: "CREATE", entity: "Course", entityId: course.id, description: `Curso criado: ${course.name}` },
    });

    return successResponse(course, 201);
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse(error.issues.map((e) => e.message).join(", "));
    return errorResponse("Erro ao criar curso");
  }
}

