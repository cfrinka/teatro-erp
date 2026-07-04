import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { z } from "zod";


const createSchema = z.object({
  enrollmentId: z.string().min(1, "Matrícula é obrigatória"),
  dueDate: z.string().min(1, "Data de vencimento é obrigatória"),
  amount: z.number().positive("Valor deve ser positivo"),
  status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED", "PARTIAL"]).default("PENDING"),
  paidDate: z.string().optional().nullable(),
  method: z.enum(["PIX", "BOLETO", "CREDIT_CARD", "DEBIT_CARD", "CASH", "TRANSFER"]).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  const { authorized, response } = await requireAuth();
  if (!authorized) return response as any;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");

  const where: Record<string, unknown> = {};
  if (search) {
    where.enrollment = { student: { name: { contains: search } } };
  }
  if (status) where.status = status as any;
  if (startDate) where.dueDate = { ...(where.dueDate as any || {}), gte: new Date(startDate) };
  if (endDate) where.dueDate = { ...(where.dueDate as any || {}), lte: new Date(endDate) };

  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      include: {
        enrollment: {
          select: {
            student: { select: { id: true, name: true } },
            class: { select: { course: { select: { name: true } } } },
          },
        },
      },
      orderBy: { dueDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return successResponse({
    data: payments,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(request: Request) {
  const { authorized, response, user } = await requireAuth(["ADMIN", "FINANCIAL"]);
  if (!authorized) return response as any;

  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: data.enrollmentId },
      include: { student: { select: { name: true } } },
    });
    if (!enrollment) return errorResponse("Matrícula não encontrada", 404);

    const payment = await prisma.payment.create({
      data: {
        ...data,
        dueDate: new Date(data.dueDate),
        paidDate: data.paidDate ? new Date(data.paidDate) : null,
      },
      include: {
        enrollment: {
          select: { student: { select: { name: true } } },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: "CREATE",
        entity: "Payment",
        entityId: payment.id,
        description: `Pagamento criado: ${payment.enrollment.student.name} - ${data.amount}`,
      },
    });

    return successResponse(payment, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues.map((e) => e.message).join(", "));
    }
    return errorResponse("Erro ao criar pagamento");
  }
}

