'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  Ambulance,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  CheckCircle2,
  AlertOctagon,
  User
} from 'lucide-react'

export interface ActivityItem {
  id: string
  type: 'TEMUAN' | 'INSIDEN'
  title: string
  location: string
  status: string
  category?: string
  kondisi?: string
  date: string
  reporterName?: string
  href: string
}

interface RecentActivityFeedProps {
  items: ActivityItem[]
  userRole?: string
}

export default function RecentActivityFeed({
  items,
  userRole = 'ADMIN',
}: RecentActivityFeedProps) {
  const [filter, setFilter] = useState<'ALL' | 'TEMUAN' | 'INSIDEN'>('ALL')

  const filteredItems = items.filter((item) => {
    if (filter === 'ALL') return true
    return item.type === filter
  })

  function formatTimeAgo(dateStr: string) {
    try {
      const date = new Date(dateStr)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffMinutes < 1) return 'Baru saja'
      if (diffMinutes < 60) return `${diffMinutes} mnt lalu`
      if (diffHours < 24) return `${diffHours} jam lalu`
      if (diffDays < 7) return `${diffDays} hari lalu`

      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date)
    } catch (e) {
      return dateStr
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
      <div>
        {/* Header & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert size={20} className="text-red-500" />
              <span>Aktivitas & Laporan Terkini</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Pemantauan live laporan bahaya dan insiden keselamatan kerja
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                filter === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Semua ({items.length})
            </button>
            <button
              onClick={() => setFilter('TEMUAN')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                filter === 'TEMUAN'
                  ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Temuan ({items.filter((i) => i.type === 'TEMUAN').length})
            </button>
            <button
              onClick={() => setFilter('INSIDEN')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                filter === 'INSIDEN'
                  ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Insiden ({items.filter((i) => i.type === 'INSIDEN').length})
            </button>
          </div>
        </div>

        {/* List of Activities */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 size={36} className="mx-auto text-emerald-500/60 mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tidak ada laporan dalam kategori ini
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Semua kondisi aman dan tidak ditemukan insiden terbuka.
              </p>
            </div>
          ) : (
            filteredItems.slice(0, 6).map((item) => {
              const isTemuan = item.type === 'TEMUAN'
              const isOpen = item.status === 'OPEN' || item.status === 'INVESTIGASI'

              return (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={item.href}
                  className="group py-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 p-2 rounded-2xl transition"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 transition group-hover:scale-105 ${
                        isTemuan
                          ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400'
                          : 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {isTemuan ? <AlertTriangle size={18} /> : <Ambulance size={18} />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            isTemuan
                              ? 'bg-orange-50 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300'
                              : 'bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300'
                          }`}
                        >
                          {isTemuan ? 'Temuan K3' : 'Insiden'}
                        </span>

                        {item.category && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {item.category}
                          </span>
                        )}

                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            isOpen
                              ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-1">
                        {item.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin size={11} className="text-slate-400" />
                          <span className="line-clamp-1 max-w-[160px]">{item.location}</span>
                        </span>

                        {item.reporterName && (
                          <span className="flex items-center gap-1">
                            <User size={11} />
                            <span>{item.reporterName}</span>
                          </span>
                        )}

                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          <span>{formatTimeAgo(item.date)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-1 text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 group-hover:translate-x-1 transition-all shrink-0 self-center">
                    <ChevronRight size={16} />
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-3 flex justify-between items-center text-xs">
        <span className="text-slate-400 font-medium">Menampilkan laporan terintegrasi</span>
        <Link
          href={userRole === 'PEGAWAI' ? '/pegawai/audit' : '/admin/audit'}
          className="inline-flex items-center gap-1 font-bold text-red-600 dark:text-red-400 hover:underline"
        >
          <span>Buka Modul Pelaporan</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  )
}
