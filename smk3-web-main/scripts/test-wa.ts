/**
 * Skrip Uji Coba Pengiriman Pesan WhatsApp Gateway
 * 
 * Cara Menjalankan:
 * 1. Pastikan Anda sudah membuat file .env dan mengisi token (contoh: WA_API_TOKEN=xxx)
 * 2. Jalankan perintah di terminal:
 *    npx tsx scripts/test-wa.ts 0813-2490-7303
 */

import fs from "fs";
import path from "path";

// Helper otomatis memuat file .env jika dotenv belum terpasang
function loadLocalEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...values] = trimmed.split("=");
        const value = values.join("=").replace(/(^['"]|['"]$)/g, "").trim();
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    });
  }
}

loadLocalEnv();

// Import WhatsApp Service yang telah diaudit & disempurnakan
import { whatsappService } from "../lib/services/whatsapp.service";

async function runTest() {
  console.log("\n==================================================");
  console.log("🚀 PENGUJIAN WHATSAPP GATEWAY (SMK3 MONITORING)");
  console.log("==================================================");

  // Ambil nomor dari argumen terminal jika ada, atau gunakan default
  const argPhone = process.argv[2];
  const TARGET_PHONE = argPhone || "081324907303";

  const provider = (process.env.WA_PROVIDER || "FONNTE").toUpperCase();
  const token = (process.env.WA_API_TOKEN || "").trim();

  console.log(`📌 Provider Aktif : ${provider}`);
  console.log(`📌 Status Token   : ${token ? "✅ TERDETEKSI (" + token.substring(0, 4) + "****)" : "❌ KOSONG (Wajib diisi di .env)"}`);
  console.log(`📌 Target Nomor   : ${TARGET_PHONE}`);
  console.log("--------------------------------------------------");

  if (!token) {
    console.error("⚠️ PERINGATAN: File .env belum memiliki WA_API_TOKEN.");
    console.error("👉 Silakan salin .env.example menjadi .env dan isi token akun WhatsApp Gateway Anda terlebih dahulu.\n");
  }

  console.log("⏳ Sedang memproses dan mengirim pesan uji coba...");

  const result = await whatsappService.sendAparAlert({
    recipientPhone: TARGET_PHONE,
    picName: "Mukhlis Zahrawani (Officer K3)",
    kodeApar: "APAR-LT02-005",
    tipeMedia: "Dry Chemical Powder 6kg",
    lokasi: "Gedung Telkom - Lantai 2 (Ruang Server)",
    tanggalExpired: "03 Oktober 2026",
    sisaHari: 1,
  });

  console.log("\n--- HASIL PENGIRIMAN ---");
  if (result.success) {
    console.log("🎉 STATUS : BERHASIL TERKIRIM!");
    console.log(`🆔 ID Pesan : ${result.messageId}`);
    console.log(`📡 Provider : ${result.provider}`);
    console.log("📦 Response Gateway:", JSON.stringify(result.rawResponse, null, 2));
  } else {
    console.error("⚠️ STATUS : PENGIRIMAN GAGAL!");
    console.error(`❌ Alasan  : ${result.error}`);
    if (result.rawResponse) {
      console.error("📦 Detail  :", JSON.stringify(result.rawResponse, null, 2));
    }
  }
  console.log("==================================================\n");
}

runTest();
