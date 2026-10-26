# Deploy aplikasi SMK3 ke Vercel

## 1. Hubungkan repositori

Di pengaturan proyek Vercel, pilih **Root Directory** `smk3-web-main` (folder yang berisi `next.config.ts` dan aplikasi Next.js). Biarkan framework terdeteksi sebagai Next.js dan gunakan perintah build standar `npm run build`.

## 2. Siapkan PostgreSQL

Buat database PostgreSQL yang dapat diakses dari internet melalui penyedia database. Salin connection string produksi dari penyedia tersebut; jangan gunakan URL lokal di `.env.example` seperti `host.docker.internal`.

Tambahkan `DATABASE_URL` pada Vercel **Project → Settings → Environment Variables**, untuk environment **Production** (dan Preview bila memang memakai database Preview terpisah). Simpan secret di Vercel, jangan commit ke Git atau kirim melalui chat.

Tambahkan juga `AUTH_SECRET` dengan nilai acak panjang (minimal 32 karakter), lalu redeploy. Aplikasi memakai nilai ini untuk menandatangani sesi login.

## 3. Terapkan migrasi sebelum login

Jalankan dari folder `smk3-web-main`, dengan `DATABASE_URL` sementara diarahkan ke database target. Sebelum menjalankan pada database yang sudah pernah dipakai, cek status migrasi dan buat backup. Migrasi lama `20260202091435_sync_laporan_table` berisi operasi penghapusan tabel; jangan menerapkannya ke database existing yang belum punya catatan migrasi tanpa review/rekonsiliasi terlebih dahulu.

```bash
npm run db:migrate
```

Perintah ini menerapkan file migrasi yang sudah ada, tanpa mereset database. Jangan jalankan `npm run db:reset` pada database produksi. Jangan jalankan `npm run db:seed` tanpa meninjau `prisma/seed.ts`: seed menambahkan akun demo dan juga menyinkronkan/menghapus sebagian data Witel.

Pastikan akun admin memang ada pada database tersebut. Akun lokal tidak otomatis ada di database produksi. Password plaintext yang lama akan di-hash saat pemilik akun berhasil login; akun baru dari halaman manajemen pengguna sudah menyimpan password dalam bentuk hash. Buat akun produksi lewat proses administrasi yang sah, bukan memakai akun demo. `db:seed` hanya untuk development/test; sekarang ditolak saat `NODE_ENV=production` dan tidak lagi menghapus Witel yang sudah ada.

## 4. Deploy ulang dan cek log

Setelah menambahkan atau mengubah environment variable, lakukan redeploy. Jika login masih gagal, cek **Deployments → deployment terbaru → Runtime Logs**. `DATABASE_URL` belum ada, koneksi ditolak, atau tabel belum termigrasi akan menyebabkan query login gagal.

## Catatan upload

Aplikasi saat ini menyimpan berkas ke `public/uploads` pada disk server. Penyimpanan lokal function Vercel tidak persisten, sehingga file upload dapat gagal atau hilang setelah deployment/function berganti. Sebelum mengandalkan upload di produksi, pindahkan penyimpanan file ke object storage (misalnya Vercel Blob) dan simpan URL/metadata pada database.

## Environment variables opsional

Peringatan APAR dikirim melalui email saja. Atur `CRON_SECRET`, `APAR_EMAIL_TO`, `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER`, `SMTP_PASSWORD`, dan `SMTP_FROM` pada Vercel. Untuk Gmail, `SMTP_USER` dan `SMTP_FROM` memakai akun pengirim yang sama; `SMTP_PASSWORD` harus berupa Google App Password. Jangan gunakan password login Gmail atau isi secret produksi pada Git/chat. Set variabel untuk Production lalu redeploy. Fitur email dan cron ini tidak diperlukan untuk sekadar membuka halaman atau menguji login.
