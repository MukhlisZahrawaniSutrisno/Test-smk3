/**
 * WhatsApp Gateway Service untuk Sistem Manajemen K3 (SMK3)
 * 
 * Fitur Unggulan:
 * 1. Normalisasi Nomor Telepon Indonesia: Mengubah "08...", "+62...", atau "620..." menjadi "628..." (Standar E.164)
 * 2. Dynamic Environment Resolution (Lazy Loading): Mengambil konfigurasi .env secara real-time saat dipanggil
 * 3. Timeout Protection: AbortController dengan batas waktu 15 detik (Anti-Memory Leak dengan blok finally)
 * 4. Resilient Retry Mechanism: Exponential Backoff (3x percobaan pada error jaringan atau HTTP 5xx)
 * 5. Multi-Gateway Support: Kompatibel dengan Fonnte, Wablas, dan Meta WhatsApp Cloud API
 */

export type WhatsAppProvider = "FONNTE" | "WABLAS" | "META";

export interface SendWhatsAppOptions {
  recipientPhone: string;
  message: string;
}

export interface SendAparAlertOptions {
  recipientPhone: string;
  picName: string;
  kodeApar: string;
  tipeMedia: string;
  lokasi: string;
  tanggalExpired: string;
  sisaHari: number;
}

export interface WhatsAppSendResult {
  success: boolean;
  provider: WhatsAppProvider;
  messageId?: string;
  rawResponse?: any;
  error?: string;
}

/**
 * Normalisasi format nomor telepon Indonesia menjadi standar internasional (628xxx)
 * Menangani berbagai format input:
 * - "081234567890"  -> "6281234567890"
 * - "+62812-3456"   -> "628123456"
 * - "6208123456"    -> "628123456" (kesalahan input umum)
 * - "81234567890"   -> "6281234567890"
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return "";

  // Hapus semua karakter non-angka
  let clean = phone.trim().replace(/[^0-9]/g, "");

  // Tangani awalan internasional 00 (misal: 0062...)
  if (clean.startsWith("0062")) {
    clean = clean.substring(2);
  }

  // Tangani salah ketik umum: 6208xxx -> 628xxx
  if (clean.startsWith("620")) {
    clean = "62" + clean.substring(3);
  }
  // Ubah awalan lokal 08xxx -> 628xxx
  else if (clean.startsWith("0")) {
    clean = "62" + clean.substring(1);
  }
  // Tambahkan kode negara jika pengguna hanya mengetik 8xxx
  else if (clean.startsWith("8")) {
    clean = "62" + clean;
  }

  return clean;
}

/**
 * Validasi apakah nomor HP memenuhi standar panjang nomor telepon Indonesia (10 - 15 digit)
 */
export function isValidIndonesianPhone(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  return /^62[2-9][0-9]{7,12}$/.test(normalized);
}

export class WhatsAppService {
  /**
   * Mengambil konfigurasi environment secara dinamis (Lazy Resolution)
   * Hal ini mencegah bug singleton di mana konfigurasi bernilai kosong
   * jika modul di-import sebelum file .env dimuat.
   */
  private getRuntimeConfig() {
    const rawProvider = (process.env.WA_PROVIDER || "FONNTE").toUpperCase();
    let provider: WhatsAppProvider = "FONNTE";

    if (rawProvider === "WABLAS") {
      provider = "WABLAS";
    } else if (rawProvider === "META") {
      provider = "META";
    }

    const apiToken = (process.env.WA_API_TOKEN || "").trim();
    const metaPhoneId = (process.env.WA_META_PHONE_NUMBER_ID || "").trim();

    let apiUrl = (process.env.WA_GATEWAY_URL || "").trim();

    if (!apiUrl) {
      switch (provider) {
        case "WABLAS":
          apiUrl = "https://pati.wablas.com/api/send-message";
          break;
        case "META":
          apiUrl = metaPhoneId
            ? `https://graph.facebook.com/v21.0/${metaPhoneId}/messages`
            : "";
          break;
        case "FONNTE":
        default:
          apiUrl = "https://api.fonnte.com/send";
          break;
      }
    }

    return { provider, apiToken, metaPhoneId, apiUrl };
  }

