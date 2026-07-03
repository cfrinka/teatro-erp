import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().optional(),
  type: z.enum(["CONTRACT", "FORM", "REPORT", "CERTIFICATE", "OTHER"]).optional(),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  fileUrl: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  archived: z.boolean().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireAuth();
  if (!authorized) return response as any;

  const { id } = await params;
  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      student: true,
      uploadedBy: { select: { id: true, name: true, email: true } },
    },
  });
  if (!document) return errorResponse("Documento não encontrado", 404);
  return successResponse(document);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response, user } = await requireAuth(["ADMIN", "COORDINATION", "RECEPTION"]);
  if (!authorized) return response as any;

  const { id } = await params;
  const existing = await prisma.document.findUnique({ where: { id } });
  if (!existing) return errorResponse("Documento não encontrado", 404);

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    const { tags, ...rest } = data;
    const updateData = {
      ...rest,
      ...(tags !== undefined ? { tags: JSON.stringify(tags) } : {}),
    };

    const document = await prisma.document.update({
      where: { id },
      data: updateData,
      include: {
        student: { select: { name: true } },
        uploadedBy: { select: { name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: "UPDATE",
        entity: "Document",
        entityId: id,
        description: `Documento atualizado: ${document.title}`,
      },
    });

    return successResponse(document);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues.map((e) => e.message).join(", "));
    }
    return errorResponse("Erro ao atualizar documento");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response, user } = await requireAuth(["ADMIN"]);
  if (!authorized) return response as any;

  const { id } = await params;
  const document = await prisma.document.findUnique({
    where: { id },
    select: { id: true, title: true },
  });
  if (!document) return errorResponse("Documento não encontrado", 404);

  await prisma.document.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: user!.id,
      action: "DELETE",
      entity: "Document",
      entityId: id,
      description: `Documento excluído: ${document.title}`,
    },
  });

  return successResponse({ message: "Documento excluído com sucesso" });
}
