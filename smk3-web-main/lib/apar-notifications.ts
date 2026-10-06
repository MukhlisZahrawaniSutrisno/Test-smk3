import type { Prisma, PrismaClient } from "@prisma/client";
import { getAparNotificationTypes, getAparWarningMessage, getJakartaToday, type AparNotificationType } from "./apar-policy";

export type AparNotificationDatabase = Pick<PrismaClient, "apar" | "$transaction">;
type NotificationError = { aparId: string; tipe?: AparNotificationType; message: string };
type RunOptions = {
  db: AparNotificationDatabase;
  now?: Date;
  waTo?: string;
  emailTo?: string;
  sendWhatsApp: (options: { recipientPhone: string; message: string }) => Promise<void>;
  sendEmail: (options: { to: string; subject: string; text: string }) => Promise<void>;
};

/** Each asset uses a database lock, so independent servers cannot send the same cycle concurrently. */
export async function runAparNotifications(options: RunOptions) {
  const { db } = options;
  const now = options.now ?? new Date();
  const today = getJakartaToday(now);
  const assets = await db.apar.findMany({ where: { status: "ACTIVE" }, select: { id: true } });
  const result = { scanned: assets.length, created: 0, alreadySent: 0, skippedLocked: 0, errors: [] as NotificationError[] };

  for (const candidate of assets) {
    try {
      const assetResult = await db.$transaction(async (tx: Prisma.TransactionClient) => {
        const locks = await tx.$queryRaw<{ locked: boolean }[]>`SELECT pg_try_advisory_xact_lock(hashtext(${candidate.id})) AS locked`;
        const counts = { created: 0, alreadySent: 0, skippedLocked: 0, errors: [] as NotificationError[] };
        if (!locks[0]?.locked) { counts.skippedLocked = 1; return counts; }
        // Re-read after acquiring the lock in case an earlier cron or refill changed this asset.
        const apar = await tx.apar.findUnique({ where: { id: candidate.id } });
        if (!apar || apar.status !== "ACTIVE") return counts;
        const types = getAparNotificationTypes(apar.tanggalExpired, today);
        if (!types.length) return counts;
        const existing = await tx.notifikasiApar.findMany({
          where: { aparId: apar.id, tanggalExpiredSnapshot: apar.tanggalExpired }, select: { tipe: true },
        });
        const pesan = getAparWarningMessage(apar, today);
        for (const tipe of types) {
          if (existing.some(log => log.tipe === tipe)) { counts.alreadySent++; continue; }
          try {
            if (tipe === "WA_EXPIRED") {
              const recipientPhone = apar.picNomorWa.trim() || options.waTo?.trim();
              if (!recipientPhone) throw new Error("PIC WhatsApp / APAR_WA_TO belum dikonfigurasi");
              await options.sendWhatsApp({ recipientPhone, message: pesan });
            } else if (tipe === "EMAIL_EXPIRED") {
              const to = options.emailTo?.trim();
              if (!to) throw new Error("APAR_EMAIL_TO belum dikonfigurasi");
              await options.sendEmail({ to, subject: `APAR kedaluwarsa: ${apar.kodeApar}`, text: pesan });
            }
          } catch (error) {
            counts.errors.push({ aparId: apar.id, tipe, message: error instanceof Error ? error.message : String(error) });
            continue;
          }
          // Never record a failed external send. Database failures abort this transaction.
          await tx.notifikasiApar.create({ data: {
            aparId: apar.id, tipe, pesan, tanggalExpiredSnapshot: apar.tanggalExpired, terkirimAt: now,
          } });
          counts.created++;
        }
        return counts;
      }, { maxWait: 5000, timeout: 60000 });
      result.created += assetResult.created;
      result.alreadySent += assetResult.alreadySent;
      result.skippedLocked += assetResult.skippedLocked;
      result.errors.push(...assetResult.errors);
    } catch (error) {
      result.errors.push({ aparId: candidate.id, message: error instanceof Error ? error.message : String(error) });
    }
  }
  return result;
}
