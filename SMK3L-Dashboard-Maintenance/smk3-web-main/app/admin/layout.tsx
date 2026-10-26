import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import AdminLayoutClient from "./AdminLayoutClient";

export const metadata: Metadata = {
  title: "Admin Dashboard - SMK3 Telkom",
  description: "Panel Admin Sistem Manajemen K3",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");
  if (user.role === "PEGAWAI") {
    redirect("/pegawai/dashboard");
  }

  // AMBIL DATA NOTIFIKASI SECARA DINAMIS
  const openAuditsCount = await prisma.temuanAudit.count({
    where: { status: "OPEN" },
  });

  const incidentsCount = await prisma.laporanKecelakaan.count();

  return (
    <AdminLayoutClient
      userName={user.name || "Admin"}
      userRole={user.role}
      openAuditsCount={openAuditsCount}
      incidentsCount={incidentsCount}
    >
      {children}
    </AdminLayoutClient>
  );
}
