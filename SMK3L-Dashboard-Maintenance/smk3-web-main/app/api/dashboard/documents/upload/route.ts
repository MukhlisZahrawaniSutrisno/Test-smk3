import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromToken, SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_DASHBOARD_DOCUMENT_BYTES, parseDashboardDocumentPayload } from "@/lib/dashboard-document-validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseTokenPayload(value: unknown) {
  try {
    const payload = typeof value === "string" ? JSON.parse(value) as Record<string, unknown> : value as Record<string, unknown>;
    const document = parseDashboardDocumentPayload(payload);
    if (!document || typeof payload.uploadedById !== "string" || !payload.uploadedById || !Number.isInteger(payload.size) || (payload.size as number) < 1 || (payload.size as number) > MAX_DASHBOARD_DOCUMENT_BYTES) return null;
    return {
      ...document,
      size: payload.size as number,
      uploadedById: payload.uploadedById,
      uploadedByName: typeof payload.uploadedByName === "string" ? payload.uploadedByName.slice(0, 120) : null,
    };
  } catch { return null; }
}

export async function POST(request: NextRequest) {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    const body = await request.json() as HandleUploadBody;
    if (body.type === "blob.generate-client-token") {
      const origin = request.headers.get("origin");
      if (!origin || new URL(origin).origin !== new URL(request.url).origin) {
        return NextResponse.json({ error: "Permintaan unggah tidak valid." }, { status: 403, headers });
      }
      const user = await getAuthenticatedUserFromToken(request.cookies.get(SESSION_COOKIE)?.value);
      if (!user) return NextResponse.json({ error: "Silakan login untuk mengunggah dokumen." }, { status: 401, headers });
    }

    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const user = await getAuthenticatedUserFromToken(request.cookies.get(SESSION_COOKIE)?.value);
        if (!user) throw new Error("Sesi tidak valid.");
        const document = parseDashboardDocumentPayload(JSON.parse(clientPayload || "null"));
        if (!document || !pathname.startsWith(`smk3l-dashboard/${document.activityId}/`)) {
          throw new Error("Data dokumen tidak valid.");
        }
        return {
          allowedContentTypes: [document.contentType],
          maximumSizeInBytes: MAX_DASHBOARD_DOCUMENT_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ ...document, uploadedById: user.id, uploadedByName: user.name || user.email }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const metadata = parseTokenPayload(tokenPayload);
        if (!metadata || blob.contentType !== metadata.contentType) {
          throw new Error("Berkas unggahan tidak sesuai aturan.");
        }
        await prisma.dashboardActivityDocument.create({ data: {
          activityId: metadata.activityId,
          name: metadata.name,
          kind: metadata.kind,
          source: metadata.source,
          blobPathname: blob.pathname,
          size: metadata.size,
          pages: metadata.pages,
          uploadedById: metadata.uploadedById,
          uploadedByName: metadata.uploadedByName,
        } });
      },
    });
    return NextResponse.json(result, { headers });
  } catch (error) {
    console.error("Dashboard document upload failed:", error);
    return NextResponse.json({ error: "Unggahan gagal. Periksa login, koneksi, dan konfigurasi penyimpanan." }, { status: 503, headers });
  }
}
