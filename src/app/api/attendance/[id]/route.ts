import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response as unknown as NextResponse;

  const { id } = await params;
  const record = await prisma.attendance.findUnique({
    where: { id },
    include: {
      student: true,
      class: { include: { course: true } },
    },
  });
  if (!record) return errorResponse("Registro não encontrado", 404);
  return successResponse(record);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await requireAuth(["ADMIN", "COORDINATION", "TEACHER"]);
  if (!auth.authorized) return auth.response as unknown as NextResponse;

  const { id } = await params;
  const existing = await prisma.attendance.findUnique({ where: { id } });
  if (!existing) return errorResponse("Registro não encontrado", 404);

  try {
    const body = await request.json();
    const data = z.object({
      status: z.enum(["PRESENT", "ABSENT", "LATE", "JUSTIFIED"]),
      content: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
    }).parse(body);

    const record = await prisma.attendance.update({
      where: { id },
      data,
      include: {
        student: { select: { name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.user!.id,
        action: "UPDATE",
        entity: "Attendance",
        entityId: id,
        description: `Presença atualizada: ${record.student.name} -> ${record.status}`,
      },
    });

    return successResponse(record);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues.map((e) => e.message).join(", "));
    }
    return errorResponse("Erro ao atualizar presença");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await requireAuth(["ADMIN", "COORDINATION"]);
  if (!auth.authorized) return auth.response as unknown as NextResponse;

  const { id } = await params;
  const record = await prisma.attendance.findUnique({
    where: { id },
    include: { student: { select: { name: true } } },
  });
  if (!record) return errorResponse("Registro não encontrado", 404);

  await prisma.attendance.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: auth.user!.id,
      action: "DELETE",
      entity: "Attendance",
      entityId: id,
      description: `Presença removida: ${record.student.name}`,
    },
  });

  return successResponse({ message: "Registro excluído com sucesso" });
}
