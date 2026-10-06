# Notifikasi kedaluwarsa APAR

`Apar` memakai tabel lama `AparAsset` melalui `@@map`; kolom `lokasi` dan
`tanggalExpired` juga dipetakan agar data lama tetap tersedia. Field lama
dipertahankan, tetapi cukup isi kode, lokasi, tanggal expired dan status untuk
membuat aset. `NotifikasiApar` memiliki constraint unik per aset, tipe dan
snapshot tanggal kedaluwarsa.

## Menjalankan

```sh
npm install
npx prisma generate
npm run db:migrate
npm test
npm run dev
```

Isi `.env` mengikuti `.env.example`:

```dotenv
CRON_SECRET=<secret-acak-panjang>
WA_PROVIDER=FONNTE
WA_API_TOKEN=<token-gateway>
APAR_WA_TO=628xxxxxxxxxx
APAR_EMAIL_TO=k3@perusahaan.example
SMTP_HOST=smtp.perusahaan.example
SMTP_PORT=587
SMTP_USER=k3@perusahaan.example
SMTP_PASSWORD=<password-smtp>
SMTP_FROM=k3@perusahaan.example
```

Gunakan alamat perusahaan atau mailing list di `APAR_EMAIL_TO`. Port 587 memakai
STARTTLS wajib; port 465 memakai TLS langsung. Jangan menonaktifkan validasi
sertifikat. `picNomorWa` pada aset mengalahkan nomor fallback `APAR_WA_TO`.
Semua variabel diteruskan ke container melalui Docker Compose.

## Menambahkan data

Jalankan kode ini dari kode server atau skrip yang mengimpor `prisma`:

```ts
await prisma.apar.create({
  data: {
    kodeApar: 'APAR-LT01-001',
    lokasi: 'Lantai 1 - Lobby',
    tanggalExpired: new Date('2026-12-31T00:00:00Z'),
    status: 'ACTIVE',
    picNomorWa: '628xxxxxxxxxx', // opsional; fallback ke APAR_WA_TO
  },
})
```

## Cron

Endpoint `GET /api/cron/apar` memerlukan `Authorization: Bearer <CRON_SECRET>`.
Endpoint ini harus dipanggil scheduler; membuka aplikasi tidak menjalankan cron.
Contoh pemanggilan:

```sh
curl --fail-with-body -H "Authorization: Bearer $CRON_SECRET" \
  https://alamat-aplikasi.example/api/cron/apar
```

Contoh crontab pada server dengan timezone UTC (07:00 Jakarta setiap hari):

```cron
CRON_SECRET=<secret-yang-sama-dengan-env-aplikasi>
0 0 * * * curl --fail-with-body -H "Authorization: Bearer $CRON_SECRET" https://alamat-aplikasi.example/api/cron/apar
```

- Mulai dua **bulan kalender** sebelum expired: satu log `WEB_WARNING`.
  Tanggal yang tidak tersedia dijepit ke akhir bulan; 30 April mulai 28/29 Februari.
- Pada dan setelah tanggal expired: kirim WA dan email, catat `WA_EXPIRED` dan
  `EMAIL_EXPIRED` hanya jika gateway/SMTP menerima pengiriman.
- Kegagalan satu kanal tidak menghalangi kanal lain; HTTP 503 menandakan ada
  kegagalan yang dapat dicoba ulang. Log sukses tidak dikirim ulang pada cron berikutnya.
- Hanya aset `ACTIVE` diproses. Setelah refill, perbarui `tanggalExpired` dan
  kembalikan `status` ke `ACTIVE`; siklus notifikasi baru mengikuti tanggal baru.
- Tanggal hari ini ditentukan dalam `Asia/Jakarta`, termasuk saat server UTC.

## UI dan batas pengiriman

`AparNotificationBadge.tsx` terpasang pada header admin dan pegawai. Komponen
membaca `/api/apar/notifications` tiap 60 detik setelah pengguna login. Angka
menghitung semua peringatan aktif; dropdown menampilkan 50 aset terdekat.
Peringatan tetap terlihat setelah expired, serta hilang saat aset nonaktif atau
tanggal expired berubah. Pesan web dihitung dari tanggal saat ini.

Lock PostgreSQL dan constraint unik mencegah cron tumpang tindih dan pengulangan
biasa. Pengiriman lintas gateway dan database tidak atomik: jika server mati
setelah gateway menerima pesan tetapi sebelum log tersimpan, percobaan ulang
dapat mengirim ulang. Log sukses berarti diterima gateway/SMTP, bukan bukti
pesan telah dibaca atau tiba di inbox. SMTP dibatasi 20 detik dan soket ditutup
saat timeout. Pengujian menggunakan penyimpanan/gateway tiruan; migrasi database
dan pengiriman nyata dijalankan setelah konfigurasi deployment diisi.