  /**
   * Mengirim pesan WhatsApp teks umum dengan proteksi Timeout & Retry Logic
   */
  public async sendMessage(
    options: SendWhatsAppOptions,
    maxRetries: number = 3
  ): Promise<WhatsAppSendResult> {
    const config = this.getRuntimeConfig();

    // 1. Validasi Keberadaan Token
    if (!config.apiToken) {
      return {
        success: false,
        provider: config.provider,
        error:
          "WA_API_TOKEN belum diisi di file .env. Pastikan Anda sudah menyalin .env dan mengisi token gateway.",
      };
    }

    // 2. Validasi Khusus Meta Cloud API
    if (config.provider === "META" && !config.metaPhoneId) {
      return {
        success: false,
        provider: config.provider,
        error:
          "WA_META_PHONE_NUMBER_ID wajib diisi di file .env untuk provider META.",
      };
    }

    // 3. Normalisasi & Validasi Nomor Telepon
    const normalizedPhone = normalizePhoneNumber(options.recipientPhone);
    if (!normalizedPhone || !isValidIndonesianPhone(options.recipientPhone)) {
      return {
        success: false,
        provider: config.provider,
        error: `Nomor telepon tujuan tidak valid: '${options.recipientPhone}'. Format yang disarankan: 08xxxxxxxxxx`,
      };
    }

    // 4. Susun Headers dan Body sesuai Gateway
    let headers: Record<string, string> = {};
    let body: Record<string, any> = {};

    switch (config.provider) {
      case "FONNTE":
        headers = {
          Authorization: config.apiToken,
          "Content-Type": "application/json",
        };
        body = {
          target: normalizedPhone,
          message: options.message,
          countryCode: "62",
        };
        break;

      case "WABLAS":
        headers = {
          Authorization: config.apiToken,
          "Content-Type": "application/json",
        };
        body = {
          phone: normalizedPhone,
          message: options.message,
        };
        break;

      case "META":
        headers = {
          Authorization: `Bearer ${config.apiToken}`,
          "Content-Type": "application/json",
        };
        body = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: normalizedPhone,
          type: "text",
          text: {
            preview_url: false,
            body: options.message,
          },
        };
        break;
    }

    let attempt = 0;
    let lastError = "";

    // 5. Siklus Percobaan Ulang (Exponential Backoff Retry)
    while (attempt < maxRetries) {
      attempt++;

      // Proteksi Timeout 15 Detik
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(config.apiUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        let responseData: any;
        try {
          responseData = await response.json();
        } catch {
          responseData = { rawText: await response.text().catch(() => "") };
        }

        // Tangani respons sukses HTTP
        if (response.ok) {
          // Beberapa gateway mengembalikan HTTP 200 tetapi JSON berisi error (misal token kadaluwarsa)
          if (
            responseData.status === false ||
            responseData.status === "failed" ||
            responseData.status === "error"
          ) {
            lastError =
              responseData.reason ||
              responseData.message ||
              responseData.detail ||
              "Gateway merespons penolakan pesan.";
          } else {
            // BERHASIL TERKIRIM
            const messageId =
              responseData.id ||
              responseData.message_id ||
              responseData.messages?.[0]?.id ||
              `msg_${Date.now()}`;

            return {
              success: true,
              provider: config.provider,
              messageId: String(messageId),
              rawResponse: responseData,
            };
          }
        } else {
          lastError = `HTTP ${response.status}: ${JSON.stringify(responseData)}`;

          // Hentikan retry jika terjadi Client Error (400, 401 Unauthorized, 403 Forbidden)
          // Kecuali 429 (Rate Limit), yang patut dicoba ulang
          if (
            response.status >= 400 &&
            response.status < 500 &&
            response.status !== 429
          ) {
            return {
              success: false,
              provider: config.provider,
              error: `Error Klien (${response.status}) - Token atau format permintaan salah: ${lastError}`,
              rawResponse: responseData,
            };
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          lastError = "Koneksi gateway timeout (melebihi batas aman 15 detik).";
        } else {
          lastError = err.message || "Gagal menghubungi server gateway.";
        }
      } finally {
        // Membersihkan timer agar tidak terjadi resource/memory leak di event loop
        clearTimeout(timeoutId);
      }

      // Jeda waktu sebelum mengulang (1s, 2s, 4s)
      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt - 1) * 1000;
        console.warn(
          `[WhatsAppService] Percobaan ke-${attempt} gagal (${lastError}). Mencoba kembali dalam ${backoffMs}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }

    return {
      success: false,
      provider: config.provider,
      error: `Pengiriman gagal setelah ${maxRetries}x percobaan. Penyebab: ${lastError}`,
    };
  }

  /**
   * Helper khusus untuk format pesan resmi peringatan kedaluwarsa APAR
   */
  public async sendAparAlert(options: SendAparAlertOptions): Promise<WhatsAppSendResult> {
    const template =
      `🚨 *[PERINGATAN KRITIS K3 - TABUNG APAR]* 🚨\n\n` +
      `Yth. Bapak/Ibu *${options.picName}*,\n` +
      `Sistem Monitoring K3 mendeteksi aset proteksi kebakaran berikut berada pada batas kedaluwarsa:\n\n` +
      `🔹 *Kode APAR:* ${options.kodeApar}\n` +
      `🔹 *Media:* ${options.tipeMedia}\n` +
      `🔹 *Lokasi:* ${options.lokasi}\n` +
      `🔹 *Tgl Kedaluwarsa:* ${options.tanggalExpired}\n` +
      `⚠️ *Status:* *Sisa ${options.sisaHari} Hari (H-${options.sisaHari})*\n\n` +
      `Mohon segera lakukan penggantian atau pengisian ulang (*refill*) tabung APAR ini hari ini guna memastikan kepatuhan regulasi keselamatan kerja dan kesiapsiagaan darurat.\n\n` +
      `_Pesan otomatis ini dikirim oleh Sistem Informasi Manajemen K3 (SMK3)._`;

    return this.sendMessage({
      recipientPhone: options.recipientPhone,
      message: template,
    });
  }
}

// Export instance singleton untuk digunakan di seluruh aplikasi
export const whatsappService = new WhatsAppService();
