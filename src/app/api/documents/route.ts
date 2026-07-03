import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const createSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  type: z.enum(["CONTRACT", "FORM", "REPORT", "CERTIFICATE", "OTHER"]),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  fileUrl: z.string().optional().nullable(),
  studentId: z.string().optional().nullable(),
  enrollmentId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: Request) {
  const { authorized, response } = await requireAuth(["ADMIN", "COORDINATION", "RECEPTION"]);
  if (!authorized) return response as any;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  const where: Prisma.DocumentWhereInput = {};
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (type) where.type = type as any;

  const [total, documents] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.findMany({
      where,
      include: {
        student: { select: { id: true, name: true } },
        uploadedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return successResponse({
    data: documents,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(request: Request) {
  const { authorized, response, user } = await requireAuth(["ADMIN", "COORDINATION", "RECEPTION"]);
  if (!authorized) return response as any;

  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const document = await prisma.document.create({
      data: {
        ...data,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        uploadedById: user!.id,
      },
      include: {
        student: { select: { name: true } },
        uploadedBy: { select: { name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: "CREATE",
        entity: "Document",
        entityId: document.id,
        description: `Documento criado: ${document.title}`,
      },
    });

    return successResponse(document, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues.map((e) => e.message).join(", "));
    }
    return errorResponse("Erro ao criar documento");
  }
}

