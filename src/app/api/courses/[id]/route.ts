import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  workload: z.number().optional(),
  enrollmentFee: z.number().optional(),
  monthlyFee: z.number().optional(),
  minAge: z.number().optional().nullable(),
  maxAge: z.number().optional().nullable(),
  maxStudents: z.number().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { authorized, response } = await requireAuth();
  if (!authorized) return response as any;

  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: { classes: { include: { _count: { select: { enrollments: true } } } } },
  });
  if (!course) return errorResponse("Curso não encontrado", 404);
  return successResponse(course);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { authorized, response, user } = await requireAuth(["ADMIN", "COORDINATION"]);
  if (!authorized) return response as any;

  const { id } = await params;
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) return errorResponse("Curso não encontrado", 404);

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);
    const course = await prisma.course.update({ where: { id }, data });

    await prisma.auditLog.create({
      data: { userId: user!.id, action: "UPDATE", entity: "Course", entityId: id, description: `Curso atualizado: ${course.name}` },
    });

    return successResponse(course);
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse(error.issues.map((e) => e.message).join(", "));
    return errorResponse("Erro ao atualizar curso");
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { authorized, response, user } = await requireAuth(["ADMIN"]);
  if (!authorized) return response as any;

  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) return errorResponse("Curso não encontrado", 404);

  await prisma.course.delete({ where: { id } });

  await prisma.auditLog.create({
    data: { userId: user!.id, action: "DELETE", entity: "Course", entityId: id, description: `Curso excluído: ${course.name}` },
  });

  return successResponse({ message: "Curso excluído com sucesso" });
}
