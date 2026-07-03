import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";

export async function GET(_request: Request) {
  const { authorized, response } = await requireAuth();
  if (!authorized) return response as any;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const weekDayMap = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const todayDayName = weekDayMap[now.getDay()] as string;

  const [
    totalStudents,
    activeStudents,
    totalTeachers,
    totalCourses,
    activeClasses,
    activeEnrollments,
    monthlyRevenue,
    pendingPayments,
    overdueCount,
    todayClasses,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.teacher.count({ where: { status: "ACTIVE" } }),
    prisma.course.count({ where: { status: "ACTIVE" } }),
    prisma.class.count({ where: { status: "ACTIVE" } }),
    prisma.enrollment.count({ where: { status: "ACTIVE" } }),
    prisma.payment.aggregate({
      where: {
        status: "PAID",
        paidDate: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: "PENDING",
        dueDate: { gte: now },
      },
      _sum: { amount: true },
    }),
    prisma.payment.count({
      where: { status: "OVERDUE" },
    }),
    prisma.class.count({
      where: {
        status: "ACTIVE",
        weekDays: {
          contains: todayDayName,
        },
      },
    }),
  ]);

  // Get upcoming events
  const upcomingEvents = await prisma.event.findMany({
    where: { startDate: { gte: now } },
    orderBy: { startDate: "asc" },
    take: 5,
  });

  // Get recent payments
  const recentPayments = await prisma.payment.findMany({
    where: { status: "PAID", paidDate: { gte: monthStart } },
    include: {
      enrollment: {
        select: {
          student: { select: { name: true } },
          class: { select: { course: { select: { name: true } } } },
        },
      },
    },
    orderBy: { paidDate: "desc" },
    take: 10,
  });

  // Get overdue payments
  const overduePayments = await prisma.payment.findMany({
    where: { status: "OVERDUE" },
    include: {
      enrollment: {
        select: {
          student: { select: { name: true } },
          monthlyFee: true,
        },
      },
    },
    orderBy: { dueDate: "asc" },
    take: 5,
  });

  return successResponse({
    metrics: {
      totalStudents,
      activeStudents,
      totalTeachers,
      totalCourses,
      activeClasses,
      activeEnrollments,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      pendingRevenue: pendingPayments._sum.amount || 0,
      overdueCount,
      todayClasses,
    },
    upcomingEvents,
    recentPayments,
    overduePayments,
  });
}

