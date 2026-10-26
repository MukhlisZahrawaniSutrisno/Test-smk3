import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth"
import ArchiveClientPage from "./client-page"

export default async function Page() {
    const user = await getAuthenticatedUser()
    if (!user) redirect("/login")
    if (user.role !== "ADMIN" && user.role !== "AUDITOR") {
        redirect("/login")
    }

    const documents = await prisma.documentArchive.findMany({
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-8 font-sans">
            <ArchiveClientPage initialDocuments={documents} userRole={user.role} />
        </div>
    )
}
