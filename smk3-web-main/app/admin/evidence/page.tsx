import type { EvidenceSmk3 } from "@prisma/client"
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import EvidenceClientPage from './client-page'
import { EVIDENCE_AREAS, EVIDENCE_PERIODS } from '@/lib/evidence-master-data'

export default async function AdminEvidencePage() {
  const defaultArea = EVIDENCE_AREAS[0] // '-TELKOM REGIONAL-III'
  const defaultPeriode = EVIDENCE_PERIODS[0] // 2026

  let records: EvidenceSmk3[] = []
  try {
    records = await prisma.evidenceSmk3.findMany({
      where: {
        area: defaultArea,
        periode: defaultPeriode,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    })
  } catch (error) {
    console.error('Error fetching admin evidence records:', error)
    records = []
  }

  return (
    <EvidenceClientPage
      initialRecords={JSON.parse(JSON.stringify(records || []))}
      initialArea={defaultArea}
      initialPeriode={defaultPeriode}
      userRole="ADMIN"
    />
  )
}
