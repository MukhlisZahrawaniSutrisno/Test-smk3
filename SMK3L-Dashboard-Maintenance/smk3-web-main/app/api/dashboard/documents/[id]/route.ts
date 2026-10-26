import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromToken, SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    const user = await getAuthenticatedUserFromToken(request.cookies.get(SESSION_COOKIE)?.value);
    if (!user) return NextResponse.json({ error: "Silakan login untuk menghapus dokumen." }, { status: 401, headers });
    const { id } = await context.params;
    const document = await prisma.dashboardActivityDocument.findUnique({ where: { id } });
    if (!document) return NextResponse.json({ error: "Dokumen tidak ditemukan." }, { status: 404, headers });
    if (user.role !== "ADMIN" && document.uploadedById !== user.id) {
      return NextResponse.json({ error: "Hanya pengunggah atau admin yang dapat menghapus dokumen ini." }, { status: 403, headers });
    }
    await del(document.blobPathname);
    await prisma.dashboardActivityDocument.delete({ where: { id } });
    return NextResponse.json({ success: true }, { headers });
  } catch (error) {
    console.error("Dashboard document delete failed:", error);
    return NextResponse.json({ error: "Dokumen belum dapat dihapus." }, { status: 503, headers });
  }
}
