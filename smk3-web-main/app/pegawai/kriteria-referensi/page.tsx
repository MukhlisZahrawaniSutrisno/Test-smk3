export const dynamic = 'force-dynamic'

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getKriteriaWithDocuments } from "@/app/actions/kriteriaReference"
import KriteriaClient from "@/app/admin/kriteria-referensi/KriteriaClient"

export const metadata = {
  title: "Referensi Kriteria SMK3 - Pegawai",
  description: "Daftar dokumen referensi kriteria audit SMK3 PP No. 50/2012 Telkom Indonesia",
}

export default async function PegawaiKriteriaReferensiPage() {
  const cookieStore = await cookies()
  const userRole = cookieStore.get("user_role")?.value
  const userName = cookieStore.get("user_name")?.value || "Pegawai"

  if (!userRole) {
    redirect("/login")
  }

  const kriteriaData = await getKriteriaWithDocuments()

  return (
    <KriteriaClient
      initialData={JSON.parse(JSON.stringify(kriteriaData))}
      userRole={userRole}
      userName={userName}
    />
  )
}
