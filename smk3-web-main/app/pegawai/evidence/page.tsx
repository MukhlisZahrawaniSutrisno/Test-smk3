export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EvidenceClientPage from '@/app/admin/evidence/client-page'
import { EVIDENCE_AREAS, EVIDENCE_PERIODS } from '@/lib/evidence-master-data'

export default async function PegawaiEvidencePage() {
  const cookieStore = await cookies()
  const userRole = cookieStore.get('user_role')?.value
  const userId = cookieStore.get('user_id')?.value

  if (!userId || userRole !== 'PEGAWAI') {
    redirect('/login')
  }

  const defaultArea = EVIDENCE_AREAS[0]
  const defaultPeriode = EVIDENCE_PERIODS[0]

  let records: any[] = []
  try {
    records = await (prisma as any).evidenceSmk3.findMany({
      where: {
        area: defaultArea,
        periode: defaultPeriode,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    })
  } catch (error) {
    console.error('Error fetching pegawai evidence records:', error)
    records = []
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <EvidenceClientPage
        initialRecords={JSON.parse(JSON.stringify(records || []))}
        initialArea={defaultArea}
        initialPeriode={defaultPeriode}
        userRole="PEGAWAI"
      />
    </div>
  )
}
