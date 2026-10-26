export const dynamic = 'force-dynamic'

import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth"
import { getKriteriaWithDocuments } from "@/app/actions/kriteriaReference"
import KriteriaClient from "@/app/admin/kriteria-referensi/KriteriaClient"

export const metadata = {
  title: "Referensi Kriteria SMK3 - Pegawai",
  description: "Daftar dokumen referensi kriteria audit SMK3 PP No. 50/2012 Telkom Indonesia",
}

export default async function PegawaiKriteriaReferensiPage() {
  const user = await getAuthenticatedUser()
  if (!user) redirect("/login")

  const kriteriaData = await getKriteriaWithDocuments()

  return (
    <KriteriaClient
      initialData={JSON.parse(JSON.stringify(kriteriaData))}
      userRole={user.role}
      userName={user.name || "Pegawai"}
    />
  )
}
