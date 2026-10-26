export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma"
import IbprClientPage from "./client-page"
import { getAuthenticatedUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Page() {
    const user = await getAuthenticatedUser()
    if (!user) redirect("/login")
    if (user.role !== "ADMIN") redirect("/admin/dashboard")
    const data = await prisma.ibpr.findMany({
        orderBy: { lokasi: 'asc' }
    })

    // Group by Lokasi
    const groupedData: Record<string, typeof data> = {}
    data.forEach(item => {
        if (!groupedData[item.lokasi]) {
            groupedData[item.lokasi] = []
        }
        groupedData[item.lokasi].push(item)
    })

    return (
        <div className="space-y-8 font-sans">
            <IbprClientPage groupedData={groupedData} />
        </div>
    )
}
