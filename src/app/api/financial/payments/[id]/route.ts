import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { z } from "zod";

const updateSchema = z.object({
  dueDate: z.string().optional(),
  amount: z.number().positive().optional(),
  status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED", "PARTIAL"]).optional(),
  paidDate: z.string().optional().nullable(),
  method: z.enum(["PIX", "BOLETO", "CREDIT_CARD", "DEBIT_CARD", "CASH", "TRANSFER"]).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireAuth();
  if (!authorized) return response as any;

  const { id } = await params;
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      enrollment: {
        include: {
          student: true,
          class: { include: { course: true } },
        },
      },
    },
  });
  if (!payment) return errorResponse("Pagamento não encontrado", 404);
  return successResponse(payment);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response, user } = await requireAuth(["ADMIN", "FINANCIAL"]);
  if (!authorized) return response as any;

  const { id } = await params;
  const existing = await prisma.payment.findUnique({ where: { id } });
  if (!existing) return errorResponse("Pagamento não encontrado", 404);

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    const updateData: Record<string, unknown> = { ...data };
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if ("paidDate" in data) {
      updateData.paidDate = data.paidDate ? new Date(data.paidDate) : null;
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: updateData as any,
      include: {
        enrollment: {
          select: { student: { select: { name: true } } },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: "UPDATE",
        entity: "Payment",
        entityId: id,
        description: `Pagamento atualizado: ${payment.enrollment.student.name} - ${payment.status}`,
      },
    });

    return successResponse(payment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues.map((e) => e.message).join(", "));
    }
    return errorResponse("Erro ao atualizar pagamento");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response, user } = await requireAuth(["ADMIN"]);
  if (!authorized) return response as any;

  const { id } = await params;
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { enrollment: { select: { student: { select: { name: true } } } } },
  });
  if (!payment) return errorResponse("Pagamento não encontrado", 404);

  await prisma.payment.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: user!.id,
      action: "DELETE",
      entity: "Payment",
      entityId: id,
      description: `Pagamento excluído: ${payment.enrollment.student.name}`,
    },
  });

  return successResponse({ message: "Pagamento excluído com sucesso" });
}
