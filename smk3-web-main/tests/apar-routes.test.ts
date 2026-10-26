import assert from 'node:assert/strict'
import { test } from 'node:test'
import { NextRequest } from 'next/server'
import { GET as getCron } from '../app/api/cron/apar/route'
import { GET as getNotifications } from '../app/api/apar/notifications/route'
import { prisma } from '../lib/prisma'
import { createSessionToken } from '../lib/session-token'
import { SESSION_COOKIE } from '../lib/auth'

test('cron rejects missing or invalid secrets before any work', async (t) => {
  const previous = process.env.CRON_SECRET
  t.after(() => { if (previous === undefined) delete process.env.CRON_SECRET; else process.env.CRON_SECRET = previous })
  process.env.CRON_SECRET = ''
  assert.equal((await getCron(new Request('http://localhost/api/cron/apar'))).status, 503)
  process.env.CRON_SECRET = 'test-only-secret'
  assert.equal((await getCron(new Request('http://localhost/api/cron/apar'))).status, 401)
  assert.equal((await getCron(new Request('http://localhost/api/cron/apar', { headers: { authorization: 'Bearer wrong' } }))).status, 401)
})

test('notification API requires a valid database user and never caches private data', async (t) => {
  const previousSecret = process.env.AUTH_SECRET
  process.env.AUTH_SECRET = 'test-only-session-secret'
  t.after(() => { if (previousSecret === undefined) delete process.env.AUTH_SECRET; else process.env.AUTH_SECRET = previousSecret })
  const anonymous = await getNotifications(new NextRequest('http://localhost/api/apar/notifications'))
  assert.equal(anonymous.status, 401)
  assert.equal(anonymous.headers.get('cache-control'), 'private, no-store')
  const original = prisma.user.findUnique
  let calls = 0
  prisma.user.findUnique = (async () => { calls++; return null }) as unknown as typeof original
  t.after(() => { prisma.user.findUnique = original })
  const token = createSessionToken('missing', process.env.AUTH_SECRET)
  const request = new NextRequest('http://localhost/api/apar/notifications', { headers: { cookie: `${SESSION_COOKIE}=${token}` } })
  assert.equal((await getNotifications(request)).status, 401)
  assert.equal(calls, 1)
})
