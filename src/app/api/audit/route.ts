import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { NextResponse } from "next/server";


export async function GET(request: Request): Promise<NextResponse> {
  const auth = await requireAuth(["ADMIN"]);
  if (!auth.authorized) return auth.response as unknown as NextResponse;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const action = searchParams.get("action") || "";
  const entity = searchParams.get("entity") || "";
  const userId = searchParams.get("userId") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");

  const where: Record<string, unknown> = {};
  if (search) {
    where.description = { contains: search };
  }
  if (action) where.action = action as any;
  if (entity) where.entity = entity as any;
  if (userId) where.userId = userId;
  if (startDate) where.createdAt = { ...(where.createdAt as any || {}), gte: new Date(startDate) };
  if (endDate) where.createdAt = { ...(where.createdAt as any || {}), lte: new Date(endDate) };

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return successResponse({
    data: logs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
