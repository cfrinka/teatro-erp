import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";


export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role as string,
  };
}

export async function requireAuth(allowedRoles?: string[]) {
  const user = await getSessionUser();
  if (!user) {
    return { authorized: false, response: errorResponse("Não autorizado", 401), user: null };
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return { authorized: false, response: errorResponse("Permissão negada", 403), user: null };
  }
  return { authorized: true, response: null, user };
}
