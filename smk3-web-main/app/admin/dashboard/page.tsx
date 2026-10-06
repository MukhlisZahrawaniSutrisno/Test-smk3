export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import {
  Users,
  AlertTriangle,
  FileText,
  ShieldCheck,
  TrendingUp,
  FolderArchive,
  FileCheck,
  ArrowRight,
  PlusCircle,
  FolderOpen
} from "lucide-react";
import IncidentChart from "./IncidentChart";
import ArchiveCharts from "./ArchiveCharts";
import DashboardHero from "@/app/components/dashboard/DashboardHero";
import AuditSeverityMeter from "@/app/components/dashboard/AuditSeverityMeter";
import RecentActivityFeed, { ActivityItem } from "@/app/components/dashboard/RecentActivityFeed";
import Link from "next/link";

export default async function AdminDashboard() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const cookieStore = await cookies();
  const userRole = cookieStore.get("user_role")?.value || "ADMIN";
  const userName = cookieStore.get("user_name")?.value || "Admin";

  // 1. Ambil Data Statistik & Aktivitas Secara Paralel
  const [
    totalUser,
    totalAudit,
    totalAuditOpen,
    totalKritikal,
    totalMayor,
    totalMinor,
    totalAuditClosed,
    totalInsiden,
    totalInsidenOpen,
    insidenBulanIni,
    totalIbpr,
    insidenTahunan,
    totalArchive,
    totalDigital,
    totalNonDigital,
    totalEvidence,
    allDocuments,
    recentTemuan,
    recentInsiden,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.temuanAudit.count(),
    prisma.temuanAudit.count({ where: { status: "OPEN" } }),
    prisma.temuanAudit.count({ where: { kategori: "KRITIKAL" } }),
    prisma.temuanAudit.count({ where: { kategori: "MAYOR" } }),
    prisma.temuanAudit.count({ where: { kategori: "MINOR" } }),
    prisma.temuanAudit.count({ where: { status: "CLOSED" } }),
    prisma.laporanKecelakaan.count(),
    prisma.laporanKecelakaan.count({ where: { status: { not: "CLOSED" } } }),
    prisma.laporanKecelakaan.count({
      where: {
        waktuKejadian: {
          gte: new Date(currentYear, currentMonth, 1),
          lt: new Date(currentYear, currentMonth + 1, 1),
        },
      },
    }),
    prisma.ibpr.count(),
    prisma.laporanKecelakaan.findMany({
      where: {
        waktuKejadian: {
          gte: new Date(currentYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1),
        },
      },
      select: {
        waktuKejadian: true,
      },
    }),
    prisma.documentArchive.count(),
    prisma.documentArchive.count({ where: { digitalStatus: "Sudah Digital" } }),
    prisma.documentArchive.count({ where: { digitalStatus: "Belum Digital" } }),
    prisma.evidenceSmk3.count(),
    prisma.documentArchive.findMany({
      select: {
        documentType: true,
        documentDate: true,
      }
    }),
    prisma.temuanAudit.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { auditor: true },
    }),
    prisma.laporanKecelakaan.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { pelapor: true },
    }),
  ]);

  // 2. Olah Data untuk Grafik Bulanan
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Ags", "Sep", "Okt", "Nov", "Des"
  ];

  const chartData = monthNames.map((name, index) => {
    const total = insidenTahunan.filter(
      (insiden) => insiden.waktuKejadian.getMonth() === index
    ).length;
    return { name, total };
  });

  // Olah Data Dokumen Berdasarkan Jenis untuk PieChart
  const typeMap: Record<string, number> = {};
  allDocuments.forEach(doc => {
    typeMap[doc.documentType] = (typeMap[doc.documentType] || 0) + 1;
  });
  const typeChartData = Object.entries(typeMap).map(([name, value]) => ({
    name,
    value
  }));

  // Olah Data Dokumen Berdasarkan Tahun untuk AreaChart
  const yearMap: Record<string, number> = {};
  allDocuments.forEach(doc => {
    try {
      const y = new Date(doc.documentDate).getFullYear().toString();
      yearMap[y] = (yearMap[y] || 0) + 1;
    } catch (e) {}
  });
  const yearChartData = Object.entries(yearMap)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Gabungkan aktivitas terbaru
  const activityItems: ActivityItem[] = [
    ...recentTemuan.map((t) => ({
      id: t.id,
      type: "TEMUAN" as const,
      title: t.judul,
      location: t.lokasi,
      status: t.status,
      category: t.kategori,
      kondisi: t.kondisi,
      date: t.createdAt.toISOString(),
      reporterName: t.auditor?.name || "Petugas K3",
      href: "/admin/audit",
    })),
    ...recentInsiden.map((i) => ({
      id: i.id,
      type: "INSIDEN" as const,
      title: i.judul,
      location: i.lokasi,
      status: i.status,
      date: i.createdAt.toISOString(),
      reporterName: i.pelapor?.name || "Pelapor",
      href: "/admin/kecelakaan",
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  const digitalRatio = totalArchive > 0 ? Math.round((totalDigital / totalArchive) * 100) : 0;

  return (
    <div className="space-y-8 font-sans">
      {/* 1. HERO BANNER EXECUTIVE GREETING */}
      <DashboardHero
        userName={userName}
        userRole={userRole}
        openIncidentsCount={totalInsidenOpen}
        openAuditsCount={totalAuditOpen}
      />

      {/* 2. GRID METRIK UTAMA (KPI CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Insiden K3 */}
        <Link
          href="/admin/kecelakaan"
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 hover:shadow-xl hover:border-red-400 dark:hover:border-red-900/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[160px] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-red-500/5 dark:bg-red-500/10 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-125"></div>
          
          <div className="flex justify-between items-start w-full relative z-10">
            <div>
              <span className="text-[10px] font-black text-red-700 dark:text-red-400 uppercase tracking-wider bg-red-50 dark:bg-red-950/60 px-3 py-1 rounded-full border border-red-200/80 dark:border-red-900/50">
                Insiden K3
              </span>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
                {totalInsiden}
              </h3>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/40 shadow-sm group-hover:scale-110 transition-transform">
              <AlertTriangle size={22} strokeWidth={2.5} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-1.5 relative z-10">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${
              totalInsidenOpen > 0
                ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}>
              {totalInsidenOpen} Aktif
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
              {insidenBulanIni} Bulan Ini
            </span>
          </div>
        </Link>

        {/* Card 2: Temuan Audit */}
        <Link
          href="/admin/audit"
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 hover:shadow-xl hover:border-orange-400 dark:hover:border-orange-900/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[160px] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-orange-500/5 dark:bg-orange-500/10 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-125"></div>
          
          <div className="flex justify-between items-start w-full relative z-10">
            <div>
              <span className="text-[10px] font-black text-orange-700 dark:text-orange-400 uppercase tracking-wider bg-orange-50 dark:bg-orange-950/60 px-3 py-1 rounded-full border border-orange-200/80 dark:border-orange-900/50">
                Temuan Audit
              </span>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
                {totalAudit}
              </h3>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-2xl border border-orange-100 dark:border-orange-900/40 shadow-sm group-hover:scale-110 transition-transform">
              <FileText size={22} strokeWidth={2.5} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-1.5 relative z-10">
            <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2.5 py-1 rounded-xl border border-red-200 dark:border-red-900/40">
              {totalAuditOpen} Open
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
              {totalAuditClosed} Closed
            </span>
          </div>
        </Link>

        {/* Card 3: Dokumen IBPR */}
        <Link
          href="/admin/ibpr"
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-900/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[160px] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 dark:bg-amber-500/10 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-125"></div>
          
          <div className="flex justify-between items-start w-full relative z-10">
            <div>
              <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200/80 dark:border-amber-900/50">
                Dokumen IBPR
              </span>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
                {totalIbpr}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-100 dark:border-amber-900/40 shadow-sm group-hover:scale-110 transition-transform">
              <TrendingUp size={22} strokeWidth={2.5} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 relative z-10 font-semibold">
            <span>Pemetaan Risiko Ruangan</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">&rarr;</span>
          </div>
        </Link>

        {/* Card 4: Evidence SMK3 */}
        <Link
          href="/admin/evidence"
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 hover:shadow-xl hover:border-emerald-400 dark:hover:border-emerald-900/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[160px] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-125"></div>
          
          <div className="flex justify-between items-start w-full relative z-10">
            <div>
              <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-900/50">
                Evidence SMK3
              </span>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
                {totalEvidence}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm group-hover:scale-110 transition-transform">
              <FileCheck size={22} strokeWidth={2.5} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 relative z-10 font-semibold">
            <span>Dokumen TTD & Berkas Audit</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">&rarr;</span>
          </div>
        </Link>

      </div>

      {/* 3. ROW: TREN INSIDEN CHART & SHORTCUT HUB */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Incident Trend Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 relative z-10">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Tren Laporan Insiden K3 ({currentYear})</span>
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-medium">
                Fluktuasi akumulasi insiden dilaporkan per bulan di Telkom Regional 3
              </p>
            </div>
            <Link
              href="/admin/kecelakaan"
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Detail Laporan</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="w-full h-[300px] relative z-10">
            <IncidentChart data={chartData} />
          </div>
        </div>

        {/* Quick Action Launcher Card */}
        <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl shadow-xl border border-slate-700/70 p-6 flex flex-col justify-between space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-red-300 border border-white/10 backdrop-blur-md">
                Aksi Cepat Sistem
              </span>
              <ShieldCheck size={20} className="text-red-400" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              Tindakan Manajemen K3
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed font-medium">
              Pintasan operasional untuk memelihara kepatuhan keselamatan dan digitalisasi dokumen.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 gap-2.5">
            <Link
              href="/admin/audit/create"
              className="flex items-center justify-between p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all group text-xs font-bold text-white"
            >
              <span className="flex items-center gap-2.5">
                <PlusCircle size={16} className="text-red-400" />
                <span>Input Temuan Audit Baru</span>
              </span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/admin/ibpr"
              className="flex items-center justify-between p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all group text-xs font-bold text-white"
            >
              <span className="flex items-center gap-2.5">
                <FolderOpen size={16} className="text-amber-400" />
                <span>Kelola Dokumen IBPR</span>
              </span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/admin/archive"
              className="flex items-center justify-between p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all group text-xs font-bold text-white"
            >
              <span className="flex items-center gap-2.5">
                <FolderArchive size={16} className="text-blue-400" />
                <span>Arsip Dokumen Digital ({digitalRatio}% Ter-scan)</span>
              </span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            {userRole === "ADMIN" && (
              <Link
                href="/admin/users"
                className="flex items-center justify-between p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all group text-xs font-bold text-white"
              >
                <span className="flex items-center gap-2.5">
                  <Users size={16} className="text-emerald-400" />
                  <span>Manajemen SDM & Role</span>
                </span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>

      </div>

      {/* 4. ROW: AUDIT SEVERITY METER & LIVE ACTIVITY FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5">
          <AuditSeverityMeter
            totalTemuan={totalAudit}
            totalKritikal={totalKritikal}
            totalMayor={totalMayor}
            totalMinor={totalMinor}
            totalOpen={totalAuditOpen}
            totalClosed={totalAuditClosed}
            userRole={userRole}
          />
        </div>

        <div className="lg:col-span-7">
          <RecentActivityFeed
            items={activityItems}
            userRole={userRole}
          />
        </div>
      </div>

      {/* 5. ROW: ARSIP DOKUMEN CHARTS (ADMIN ONLY) */}
      {userRole === "ADMIN" && (
        <ArchiveCharts typeData={typeChartData} yearData={yearChartData} />
      )}

    </div>
  );
}
