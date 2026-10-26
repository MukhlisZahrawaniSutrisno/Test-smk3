import { createHmac, timingSafeEqual } from "node:crypto";

export type SessionClaims = { userId: string; expiresAt: number };

function signature(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(userId: string, secret: string, now = Date.now()) {
  if (!secret) throw new Error("AUTH_SECRET wajib diisi");
  const payload = Buffer.from(JSON.stringify({ userId, expiresAt: now + 8 * 60 * 60 * 1000 })).toString("base64url");
  return `${payload}.${signature(payload, secret)}`;
}

export function verifySessionToken(token: string | undefined, secret: string | undefined, now = Date.now()): SessionClaims | null {
  if (!token || !secret) return null;
  const [payload, suppliedSignature, extra] = token.split(".");
  if (!payload || !suppliedSignature || extra) return null;
  const expected = signature(payload, secret);
  const suppliedBytes = Buffer.from(suppliedSignature);
  const expectedBytes = Buffer.from(expected);
  if (suppliedBytes.length !== expectedBytes.length || !timingSafeEqual(suppliedBytes, expectedBytes)) return null;

  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString()) as SessionClaims;
    if (typeof claims.userId !== "string" || !claims.userId || !Number.isFinite(claims.expiresAt) || claims.expiresAt <= now) return null;
    return claims;
  } catch {
    return null;
  }
}
