import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromToken, SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const headers = new Headers({ "Cache-Control": "private, no-store" });
  try {
    const user = await getAuthenticatedUserFromToken(request.cookies.get(SESSION_COOKIE)?.value);
    if (!user) return NextResponse.json({ error: "Silakan login untuk membuka dokumen." }, { status: 401, headers });
    const { id } = await context.params;
    const document = await prisma.dashboardActivityDocument.findUnique({ where: { id } });
    if (!document) return NextResponse.json({ error: "Dokumen tidak ditemukan." }, { status: 404, headers });
    const result = await get(document.blobPathname, { access: "private" });
    if (!result || result.statusCode !== 200) return NextResponse.json({ error: "File dokumen tidak ditemukan." }, { status: 404, headers });
    const disposition = request.nextUrl.searchParams.get("disposition") === "inline" ? "inline" : "attachment";
    headers.set("Content-Disposition", `${disposition}; filename*=UTF-8''${encodeURIComponent(document.name)}`);
    headers.set("Content-Type", result.blob.contentType);
    headers.set("Content-Length", String(result.blob.size));
    return new Response(result.stream, { headers });
  } catch (error) {
    console.error("Dashboard document read failed:", error);
    return NextResponse.json({ error: "File dokumen belum dapat dibuka." }, { status: 503, headers });
  }
}
