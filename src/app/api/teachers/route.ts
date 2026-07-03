import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  cpf: z.string().min(11),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  specialty: z.string().optional().nullable(),
  curriculum: z.string().optional().nullable(),
  availability: z.string().optional().nullable(),
  hourlyRate: z.number().optional().default(0),
  notes: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  const { authorized, response } = await requireAuth();
  if (!authorized) return response as any;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { specialty: { contains: search } },
      { cpf: { contains: search } },
    ];
  }

  const teachers = await prisma.teacher.findMany({
    where: where as any,
    orderBy: { name: "asc" },
    include: { user: { select: { id: true, email: true } } },
  });

  return successResponse(teachers);
}

export async function POST(request: Request) {
  const { authorized, response, user } = await requireAuth(["ADMIN", "COORDINATION"]);
  if (!authorized) return response as any;

  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const existing = await prisma.teacher.findUnique({ where: { cpf: data.cpf } });
    if (existing) return errorResponse("CPF já cadastrado");

    const teacher = await prisma.teacher.create({ data });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: "CREATE",
        entity: "Teacher",
        entityId: teacher.id,
        description: `Professor criado: ${teacher.name}`,
      },
    });

    return successResponse(teacher, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues.map((e) => e.message).join(", "));
    }
    return errorResponse("Erro ao criar professor");
  }
}

