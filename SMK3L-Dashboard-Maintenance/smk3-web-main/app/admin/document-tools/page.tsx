import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth"
import ToolsClient from "./ToolsClient"

export default async function AdminDocumentToolsPage() {
  const user = await getAuthenticatedUser()
  if (!user) redirect("/login")
  if (user.role !== "ADMIN") {
    redirect("/admin/audit")
  }

  return (
    <div className="space-y-8 font-sans">
      <Suspense fallback={<div className="p-12 text-center text-sm font-bold text-slate-400">Memuat Document Tools...</div>}>
        <ToolsClient />
      </Suspense>
    </div>
  )
}
