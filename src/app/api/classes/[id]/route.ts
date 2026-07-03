import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  courseId: z.string().optional(),
  teacherId: z.string().optional().nullable(),
  room: z.string().optional().nullable(),
  weekDays: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  period: z.string().optional().nullable(),
  maxStudents: z.number().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "COMPLETED"]).optional(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response as unknown as NextResponse;

  const { id } = await params;
  const cls = await prisma.class.findUnique({
    where: { id },
    include: {
      course: true,
      teacher: true,
      enrollments: { include: { student: { select: { id: true, name: true, photoUrl: true } } } },
    },
  });
  if (!cls) return errorResponse("Turma não encontrada", 404);
  return successResponse(cls);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const auth = await requireAuth(["ADMIN", "COORDINATION"]);
  if (!auth.authorized) return auth.response as unknown as NextResponse;

  const { id } = await params;
  const existing = await prisma.class.findUnique({ where: { id } });
  if (!existing) return errorResponse("Turma não encontrada", 404);

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);
    const cls = await prisma.class.update({ where: { id }, data });

    await prisma.auditLog.create({
      data: { userId: auth.user!.id, action: "UPDATE", entity: "Class", entityId: id, description: `Turma atualizada: ${cls.room || cls.id}` },
    });

    return successResponse(cls);
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse(error.issues.map((e) => e.message).join(", "));
    return errorResponse("Erro ao atualizar turma");
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const auth = await requireAuth(["ADMIN"]);
  if (!auth.authorized) return auth.response as unknown as NextResponse;

  const { id } = await params;
  const existing = await prisma.class.findUnique({ where: { id } });
  if (!existing) return errorResponse("Turma não encontrada", 404);

  await prisma.class.update({ where: { id }, data: { status: "INACTIVE" } });
    await prisma.auditLog.create({
    data: { userId: auth.user!.id, action: "DELETE", entity: "Class", entityId: id, description: "Turma desativada" },
  });

  return successResponse({ message: "Turma desativada com sucesso" });
}
