export type AparNotificationType = "WEB_WARNING" | "EMAIL_EXPIRED";

/** Date-only values use UTC midnight; the current day is determined in Jakarta. */
export function getJakartaToday(now: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const value = (type: string) => Number(parts.find(part => part.type === type)?.value);
  return new Date(Date.UTC(value("year"), value("month") - 1, value("day")));
}

export function getWarningStart(expiry: Date): Date {
  const start = new Date(Date.UTC(expiry.getUTCFullYear(), expiry.getUTCMonth() - 2, 1));
  const lastDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0)).getUTCDate();
  start.setUTCDate(Math.min(expiry.getUTCDate(), lastDay));
  return start;
}

export function getAparNotificationTypes(expiry: Date, today: Date): AparNotificationType[] {
  if (today < getWarningStart(expiry)) return [];
  return today >= expiry ? ["WEB_WARNING", "EMAIL_EXPIRED"] : ["WEB_WARNING"];
}

export function getAparWarningMessage(apar: { kodeApar: string; lokasi: string; tanggalExpired: Date }, today: Date): string {
  const status = today >= apar.tanggalExpired ? 'telah kedaluwarsa' : 'akan kedaluwarsa';
  return `APAR ${apar.kodeApar} di ${apar.lokasi} ${status} pada ${apar.tanggalExpired.toISOString().slice(0, 10)}. Segera lakukan pemeriksaan dan penggantian atau refill.`;
}
