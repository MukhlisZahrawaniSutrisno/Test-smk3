# Salinan Maintenance SMK3L

Paket ini adalah salinan source code untuk pengembangan. Dashboard kegiatan dibuka di `/dashboard-smk3l-2026.html`. Dokumen baru disimpan sebagai Blob privat, sedangkan metadata dokumen tersimpan di PostgreSQL agar pengguna yang login dapat melihat dokumen yang sama. Mulai v7.0, rentang tanggal kegiatan juga disimpan di PostgreSQL bagi pengguna login; mode browser lokal tetap tersedia saat database belum terhubung. Panduan pemasangan dan migrasi: [Rentang Waktu Kegiatan](docs/RENTANG_KEGIATAN.md).

## Menjalankan di komputer

1. Pasang Node.js yang sesuai dengan `package.json`, lalu jalankan `npm ci`.
2. Salin `.env.example` menjadi `.env` dan isi `DATABASE_URL` PostgreSQL serta `AUTH_SECRET` acak minimal 32 karakter.
3. Jalankan migrasi dengan `npm run db:migrate` dan buat akun melalui alur aplikasi yang sudah tersedia.
4. Jalankan `npm run dev`, lalu buka `http://localhost:3000/dashboard-smk3l-2026.html`.

Tanpa database dan login, halaman dashboard tetap dapat dibuka, tetapi API dokumen bersama tidak aktif.

## Deploy ke Vercel

1. Import folder source ini sebagai proyek Next.js di Vercel.
2. Hubungkan PostgreSQL yang dipakai aplikasi dan tambahkan `DATABASE_URL` serta `AUTH_SECRET` pada Environment Variables.
3. Buat/hubungkan Vercel Blob Store agar `BLOB_READ_WRITE_TOKEN` tersedia.
4. Jalankan `npm run db:migrate` terhadap database deployment sebelum pengguna mengunggah dokumen.
5. Deploy, login, lalu buka `/dashboard-smk3l-2026.html`.

API dokumen mengharuskan login. Semua pengguna login dapat melihat dokumen bersama; hanya admin atau pengunggah yang dapat menghapus dokumennya. PDF merge berjalan di browser dan hasilnya diunggah ke penyimpanan bersama.

ZIP ini tidak menyertakan `.env`, kredensial, database, atau berkas unggahan. Jangan memasukkan secret ke GitHub.
