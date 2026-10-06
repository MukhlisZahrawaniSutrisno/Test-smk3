import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAparWebNotifications } from '@/lib/apar-web-notifications'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const headers = { 'Cache-Control': 'private, no-store' }
  const userId = request.cookies.get('user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Silakan login' }, { status: 401, headers })
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
    if (!user) return NextResponse.json({ error: 'Sesi tidak valid' }, { status: 401, headers })
    return NextResponse.json(await getAparWebNotifications(prisma), { headers })
  } catch (error) {
    console.error('APAR notification read failed:', error)
    return NextResponse.json({ error: 'Notifikasi APAR belum dapat dimuat' }, { status: 503, headers })
  }
}
