import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { NextResponse } from "next/server";
import { z } from "zod";


const createSchema = z.object({
  studentId: z.string().min(1, "Aluno é obrigatório"),
  classId: z.string().min(1, "Turma é obrigatória"),
  date: z.string().min(1, "Data é obrigatória"),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "JUSTIFIED"]),
  content: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(request: Request): Promise<NextResponse> {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response as unknown as NextResponse;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const classId = searchParams.get("classId") || "";
  const date = searchParams.get("date") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");

  const where: Record<string, unknown> = {};
  if (search) {
    where.student = { name: { contains: search } };
  }
  if (classId) where.classId = classId;
  if (date) where.date = new Date(date);

  const [total, records] = await Promise.all([
    prisma.attendance.count({ where }),
    prisma.attendance.findMany({
      where,
      include: {
        student: { select: { id: true, name: true } },
        class: { select: { id: true, course: { select: { name: true } }, weekDays: true } },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return successResponse({
    data: records,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  const auth = await requireAuth(["ADMIN", "COORDINATION", "TEACHER"]);
  if (!auth.authorized) return auth.response as unknown as NextResponse;

  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const existing = await prisma.attendance.findFirst({
      where: {
        studentId: data.studentId,
        classId: data.classId,
        date: new Date(data.date),
      },
    });
    if (existing) return errorResponse("Registro de presença já existe para este aluno nesta data");

    const record = await prisma.attendance.create({
      data: {
        ...data,
        date: new Date(data.date),
        recordedBy: auth.user!.id,
      },
      include: {
        student: { select: { name: true } },
        class: { select: { course: { select: { name: true } } } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.user!.id,
        action: "CREATE",
        entity: "Attendance",
        entityId: record.id,
        description: `Presença registrada: ${record.student.name} - ${record.status}`,
      },
    });

    return successResponse(record, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues.map((e) => e.message).join(", "));
    }
    return errorResponse("Erro ao registrar presença");
  }
}

export async function PUT(request: Request): Promise<NextResponse> {
  const auth = await requireAuth(["ADMIN", "COORDINATION", "TEACHER"]);
  if (!auth.authorized) return auth.response as unknown as NextResponse;

  try {
    const body = await request.json();
    const { ids, status } = z.object({
      ids: z.array(z.string()).min(1),
      status: z.enum(["PRESENT", "ABSENT", "LATE", "JUSTIFIED"]),
    }).parse(body);

    const records = await prisma.attendance.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.user!.id,
        action: "UPDATE",
        entity: "Attendance",
        entityId: `batch:${ids.length} records`,
        description: `Presenças em lote: ${records.count} registros atualizados para ${status}`,
      },
    });

    return successResponse({ count: records.count });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues.map((e) => e.message).join(", "));
    }
    return errorResponse("Erro ao atualizar presenças");
  }
}
