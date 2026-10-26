SALINAN MAINTENANCE SMK3L v7.0 — RENTANG KEGIATAN DAN DOKUMEN BERSAMA

Source aplikasi ada di folder smk3-web-main. Ini proyek Next.js lengkap,
bukan file HTML yang bisa langsung ditempel ke website lain.

Jalankan lokal:
1. Buka terminal di folder smk3-web-main.
2. Jalankan npm ci.
3. Salin .env.example menjadi .env, lalu isi DATABASE_URL PostgreSQL
   dan AUTH_SECRET (acak, minimal 32 karakter).
4. Jalankan npm run db:migrate.
5. Jalankan npm run dev.
6. Buka http://localhost:3000/dashboard-smk3l-2026.html dan login.

Untuk Vercel, deploy proyek ini dan isi DATABASE_URL, AUTH_SECRET, serta
BLOB_READ_WRITE_TOKEN dari Vercel Blob. Terapkan migrasi ke database deployment
dengan npm run db:migrate sebelum upload dokumen.

Dokumen unggahan baru disimpan terpusat: pengguna login dapat melihat dokumen
yang sama. Hanya admin atau pengunggah yang dapat menghapus dokumen bersama.
Rentang tanggal kegiatan kini disimpan di PostgreSQL bagi pengguna login.
Mode browser lokal tetap tersedia bila database belum terhubung.
Panduan upgrade: smk3-web-main/docs/RENTANG_KEGIATAN.md.

ZIP tidak menyertakan .env, kredensial, database, atau berkas unggahan. Website
produksi yang sudah ada tidak diubah oleh paket salinan ini.
