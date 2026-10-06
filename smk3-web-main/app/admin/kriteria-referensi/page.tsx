export const dynamic = 'force-dynamic'

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getKriteriaWithDocuments } from "@/app/actions/kriteriaReference"
import KriteriaClient from "./KriteriaClient"

export const metadata = {
  title: "Dokumen Referensi Kriteria SMK3 - Telkom Indonesia",
  description: "Daftar dokumen referensi kriteria audit SMK3 PP No. 50/2012 Telkom Indonesia",
}

export default async function AdminKriteriaReferensiPage() {
  const cookieStore = await cookies()
  const userRole = cookieStore.get("user_role")?.value
  const userName = cookieStore.get("user_name")?.value || "Admin"

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
