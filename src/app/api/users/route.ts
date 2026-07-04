import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { z } from "zod";
import { hash } from "bcryptjs";

const createSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  role: z.enum(["ADMIN", "COORDINATION", "FINANCIAL", "TEACHER", "RECEPTION"]),
  phone: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  const { authorized, response } = await requireAuth(["ADMIN"]);
  if (!authorized) return response as any;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const users = await prisma.user.findMany({
    where: where as any,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      phone: true,
      photoUrl: true,
      createdAt: true,
      teacher: { select: { id: true } },
    },
  });

  return successResponse(users);
}

export async function POST(request: Request) {
  const { authorized, response, user } = await requireAuth(["ADMIN"]);
  if (!authorized) return response as any;

  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return errorResponse("Email já cadastrado");

    const passwordHash = await hash(data.password, 12);

    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        phone: data.phone || null,
        active: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        phone: true,
        createdAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: "CREATE",
        entity: "User",
        entityId: newUser.id,
        description: `Usuário criado: ${newUser.name} (${newUser.role})`,
      },
    });

    return successResponse(newUser, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues.map((e) => e.message).join(", "));
    }
    return errorResponse("Erro ao criar usuário");
  }
}
