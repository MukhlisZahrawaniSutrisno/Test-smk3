import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserFromToken, SESSION_COOKIE } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAparWebNotifications } from '@/lib/apar-web-notifications'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const headers = { 'Cache-Control': 'private, no-store' }
  try {
    const user = await getAuthenticatedUserFromToken(request.cookies.get(SESSION_COOKIE)?.value)
    if (!user) return NextResponse.json({ error: 'Sesi tidak valid' }, { status: 401, headers })
    return NextResponse.json(await getAparWebNotifications(prisma), { headers })
  } catch (error) {
    console.error('APAR notification read failed:', error)
    return NextResponse.json({ error: 'Notifikasi APAR belum dapat dimuat' }, { status: 503, headers })
  }
}
