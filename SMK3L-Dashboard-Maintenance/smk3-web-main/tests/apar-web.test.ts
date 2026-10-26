import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { PrismaClient } from '@prisma/client'
import { getAparWebNotifications } from '../lib/apar-web-notifications'

test('badge counts current expiry cycles, keeps overdue warnings, and limits details', async () => {
  const expiry = new Date('2026-10-06')
  const rows = Array.from({ length: 52 }, (_, index) => ({
    id: String(index), pesan: 'Periksa APAR', tanggalExpiredSnapshot: expiry,
    apar: { kodeApar: `APAR-${index}`, lokasi: 'Lobby', tanggalExpired: expiry },
  }))
  rows.push({ id: 'old-cycle', pesan: 'Stale', tanggalExpiredSnapshot: new Date('2025-10-06'), apar: { kodeApar: 'REFILL', lokasi: 'Lobby', tanggalExpired: expiry } })
  rows.push({ id: 'not-due', pesan: 'Future', tanggalExpiredSnapshot: new Date('2027-10-06'), apar: { kodeApar: 'FUTURE', lokasi: 'Lobby', tanggalExpired: new Date('2027-10-06') } })
  let query: unknown
  const db = { notifikasiApar: { findMany: async (args: unknown) => { query = args; return rows } } } as unknown as PrismaClient
  const result = await getAparWebNotifications(db, new Date('2026-10-07'))
  assert.equal(result.count, 52)
  assert.equal(result.notifications.length, 50)
  assert.match(result.notifications[0].pesan, /telah kedaluwarsa/)
  assert.equal(result.notifications[0].apar.tanggalExpired, '2026-10-06T00:00:00.000Z')
  assert.deepEqual((query as { where: unknown }).where, { tipe: 'WEB_WARNING', apar: { status: 'ACTIVE' } })
})
