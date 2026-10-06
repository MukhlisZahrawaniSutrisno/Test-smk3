'use client'

import React from 'react'
import { AlertOctagon, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface AuditSeverityMeterProps {
  totalTemuan: number
  totalKritikal: number
  totalMayor: number
  totalMinor: number
  totalOpen: number
  totalInProgress?: number
  totalClosed: number
  userRole?: string
}

export default function AuditSeverityMeter({
  totalTemuan,
  totalKritikal,
  totalMayor,
  totalMinor,
  totalOpen,
  totalInProgress = 0,
  totalClosed,
  userRole = 'ADMIN',
}: AuditSeverityMeterProps) {
  const closedPercentage = totalTemuan > 0 ? Math.round((totalClosed / totalTemuan) * 100) : 100

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-6">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Status & Tingkat Keparahan Temuan</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Distribusi temuan audit K3 berdasarkan urgensi penanganan (PP 50/2012)
            </p>
          </div>
          <Link
            href={userRole === 'PEGAWAI' ? '/pegawai/audit' : '/admin/audit'}
            className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
          >
            Lihat Semua &rarr;
          </Link>
        </div>

        {/* 3 Severity Cards */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {/* KRITIKAL */}
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-700 dark:text-red-300">
                Kritikal
              </span>
              <AlertOctagon size={14} className="text-red-600 dark:text-red-400" />
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-red-600 dark:text-red-400 leading-tight">
                {totalKritikal}
              </p>
              <p className="text-[10px] text-red-600/80 dark:text-red-300/80 font-semibold mt-0.5">
                Koreksi 1x24 jam
              </p>
            </div>
          </div>

          {/* MAYOR */}
          <div className="p-3.5 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-900/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-700 dark:text-orange-300">
                Mayor
              </span>
              <AlertTriangle size={14} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-orange-600 dark:text-orange-400 leading-tight">
                {totalMayor}
              </p>
              <p className="text-[10px] text-orange-600/80 dark:text-orange-300/80 font-semibold mt-0.5">
                Koreksi 1 bulan
              </p>
            </div>
          </div>

          {/* MINOR */}
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Minor
              </span>
              <Info size={14} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-tight">
                {totalMinor}
              </p>
              <p className="text-[10px] text-blue-600/80 dark:text-blue-300/80 font-semibold mt-0.5">
                Penyelesaian rutin
              </p>
            </div>
          </div>
        </div>

        {/* Progress Resolution Bar */}
        <div className="mt-5 space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-500" />
              Tingkat Penyelesaian Temuan:
            </span>
            <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
              {closedPercentage}% Selesai
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-700"
              style={{ width: `${closedPercentage}%` }}
              title={`Closed: ${totalClosed}`}
            />
            <div
              className="bg-red-500 h-full transition-all duration-700"
              style={{ width: `${100 - closedPercentage}%` }}
              title={`Open: ${totalOpen}`}
            />
          </div>

          <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 pt-1">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {totalClosed} Closed / Selesai
            </span>
            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              {totalOpen} Open / Butuh Tindakan
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
