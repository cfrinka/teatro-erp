import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rolePermissions: Record<string, string[]> = {
  ADMIN: [
    "dashboard",
    "students",
    "teachers",
    "courses",
    "classes",
    "enrollments",
    "attendance",
    "financial",
    "schedule",
    "communications",
    "documents",
    "reports",
    "settings",
    "users",
    "audit",
  ],
  COORDINATION: [
    "dashboard",
    "students",
    "teachers",
    "courses",
    "classes",
    "enrollments",
    "attendance",
    "schedule",
    "communications",
    "documents",
    "reports",
  ],
  FINANCIAL: ["dashboard", "financial", "reports", "students", "enrollments"],
  TEACHER: [
    "dashboard",
    "attendance",
    "schedule",
    "students",
    "classes",
    "communications",
  ],
  RECEPTION: [
    "dashboard",
    "students",
    "enrollments",
    "schedule",
    "communications",
  ],
};

export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Public routes and API routes
  if (pathname === "/login" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (!session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user.role as string;
  const permissions = rolePermissions[role] || [];

  const pathParts = pathname.split("/").filter(Boolean);
  const module = pathParts.length >= 1 ? pathParts[0] : "dashboard";

  if (!permissions.includes(module)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
