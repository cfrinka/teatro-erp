import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { z } from "zod";


const createSchema = z.object({
  studentId: z.string().min(1, "Aluno é obrigatório"),
  classId: z.string().min(1, "Turma é obrigatória"),
  monthlyFee: z.number().positive("Valor da mensalidade deve ser positivo"),
  contractDate: z.string().min(1, "Data do contrato é obrigatória"),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  const { authorized, response } = await requireAuth();
  if (!authorized) return response as any;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { student: { name: { contains: search } } },
      { class: { course: { name: { contains: search } } } },
    ];
  }
  if (status) where.status = status as any;

  const [total, enrollments] = await Promise.all([
    prisma.enrollment.count({ where }),
    prisma.enrollment.findMany({
      where,
      include: {
        student: { select: { id: true, name: true } },
        class: {
          select: {
            id: true,
            course: { select: { name: true } },
            weekDays: true,
            startTime: true,
          },
        },
      },
      orderBy: { contractDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return successResponse({
    data: enrollments,
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

    const classObj = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { enrollments: { where: { status: "ACTIVE" } } } } },
    });
    if (!classObj) return errorResponse("Turma não encontrada", 404);
    if (classObj.maxStudents && classObj._count.enrollments >= classObj.maxStudents) {
      return errorResponse("Turma lotada");
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: data.studentId,
        classId: data.classId,
        monthlyFee: data.monthlyFee,
        contractDate: new Date(data.contractDate),
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        notes: data.notes,
      },
      include: {
        student: { select: { name: true } },
        class: { select: { course: { select: { name: true } } } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: "CREATE",
        entity: "Enrollment",
        entityId: enrollment.id,
        description: `Matrícula criada: ${enrollment.student.name} em ${enrollment.class.course.name}`,
      },
    });

    return successResponse(enrollment, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues.map((e) => e.message).join(", "));
    }
    return errorResponse("Erro ao criar matrícula");
  }
}

