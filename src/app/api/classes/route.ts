import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { z } from "zod";


const createSchema = z.object({
  courseId: z.string().min(1),
  teacherId: z.string().optional().nullable(),
  room: z.string().optional().nullable(),
  weekDays: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  period: z.string().optional().nullable(),
  maxStudents: z.number().optional().default(20),
});

export async function GET(request: Request) {
  const { authorized, response } = await requireAuth();
  if (!authorized) return response as any;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { room: { contains: search } },
      { course: { name: { contains: search } } },
      { teacher: { name: { contains: search } } },
    ];
  }

  const [total, classes] = await Promise.all([
    prisma.class.count({ where }),
    prisma.class.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        course: { select: { id: true, name: true } },
        teacher: { select: { id: true, name: true } },
        _count: { select: { enrollments: true, attendances: true } },
      },
    }),
  ]);

  return successResponse({ data: classes, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

export async function POST(request: Request) {
  const { authorized, response, user } = await requireAuth(["ADMIN", "COORDINATION"]);
  if (!authorized) return response as any;

  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const cls = await prisma.class.create({ data });

    await prisma.auditLog.create({
      data: { userId: user!.id, action: "CREATE", entity: "Class", entityId: cls.id, description: `Turma criada: ${cls.room || cls.id}` },
    });

    return successResponse(cls, 201);
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse(error.issues.map((e) => e.message).join(", "));
    return errorResponse("Erro ao criar turma");
  }
}

