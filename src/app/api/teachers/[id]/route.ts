import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  cpf: z.string().min(11).optional(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  photoUrl: z.string().optional().nullable(),
  specialty: z.string().optional().nullable(),
  curriculum: z.string().optional().nullable(),
  availability: z.string().optional().nullable(),
  hourlyRate: z.number().optional(),
  notes: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { authorized, response } = await requireAuth();
  if (!authorized) return response as any;

  const { id } = await params;
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: { user: { select: { id: true, email: true, role: true } } },
  });
  if (!teacher) return errorResponse("Professor não encontrado", 404);

  return successResponse(teacher);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { authorized, response, user } = await requireAuth(["ADMIN", "COORDINATION"]);
  if (!authorized) return response as any;

  const { id } = await params;
  const existing = await prisma.teacher.findUnique({ where: { id } });
  if (!existing) return errorResponse("Professor não encontrado", 404);

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    const teacher = await prisma.teacher.update({ where: { id }, data });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: "UPDATE",
        entity: "Teacher",
        entityId: id,
        description: `Professor atualizado: ${teacher.name}`,
      },
    });

    return successResponse(teacher);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues.map((e) => e.message).join(", "));
    }
    return errorResponse("Erro ao atualizar professor");
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { authorized, response, user } = await requireAuth(["ADMIN"]);
  if (!authorized) return response as any;

  const { id } = await params;
  const teacher = await prisma.teacher.findUnique({ where: { id } });
  if (!teacher) return errorResponse("Professor não encontrado", 404);

  await prisma.teacher.update({ where: { id }, data: { status: "INACTIVE" as any } });

  await prisma.auditLog.create({
    data: {
      userId: user!.id,
      action: "DELETE",
      entity: "Teacher",
      entityId: id,
      description: `Professor desativado: ${teacher.name}`,
    },
  });

  return successResponse({ message: "Professor desativado com sucesso" });
}
