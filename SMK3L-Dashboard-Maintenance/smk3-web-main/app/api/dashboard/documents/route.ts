import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromToken, SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    const user = await getAuthenticatedUserFromToken(request.cookies.get(SESSION_COOKIE)?.value);
    if (!user) return NextResponse.json({ error: "Silakan login untuk melihat dokumen." }, { status: 401, headers });
    const activityId = request.nextUrl.searchParams.get("activityId");
    const documents = await prisma.dashboardActivityDocument.findMany({
      where: activityId ? { activityId } : undefined,
      orderBy: { createdAt: "desc" },
      select: { id: true, activityId: true, name: true, kind: true, source: true, size: true, pages: true, createdAt: true },
    });
    return NextResponse.json(documents, { headers });
  } catch (error) {
    console.error("Dashboard documents read failed:", error);
    return NextResponse.json({ error: "Dokumen bersama belum dapat dimuat." }, { status: 503, headers });
  }
}
