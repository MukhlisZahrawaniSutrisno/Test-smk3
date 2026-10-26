'use client'

import { useState, useMemo } from 'react'
import {
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Calculator,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ClipboardList
} from 'lucide-react'
import { AUDIT_LEVELS, AUDIT_12_ELEMENTS } from '@/app/utils/auditData'
import { KRITERIA_SMK3_DATA, ELEMEN_LIST } from '@/app/utils/kriteriaReferenceData'

export default function AuditSimulatorSection() {
  const [selectedLevel, setSelectedLevel] = useState<'awal' | 'transisi' | 'lanjutan'>('lanjutan')
  
  // State to expand/collapse the criteria checklist (Default closed/ringkas)
  const [showChecklist, setShowChecklist] = useState<boolean>(false)

  // Checklist state: Set of checked kriteria IDs (e.g. '1.1.1', '1.2.3')
  const [checkedKriteria, setCheckedKriteria] = useState<Set<string>>(() => {
    // Default to ~90% of criteria checked
    const initial = new Set<string>()
    KRITERIA_SMK3_DATA.slice(0, 150).forEach((k) => initial.add(k.id))
    return initial
  })

  // Collapsible elements inside checklist
  const [openElements, setOpenElements] = useState<{ [key: number]: boolean }>({ 1: true })

  // Non-conformance findings
  const [hasCritical, setHasCritical] = useState<boolean>(false)
  const [hasMayor, setHasMayor] = useState<boolean>(false)
  const [showElementsTable, setShowElementsTable] = useState<boolean>(false)

  const currentLevelObj = AUDIT_LEVELS.find((lvl) => lvl.id === selectedLevel) || AUDIT_LEVELS[2]
  const totalCriteria = currentLevelObj.criteriaCount

  // Filter criteria belonging to active level
  const activeLevelCriteria = useMemo(() => {
    if (selectedLevel === 'awal') {
      return KRITERIA_SMK3_DATA.filter((k) => k.tingkat === 'AWAL')
    }
    if (selectedLevel === 'transisi') {
      return KRITERIA_SMK3_DATA.filter((k) => k.tingkat === 'AWAL' || k.tingkat === 'TRANSISI')
    }
    return KRITERIA_SMK3_DATA
  }, [selectedLevel])

  // Count fulfilled criteria
  const activeFulfilled = useMemo(() => {
    let count = 0
    activeLevelCriteria.forEach((k) => {
      if (checkedKriteria.has(k.id)) count++
    })
    return count
  }, [activeLevelCriteria, checkedKriteria])

  const percentage = Math.round((activeFulfilled / totalCriteria) * 100)

  // Toggle single item
  const toggleKriteria = (id: string) => {
    const next = new Set(checkedKriteria)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setCheckedKriteria(next)
  }

  // Toggle all items in an element
  const toggleAllInElement = (elemenNumber: number) => {
    const itemsInElem = activeLevelCriteria.filter((k) => k.elemenNumber === elemenNumber)
    const allChecked = itemsInElem.every((k) => checkedKriteria.has(k.id))
    const next = new Set(checkedKriteria)
    itemsInElem.forEach((k) => {
      if (allChecked) {
        next.delete(k.id)
      } else {
        next.add(k.id)
      }
    })
    setCheckedKriteria(next)
  }

  // Check all criteria in active level
  const handleCheckAll = () => {
    const next = new Set(checkedKriteria)
    activeLevelCriteria.forEach((k) => next.add(k.id))
    setCheckedKriteria(next)
  }

  // Uncheck all criteria in active level
  const handleUncheckAll = () => {
    const next = new Set(checkedKriteria)
    activeLevelCriteria.forEach((k) => next.delete(k.id))
    setCheckedKriteria(next)
  }

  const toggleAccordionElement = (elemNumber: number) => {
    setOpenElements((prev) => ({ ...prev, [elemNumber]: !prev[elemNumber] }))
  }

  const getEvaluationResult = () => {
    if (hasCritical) {
      return {
        status: 'GAGAL / TIDAK LULUS',
        level: 'DISKUALIFIKASI (KRITIKAL)',
        color: 'red',
        description: 'Terdapat temuan yang dapat menimbulkan bahaya fatal/kematian (fatality). Perusahaan dinilai belum berhasil menerapkan SMK3 sesuai PP 50/2012.',
      }
    }
    if (hasMayor) {
      return {
        status: 'GAGAL / BELUM BERHASIL',
        level: 'TIDAK LULUS (MAYOR)',
        color: 'rose',
        description: 'Terdapat pelanggaran perundang-undangan atau prinsip pokok SMK3 tidak dijalankan. Penilaian tidak dapat disahkan hingga temuan ditutup.',
      }
    }
    if (percentage >= 85) {
      return {
        status: 'MEMUASKAN (Tingkat Emas)',
        level: 'Pencapaian 85% - 100%',
        color: 'emerald',
        description: 'Sistem K3 berjalan sangat efektif dan konsisten sesuai standar tertinggi PP 50/2012. Berhak atas Sertifikat & Bendera Emas.',
      }
    }
    if (percentage >= 60) {
      return {
        status: 'BAIK (Tingkat Perak)',
        level: 'Pencapaian 60% - 84%',
        color: 'blue',
        description: 'Penerapan K3 telah memenuhi standar minimal wajib dan layak mendapat Sertifikat & Bendera Perak.',
      }
    }
    return {
      status: 'KURANG',
      level: 'Pencapaian 0% - 59%',
      color: 'amber',
      description: 'Penerapan K3 masih di bawah standar minimal yang dipersyaratkan oleh regulasi pemerintah (Pembinaan Disnaker).',
    }
  }

  const result = getEvaluationResult()

  return (
    <section id="audit-smk3" className="py-20 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 text-xs font-extrabold uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>Standar Audit PP 50/2012</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Kriteria & Penilaian Audit SMK3
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            Pemeriksaan independen terhadap pemenuhan kriteria untuk mengukur efektivitas dan keberhasilan penerapan SMK3 perusahaan.
          </p>
        </div>

        {/* 1. 3 TINGKAT AUDIT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AUDIT_LEVELS.map((lvl) => {
            const isSelected = selectedLevel === lvl.id
            return (
              <div
                key={lvl.id}
                onClick={() => {
                  setSelectedLevel(lvl.id as typeof selectedLevel)
                }}
                className={`cursor-pointer p-6 rounded-3xl border transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-red-50/70 dark:bg-red-950/30 border-red-500 shadow-md shadow-red-500/10 scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-red-600 dark:text-red-400 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60">
                      {lvl.badge}
                    </span>
                    {isSelected && <CheckCircle className="text-red-600 dark:text-red-400 w-5 h-5" />}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {lvl.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-2 leading-relaxed">
                    {lvl.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <span>Sasaran: </span>
                  <span className="text-slate-700 dark:text-slate-200">{lvl.targetCompany}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* 2. SIMULATOR AUDIT INTERAKTIF */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-6 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-8">
          
          {/* SECTION TITLE */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-2">
              <Calculator className="text-red-600 dark:text-red-400 w-6 h-6" />
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Simulasi Penilaian Audit Mandiri (Interactive Calculator)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Tingkat Terpilih: <strong className="text-red-600 dark:text-red-400">{currentLevelObj.name} ({totalCriteria} Kriteria Wajib)</strong>
            </p>
          </div>

          {/* MAIN SIMULATOR LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: CARD KRITERIA & CARD TEMUAN */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* CARD UTAMA: PENILAIAN KRITERIA (CLICK TO OPEN/CLOSE CHECKLIST) */}
              <div
                className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                  showChecklist
                    ? 'bg-white dark:bg-slate-800 border-red-500/80 shadow-md ring-1 ring-red-500/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'
                }`}
                onClick={() => setShowChecklist(!showChecklist)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                      <ClipboardList size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Checklist Kriteria Penerapan SMK3</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        {showChecklist ? 'Klik untuk menutup daftar checklist' : 'Klik untuk melihat & mencentang butir kriteria'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400">
                    <span className="hidden sm:inline">{showChecklist ? 'Tutup' : 'Buka Kriteria'}</span>
                    <div className="p-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {showChecklist ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* EXPANDED ACCORDION: CHECKLIST PER ELEMEN */}
                {showChecklist && (
                  <div
                    className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4 animate-in fade-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Quick check/uncheck all bar */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-bold text-slate-600 dark:text-slate-300">
                        Pilih Klausul yang Terpenuhi:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCheckAll}
                          className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                        >
                          Centang Semua
                        </button>
                        <button
                          type="button"
                          onClick={handleUncheckAll}
                          className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                        >
                          Hapus Centang
                        </button>
                      </div>
                    </div>

                    {/* 12 Elements Accordion */}
                    <div className="space-y-2.5 max-h-[440px] overflow-y-auto custom-scrollbar pr-1">
                      {ELEMEN_LIST.map((elem) => {
                        const itemsInElem = activeLevelCriteria.filter((k) => k.elemenNumber === elem.number)
                        if (itemsInElem.length === 0) return null

                        const isAllChecked = itemsInElem.every((k) => checkedKriteria.has(k.id))
                        const isOpen = !!openElements[elem.number]

                        return (
                          <div
                            key={elem.number}
                            className="bg-slate-50 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                          >
                            {/* Element Header */}
                            <div
                              onClick={() => toggleAccordionElement(elem.number)}
                              className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800 transition"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-black text-[11px] flex items-center justify-center shrink-0">
                                  {elem.number}
                                </span>
                                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                  {elem.title}
                                </h5>
                              </div>

                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => toggleAllInElement(elem.number)}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition ${
                                    isAllChecked
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                                      : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                  }`}
                                >
                                  {isAllChecked ? 'Batal Semua' : 'Centang Semua'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleAccordionElement(elem.number)}
                                  className="text-slate-400 hover:text-slate-600 p-0.5"
                                >
                                  {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                </button>
                              </div>
                            </div>

                            {/* Element Checklist Items */}
                            {isOpen && (
                              <div className="p-3 pt-0 space-y-2 border-t border-slate-200/60 dark:border-slate-800 divide-y divide-slate-200/50 dark:divide-slate-800">
                                {itemsInElem.map((k) => {
                                  const isChecked = checkedKriteria.has(k.id)
                                  return (
                                    <div
                                      key={k.id}
                                      onClick={() => toggleKriteria(k.id)}
                                      className={`pt-2 pb-1 flex items-start gap-2.5 cursor-pointer transition rounded-xl px-2 ${
                                        isChecked
                                          ? 'bg-red-50/50 dark:bg-red-950/30'
                                          : 'hover:bg-white dark:hover:bg-slate-800'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {}}
                                        className="mt-0.5 w-4 h-4 accent-red-600 rounded shrink-0 cursor-pointer"
                                      />
                                      <div className="space-y-0.5">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          <span className="font-mono text-xs font-black text-red-600 dark:text-red-400">
                                            {k.nomor}
                                          </span>
                                          {k.defaultDocRef && (
                                            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">
                                              <FileText size={9} className="text-red-500" />
                                              <span>{k.defaultDocRef}</span>
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                          {k.deskripsi || k.elemenTitle}
                                        </p>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* CARD TEMUAN KETIDAKSESUAIAN (KRITIKAL & MAYOR) */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-amber-500" />
                  <span>Simulasi Temuan Ketidaksesuaian:</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                    hasCritical 
                      ? 'bg-red-100 dark:bg-red-950/60 border-red-500' 
                      : 'bg-slate-50 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100/60 dark:hover:bg-slate-900'
                  }`}>
                    <input
                      type="checkbox"
                      checked={hasCritical}
                      onChange={(e) => setHasCritical(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-red-600 rounded"
                    />
                    <div>
                      <div className="text-xs font-extrabold text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertOctagon size={13} />
                        <span>Ada Temuan KRITIKAL</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Potensi bahaya mematikan / korban jiwa (Koreksi 1x24 jam).
                      </p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                    hasMayor 
                      ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-500' 
                      : 'bg-slate-50 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100/60 dark:hover:bg-slate-900'
                  }`}>
                    <input
                      type="checkbox"
                      checked={hasMayor}
                      onChange={(e) => setHasMayor(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-rose-600 rounded"
                    />
                    <div>
                      <div className="text-xs font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertTriangle size={13} />
                        <span>Ada Temuan MAYOR</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Pelanggaran undang-undang atau 3+ minor berulang (Koreksi 1 bulan).
                      </p>
                    </div>
                  </label>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: SIMULATOR RESULT CARD */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-xl space-y-6 sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Hasil Prediksi Audit Mandiri
                </span>
                <Sparkles size={16} className="text-red-500" />
              </div>

              {/* Status Header */}
              <div className="space-y-2">
                <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                  result.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                  result.color === 'blue' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' :
                  result.color === 'red' ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' :
                  result.color === 'rose' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' :
                  'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                }`}>
                  {result.level}
                </span>
                <h4 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  {result.status}
                </h4>
              </div>

              {/* Score Visual Meter */}
              <div className="space-y-2 bg-slate-50 dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Skor Kepatuhan SMK3:</span>
                  <span className="text-base font-black text-red-600 dark:text-red-400">
                    {percentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      percentage >= 85 ? 'bg-emerald-500' :
                      percentage >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold pt-1">
                  <span>0% (Kurang)</span>
                  <span>60% (Perak)</span>
                  <span>85% (Emas)</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                {result.description}
              </p>
              
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Kriteria Lolos: <strong>{activeFulfilled}/{totalCriteria}</strong></span>
                <span>Standar: PP 50/2012 Tabel 2</span>
              </div>
            </div>

          </div>

          {/* 12 ELEMEN ACCORDION TABLE BUTTON */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-center">
            <button
              onClick={() => setShowElementsTable(!showElementsTable)}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-sm"
            >
              <FileSpreadsheet size={15} className="text-red-500" />
              <span>{showElementsTable ? 'Sembunyikan Tabel 12 Elemen' : 'Lihat Matriks 12 Elemen Kriteria SMK3 (PP 50/2012)'}</span>
            </button>
          </div>

          {/* 12 ELEMEN TABLE (ACCORDION) */}
          {showElementsTable && (
            <div className="pt-4 animate-in fade-in duration-200 space-y-3">
              <h4 className="text-sm font-black text-slate-800 dark:text-white">
                Rincian 12 Elemen Penilaian Audit SMK3 (PP No. 50/2012 Pasal 16)
              </h4>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold uppercase">
                    <tr>
                      <th className="p-3">No</th>
                      <th className="p-3">Elemen Audit</th>
                      <th className="p-3">Tingkat Awal (64)</th>
                      <th className="p-3">Tingkat Transisi (122)</th>
                      <th className="p-3">Tingkat Lanjutan (166)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                    {AUDIT_12_ELEMENTS.map((el) => (
                      <tr key={el.number} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-400">{el.number}</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{el.title}</td>
                        <td className="p-3 text-[11px]">{el.awal}</td>
                        <td className="p-3 text-[11px]">{el.transisi}</td>
                        <td className="p-3 text-[11px]">{el.lanjutan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  )
}
