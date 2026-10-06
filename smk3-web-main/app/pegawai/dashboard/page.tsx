export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  AlertTriangle,
  Ambulance,
  ShieldCheck,
  FolderArchive,
  BookOpen,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { cookies } from "next/headers";
import DashboardHero from "@/app/components/dashboard/DashboardHero";
import RecentActivityFeed, { ActivityItem } from "@/app/components/dashboard/RecentActivityFeed";

export default async function PegawaiDashboard() {
  const cookieStore = await cookies();
  const userName = cookieStore.get("user_name")?.value || "Rekan Telkom";
  const userId = cookieStore.get("user_id")?.value;
  const userRole = cookieStore.get("user_role")?.value || "PEGAWAI";

  // Ambil Data Khusus Pegawai & Data Global
  const whereConditionTemuan = userId ? { auditorId: userId } : {};
  const whereConditionInsiden = userId ? { pelaporId: userId } : {};

  const [
    myTemuanCount,
    myInsidenCount,
    myTemuanOpen,
    myInsidenOpen,
    recentTemuan,
    recentInsiden,
  ] = await Promise.all([
    prisma.temuanAudit.count({ where: whereConditionTemuan }),
    prisma.laporanKecelakaan.count({ where: whereConditionInsiden }),
    prisma.temuanAudit.count({ where: { ...whereConditionTemuan, status: "OPEN" } }),
    prisma.laporanKecelakaan.count({ where: { ...whereConditionInsiden, status: { not: "CLOSED" } } }),
    prisma.temuanAudit.findMany({
      where: whereConditionTemuan,
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.laporanKecelakaan.findMany({
      where: whereConditionInsiden,
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const myActivityItems: ActivityItem[] = [
    ...recentTemuan.map((t) => ({
      id: t.id,
      type: "TEMUAN" as const,
      title: t.judul,
      location: t.lokasi,
      status: t.status,
      category: t.kategori,
      kondisi: t.kondisi,
      date: t.createdAt.toISOString(),
      href: "/pegawai/audit",
    })),
    ...recentInsiden.map((i) => ({
      id: i.id,
      type: "INSIDEN" as const,
      title: i.judul,
      location: i.lokasi,
      status: i.status,
      date: i.createdAt.toISOString(),
      href: "/pegawai/kecelakaan",
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

  return (
    <div className="space-y-8 font-sans">
      {/* 1. HERO BANNER WELCOME */}
      <DashboardHero
        userName={userName}
        userRole={userRole}
        openIncidentsCount={myInsidenOpen}
        openAuditsCount={myTemuanOpen}
      />

      {/* 2. EMPLOYEE KPI SUMMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Laporan Temuan Bahaya */}
        <Link
          href="/pegawai/audit"
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 hover:shadow-xl hover:border-orange-400 dark:hover:border-orange-900/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[150px] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-orange-500/5 dark:bg-orange-500/10 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-125"></div>
          
          <div className="flex justify-between items-start w-full relative z-10">
            <div>
              <span className="text-[10px] font-black text-orange-700 dark:text-orange-400 uppercase tracking-wider bg-orange-50 dark:bg-orange-950/60 px-3 py-1 rounded-full border border-orange-200/80 dark:border-orange-900/50">
                Temuan Saya
              </span>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
                {myTemuanCount}
              </h3>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-2xl border border-orange-100 dark:border-orange-900/40 shadow-sm group-hover:scale-110 transition-transform">
              <AlertTriangle size={22} strokeWidth={2.5} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 relative z-10 font-semibold">
            <span>{myTemuanOpen} Butuh Verifikasi</span>
            <span className="text-orange-600 dark:text-orange-400 font-bold">&rarr;</span>
          </div>
        </Link>

        {/* Card 2: Laporan Insiden Saya */}
        <Link
          href="/pegawai/kecelakaan"
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 hover:shadow-xl hover:border-red-400 dark:hover:border-red-900/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[150px] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-red-500/5 dark:bg-red-500/10 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-125"></div>
          
          <div className="flex justify-between items-start w-full relative z-10">
            <div>
              <span className="text-[10px] font-black text-red-700 dark:text-red-400 uppercase tracking-wider bg-red-50 dark:bg-red-950/60 px-3 py-1 rounded-full border border-red-200/80 dark:border-red-900/50">
                Insiden Saya
              </span>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
                {myInsidenCount}
              </h3>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/40 shadow-sm group-hover:scale-110 transition-transform">
              <Ambulance size={22} strokeWidth={2.5} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 relative z-10 font-semibold">
            <span>{myInsidenOpen} Proses Investigasi</span>
            <span className="text-red-600 dark:text-red-400 font-bold">&rarr;</span>
          </div>
        </Link>

        {/* Card 3: Status Zero Accident */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between min-h-[150px] relative overflow-hidden">
          <div className="flex justify-between items-start w-full relative z-10">
            <div>
              <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-900/50">
                Status Area
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-3 tracking-tight flex items-center gap-1.5">
                <CheckCircle2 size={24} className="text-emerald-500" />
                <span>Zero Accident</span>
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm">
              <ShieldCheck size={22} strokeWidth={2.5} />
            </div>
          </div>

          <div className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
            TREG 3 Area Terproteksi
          </div>
        </div>

        {/* Card 4: Referensi Kriteria */}
        <Link
          href="/pegawai/kriteria-referensi"
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-900/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[150px] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/5 dark:bg-blue-500/10 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-125"></div>
          
          <div className="flex justify-between items-start w-full relative z-10">
            <div>
              <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200/80 dark:border-blue-900/50">
                Panduan K3
              </span>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
                166
              </h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-900/40 shadow-sm group-hover:scale-110 transition-transform">
              <BookOpen size={22} strokeWidth={2.5} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 relative z-10 font-semibold">
            <span>Kriteria Audit PP 50/2012</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">&rarr;</span>
          </div>
        </Link>

      </div>

      {/* 3. MENU UTAMA PEGAWAI (4 INTERACTIVE ACTION CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Lapor Temuan */}
        <Link
          href="/pegawai/audit"
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-orange-500 hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col justify-between"
        >
          <div className="w-14 h-14 bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-sm">
            <AlertTriangle size={28} />
          </div>
          <div>
            <h4 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              Lapor Temuan Bahaya
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
              Laporkan kondisi tidak aman atau potensi bahaya di area kerja Telkom.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-orange-600 dark:text-orange-400">
            <span>Buka Formulir</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 2: Lapor Insiden */}
        <Link
          href="/pegawai/kecelakaan"
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-red-500 hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col justify-between"
        >
          <div className="w-14 h-14 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm">
            <Ambulance size={28} />
          </div>
          <div>
            <h4 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              Lapor Insiden Kerja
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
              Formulir cepat pelaporan kecelakaan atau insiden darurat di lapangan.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-red-600 dark:text-red-400">
            <span>Buka Formulir</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 3: Referensi Kriteria */}
        <Link
          href="/pegawai/kriteria-referensi"
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-500 hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col justify-between"
        >
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
            <BookOpen size={28} />
          </div>
          <div>
            <h4 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Kriteria SMK3 (PP 50)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
              Pelajari 166 butir standar kriteria wajib keselamatan kerja nasional.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
            <span>Buka Katalog</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 4: Arsip Dokumen Digital */}
        <Link
          href="/pegawai/archive"
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500 hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col justify-between"
        >
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
            <FolderArchive size={28} />
          </div>
          <div>
            <h4 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Arsip & Dokumen K3
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
              Akses berkas digitalisasi SOP, surat instruksi, dan sertifikasi.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>Akses Berkas</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

      </div>

      {/* 4. ROW: RECENT ACTIVITY (MY REPORTS) */}
      <RecentActivityFeed
        items={myActivityItems}
        userRole="PEGAWAI"
      />

    </div>
  );
}