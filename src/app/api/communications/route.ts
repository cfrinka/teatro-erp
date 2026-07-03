import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const createSchema = z.object({
  type: z.enum(["EMAIL", "SMS", "WHATSAPP", "NOTIFICATION", "BULLETIN"]),
  subject: z.string().min(1, "Assunto é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  recipients: z.array(z.string()).min(1, "Pelo menos um destinatário"),
  recipientType: z.enum(["ALL_STUDENTS", "ALL_PARENTS", "SPECIFIC_STUDENTS", "ALL_TEACHERS", "CLASS"]),
  classId: z.string().optional().nullable(),
  scheduledFor: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  const { authorized, response } = await requireAuth(["ADMIN", "COORDINATION", "TEACHER", "RECEPTION"]);
  if (!authorized) return response as any;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  const where: Prisma.CommunicationWhereInput = {};
  if (search) {
    where.OR = [
      { subject: { contains: search } },
      { content: { contains: search } },
    ];
  }

  const [total, communications] = await Promise.all([
    prisma.communication.count({ where }),
    prisma.communication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return successResponse({
    data: communications,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(request: Request) {
  const { authorized, response, user } = await requireAuth(["ADMIN", "COORDINATION", "TEACHER", "RECEPTION"]);
  if (!authorized) return response as any;

  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const communication = await prisma.communication.create({
      data: {
        ...data,
        recipients: JSON.stringify(data.recipients),
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
        sentById: user!.id,
        sentAt: data.scheduledFor ? null : new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: "CREATE",
        entity: "Communication",
        entityId: communication.id,
        description: `Comunicação criada: ${communication.subject}`,
      },
    });

    return successResponse(communication, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues.map((e) => e.message).join(", "));
    }
    return errorResponse("Erro ao criar comunicação");
  }
}

