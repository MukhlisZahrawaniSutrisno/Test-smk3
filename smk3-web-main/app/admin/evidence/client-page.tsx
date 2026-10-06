'use client'

import { useState, useTransition, useMemo } from 'react'
import {
  FileText,
  Search,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  TrendingUp,
  Download,
  Trash2,
  Eye,
  Loader2,
  X,
  Upload,
  Calendar,
  MapPin,
  Filter,
  Check,
  FolderOpen
} from 'lucide-react'
import {
  EVIDENCE_AREAS,
  EVIDENCE_PERIODS,
  EVIDENCE_MASTER_DATA,
  TOTAL_EVIDENCE_COUNT,
  EvidenceItem,
  ProcedureGroup,
} from '@/lib/evidence-master-data'
import { uploadEvidence, deleteEvidence } from '@/app/actions/evidence'
import toast from 'react-hot-toast'

interface EvidenceRecord {
  id: string
  itemCode: string
  area: string
  periode: number
  fileName: string
  filePath: string
  keterangan?: string | null
  uploadedBy?: string | null
  uploadedAt: Date | string
}

interface EvidenceClientPageProps {
  initialRecords: EvidenceRecord[]
  initialArea: string
  initialPeriode: number
  userRole?: string
}

export default function EvidenceClientPage({
  initialRecords,
  initialArea,
  initialPeriode,
  userRole = 'ADMIN',
}: EvidenceClientPageProps) {
  const [selectedArea, setSelectedArea] = useState(initialArea)
  const [selectedPeriode, setSelectedPeriode] = useState(initialPeriode)
  const [appliedArea, setAppliedArea] = useState(initialArea)
  const [appliedPeriode, setAppliedPeriode] = useState(initialPeriode)

  const [records, setRecords] = useState<EvidenceRecord[]>(initialRecords)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DONE' | 'PENDING'>('ALL')

  const [isPending, startTransition] = useTransition()

  // Modal State
  const [modalItem, setModalItem] = useState<{
    groupName: string
    item: EvidenceItem
  } | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [keterangan, setKeterangan] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  // Map itemCode -> record
  const recordMap = useMemo(() => {
    const map: Record<string, EvidenceRecord> = {}
    records.forEach((r) => {
      map[r.itemCode] = r
    })
    return map
  }, [records])

  // Helper untuk mendapatkan key unik item
  const getItemKey = (item: EvidenceItem) => item.code || item.title

  // Count fulfilled items
  const fulfilledCount = useMemo(() => {
    let count = 0
    EVIDENCE_MASTER_DATA.forEach((group) => {
      group.items.forEach((item) => {
        const itemKey = getItemKey(item)
        if (recordMap[itemKey]) {
          count += 1
        }
      })
    })
    return count
  }, [recordMap])

  const completionPercentage = useMemo(() => {
    if (TOTAL_EVIDENCE_COUNT === 0) return 0
    return ((fulfilledCount / TOTAL_EVIDENCE_COUNT) * 100).toFixed(1)
  }, [fulfilledCount])

  // Filtered Procedure Groups
  const filteredGroups = useMemo(() => {
    return EVIDENCE_MASTER_DATA.map((group) => {
      const matchingItems = group.items.filter((item) => {
        const itemKey = getItemKey(item)
        const matchesSearch =
          group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.code ? item.code.toLowerCase().includes(searchQuery.toLowerCase()) : false)

        const isFulfilled = !!recordMap[itemKey]
        let matchesStatus = true
        if (statusFilter === 'DONE') matchesStatus = isFulfilled
        if (statusFilter === 'PENDING') matchesStatus = !isFulfilled

        return matchesSearch && matchesStatus
      })

      return {
        ...group,
        items: matchingItems,
      }
    }).filter((group) => group.items.length > 0)
  }, [searchQuery, statusFilter, recordMap])

  // Handle Tampilkan Filter
  const handleApplyFilter = async () => {
    startTransition(async () => {
      setAppliedArea(selectedArea)
      setAppliedPeriode(selectedPeriode)
      // Import action dinamis atau fetch data
      const { getEvidenceRecords } = await import('@/app/actions/evidence')
      const res = await getEvidenceRecords(selectedArea, selectedPeriode)
      if (res.success && res.data) {
        setRecords(res.data as any)
        toast.success(`Menampilkan data ${selectedArea} (${selectedPeriode})`)
      }
    })
  }

  // Handle Upload Form Submit
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalItem || !uploadFile) {
      toast.error('Pilih file yang akan diunggah')
      return
    }

    const itemKey = getItemKey(modalItem.item)

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', uploadFile)
    formData.append('itemCode', itemKey)
    formData.append('area', appliedArea)
    formData.append('periode', appliedPeriode.toString())
    formData.append('keterangan', keterangan)

    const res = await uploadEvidence(formData)
    setIsUploading(false)

    if (res.success && res.data) {
      toast.success(`Evidence ${modalItem.item.code || modalItem.item.title} berhasil diunggah!`)
      setRecords((prev) => {
        const filtered = prev.filter((r) => r.itemCode !== itemKey)
        return [...filtered, res.data as any]
      })
      setModalItem(null)
      setUploadFile(null)
      setKeterangan('')
    } else {
      toast.error(res.message || 'Gagal mengunggah file')
    }
  }

  // Handle Delete Evidence
  const handleDelete = async (itemCode: string, title: string) => {
    if (!confirm(`Hapus berkas evidence untuk "${title}"?`)) return

    startTransition(async () => {
      const res = await deleteEvidence(itemCode, appliedArea, appliedPeriode)
      if (res.success) {
        toast.success('Berkas evidence berhasil dihapus')
        setRecords((prev) => prev.filter((r) => r.itemCode !== itemCode))
      } else {
        toast.error(res.message || 'Gagal menghapus berkas')
      }
    })
  }

  return (
    <div className="space-y-6 font-sans">
      {/* --- 1. HEADER & KPI CARDS --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shadow-inner">
              <FileCheck size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                Upload Evidence SMK3
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tracker Dokumen & Checklist Bukti Pemenuhan Manual & Prosedur SMK3L
              </p>
            </div>
          </div>
        </div>

        {/* Quick Area Badge */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <MapPin size={15} className="text-red-600" />
          <span>{appliedArea}</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <Calendar size={15} className="text-red-600" />
          <span>Periode {appliedPeriode}</span>
        </div>
      </div>

      {/* --- 2. SUMMARY KPI STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Target Evidence */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Target Evidence
            </p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-0.5">
              {TOTAL_EVIDENCE_COUNT} <span className="text-xs font-medium text-slate-400">Dokumen</span>
            </h3>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-r"></div>
        </div>

        {/* Card 2: Terpenuhi */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Evidence Terpenuhi
            </p>
            <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {fulfilledCount} <span className="text-xs font-medium text-slate-400">/ {TOTAL_EVIDENCE_COUNT}</span>
            </h3>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-r"></div>
        </div>

        {/* Card 3: Persentase Kepatuhan */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tingkat Pemenuhan
            </p>
            <span className="text-sm font-black text-red-600 dark:text-red-400">
              {completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-red-600 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1 font-medium">
            <TrendingUp size={13} className="text-emerald-500" />
            {fulfilledCount === TOTAL_EVIDENCE_COUNT
              ? 'Seluruh evidence 100% lengkap!'
              : `${TOTAL_EVIDENCE_COUNT - fulfilledCount} dokumen belum diunggah`}
          </p>
        </div>
      </div>

      {/* --- 3. FILTER BAR (SESUAI GAMBAR ASLI) --- */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          {/* Filter Area */}
          <div className="sm:col-span-5 space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Area
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition"
            >
              {EVIDENCE_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Periode */}
          <div className="sm:col-span-4 space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Periode
            </label>
            <select
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition"
            >
              {EVIDENCE_PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Tombol Tampilkan (Merah Telkom) */}
          <div className="sm:col-span-3">
            <button
              onClick={handleApplyFilter}
              disabled={isPending}
              className="w-full py-2.5 px-5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl shadow-md shadow-red-900/20 active:scale-95 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              <span>Tampilkan</span>
            </button>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Cari kode formulir / manual..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition"
            />
          </div>

          {/* Quick Filter Status */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${statusFilter === 'ALL'
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
            >
              Semua ({TOTAL_EVIDENCE_COUNT})
            </button>
            <button
              onClick={() => setStatusFilter('DONE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${statusFilter === 'DONE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
                }`}
            >
              <CheckCircle2 size={13} />
              Terpenuhi ({fulfilledCount})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${statusFilter === 'PENDING'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
                }`}
            >
              <AlertCircle size={13} />
              Belum ({TOTAL_EVIDENCE_COUNT - fulfilledCount})
            </button>
          </div>
        </div>
      </div>

      {/* --- 4. DATA TABLE --- */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-6 w-1/4">Manual & Prosedur</th>
                <th className="py-3.5 px-6 w-2/5">No. Form & Lampiran</th>
                <th className="py-3.5 px-4 text-center w-24">Jumlah Evidence</th>
                <th className="py-3.5 px-4 text-center w-28">Evidence Terpenuhi</th>
                <th className="py-3.5 px-4 text-center w-36">Evidence (Berkas TTD)</th>
                <th className="py-3.5 px-4 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FolderOpen size={40} className="mx-auto mb-2 opacity-40" />
                    Tidak ada data formulir yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => {
                  return group.items.map((item, itemIdx) => {
                    const itemKey = getItemKey(item)
                    const record = recordMap[itemKey]
                    const isFulfilled = !!record

                    return (
                      <tr
                        key={`${group.no}-${itemIdx}-${itemKey}`}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-750 transition ${isFulfilled ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                          }`}
                      >
                        {/* No (Merged visually for first item) */}
                        {itemIdx === 0 ? (
                          <td
                            rowSpan={group.items.length}
                            className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300 align-top border-r border-slate-100 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-900/30"
                          >
                            {group.no}
                          </td>
                        ) : null}

                        {/* Manual & Prosedur Name (Merged) */}
                        {itemIdx === 0 ? (
                          <td
                            rowSpan={group.items.length}
                            className="py-3 px-6 align-top border-r border-slate-100 dark:border-slate-700/40"
                          >
                            <span className="font-extrabold text-slate-800 dark:text-slate-100 block">
                              {group.name}
                            </span>
                          </td>
                        ) : null}

                        {/* No. Form & Lampiran + Title + Direct Link Google Docs (Optional) */}
                        <td className="py-3 px-6">
                          <div className="space-y-1">
                            {item.templateUrl ? (
                              item.code ? (
                                <>
                                  <a
                                    href={item.templateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold hover:underline text-xs tracking-tight group"
                                    title="Klik untuk membuka template Google Docs / File editable"
                                  >
                                    <span>{item.code}</span>
                                    <ExternalLink
                                      size={12}
                                      className="opacity-70 group-hover:opacity-100 transition-opacity"
                                    />
                                  </a>
                                  <p className="text-slate-700 dark:text-slate-300 font-medium text-xs leading-relaxed">
                                    {item.title}
                                  </p>
                                </>
                              ) : (
                                <a
                                  href={item.templateUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold hover:underline text-xs leading-relaxed group"
                                  title="Klik untuk membuka template Google Docs / File editable"
                                >
                                  <span>{item.title}</span>
                                  <ExternalLink
                                    size={12}
                                    className="opacity-70 group-hover:opacity-100 transition-opacity shrink-0"
                                  />
                                </a>
                              )
                            ) : (
                              <>
                                {item.code && (
                                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">
                                    {item.code}
                                  </span>
                                )}
                                <p className="text-slate-700 dark:text-slate-300 font-medium text-xs leading-relaxed">
                                  {item.title}
                                </p>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Jumlah Evidence (Target) */}
                        <td className="py-3 px-4 text-center font-bold text-slate-600 dark:text-slate-400 text-xs">
                          {item.targetCount}
                        </td>

                        {/* Evidence Terpenuhi */}
                        <td className="py-3 px-4 text-center">
                          {isFulfilled ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 shadow-xs">
                              <CheckCircle2 size={12} />
                              1
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              0
                            </span>
                          )}
                        </td>

                        {/* Evidence Berkas Link / Status */}
                        <td className="py-3 px-4 text-center">
                          {isFulfilled && record ? (
                            <div className="flex flex-col items-center gap-1">
                              {(() => {
                                const lowerName = record.fileName.toLowerCase()
                                const isDocx = lowerName.endsWith('.docx') || lowerName.endsWith('.doc')
                                const isPdf = lowerName.endsWith('.pdf')
                                const isExcel = lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')

                                let badgeColor = 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 hover:bg-blue-100'
                                if (isDocx) {
                                  badgeColor = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 hover:bg-indigo-100'
                                } else if (isPdf) {
                                  badgeColor = 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 hover:bg-red-100'
                                } else if (isExcel) {
                                  badgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 hover:bg-emerald-100'
                                }

                                return (
                                  <a
                                    href={record.filePath}
                                    download={isDocx || isExcel ? record.fileName : undefined}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 ${badgeColor} rounded-lg text-xs font-bold transition max-w-[160px] truncate shadow-xs`}
                                    title={`Lihat / Unduh file: ${record.fileName}`}
                                  >
                                    {isDocx || isExcel ? <Download size={12} /> : <Eye size={12} />}
                                    <span className="truncate">{record.fileName}</span>
                                  </a>
                                )
                              })()}
                              {record.uploadedBy && (
                                <span className="text-[10px] text-slate-400">
                                  oleh {record.uploadedBy}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Belum ada berkas
                            </span>
                          )}
                        </td>

                        {/* Aksi (+ Upload / Hapus) */}
                        <td className="py-3 px-4 text-center">
                          {isFulfilled ? (
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Re-upload button */}
                              <button
                                onClick={() =>
                                  setModalItem({
                                    groupName: group.name,
                                    item: item,
                                  })
                                }
                                title="Ganti berkas evidence TTD"
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 flex items-center justify-center transition shadow-xs"
                              >
                                <Upload size={14} />
                              </button>
                              {/* Delete button */}
                              <button
                                onClick={() => handleDelete(item.code || item.title, item.title)}
                                title="Hapus berkas evidence"
                                className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/50 dark:hover:bg-red-900/60 dark:text-red-400 flex items-center justify-center transition shadow-xs"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                setModalItem({
                                  groupName: group.name,
                                  item: item,
                                })
                              }
                              title="Upload Dokumen Bertanda Tangan (TTD)"
                              className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white flex items-center justify-center transition font-bold shadow-xs mx-auto"
                            >
                              <Plus size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                })
              )}
            </tbody>

            {/* TOTAL FOOTER (SESUAI GAMBAR) */}
            <tfoot className="bg-slate-100 dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 border-t-2 border-slate-300 dark:border-slate-700">
              <tr>
                <td colSpan={3} className="py-4 px-6 text-right uppercase tracking-wider font-extrabold text-sm">
                  TOTAL
                </td>
                <td className="py-4 px-4 text-center font-extrabold text-sm">
                  {TOTAL_EVIDENCE_COUNT}
                </td>
                <td className="py-4 px-4 text-center font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                  {fulfilledCount}
                </td>
                <td colSpan={2} className="py-4 px-4 text-center text-xs text-slate-500 font-semibold">
                  Tingkat Kepatuhan: {completionPercentage}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* --- 5. MODAL UPLOAD EVIDENCE TTD --- */}
      {modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-red-800 to-red-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <Upload size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">
                    Upload Berkas Evidence TTD
                  </h3>
                  <p className="text-xs text-red-100 opacity-90">
                    {appliedArea} • Periode {appliedPeriode}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalItem(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
              {/* Info Target Dokumen */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-red-600 dark:text-red-400 tracking-wider">
                  {modalItem.groupName}
                </span>
                {modalItem.item.code && (
                  <h4 className="font-black text-slate-800 dark:text-white text-sm">
                    {modalItem.item.code}
                  </h4>
                )}
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  {modalItem.item.title}
                </p>
              </div>

              {/* Upload Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Pilih Berkas Scan / Evidence TTD
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400">
                    PDF, DOCX, DOC, JPG, PNG, XLSX
                  </span>
                </div>
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.xlsx,.xls"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 dark:file:bg-red-950/60 dark:file:text-red-300 file:cursor-pointer border border-slate-200 dark:border-slate-700 rounded-2xl p-2 bg-slate-50 dark:bg-slate-900"
                />
                <p className="text-[11px] text-slate-400 italic">
                  *Mendukung dokumen Microsoft Word (.docx/.doc), PDF, gambar scan (.jpg/.png), dan Excel (.xlsx).
                </p>
              </div>

              {/* Keterangan Tambahan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Keterangan / Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Misal: Sudah ditandatangani oleh GM & Asman..."
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalItem(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !uploadFile}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-lg shadow-red-900/30 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Mengunggah...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      <span>Simpan Evidence</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
