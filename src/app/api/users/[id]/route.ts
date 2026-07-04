import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response, user } = await requireAuth(["ADMIN"]);
  if (!authorized) return response as any;

  try {
    const { id } = await params;
    const { active } = await request.json();

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    if (!existingUser) return errorResponse("Usuário não encontrado", 404);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { active },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: "UPDATE",
        entity: "User",
        entityId: updatedUser.id,
        description: `Usuário ${active ? "ativado" : "desativado"}: ${updatedUser.name}`,
      },
    });

    return successResponse(updatedUser);
  } catch {
    return errorResponse("Erro ao atualizar usuário");
  }
}
