'use client'

import React, { useState, useEffect, useRef } from "react"
import { 
  X, 
  Camera, 
  Upload, 
  MapPin, 
  RefreshCw, 
  Download, 
  Loader2, 
  SwitchCamera,
  CheckCircle2,
  Calendar,
  FileText
} from "lucide-react"
import toast from "react-hot-toast"
import { stampImage } from "@/app/utils/imageStamper"

interface TimestampModalProps {
  isOpen: boolean
  onClose: () => void
}

const getLocalIsoString = (date = new Date()) => {
  const pad = (n: number) => n.toString().padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

export default function TimestampModal({ isOpen, onClose }: TimestampModalProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('upload')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  // GPS & Address
  const [lat, setLat] = useState("")
  const [lng, setLng] = useState("")
  const [address, setAddress] = useState("")
  const [description, setDescription] = useState("")
  const [takenAt, setTakenAt] = useState("")
  const [isLiveTime, setIsLiveTime] = useState(true)
  const [detectingGps, setDetectingGps] = useState(false)
  const [processing, setProcessing] = useState(false)

  // Webcam Refs & Facing Mode
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment")

  useEffect(() => {
    if (isOpen) {
      setTakenAt(getLocalIsoString())
      setIsLiveTime(true)
      detectLocation()

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose()
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    } else {
      stopCamera()
      resetForm()
    }
  }, [isOpen, onClose])

  // Real-time ticking clock effect
  useEffect(() => {
    if (!isOpen || !isLiveTime || imagePreview) return

    setTakenAt(getLocalIsoString())
    const timer = setInterval(() => {
      setTakenAt(getLocalIsoString())
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, isLiveTime, imagePreview])

  // Monitor tab change to manage camera stream
  useEffect(() => {
    if (activeTab === 'camera' && isOpen) {
      startCamera()
    } else {
      stopCamera()
    }
  }, [activeTab, facingMode])

  const resetForm = () => {
    setImageFile(null)
    setImagePreview(null)
    setLat("")
    setLng("")
    setAddress("")
    setDescription("")
    setIsLiveTime(true)
    setTakenAt(getLocalIsoString())
  }

  const startCamera = async () => {
    try {
      stopCamera()
      let mediaStream: MediaStream
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        })
      } catch {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        })
      }

      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        try {
          await videoRef.current.play()
        } catch (e) {
          console.warn("Auto play warning:", e)
        }
      }
      setCameraActive(true)
    } catch (err) {
      console.error("Camera access error:", err)
      toast.error("Gagal mengakses kamera. Silakan pilih tab Unggah Foto.")
      setActiveTab('upload')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setCameraActive(false)
  }

  const toggleFacingMode = () => {
    setFacingMode(prev => prev === "environment" ? "user" : "environment")
  }

  const capturePhoto = () => {
    if (!videoRef.current || !stream) return

    const video = videoRef.current
    const w = video.videoWidth || video.clientWidth || 1280
    const h = video.videoHeight || video.clientHeight || 720
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(video, 0, 0, w, h)
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `CAPTURE_${Date.now()}.jpg`, { type: "image/jpeg" })
          setImageFile(file)
          setImagePreview(URL.createObjectURL(blob))
          setTakenAt(getLocalIsoString())
          setIsLiveTime(false)
          stopCamera()
        }
      }, "image/jpeg", 0.92)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("File harus berupa gambar (JPG/PNG)!")
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setTakenAt(getLocalIsoString())
      setIsLiveTime(false)
    }
  }

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung oleh browser Anda.")
      return
    }

    setDetectingGps(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude.toString()
        const longitude = position.coords.longitude.toString()
        setLat(latitude)
        setLng(longitude)
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          if (res.ok) {
            const data = await res.json()
            setAddress(data.display_name || "")
          }
        } catch (err) {
          console.warn("Reverse geocode failed", err)
        } finally {
          setDetectingGps(false)
        }
      },
      (error) => {
        console.error("GPS Error:", error)
        toast.error("Gagal mendeteksi lokasi GPS.")
        setDetectingGps(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleDownload = async () => {
    if (!imageFile) {
      toast.error("Silakan ambil atau unggah foto terlebih dahulu!")
      return
    }

    try {
      setProcessing(true)
      const stampedBlob = await stampImage(
        imageFile,
        lat || null,
        lng || null,
        description,
        address,
        takenAt
      )

      if (stampedBlob) {
        const url = URL.createObjectURL(stampedBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = `stamped_${Date.now()}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success("Foto berstempel berhasil dibuat!")
      } else {
        toast.error("Gagal memproses gambar.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Terjadi kesalahan saat memproses gambar.")
    } finally {
      setProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
    >
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-4xl h-full sm:h-auto max-h-[100dvh] sm:max-h-[90vh] sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl border-0 sm:border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER MODAL */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-red-800 via-red-700 to-red-600 flex items-center justify-between text-white shrink-0 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <Camera className="w-5 h-5 text-white shrink-0" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">Dokumentasi Kamera Timestamp</h3>
              <p className="text-[10px] text-red-100/80 hidden xs:block">Watermark Resmi K3 PT Telkom Indonesia</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/15 active:scale-95 rounded-full transition shrink-0"
            title="Tutup (ESC)"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WORKSPACE AREA (SCROLLABLE) */}
        <div className="p-3 sm:p-5 md:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 bg-slate-50 dark:bg-slate-950">
          
          {/* SISI KIRI: PENGAMBILAN GAMBAR */}
          <div className="flex flex-col gap-3">
            {/* TAB SELECTOR */}
            <div className="flex bg-slate-200/70 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-300/50 dark:border-slate-700 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'upload' 
                    ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Upload size={14} /> Unggah Foto
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('camera')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'camera' 
                    ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Camera size={14} /> Buka Kamera
              </button>
            </div>

            {/* BOX DISPLAY VIEWPORT */}
            <div className="w-full aspect-[4/3] xs:aspect-video lg:aspect-auto lg:min-h-[280px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 relative flex items-center justify-center shadow-inner">
              
              {activeTab === 'upload' && !imagePreview && (
                <div className="text-center p-6 flex flex-col items-center justify-center text-slate-400 w-full h-full">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-3 text-red-400">
                    <Upload size={24} />
                  </div>
                  <p className="font-bold text-xs sm:text-sm text-slate-200">Pilih atau Ambil Foto dari Perangkat</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Mendukung format JPG, JPEG, atau PNG</p>
                  <label className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition active:scale-95">
                    Pilih Berkas Foto
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {activeTab === 'camera' && !imagePreview && (
                <div className="w-full h-full relative flex items-center justify-center bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  
                  {cameraActive && (
                    <>
                      {/* Switch Camera Button (Depan / Belakang) */}
                      <button
                        type="button"
                        onClick={toggleFacingMode}
                        className="absolute top-3 right-3 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition shadow-md active:scale-90"
                        title="Ganti Kamera Depan/Belakang"
                        aria-label="Ganti Kamera"
                      >
                        <SwitchCamera size={18} />
                      </button>

                      {/* Shutter Button */}
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full border-4 border-red-600 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                        title="Ambil Foto"
                        aria-label="Ambil Foto"
                      >
                        <div className="w-9 h-9 sm:w-11 sm:h-11 bg-red-600 rounded-full flex items-center justify-center text-white">
                          <Camera size={20} />
                        </div>
                      </button>
                    </>
                  )}
                </div>
              )}

              {imagePreview && (
                <div className="w-full h-full relative flex items-center justify-center p-2 bg-slate-950">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain select-none rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(null)
                      if (activeTab === 'camera') startCamera()
                    }}
                    className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black text-white rounded-full transition shadow-md active:scale-90"
                    title="Ulangi Foto"
                    aria-label="Ulangi Foto"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {imageFile && (
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={13} /> Foto siap distempel
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-red-600 dark:text-red-400 hover:underline font-bold text-[11px]"
                >
                  Ganti Foto
                </button>
              </div>
            )}
          </div>

          {/* SISI KANAN: FORM METADATA */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4">
            <div className="space-y-3 sm:space-y-3.5">
              
              {/* GPS Lokasi */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={12} className="text-red-500" /> Koordinat GPS
                  </label>
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={detectingGps}
                    className="text-[10px] font-black text-red-600 dark:text-red-400 flex items-center gap-1 hover:underline disabled:opacity-50"
                  >
                    <RefreshCw size={10} className={detectingGps ? "animate-spin" : ""} />
                    {detectingGps ? "Mencari GPS..." : "Deteksi Otomatis"}
                  </button>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-3 py-2 rounded-xl text-xs">
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">LAT</span>
                    <input
                      type="text"
                      placeholder="-7.2575"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="bg-transparent outline-none w-full font-semibold text-slate-800 dark:text-slate-200 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-3 py-2 rounded-xl text-xs">
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">LONG</span>
                    <input
                      type="text"
                      placeholder="112.7521"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      className="bg-transparent outline-none w-full font-semibold text-slate-800 dark:text-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Alamat Fisik */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <FileText size={12} className="text-red-500" /> Alamat Lokasi
                </label>
                <textarea
                  placeholder="Alamat akan terisi otomatis dari GPS..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 p-2.5 rounded-xl outline-none focus:border-red-500 transition resize-none leading-relaxed"
                />
              </div>

              {/* Tanggal & Waktu */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={12} className="text-red-500" /> Waktu Pengambilan
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLiveTime(true)
                      setTakenAt(getLocalIsoString())
                    }}
                    className={`text-[10px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-full transition ${
                      isLiveTime && !imagePreview
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:text-red-600"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isLiveTime && !imagePreview ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
                    <span>{isLiveTime && !imagePreview ? "Live Realtime" : "Waktu Sekarang"}</span>
                  </button>
                </div>
                <input
                  type="datetime-local"
                  step="1"
                  value={takenAt}
                  onChange={(e) => {
                    setTakenAt(e.target.value)
                    setIsLiveTime(false)
                  }}
                  className="w-full text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 p-2.5 rounded-xl outline-none focus:border-red-500 transition font-mono"
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Keterangan Dokumentasi K3
                </label>
                <textarea
                  placeholder="Contoh: Inspeksi APAR Lantai 9 Telkom Landmark Tower..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 p-2.5 rounded-xl outline-none focus:border-red-500 transition resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* ACTION BUTTON (MOBILE-FRIENDLY) */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={resetForm}
                className="py-2.5 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition active:scale-95"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={processing || !imageFile}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/15 hover:shadow-red-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none active:scale-95"
              >
                {processing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Memproses Stempel...
                  </>
                ) : (
                  <>
                    <Download size={14} /> Beri Stempel & Unduh
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
