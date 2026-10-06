'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  Upload,
  FileText,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Layers,
  Sparkles,
  Trash2,
  FileCheck2,
  X,
  Plus,
  AlertCircle
} from 'lucide-react'
import { KriteriaWithDoc } from '@/app/actions/kriteriaReference'
import { ELEMEN_LIST } from '@/app/utils/kriteriaReferenceData'

interface KriteriaClientProps {
  initialData: KriteriaWithDoc[]
  userRole: string
  userName: string
}

export default function KriteriaClient({ initialData, userRole, userName }: KriteriaClientProps) {
  const [data, setData] = useState<KriteriaWithDoc[]>(initialData)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedElemen, setSelectedElemen] = useState<string>('ALL')
  const [hasFileFilter, setHasFileFilter] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Notification Banner
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Edit / Upload Modal State
  const [editingItem, setEditingItem] = useState<KriteriaWithDoc | null>(null)
  const [inputDocNumber, setInputDocNumber] = useState('')
  const [inputDocTitle, setInputDocTitle] = useState('')
  const [inputKeterangan, setInputKeterangan] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete confirmation modal state
  const [deletingKriteriaNo, setDeletingKriteriaNo] = useState<string | null>(null)

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification(null)
    }, 4000)
  }

  // Filtered and searched data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        searchTerm === '' ||
        item.nomor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.docNumber ? item.docNumber.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (item.docTitle && item.docTitle.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchElemen = selectedElemen === 'ALL' || item.elemenNumber === Number(selectedElemen)
      const matchFile = !hasFileFilter || !!item.filePath

      return matchSearch && matchElemen && matchFile
    })
  }, [data, searchTerm, selectedElemen, hasFileFilter])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredData.slice(start, start + itemsPerPage)
  }, [filteredData, currentPage, itemsPerPage])

  const handleOpenEdit = (item: KriteriaWithDoc) => {
    setEditingItem(item)
    setInputDocNumber(item.docNumber && item.docNumber !== '-' ? item.docNumber : item.defaultDocRef || '')
    setInputDocTitle(item.docTitle || '')
    setInputKeterangan(item.keterangan || '')
    setSelectedFile(null)
  }

  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('kriteriaNo', editingItem.nomor)
      formData.append('docNumber', inputDocNumber)
      formData.append('docTitle', inputDocTitle)
      formData.append('keterangan', inputKeterangan)
      formData.append('updatedBy', userName || 'Admin')
      if (selectedFile) {
        formData.append('file', selectedFile)
      }

      const response = await fetch('/api/kriteria-referensi', {
        method: 'POST',
        body: formData,
      })

      const res = await response.json()
      if (res.success) {
        // Update local state
        setData((prev) =>
          prev.map((it) => {
            if (it.nomor === editingItem.nomor) {
              return {
                ...it,
                docNumber: inputDocNumber,
                docTitle: inputDocTitle || null,
                keterangan: inputKeterangan || null,
                filePath: res.filePath || (selectedFile ? `/uploads/kriteria-docs/${selectedFile.name}` : it.filePath),
                fileName: res.fileName || (selectedFile ? selectedFile.name : it.fileName),
                updatedBy: userName,
                updatedAt: new Date(),
              }
            }
            return it
          })
        )

        showNotification('success', `Dokumen referensi kriteria ${editingItem.nomor} berhasil disimpan!`)
        setEditingItem(null)
      } else {
        showNotification('error', res.error || 'Terjadi kesalahan saat menyimpan.')
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Gagal menyimpan dokumen.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDeleteFile = async () => {
    if (!deletingKriteriaNo) return

    try {
      const response = await fetch('/api/kriteria-referensi', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kriteriaNo: deletingKriteriaNo }),
      })

      const res = await response.json()
      if (res.success) {
        setData((prev) =>
          prev.map((it) => (it.nomor === deletingKriteriaNo ? { ...it, filePath: null, fileName: null } : it))
        )
        setEditingItem((prev) => (prev && prev.nomor === deletingKriteriaNo ? { ...prev, filePath: null, fileName: null } : prev))
        showNotification('success', `Berkas lampiran untuk kriteria ${deletingKriteriaNo} berhasil dihapus.`)
      } else {
        showNotification('error', res.error || 'Gagal menghapus berkas.')
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Gagal menghapus berkas.')
    } finally {
      setDeletingKriteriaNo(null)
    }
  }

  // Summary counts
  const totalKriteria = data.length
  const totalDocsAvailable = data.filter((d) => !!d.filePath).length

  const canManage = userRole === 'ADMIN' || userRole === 'AUDITOR'

  return (
    <div className="space-y-6">
      {/* NOTIFICATION TOAST */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-red-600 text-white border-red-500'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-xs sm:text-sm font-bold">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 p-1 hover:bg-white/20 rounded-lg transition"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-red-900 via-red-800 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-red-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <BookOpen size={14} />
            <span>Standard Penilaian PP No. 50/2012</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Daftar Dokumen Referensi Kriteria SMK3
          </h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed font-medium">
            Kompilasi kriteria audit SMK3 resmi beserta pemetaan kode dokumen referensi kebijakan, prosedur (SOP), dan instruksi kerja di lingkungan Telkom Indonesia.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="relative z-10 grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center">
            <div className="text-2xl font-black text-white">{totalKriteria}</div>
            <div className="text-[10px] uppercase font-bold text-red-200 tracking-wider">Kriteria Audit</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center">
            <div className="text-2xl font-black text-emerald-400">{totalDocsAvailable}</div>
            <div className="text-[10px] uppercase font-bold text-red-200 tracking-wider">Berkas Terunggah</div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-7 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari no kriteria (1.2.3), teks, atau no dokumen..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
            />
          </div>

          {/* Filter Elemen */}
          <div className="sm:col-span-5">
            <select
              value={selectedElemen}
              onChange={(e) => {
                setSelectedElemen(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">Semua Elemen (1 - 12)</option>
              {ELEMEN_LIST.map((el) => (
                <option key={el.number} value={el.number}>
                  Elemen {el.number}: {el.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub toolbar: File Filter & Entries Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-300 font-semibold">
              <input
                type="checkbox"
                checked={hasFileFilter}
                onChange={(e) => {
                  setHasFileFilter(e.target.checked)
                  setCurrentPage(1)
                }}
                className="w-4 h-4 accent-red-600 rounded"
              />
              <span>Hanya yang memiliki berkas upload ({totalDocsAvailable})</span>
            </label>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <span>Tampilkan</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-xs"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>
        </div>
      </div>

      {/* CRITERIA TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800 text-[11px] tracking-wider">
              <tr>
                <th className="p-4 w-24">No</th>
                <th className="p-4 min-w-[340px]">Kriteria</th>
                <th className="p-4 min-w-[280px]">Dokumen Referensi</th>
                {canManage && <th className="p-4 w-28 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 4 : 3} className="p-8 text-center text-slate-400 font-medium">
                    Tidak ada kriteria yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* No Kriteria */}
                    <td className="p-4 font-black text-red-600 dark:text-red-400 align-top">
                      <div className="inline-block px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 font-mono text-xs">
                        {item.nomor}
                      </div>
                    </td>

                    {/* Deskripsi Kriteria */}
                    <td className="p-4 align-top space-y-1.5">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                        {item.deskripsi || item.elemenTitle}
                      </p>
                    </td>

                    {/* Dokumen Referensi */}
                    <td className="p-4 align-top space-y-1.5">
                      {item.docNumber && item.docNumber !== '-' ? (
                        item.filePath ? (
                          <a
                            href={item.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Klik untuk membuka dokumen PDF di tab baru"
                            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800 transition shadow-sm hover:shadow cursor-pointer"
                          >
                            <FileText size={14} className="text-red-500 group-hover:scale-110 transition-transform shrink-0" />
                            <span className="underline decoration-dotted underline-offset-2">{item.docNumber}</span>
                            <ExternalLink size={12} className="text-red-400 group-hover:text-red-600 transition-colors ml-0.5" />
                          </a>
                        ) : (
                          <div className="font-semibold text-slate-900 dark:text-slate-100 font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1.5">
                            <FileText size={13} className="text-red-500 shrink-0" />
                            <span>{item.docNumber}</span>
                          </div>
                        )
                      ) : null}

                      {item.docTitle && (
                        item.filePath && (!item.docNumber || item.docNumber === '-') ? (
                          <a
                            href={item.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Klik untuk membuka dokumen PDF"
                            className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 inline-flex items-center gap-1 hover:underline"
                          >
                            <span>{item.docTitle}</span>
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {item.docTitle}
                          </p>
                        )
                      )}

                      {!item.filePath && item.docNumber && item.docNumber !== '-' ? (
                        <div className="text-[11px] text-slate-400 italic">
                          Belum ada lampiran berkas PDF
                        </div>
                      ) : null}
                    </td>

                    {/* Aksi (Admin/Auditor only) */}
                    {canManage && (
                      <td className="p-4 align-top text-center">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition border border-red-200 dark:border-red-900/50"
                        >
                          <Upload size={13} />
                          <span>Kelola</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <div>
            Menampilkan{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </strong>{' '}
            sampai{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {Math.min(currentPage * itemsPerPage, filteredData.length)}
            </strong>{' '}
            dari <strong className="text-slate-800 dark:text-slate-200">{filteredData.length}</strong> kriteria
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition font-bold"
            >
              Prev
            </button>

            {(() => {
              const pages: number[] = []
              if (totalPages <= 5) {
                for (let i = 1; i <= totalPages; i++) pages.push(i)
              } else if (currentPage <= 3) {
                for (let i = 1; i <= 5; i++) pages.push(i)
              } else if (currentPage >= totalPages - 2) {
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
              } else {
                for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i)
              }

              return pages.map((pageNum) => (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg font-bold transition ${
                    currentPage === pageNum
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              ))
            })()}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition font-bold"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* MODAL UPLOAD / EDIT DOKUMEN REFERENSI */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-red-900 to-red-800 text-white flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-200">
                  Kelola Dokumen Referensi
                </span>
                <h3 className="text-xl font-black mt-1">
                  Kriteria No. {editingItem.nomor}
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDoc} className="p-6 space-y-4">
              {editingItem.deskripsi && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  <strong>Deskripsi Klausul:</strong> {editingItem.deskripsi}
                </div>
              )}

              {/* Nomor Dokumen Referensi */}
              <div className="space-y-1.5">
                <label htmlFor="kriteria-doc-number" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nomor/Kode Dokumen Referensi <span className="text-red-500">*</span>
                </label>
                <input
                  id="kriteria-doc-number"
                  name="docNumber"
                  type="text"
                  required
                  placeholder="Contoh: P.19/UM410/COP-M3000000/2024"
                  value={inputDocNumber}
                  onChange={(e) => setInputDocNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {/* Judul Dokumen */}
              <div className="space-y-1.5">
                <label htmlFor="kriteria-doc-title" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Judul/Nama Dokumen (Opsional)
                </label>
                <input
                  id="kriteria-doc-title"
                  name="docTitle"
                  type="text"
                  placeholder="Contoh: Prosedur Tanggap Darurat & Penanganan Krisis"
                  value={inputDocTitle}
                  onChange={(e) => setInputDocTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {/* Upload File PDF */}
              <div className="space-y-1.5">
                <label htmlFor="kriteria-doc-file" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Unggah Berkas File (PDF / Dokumen)
                </label>
                <input
                  id="kriteria-doc-file"
                  name="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 dark:file:bg-red-950 dark:file:text-red-300 cursor-pointer"
                />
                {editingItem.filePath && !selectedFile && (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs mt-1">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium truncate">
                      <FileText size={15} className="shrink-0 text-emerald-600" />
                      <span className="truncate">Berkas: <strong>{editingItem.fileName || 'Dokumen PDF'}</strong></span>
                    </div>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => setDeletingKriteriaNo(editingItem.nomor)}
                        className="text-rose-600 hover:text-rose-700 dark:text-rose-400 text-xs font-bold inline-flex items-center gap-1 px-2.5 py-1 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded-lg transition shrink-0 ml-2"
                      >
                        <Trash2 size={13} />
                        <span>Hapus File</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Catatan Keterangan */}
              <div className="space-y-1.5">
                <label htmlFor="kriteria-doc-keterangan" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Catatan Keterangan
                </label>
                <textarea
                  id="kriteria-doc-keterangan"
                  name="keterangan"
                  rows={2}
                  placeholder="Catatan tambahan implementasi K3..."
                  value={inputKeterangan}
                  onChange={(e) => setInputKeterangan(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span>Menyimpan...</span>
                  ) : (
                    <>
                      <FileCheck2 size={14} />
                      <span>Simpan Dokumen</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingKriteriaNo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 max-w-sm w-full rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Hapus Berkas Dokumen?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Berkas lampiran untuk kriteria <strong>{deletingKriteriaNo}</strong> akan dihapus secara permanen dari server.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingKriteriaNo(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteFile}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-md"
              >
                Ya, Hapus File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
