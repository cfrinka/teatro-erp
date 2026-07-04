import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { z } from "zod";


const updateSchema = z.object({
  classId: z.string().optional(),
  monthlyFee: z.number().positive().optional(),
  contractDate: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "CANCELLED", "TRANSFERRED", "COMPLETED"]).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireAuth();
  if (!authorized) return response as any;

  const { id } = await params;
  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
    include: {
      student: true,
      class: { include: { course: true, teacher: true } },
      payments: { orderBy: { dueDate: "desc" } },
    },
  });
  if (!enrollment) return errorResponse("Matrícula não encontrada", 404);

  return successResponse(enrollment);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response, user } = await requireAuth([
    "ADMIN",
    "COORDINATION",
    "RECEPTION",
  ]);
  if (!authorized) return response as any;

  const { id } = await params;
  const existing = await prisma.enrollment.findUnique({ where: { id } });
  if (!existing) return errorResponse("Matrícula não encontrada", 404);

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    const updateData: Record<string, unknown> = { ...data };
    if (data.contractDate) updateData.contractDate = new Date(data.contractDate);
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if ("endDate" in data) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    }

    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: updateData,
      include: {
        student: { select: { name: true } },
        class: { select: { course: { select: { name: true } } } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: "UPDATE",
        entity: "Enrollment",
        entityId: id,
        description: `Matrícula atualizada: ${enrollment.student.name}`,
      },
    });

    return successResponse(enrollment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues.map((e) => e.message).join(", "));
    }
    return errorResponse("Erro ao atualizar matrícula");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response, user } = await requireAuth(["ADMIN", "COORDINATION"]);
  if (!authorized) return response as any;

  const { id } = await params;
  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
    include: { student: { select: { name: true } } },
  });
  if (!enrollment) return errorResponse("Matrícula não encontrada", 404);

  await prisma.enrollment.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  await prisma.auditLog.create({
    data: {
      userId: user!.id,
      action: "DELETE",
      entity: "Enrollment",
      entityId: id,
      description: `Matrícula cancelada: ${enrollment.student.name}`,
    },
  });

  return successResponse({ message: "Matrícula cancelada com sucesso" });
}
