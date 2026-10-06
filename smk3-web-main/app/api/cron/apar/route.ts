import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runAparNotifications } from "@/lib/apar-notifications";
import { whatsappService } from "@/lib/services/whatsapp.service";
import { sendAparEmail } from "@/lib/services/email.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const headers = { 'Cache-Control': 'no-store' };
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return NextResponse.json({ error: "CRON_SECRET belum dikonfigurasi" }, { status: 503, headers });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }
  try {
    const result = await runAparNotifications({
      db: prisma, waTo: process.env.APAR_WA_TO, emailTo: process.env.APAR_EMAIL_TO,
      sendEmail: sendAparEmail,
      sendWhatsApp: async options => {
        const response = await whatsappService.sendMessage(options, 1);
        if (!response.success) throw new Error(response.error || "WhatsApp gagal dikirim");
      },
    });
    return NextResponse.json(result, { status: result.errors.length ? 503 : 200, headers });
  } catch (error) {
    console.error("APAR cron failed", error);
    return NextResponse.json({ error: "Pemrosesan APAR gagal" }, { status: 500, headers });
  }
}
