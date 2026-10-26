import { cookies } from "next/headers";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, type SessionClaims } from "@/lib/session-token";

export const SESSION_COOKIE = "smk3_session";
export const SESSION_MAX_AGE = 60 * 60 * 8;

export type AuthenticatedUser = { id: string; email: string; name: string | null; role: Role };

export async function getAuthenticatedUserFromToken(token?: string): Promise<AuthenticatedUser | null> {
  const claims: SessionClaims | null = verifySessionToken(token, process.env.AUTH_SECRET);
  if (!claims) return null;
  return prisma.user.findUnique({
    where: { id: claims.userId },
    select: { id: true, email: true, name: true, role: true },
  });
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  return getAuthenticatedUserFromToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function requireRole(roles: readonly Role[]) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  if (!roles.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}
