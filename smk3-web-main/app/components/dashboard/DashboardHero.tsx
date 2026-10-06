'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Ambulance,
  PlusCircle,
  Clock,
  PhoneCall,
  Calendar,
  CheckCircle2
} from 'lucide-react'

interface DashboardHeroProps {
  userName: string
  userRole: 'ADMIN' | 'AUDITOR' | 'PEGAWAI' | string
  openIncidentsCount?: number
  openAuditsCount?: number
}

export default function DashboardHero({
  userName,
  userRole,
  openIncidentsCount = 0,
  openAuditsCount = 0,
}: DashboardHeroProps) {
  const [greeting, setGreeting] = useState('Selamat Datang')
  const [currentDateStr, setCurrentDateStr] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 4 && hour < 11) setGreeting('Selamat Pagi')
    else if (hour >= 11 && hour < 15) setGreeting('Selamat Siang')
    else if (hour >= 15 && hour < 18) setGreeting('Selamat Sore')
    else setGreeting('Selamat Malam')

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
    setCurrentDateStr(new Intl.DateTimeFormat('id-ID', options).format(new Date()))
  }, [])

  const roleLabels: Record<string, { title: string; color: string; desc: string }> = {
    ADMIN: {
      title: 'Administrator K3',
      color: 'bg-red-500/20 text-red-200 border-red-400/30',
      desc: 'Panel kendali terpusat pengawasan SMK3, audit keselamatan, dan arsip digital Telkom Regional 3.',
    },
    AUDITOR: {
      title: 'Auditor SMK3',
      color: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
      desc: 'Panel verifikasi & evaluasi kepatuhan standar PP No. 50/2012 dan tindak lanjut temuan audit.',
    },
    PEGAWAI: {
      title: 'Pegawai / Personel Telkom',
      color: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
      desc: 'Portal keselamatan kerja mandiri. Laporkan potensi bahaya & insiden untuk ciptakan Zero Accident.',
    },
  }

  const roleInfo = roleLabels[userRole] || roleLabels.PEGAWAI

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white p-6 sm:p-8 lg:p-10 shadow-2xl border border-red-900/40">
      {/* Background Decorative Auras */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 right-10 opacity-5 pointer-events-none select-none">
        <ShieldCheck size={280} />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        {/* Left Column: Greeting & Info */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border backdrop-blur-md ${roleInfo.color}`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {roleInfo.title}
            </span>

            {currentDateStr && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/10 backdrop-blur-md">
                <Calendar size={13} className="text-red-400" />
                {currentDateStr}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            {greeting},{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-200 via-white to-amber-200">
              {userName}
            </span>{' '}
            👋
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
            {roleInfo.desc}
          </p>

          {/* Live Status Indicators */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-slate-200 font-bold backdrop-blur-md">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>Standar PP 50/2012 Terintegrasi</span>
            </div>

            {openIncidentsCount > 0 ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 font-bold">
                <AlertTriangle size={15} className="text-red-400 animate-bounce" />
                <span>{openIncidentsCount} Insiden Perlu Atensi</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 font-bold">
                <ShieldCheck size={15} className="text-emerald-400" />
                <span>Zero Accident Aktif</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Quick Actions */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
          {userRole === 'PEGAWAI' ? (
            <>
              <Link
                href="/pegawai/audit"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] border border-orange-400/40"
              >
                <AlertTriangle size={17} />
                <span>Lapor Kondisi Bahaya</span>
              </Link>
              <Link
                href="/pegawai/kecelakaan"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] border border-red-500/40"
              >
                <Ambulance size={17} />
                <span>Lapor Insiden Kerja</span>
              </Link>
            </>
          ) : userRole === 'AUDITOR' ? (
            <>
              <Link
                href="/admin/audit/create"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] border border-red-500/40"
              >
                <PlusCircle size={17} />
                <span>Input Temuan Audit Baru</span>
              </Link>
              <Link
                href="/admin/kriteria-referensi"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShieldCheck size={17} className="text-amber-400" />
                <span>Checklist 166 Kriteria</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/admin/audit/create"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] border border-red-500/40"
              >
                <PlusCircle size={17} />
                <span>Input Temuan Audit</span>
              </Link>
              <Link
                href="/admin/kecelakaan"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Ambulance size={17} className="text-red-400" />
                <span>Tinjau Laporan Insiden</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
