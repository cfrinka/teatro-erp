import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { z } from "zod";

const updateSchema = z.object({
  schoolName: z.string().optional(),
  schoolAddress: z.string().optional(),
  schoolPhone: z.string().optional(),
  schoolEmail: z.string().email().optional(),
  schoolCnpj: z.string().optional(),
  defaultMonthlyFee: z.number().positive().optional(),
  lateFeePercent: z.number().min(0).max(100).optional(),
  maxStudentsPerClass: z.number().positive().optional(),
  allowOnlineRegistration: z.boolean().optional(),
  enableSmsNotifications: z.boolean().optional(),
  enableEmailNotifications: z.boolean().optional(),
  workingDays: z.array(z.string()).optional(),
  academicYear: z.string().optional(),
});

export async function GET(_request: Request) {
  const { authorized, response } = await requireAuth(["ADMIN"]);
  if (!authorized) return response as any;

  const settings = await prisma.settings.findFirst();
  if (!settings) {
    // Create default settings
    const defaults = await prisma.settings.create({
      data: {
        schoolName: "Escola de Teatro",
        workingDays: JSON.stringify(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]),
        academicYear: new Date().getFullYear().toString(),
      },
    });
    return successResponse(defaults);
  }

  return successResponse(settings);
}

export async function PUT(request: Request) {
  const { authorized, response, user } = await requireAuth(["ADMIN"]);
  if (!authorized) return response as any;

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    const { workingDays, ...restData } = data;

    let settings = await prisma.settings.findFirst();
    if (settings) {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          ...restData,
          ...(workingDays !== undefined ? { workingDays: JSON.stringify(workingDays) } : {}),
        },
      });
    } else {
      settings = await prisma.settings.create({
        data: {
          schoolName: data.schoolName || "Escola de Teatro",
          schoolAddress: data.schoolAddress,
          schoolPhone: data.schoolPhone,
          schoolEmail: data.schoolEmail,
          schoolCnpj: data.schoolCnpj,
          defaultMonthlyFee: data.defaultMonthlyFee,
          lateFeePercent: data.lateFeePercent,
          maxStudentsPerClass: data.maxStudentsPerClass,
          allowOnlineRegistration: data.allowOnlineRegistration,
          enableSmsNotifications: data.enableSmsNotifications,
          enableEmailNotifications: data.enableEmailNotifications,
          workingDays: JSON.stringify(workingDays || ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]),
          academicYear: data.academicYear || new Date().getFullYear().toString(),
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: "UPDATE",
        entity: "Settings",
        entityId: settings.id,
        description: "Configurações do sistema atualizadas",
      },
    });

    return successResponse(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues.map((e) => e.message).join(", "));
    }
    return errorResponse("Erro ao atualizar configurações");
  }
}

