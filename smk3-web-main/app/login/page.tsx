import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen relative font-sans overflow-hidden flex items-center justify-center lg:justify-end p-4 lg:p-0">
      {/* 0. TOMBOL KEMBALI KE BERANDA (LANDING PAGE) */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/25 text-white rounded-full backdrop-blur-md border border-white/25 transition-all duration-300 text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span>Kembali ke Beranda</span>
      </Link>

      {/* 1. BACKGROUND IMAGE */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('/Landmark-Tower.jpg')",
        }}
      ></div>

      {/* 2. OVERLAY MERAH */}
      <div className="absolute inset-0 bg-black/40 z-0"></div>

      {/* 3. KONTEN UTAMA */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">
        {/* --- BAGIAN KIRI: DESKRIPSI --- */}
        <div className="hidden lg:block text-white space-y-6 pr-10">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 py-2 px-4 rounded-full shadow-lg">
            <img
              src="/Telkom-logo-full.png"
              alt="Logo"
              className="h-6 w-auto brightness-0 invert"
            />
            <span className="text-sm font-bold tracking-widest uppercase opacity-90">
              Telkom Regional 3
            </span>
          </div>

          <h1 className="text-5xl font-extrabold leading-tight tracking-tight drop-shadow-xl text-white">
            Safety First,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-white">
              Zero Accident.
            </span>
          </h1>

          <p className="text-lg text-red-50 font-medium leading-relaxed max-w-lg opacity-90 drop-shadow-md">
            Sistem Manajemen K3 Digital. Monitoring risiko, pelaporan insiden,
            dan audit keselamatan kerja yang terintegrasi.
          </p>

          {/* Highlights */}
          <div className="pt-4 flex gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg">
                <ShieldCheck size={24} className="text-white" />
              </div>
              <div className="text-sm font-bold text-white">
                <span className="block text-red-200 text-xs uppercase">
                  Security
                </span>
                Terjamin
              </div>
            </div>
          </div>
        </div>

        {/* --- BAGIAN KANAN: KARTU LOGIN ULTRA GLASS --- */}
        <div className="flex justify-center lg:justify-end">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}