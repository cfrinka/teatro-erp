import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  artisticName: z.string().optional().nullable(),
  cpf: z.string().min(11).optional(),
  rg: z.string().optional().nullable(),
  birthDate: z.string().optional(),
  gender: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  street: z.string().optional().nullable(),
  number: z.string().optional().nullable(),
  complement: z.string().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  financialResponsible: z.string().optional().nullable(),
  legalResponsible: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "CANCELLED", "TRANSFERRED"]).optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { authorized, response } = await requireAuth();
  if (!authorized) return response as any;

  const { id } = await params;
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) return errorResponse("Aluno não encontrado", 404);

  return successResponse(student);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { authorized, response, user } = await requireAuth(["ADMIN", "COORDINATION", "RECEPTION"]);
  if (!authorized) return response as any;

  const { id } = await params;
  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing) return errorResponse("Aluno não encontrado", 404);

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    const updateData: Prisma.StudentUpdateInput = { ...data };
    if (data.birthDate) updateData.birthDate = new Date(data.birthDate);

    const student = await prisma.student.update({
      where: { id },
      data: updateData,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: "UPDATE",
        entity: "Student",
        entityId: id,
        description: `Aluno atualizado: ${student.name}`,
      },
    });

    return successResponse(student);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues.map((e) => e.message).join(", "));
    }
    return errorResponse("Erro ao atualizar aluno");
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { authorized, response, user } = await requireAuth(["ADMIN", "COORDINATION"]);
  if (!authorized) return response as any;

  const { id } = await params;
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) return errorResponse("Aluno não encontrado", 404);

  await prisma.student.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: user!.id,
      action: "DELETE",
      entity: "Student",
      entityId: id,
      description: `Aluno excluído: ${student.name}`,
    },
  });

  return successResponse({ message: "Aluno excluído com sucesso" });
}
