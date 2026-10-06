'use client'

import { useState, useRef, ChangeEvent, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { PDFDocument, degrees } from "pdf-lib"
import { 
  FolderOpen, X, RefreshCw, Layers, Scissors, Minimize2, 
  Download, ArrowUp, ArrowDown, FileText, CheckCircle2, 
  Loader2, FolderArchive, ArrowLeft, Save, Check, ExternalLink
} from "lucide-react"
import toast from "react-hot-toast"

type TabType = 'rotate' | 'merge' | 'split' | 'compress'

interface FileItem {
  id: string
  file: File
  pageCount: number
}

interface PageRotateItem {
  pageIndex: number
  rotation: number // 0, 90, 180, 270
}

export default function ToolsClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filePathParam = searchParams.get('file')
  const fileNameParam = searchParams.get('name')
  const archiveIdParam = searchParams.get('archiveId')
  const tabParam = searchParams.get('tab') as TabType | null

  const [activeTab, setActiveTab] = useState<TabType>('rotate')
  const [loading, setLoading] = useState(false)
  const [savingToArchive, setSavingToArchive] = useState(false)
  const [loadedFromArchive, setLoadedFromArchive] = useState<string | null>(null)
  const [lastSavedSuccess, setLastSavedSuccess] = useState(false)

  // Rotate State
  const [rotateFile, setRotateFile] = useState<File | null>(null)
  const [rotatePageCount, setRotatePageCount] = useState(0)
  const [pageRotations, setPageRotations] = useState<PageRotateItem[]>([])
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({})

  useEffect(() => {
    // Load PDF.js script dynamically
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
    script.async = true
    script.onload = () => {
      const pdfjsLib = (window as any)['pdfjs-dist/build/pdf']
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
      }
    }
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Merge State
  const [mergeFiles, setMergeFiles] = useState<FileItem[]>([])

  // Split State
  const [splitFile, setSplitFile] = useState<File | null>(null)
  const [splitPageCount, setSplitPageCount] = useState(0)
  const [splitRange, setSplitRange] = useState("")

  // Compress State
  const [compressFile, setCompressFile] = useState<File | null>(null)
  const [compressedSize, setCompressedSize] = useState<string | null>(null)
  const [originalSize, setOriginalSize] = useState<string | null>(null)

  // Drag and Drop Ref
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ----------------------------------------------------
  // COMMON HELPERS
  // ----------------------------------------------------
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  // Helper untuk proses file PDF ke mode rotate & thumbnail
  const initRotatePdf = async (file: File) => {
    try {
      setLoading(true)
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pages = pdfDoc.getPages()
      
      setRotateFile(file)
      setRotatePageCount(pages.length)
      
      const initialRotations = pages.map((page, idx) => {
        const currentRot = page.getRotation().angle || 0
        return { pageIndex: idx, rotation: currentRot }
      })
      setPageRotations(initialRotations)
      setThumbnails({})

      setTimeout(async () => {
        const pdfjsLib = (window as any)['pdfjs-dist/build/pdf']
        if (pdfjsLib) {
          try {
            const fileUrl = URL.createObjectURL(file)
            const pdf = await pdfjsLib.getDocument(fileUrl).promise
            
            for (let i = 1; i <= pages.length; i++) {
              try {
                const page = await pdf.getPage(i)
                const scale = 0.35
                const viewport = page.getViewport({ scale })
                const canvas = document.createElement("canvas")
                const context = canvas.getContext("2d")
                if (context) {
                  canvas.width = viewport.width
                  canvas.height = viewport.height
                  await page.render({ canvasContext: context, viewport }).promise
                  const dataUrl = canvas.toDataURL("image/jpeg", 0.75)
                  setThumbnails(prev => ({ ...prev, [i - 1]: dataUrl }))
                }
              } catch (err) {
                console.error(`Gagal render thumbnail halaman ${i}:`, err)
              }
              await new Promise(resolve => setTimeout(resolve, 25))
            }
          } catch (err) {
            console.error("Gagal inisialisasi PDF.js rendering:", err)
          }
        }
      }, 150)
    } catch (err) {
      console.error(err)
      toast.error("Gagal membaca file PDF.")
    } finally {
      setLoading(false)
    }
  }

  // AUTO-LOAD DOKUMEN ARSIP DARI QUERY PARAMS
  useEffect(() => {
    if (tabParam && ['rotate', 'merge', 'split', 'compress'].includes(tabParam)) {
      setActiveTab(tabParam)
    }

    if (filePathParam && filePathParam !== loadedFromArchive) {
      const loadArchiveDocument = async () => {
        try {
          setLoading(true)
          toast.loading("Memuat berkas dari Arsip Dokumen...", { id: "load-archive-doc" })

          const res = await fetch(filePathParam)
          if (!res.ok) throw new Error("Gagal mengambil file dari server")

          const blob = await res.blob()
          const cleanName = fileNameParam 
            ? (fileNameParam.toLowerCase().endsWith('.pdf') ? fileNameParam : `${fileNameParam}.pdf`)
            : filePathParam.split('/').pop() || 'dokumen_arsip.pdf'

          const file = new File([blob], cleanName, { type: 'application/pdf' })

          setLoadedFromArchive(filePathParam)
          toast.dismiss("load-archive-doc")
          toast.success(`Dokumen "${file.name}" otomatis dimuat ke Document Tools!`)

          // 1. Set Rotate
          await initRotatePdf(file)

          // 2. Set Split
          const arrayBuffer = await file.arrayBuffer()
          const pdfDoc = await PDFDocument.load(arrayBuffer)
          const pagesCount = pdfDoc.getPageCount()
          setSplitFile(file)
          setSplitPageCount(pagesCount)
          setSplitRange(`1-${pagesCount}`)

          // 3. Set Compress
          setCompressFile(file)
          setOriginalSize(formatBytes(file.size))
          setCompressedSize(null)

          // 4. Set Merge
          setMergeFiles([{ id: `archive-${Date.now()}`, file, pageCount: pagesCount }])

        } catch (error) {
          toast.dismiss("load-archive-doc")
          console.error("Error auto-loading archive document:", error)
          toast.error("Gagal memuat file dokumen arsip secara otomatis.")
        } finally {
          setLoading(false)
        }
      }

      loadArchiveDocument()
    }
  }, [filePathParam, fileNameParam, tabParam, loadedFromArchive])

  // ----------------------------------------------------
  // SAVE DIRECTLY TO ARCHIVE HELPER
  // ----------------------------------------------------
  const handleSaveDirectToArchive = async (pdfBlob: Blob, customName?: string) => {
    try {
      setSavingToArchive(true)
      setLastSavedSuccess(false)
      const saveToast = toast.loading("Menyimpan perubahan langsung ke Dokumen Arsip...", { id: "save-to-archive" })

      const fileName = customName || (rotateFile?.name || splitFile?.name || compressFile?.name || "dokumen_arsip_edit.pdf")
      const formData = new FormData()
      formData.append("file", pdfBlob, fileName)
      if (archiveIdParam) formData.append("archiveId", archiveIdParam)
      if (filePathParam) formData.append("filePath", filePathParam)

      const response = await fetch("/api/archive/save-tool-edit", {
        method: "POST",
        body: formData,
      })

      const res = await response.json()
      toast.dismiss(saveToast)

      if (res.success) {
        setLastSavedSuccess(true)
        if (res.filePath) {
          setLoadedFromArchive(res.filePath)
        }
        toast.success(
          (t) => (
            <div className="flex flex-col gap-2">
              <span className="font-bold text-xs">{res.message || "Perubahan berhasil tersimpan di Arsip Dokumen!"}</span>
              <button
                onClick={() => {
                  toast.dismiss(t.id)
                  router.push("/admin/archive")
                  router.refresh()
                }}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg transition text-center shadow"
              >
                Lihat di Arsip Dokumen ➔
              </button>
            </div>
          ),
          { duration: 8000 }
        )
      } else {
        toast.error(res.message || "Gagal menyimpan ke arsip")
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || "Terjadi kesalahan saat menyimpan ke arsip")
    } finally {
      setSavingToArchive(false)
    }
  }

  // ----------------------------------------------------
  // ROTATE PDF LOGIC
  // ----------------------------------------------------
  const handleRotateFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      toast.error("File harus berupa PDF!")
      return
    }

    await initRotatePdf(file)
  }

  const rotatePage = (index: number) => {
    setPageRotations(prev => prev.map(item => {
      if (item.pageIndex === index) {
        return { ...item, rotation: (item.rotation + 90) % 360 }
      }
      return item;
    }))
  }

  const generateRotatedPdfBytes = async () => {
    if (!rotateFile) return null
    const arrayBuffer = await rotateFile.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const pages = pdfDoc.getPages()

    pageRotations.forEach(item => {
      pages[item.pageIndex].setRotation(degrees(item.rotation))
    })

    return await pdfDoc.save()
  }

  const handleDownloadRotated = async () => {
    if (!rotateFile) return
    try {
      setLoading(true)
      const pdfBytes = await generateRotatedPdfBytes()
      if (!pdfBytes) return
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `rotated_${rotateFile.name}`
      link.click()
      toast.success("PDF berhasil diputar & diunduh!")
    } catch (err) {
      console.error(err)
      toast.error("Gagal memproses rotasi PDF.")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveRotatedToArchive = async () => {
    if (!rotateFile) return
    try {
      setLoading(true)
      const pdfBytes = await generateRotatedPdfBytes()
      if (!pdfBytes) return
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      await handleSaveDirectToArchive(blob, rotateFile.name)
    } catch (err) {
      console.error(err)
      toast.error("Gagal memproses rotasi PDF.")
    } finally {
      setLoading(false)
    }
  }

  // ----------------------------------------------------
  // MERGE PDF LOGIC
  // ----------------------------------------------------
  const handleMergeFilesChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setLoading(true)
    const newItems: FileItem[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type !== "application/pdf") {
        toast.error(`${file.name} bukan PDF, dilewati.`)
        continue
      }

      try {
        const buffer = await file.arrayBuffer()
        const doc = await PDFDocument.load(buffer)
        newItems.push({
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          file,
          pageCount: doc.getPageCount()
        })
      } catch (err) {
        console.error(err)
        toast.error(`Gagal membaca ${file.name}`)
      }
    }

    setMergeFiles(prev => [...prev, ...newItems])
    setLoading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const moveMergeFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...mergeFiles]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newFiles.length) return
    
    // Swap
    const temp = newFiles[index]
    newFiles[index] = newFiles[targetIndex]
    newFiles[targetIndex] = temp
    setMergeFiles(newFiles)
  }

  const removeMergeFile = (id: string) => {
    setMergeFiles(prev => prev.filter(f => f.id !== id))
  }

  const generateMergedPdfBytes = async () => {
    if (mergeFiles.length < 2) {
      toast.error("Minimal harus mengunggah 2 file untuk digabungkan!")
      return null
    }

    const mergedPdf = await PDFDocument.create()
    for (const item of mergeFiles) {
      const bytes = await item.file.arrayBuffer()
      const doc = await PDFDocument.load(bytes)
      const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices())
      copiedPages.forEach(page => mergedPdf.addPage(page))
    }

    return await mergedPdf.save()
  }

  const handleDownloadMerged = async () => {
    try {
      setLoading(true)
      const pdfBytes = await generateMergedPdfBytes()
      if (!pdfBytes) return
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `merged_${Date.now()}.pdf`
      link.click()
      toast.success("File PDF berhasil digabungkan!")
    } catch (err) {
      console.error(err)
      toast.error("Gagal menggabungkan PDF.")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMergedToArchive = async () => {
    try {
      setLoading(true)
      const pdfBytes = await generateMergedPdfBytes()
      if (!pdfBytes) return
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      await handleSaveDirectToArchive(blob, fileNameParam || "merged_document.pdf")
    } catch (err) {
      console.error(err)
      toast.error("Gagal menggabungkan dan menyimpan ke arsip.")
    } finally {
      setLoading(false)
    }
  }

  // ----------------------------------------------------
  // SPLIT PDF LOGIC
  // ----------------------------------------------------
  const handleSplitFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      toast.error("File harus berupa PDF!")
      return
    }

    try {
      setLoading(true)
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      setSplitFile(file)
      setSplitPageCount(pdfDoc.getPageCount())
      setSplitRange(`1-${pdfDoc.getPageCount()}`)
    } catch (err) {
      console.error(err)
      toast.error("Gagal membaca file PDF.")
    } finally {
      setLoading(false)
    }
  }

  const generateSplitPdfBytes = async () => {
    if (!splitFile) return null

    // Parse Range (contoh: 1-3, 5)
    const pagesToExtract: number[] = []
    const parts = splitRange.replace(/\s+/g, '').split(',')

    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-')
        const start = parseInt(startStr, 10)
        const end = parseInt(endStr, 10)

        if (isNaN(start) || isNaN(end) || start < 1 || end > splitPageCount || start > end) {
          throw new Error(`Rentang halaman "${part}" tidak valid!`)
        }
        for (let i = start; i <= end; i++) {
          pagesToExtract.push(i - 1)
        }
      } else {
        const page = parseInt(part, 10)
        if (isNaN(page) || page < 1 || page > splitPageCount) {
          throw new Error(`Halaman "${part}" tidak valid!`)
        }
        pagesToExtract.push(page - 1)
      }
    }

    if (pagesToExtract.length === 0) {
      throw new Error("Masukkan rentang halaman yang ingin diekstrak.")
    }

    const sourceBytes = await splitFile.arrayBuffer()
    const sourcePdf = await PDFDocument.load(sourceBytes)
    const newPdf = await PDFDocument.create()

    const copiedPages = await newPdf.copyPages(sourcePdf, pagesToExtract)
    copiedPages.forEach(page => newPdf.addPage(page))

    return await newPdf.save()
  }

  const handleDownloadSplit = async () => {
    if (!splitFile) return
    try {
      setLoading(true)
      const pdfBytes = await generateSplitPdfBytes()
      if (!pdfBytes) return
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `split_${splitRange}_${splitFile.name}`
      link.click()
      toast.success("Halaman PDF berhasil dipisahkan!")
    } catch (err: any) {
      toast.error(err?.message || "Gagal memisahkan PDF.")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSplitToArchive = async () => {
    if (!splitFile) return
    try {
      setLoading(true)
      const pdfBytes = await generateSplitPdfBytes()
      if (!pdfBytes) return
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      await handleSaveDirectToArchive(blob, splitFile.name)
    } catch (err: any) {
      toast.error(err?.message || "Gagal memisahkan dan menyimpan ke arsip.")
    } finally {
      setLoading(false)
    }
  }

  // ----------------------------------------------------
  // COMPRESS PDF LOGIC
  // ----------------------------------------------------
  const handleCompressFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      toast.error("File harus berupa PDF!")
      return
    }

    setCompressFile(file)
    setOriginalSize(formatBytes(file.size))
    setCompressedSize(null)
  }

  const generateCompressedBlob = async () => {
    if (!compressFile) return null
    const arrayBuffer = await compressFile.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true
    })

    const blob = new Blob([compressedBytes as any], { type: "application/pdf" })
    setCompressedSize(formatBytes(blob.size))
    return blob
  }

  const handleDownloadCompress = async () => {
    if (!compressFile) return

    try {
      setLoading(true)
      const blob = await generateCompressedBlob()
      if (!blob) return
      
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `compressed_${compressFile.name}`
      link.click()
      
      toast.success("PDF berhasil dikompresi!")
    } catch (err) {
      console.error(err)
      toast.error("Gagal mengompresi PDF.")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCompressToArchive = async () => {
    if (!compressFile) return

    try {
      setLoading(true)
      const blob = await generateCompressedBlob()
      if (!blob) return
      await handleSaveDirectToArchive(blob, compressFile.name)
    } catch (err) {
      console.error(err)
      toast.error("Gagal mengompresi dan menyimpan ke arsip.")
    } finally {
      setLoading(false)
    }
  }

  const isLinkedFromArchive = Boolean(filePathParam || archiveIdParam)

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <span className="bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 p-2 rounded-xl">
              <Layers size={32} />
            </span>
            Document Tools K3
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium mt-1 ml-16">
            Manipulasi dokumen PDF secara instan di browser dan simpan langsung ke repositori arsip.
          </p>
        </div>

        {isLinkedFromArchive && (
          <Link
            href="/admin/archive"
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs border border-slate-200 dark:border-slate-700 transition shrink-0"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Arsip Dokumen</span>
          </Link>
        )}
      </div>

      {/* 1.1 LINKED ARCHIVE BANNER */}
      {isLinkedFromArchive && (
        <div className="bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent border border-red-200 dark:border-red-900/50 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600 text-white rounded-xl shadow-md shrink-0">
              <FolderArchive size={22} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-red-600 dark:text-red-400 tracking-wider">
                Mode Edit Dokumen Arsip Terhubung
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {fileNameParam || filePathParam?.split('/').pop() || 'Dokumen Arsip'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Hasil rotasi/edit bisa langsung disimpan ke file arsip di server tanpa perlu download dan upload manual.
              </p>
            </div>
          </div>
          {lastSavedSuccess && (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold">
              <Check size={16} />
              <span>Tersimpan di Server</span>
            </div>
          )}
        </div>
      )}

      {/* 2. TAB NAVIGATION */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('rotate')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'rotate'
              ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100/50 dark:border-red-950/50 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800'
          }`}
        >
          <RefreshCw size={18} /> Rotate PDF
        </button>
        <button
          onClick={() => setActiveTab('merge')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'merge'
              ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100/50 dark:border-red-950/50 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800'
          }`}
        >
          <Layers size={18} /> Merge PDF
        </button>
        <button
          onClick={() => setActiveTab('split')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'split'
              ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100/50 dark:border-red-950/50 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800'
          }`}
        >
          <Scissors size={18} /> Split PDF
        </button>
        <button
          onClick={() => setActiveTab('compress')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'compress'
              ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100/50 dark:border-red-950/50 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800'
          }`}
        >
          <Minimize2 size={18} /> Compress PDF
        </button>
      </div>

      {/* 3. WORKING AREA */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm min-h-[300px] flex flex-col justify-between relative">
        
        {(loading || savingToArchive) && (
          <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm z-30 flex items-center justify-center flex-col gap-2 rounded-3xl">
            <Loader2 className="animate-spin text-red-600" size={36} />
            <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
              {savingToArchive ? "Menyimpan perubahan ke Dokumen Arsip..." : "Sedang memproses dokumen..."}
            </p>
          </div>
        )}

        {/* ================================================= */}
        {/* TAB: ROTATE */}
        {/* ================================================= */}
        {activeTab === 'rotate' && (
          <div className="space-y-6 flex-grow flex flex-col">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Rotate PDF Pages</h3>
              <p className="text-slate-500 text-xs mt-0.5">Putar arah halaman PDF secara individual untuk meluruskan dokumen terbalik.</p>
            </div>

            {!rotateFile ? (
              <div className="border-2 border-dashed border-slate-200 hover:border-red-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-red-50/10 rounded-2xl p-12 text-center transition cursor-pointer flex flex-col items-center justify-center relative">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleRotateFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <FolderOpen className="text-slate-300 mb-3" size={48} />
                <p className="font-bold text-slate-700 text-sm">Pilih atau Seret Berkas PDF Anda</p>
                <p className="text-slate-400 text-xs mt-1">Hanya mendukung format .pdf</p>
              </div>
            ) : (
              <div className="space-y-6 flex-grow flex flex-col">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <FileText className="text-red-500" size={24} />
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{rotateFile.name}</p>
                      <p className="text-xs text-slate-500 font-semibold">{rotatePageCount} Halaman | {formatBytes(rotateFile.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setRotateFile(null)
                      setRotatePageCount(0)
                      setPageRotations([])
                      setThumbnails({})
                    }}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Pages grid for Rotation */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {pageRotations.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-800 flex flex-col items-center gap-3 relative shadow-sm hover:shadow transition"
                    >
                      <div className="w-24 h-32 bg-white rounded border border-slate-200 flex items-center justify-center shadow-inner relative overflow-hidden">
                        {thumbnails[idx] ? (
                          <img 
                            src={thumbnails[idx]} 
                            alt={`Page ${idx + 1}`}
                            className="max-w-[85px] max-h-[115px] object-contain transition-transform duration-300 select-none shadow-sm"
                            style={{ transform: `rotate(${item.rotation}deg)` }}
                          />
                        ) : (
                          <div className="w-20 h-28 bg-slate-100 rounded border border-dashed border-slate-300 flex items-center justify-center animate-pulse">
                            <Loader2 className="animate-spin text-slate-300" size={24} />
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center w-full">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">Hal {idx + 1}</p>
                        <button
                          onClick={() => rotatePage(idx)}
                          className="w-full py-1.5 bg-white dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 hover:border-red-200 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-200 hover:text-red-600 flex items-center justify-center gap-1 transition"
                        >
                          <RefreshCw size={10} /> {item.rotation}°
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col sm:flex-row justify-end gap-3">
                  {isLinkedFromArchive && (
                    <button
                      onClick={handleSaveRotatedToArchive}
                      disabled={savingToArchive || loading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-60"
                    >
                      {savingToArchive ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      Simpan Langsung ke Dokumen Arsip
                    </button>
                  )}
                  <button
                    onClick={handleDownloadRotated}
                    className="bg-slate-900 dark:bg-red-600 hover:bg-slate-800 dark:hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-slate-200 dark:shadow-none transition-all active:scale-95"
                  >
                    <Download size={18} /> Unduh File PDF Baru
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================= */}
        {/* TAB: MERGE */}
        {/* ================================================= */}
        {activeTab === 'merge' && (
          <div className="space-y-6 flex-grow flex flex-col">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Merge PDF Files</h3>
              <p className="text-slate-500 text-xs mt-0.5">Gabungkan dua atau lebih file PDF secara berurutan.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
              
              {/* Left Column: Upload */}
              <div className="lg:col-span-1">
                <div className="border-2 border-dashed border-slate-200 hover:border-red-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-red-50/10 rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center relative min-h-[220px]">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="application/pdf"
                    onChange={handleMergeFilesChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FolderOpen className="text-slate-300 mb-3" size={36} />
                  <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">Pilih Lebih Banyak PDF</p>
                  <p className="text-slate-400 text-xs mt-1">Anda bisa memilih banyak file sekaligus</p>
                </div>
              </div>

              {/* Right Column: Files List & Sort */}
              <div className="lg:col-span-2 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Urutan Penggabungan Dokumen</h4>
                
                {mergeFiles.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-sm font-medium">
                    Belum ada file yang ditambahkan
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {mergeFiles.map((item, idx) => (
                      <div 
                        key={item.id} 
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center justify-between shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-300 shrink-0">
                            {idx + 1}
                          </span>
                          <FileText className="text-red-500 shrink-0" size={20} />
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{item.file.name}</p>
                            <p className="text-[10px] text-slate-500 font-semibold">{item.pageCount} Halaman | {formatBytes(item.file.size)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => moveMergeFile(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-500 hover:text-slate-700 disabled:opacity-30 transition"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => moveMergeFile(idx, 'down')}
                            disabled={idx === mergeFiles.length - 1}
                            className="p-1.5 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-500 hover:text-slate-700 disabled:opacity-30 transition"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            onClick={() => removeMergeFile(item.id)}
                            className="p-1.5 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 border border-red-100 rounded-lg text-red-500 hover:text-red-600 transition"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col sm:flex-row justify-end gap-3">
              {isLinkedFromArchive && (
                <button
                  onClick={handleSaveMergedToArchive}
                  disabled={mergeFiles.length < 2 || savingToArchive || loading}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-60"
                >
                  {savingToArchive ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Simpan Gabungan ke Dokumen Arsip
                </button>
              )}
              <button
                onClick={handleDownloadMerged}
                disabled={mergeFiles.length < 2}
                className="bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-200 disabled:shadow-none transition-all active:scale-95"
              >
                <Layers size={18} /> Gabungkan & Unduh PDF
              </button>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* TAB: SPLIT */}
        {/* ================================================= */}
        {activeTab === 'split' && (
          <div className="space-y-6 flex-grow flex flex-col">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Split PDF Pages</h3>
              <p className="text-slate-500 text-xs mt-0.5">Ekstrak rentang halaman tertentu dari file PDF menjadi satu file tersendiri.</p>
            </div>

            {!splitFile ? (
              <div className="border-2 border-dashed border-slate-200 hover:border-red-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-red-50/10 rounded-2xl p-12 text-center transition cursor-pointer flex flex-col items-center justify-center relative">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleSplitFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <FolderOpen className="text-slate-300 mb-3" size={48} />
                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">Pilih Berkas PDF Anda</p>
                <p className="text-slate-400 text-xs mt-1">Hanya mendukung format .pdf</p>
              </div>
            ) : (
              <div className="space-y-6 flex-grow flex flex-col max-w-xl">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <FileText className="text-red-500" size={24} />
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{splitFile.name}</p>
                      <p className="text-xs text-slate-500 font-semibold">{splitPageCount} Halaman | {formatBytes(splitFile.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSplitFile(null)
                      setSplitPageCount(0)
                      setSplitRange("")
                    }}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Masukkan Rentang Halaman</label>
                  <input
                    type="text"
                    value={splitRange}
                    onChange={(e) => setSplitRange(e.target.value)}
                    placeholder="Contoh: 1-3, 5 (Artinya halaman 1 sampai 3, ditambah halaman 5)"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-100 outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-semibold"
                  />
                  <p className="text-[10px] text-slate-400 font-semibold">Gunakan format angka dan tanda hubung, pisahkan rentang dengan koma.</p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col sm:flex-row justify-end gap-3">
                  {isLinkedFromArchive && (
                    <button
                      onClick={handleSaveSplitToArchive}
                      disabled={savingToArchive || loading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-60"
                    >
                      {savingToArchive ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      Simpan Hasil Pecah ke Dokumen Arsip
                    </button>
                  )}
                  <button
                    onClick={handleDownloadSplit}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-200 transition-all active:scale-95"
                  >
                    <Scissors size={18} /> Pecah & Unduh PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================= */}
        {/* TAB: COMPRESS */}
        {/* ================================================= */}
        {activeTab === 'compress' && (
          <div className="space-y-6 flex-grow flex flex-col">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Compress PDF File</h3>
              <p className="text-slate-500 text-xs mt-0.5">Optimalkan dan perkecil ukuran file PDF di browser.</p>
            </div>

            {!compressFile ? (
              <div className="border-2 border-dashed border-slate-200 hover:border-red-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-red-50/10 rounded-2xl p-12 text-center transition cursor-pointer flex flex-col items-center justify-center relative">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleCompressFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <FolderOpen className="text-slate-300 mb-3" size={48} />
                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">Pilih Berkas PDF Anda</p>
                <p className="text-slate-400 text-xs mt-1">Hanya mendukung format .pdf</p>
              </div>
            ) : (
              <div className="space-y-6 flex-grow flex flex-col max-w-xl">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <FileText className="text-red-500" size={24} />
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{compressFile.name}</p>
                      <p className="text-xs text-slate-500 font-semibold">{originalSize}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCompressFile(null)
                      setOriginalSize(null)
                      setCompressedSize(null)
                    }}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                {compressedSize && (
                  <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 flex items-center gap-3">
                    <CheckCircle2 size={24} />
                    <div>
                      <p className="text-xs font-bold">Kompresi Selesai!</p>
                      <p className="text-[11px] font-semibold">Ukuran File Berkurang dari <span className="font-black">{originalSize}</span> menjadi <span className="font-black">{compressedSize}</span></p>
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col sm:flex-row justify-end gap-3">
                  {isLinkedFromArchive && (
                    <button
                      onClick={handleSaveCompressToArchive}
                      disabled={savingToArchive || loading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-60"
                    >
                      {savingToArchive ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      Simpan Hasil Kompresi ke Dokumen Arsip
                    </button>
                  )}
                  <button
                    onClick={handleDownloadCompress}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-200 transition-all active:scale-95"
                  >
                    <Minimize2 size={18} /> Kompresi & Unduh PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
