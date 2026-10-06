'use client'

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { KeyRound, Mail, ArrowRight, ArrowLeft, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { loginAction } from "@/app/actions/auth"

export default function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    const formData = new FormData(e.currentTarget)
    try {
      const res = await loginAction(formData)
      if (res.success && res.redirectPath) {
        router.push(res.redirectPath)
      } else {
        setErrorMessage(res.message || "Email atau password salah!")
        setLoading(false)
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kesalahan saat login")
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-white/20 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/40 ring-1 ring-white/20">
      {/* Header Form */}
      <div className="px-8 py-8 flex flex-col items-center text-center relative border-b border-white/10">
        {/* Logo Telkom */}
        <div className="bg-white/90 p-3 rounded-2xl shadow-lg mb-5 backdrop-blur-sm">
          <img
            src="/Telkom-logo-full.png"
            alt="Telkom Logo"
            className="h-8 w-auto"
          />
        </div>

        <h2 className="text-2xl font-black text-white drop-shadow-md tracking-tight">
          Login Sistem
        </h2>
        <p className="text-xs text-red-50 font-medium mt-1 tracking-wide opacity-90">
          Silakan masuk dengan akun Anda
        </p>
      </div>

      {/* Body Form */}
      <div className="p-8 space-y-5">
        {errorMessage && (
          <div className="bg-red-500/80 backdrop-blur-md border border-red-400 text-white text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in zoom-in duration-200 shadow-md">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-[10px] font-bold text-white uppercase tracking-wider ml-1 opacity-90">
              Email Perusahaan
            </label>
            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 z-10"
                size={18}
              />
              <input
                id="login-email"
                name="email"
                type="email"
                required
                autoComplete="off"
                placeholder="nama@telkom.co.id"
                className="w-full bg-white/60 backdrop-blur-md border border-white/30 text-slate-900 text-sm font-bold rounded-xl py-4 pl-11 pr-4 outline-none focus:bg-white/90 focus:ring-4 focus:ring-red-500/30 transition-all placeholder:text-slate-500 shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-password" className="text-[10px] font-bold text-white uppercase tracking-wider ml-1 opacity-90">
              Password
            </label>
            <div className="relative group">
              <KeyRound
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 z-10"
                size={18}
              />
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full bg-white/60 backdrop-blur-md border border-white/30 text-slate-900 text-sm font-bold rounded-xl py-4 pl-11 pr-12 outline-none focus:bg-white/90 focus:ring-4 focus:ring-red-500/30 transition-all placeholder:text-slate-500 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 p-1 transition-colors z-10"
                title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 rounded-xl shadow-xl shadow-red-900/40 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-2 border border-red-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>MASUK APLIKASI</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Link Kembali ke Landing Page */}
          <div className="text-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-red-100 hover:text-white font-medium transition opacity-80 hover:opacity-100"
            >
              <ArrowLeft size={14} />
              <span>Kembali ke Halaman Utama</span>
            </Link>
          </div>
        </form>
      </div>

      {/* Footer Form */}
      <div className="bg-black/10 px-8 py-4 border-t border-white/10 text-center backdrop-blur-sm">
        <p className="text-[10px] text-white/70 font-bold uppercase tracking-wide">
          &copy; 2026 Asset Management TREG 3
        </p>
      </div>
    </div>
  )
}
