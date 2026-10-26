export const dynamic = 'force-dynamic'

import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth"
import { getKriteriaWithDocuments } from "@/app/actions/kriteriaReference"
import KriteriaClient from "./KriteriaClient"

export const metadata = {
  title: "Dokumen Referensi Kriteria SMK3 - Telkom Indonesia",
  description: "Daftar dokumen referensi kriteria audit SMK3 PP No. 50/2012 Telkom Indonesia",
}

export default async function AdminKriteriaReferensiPage() {
  const user = await getAuthenticatedUser()
  if (!user) redirect("/login")

  const kriteriaData = await getKriteriaWithDocuments()

  return (
    <KriteriaClient
      initialData={JSON.parse(JSON.stringify(kriteriaData))}
      userRole={user.role}
      userName={user.name || "Admin"}
    />
  )
}
