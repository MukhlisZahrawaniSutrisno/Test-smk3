import type { PrismaClient } from '@prisma/client'
import { getJakartaToday, getWarningStart, getAparWarningMessage } from './apar-policy'

export async function getAparWebNotifications(db: PrismaClient, today = getJakartaToday()) {
  const rows = await db.notifikasiApar.findMany({
    where: { tipe: 'WEB_WARNING', apar: { status: 'ACTIVE' } },
    orderBy: { terkirimAt: 'desc' },
    select: {
      id: true, pesan: true, tanggalExpiredSnapshot: true,
      apar: { select: { kodeApar: true, lokasi: true, tanggalExpired: true } },
    },
  })
  const notifications = rows.filter((row) =>
    row.tanggalExpiredSnapshot.getTime() === row.apar.tanggalExpired.getTime() &&
    getWarningStart(row.apar.tanggalExpired) <= today
  ).sort((a, b) => a.apar.tanggalExpired.getTime() - b.apar.tanggalExpired.getTime())
  return {
    count: notifications.length,
    notifications: notifications.slice(0, 50).map(({ id, apar }) => ({
      id, pesan: getAparWarningMessage(apar, today), apar: { ...apar, tanggalExpired: apar.tanggalExpired.toISOString() },
    })),
  }
}
