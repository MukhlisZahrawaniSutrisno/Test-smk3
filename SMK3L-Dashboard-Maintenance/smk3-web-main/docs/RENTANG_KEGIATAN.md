# Rentang Waktu Kegiatan — v7.0

## Menggunakan kalender

- Pada **Tambah kegiatan**, isi **Tanggal Mulai** dan **Tanggal Selesai**. Durasi dihitung termasuk kedua tanggal. Contoh 26–28 Oktober 2026 = **3 hari**.
- Pada **Edit**, ubah tanggal mulai/selesai rencana. Jika status **Dijadwalkan ulang**, isi juga tanggal mulai/selesai baru beserta alasan dan PIC.
- Kegiatan tampil pada setiap tanggal dalam rentangnya. Bar menyambung dalam satu minggu, lalu dilanjutkan pada minggu berikutnya. Navigasi bulan menampilkan bagian rentang yang termasuk bulan tersebut.
- Klik salah satu tanggal untuk melihat detail lengkap. Maksimal dua lajur bar ditampilkan; angka **+N lainnya** menunjukkan kegiatan tambahan yang tetap tersedia di detail harian.
- Pencarian, filter status, pilihan tahun, dan jumlah kegiatan tetap memakai kegiatan unik. Kegiatan tiga hari tetap dihitung satu kegiatan. Kegiatan lama tanpa tanggal selesai dianggap satu hari.
- Lonceng tetap tanpa suara dan mengingatkan sebelum tanggal mulai efektif. Watermark Telkom serta pengelolaan dokumen tetap dipertahankan.

## Menyimpan ke database

Penyimpanan bersama memakai PostgreSQL dan sesi login yang sudah ada. Halaman tetap mendukung penyimpanan browser saat belum login atau database belum terhubung; status penyimpanan ditampilkan di bawah kalender. Mode lokal tidak diklaim tersimpan di database.

1. Cadangkan deployment dan database yang sudah digunakan.
2. Pasang source v7.0 pada proyek **Next.js yang sama**, pertahankan `.env` dan berkas unggahan milik hosting. Pembaruan ini memiliki API dan migrasi; menyalin file HTML saja tidak mengaktifkan penyimpanan database.
3. Pastikan `DATABASE_URL` mengarah ke PostgreSQL hosting dan `AUTH_SECRET` berisi secret sesi milik server. Jangan masukkan keduanya ke HTML/JavaScript publik atau GitHub.
4. Jalankan dari folder `smk3-web-main`:

   ```sh
   npm ci
   npm run db:migrate
   npm run build
   npm start
   ```

   Untuk Vercel, gunakan pengaturan environment dan alur deploy proyek yang sudah ada. Untuk Docker, `docker-compose.yml` kini meneruskan `AUTH_SECRET` serta token Blob opsional. Jangan menjalankan reset atau demo seed pada database produksi.

5. Login melalui `/login`, buka `/dashboard-smk3l-2026.html`, lalu muat ulang dengan Ctrl+F5. Gunakan akun yang sudah tersedia pada database; paket tidak membuat akun produksi.

Migrasi baru `20261026000000_add_dashboard_activity_ranges` hanya menambah tabel `DashboardActivity`, indeks, dan batasan tanggal; tidak menghapus tabel lama, dokumen, atau unggahan. Pada database existing, pastikan riwayat migrasi lama sudah sesuai sebelum menjalankan seluruh migrasi proyek. Terdapat migrasi lama yang mengubah/menghapus tabel; jangan memperlakukan database existing tanpa riwayat migrasi sebagai database baru.

Saat agenda database masih kosong, penyimpanan pertama dari pengguna login memindahkan agenda browser yang sedang terbuka ke database secara atomik, mempertahankan ID kegiatan dan hubungan dokumen. Setelah itu database menjadi sumber data bersama. Reload tidak menimpa data server dengan snapshot browser lama. Jika dua pengguna menyimpan versi yang sama, pengguna kedua mendapat pesan konflik; muat ulang sebelum mengedit kembali.

Penghapusan agenda database memakai soft delete dan mempertahankan dokumen bersama. Dokumen lokal tetap mengikuti penyimpanan browser. Jika penyimpanan lampiran gagal setelah kegiatan tersimpan di database, aplikasi menampilkan peringatan khusus dan mempertahankan berkas dalam halaman agar dapat diunduh sebelum halaman ditutup.

## Pemeriksaan yang tersedia

```sh
npm test
node scripts/verify-calendar-ranges.cjs
node scripts/verify-dashboard-reminders.cjs
node scripts/verify-range-storage-failures.cjs
```

Uji browser memakai server lokal port 3002, atau alamat pada `SMK3L_URL`, dan browser/Playwright yang sudah terpasang. Uji rentang browser mengontrol respons HTTP untuk memeriksa alur UI, termasuk kegagalan 503 dan konflik 409.

Uji PostgreSQL nyata terpisah:

```sh
# TEST_DATABASE_URL harus menunjuk database pengujian yang boleh dipakai.
node --import tsx scripts/test-dashboard-database.ts
```

Skrip memakai schema acak yang terisolasi dan membersihkannya setelah selesai. Tanpa `TEST_DATABASE_URL`, skrip melewati pengujian tanpa mengubah database. Ia menguji migrasi, inisialisasi dan edit bersamaan, tanggal setelah koneksi dibuka ulang, validasi SQL, soft delete, serta dokumen lama yang tetap tersimpan.

Integrasi Telegram otomatis tidak ditambahkan oleh perubahan rentang kalender ini.
