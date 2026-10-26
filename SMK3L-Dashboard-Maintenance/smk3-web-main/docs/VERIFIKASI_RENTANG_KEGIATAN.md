# Hasil verifikasi rentang kegiatan — 26 Oktober 2026

Target: salinan maintenance yang memakai `/dashboard-smk3l-2026.html`, bukan dashboard admin React pada folder aplikasi yang berbeda.

| Pemeriksaan | Hasil |
| --- | --- |
| `npm test` | 49 tes lulus; tidak ada kegagalan |
| ESLint pada helper kalender, penyimpanan, API, tes dan skrip terdampak | Lulus |
| Prisma schema validate dan client generate | Lulus, Prisma 5.22 |
| TypeScript dan `npm run build` | Lulus; seluruh tiga route jadwal masuk build produksi |
| `verify-calendar-ranges.cjs` | Lulus; tanpa page error |
| `verify-dashboard-reminders.cjs` | Lulus; lonceng tetap tanpa suara |
| `verify-range-storage-failures.cjs` | Lulus; kegagalan hapus tidak menghilangkan kegiatan; lampiran tetap dapat diunduh dengan nama dan byte asli |
| `test-dashboard-database.ts` pada PostgreSQL 16.14 nyata | Lulus, schema pengujian terisolasi dibersihkan |
| Review independen | Dua masalah jalur kegagalan diperbaiki dan diuji ulang; tidak ada blocker tersisa pada review perbaikan |

## Rentang dan UI

Diperiksa melalui formulir yang sebenarnya: 26–28 Oktober 2026 berdurasi tiga hari, tambah/edit tanggal, satu hari, akhir sebelum mulai, reschedule, lintas minggu/bulan/tahun, leap day, kompatibilitas kegiatan lama, dua lajur dengan overflow, pencarian, filter status, navigasi, serta hitungan kegiatan unik. Geometri bar diuji tersambung pada desktop dan viewport 390px; halaman tidak overflow horizontal. Screenshot kalender desktop dan ponsel diperiksa.

Alur penyimpanan browser diuji terhadap HTTP boundary terkontrol: agenda lama diinisialisasi satu kali sebelum penyimpanan baru, versi dikirim saat edit, reload mengambil data server, kegagalan 503 dan konflik 409 tidak berpindah diam-diam ke mode lokal. Pemeriksaan ini terpisah dari pengujian PostgreSQL nyata di bawah.

## PostgreSQL nyata

Database pengujian berjalan hanya pada loopback dalam cluster sementara, tanpa menyentuh database pengguna atau hosting. Semua migrasi proyek dijalankan pada schema acak. Hasil:

- Dua inisialisasi bersamaan menghasilkan satu sukses dan satu konflik (`200 / 409`).
- Dua edit dengan versi sama menghasilkan satu sukses dan satu konflik (`200 / 409`).
- Koneksi Prisma baru tetap membaca tanggal selesai `2026-10-28` dan versi yang sudah diperbarui.
- SQL langsung dengan tanggal selesai sebelum mulai ditolak oleh CHECK database.
- Soft delete berhasil; inisialisasi ulang setelah penghapusan ditolak.
- Dokumen yang sudah terkait dengan ID kegiatan tetap tersimpan.
- Pembuatan kegiatan baru menghasilkan `201`.

Schema pengujian dibersihkan, server PostgreSQL sementara dihentikan. Tidak ada credential atau `.env` produksi yang diubah. Dashboard development dijalankan kembali pada port 3002.

Pemasangan pada hosting belum dilakukan. Database hosting tetap memerlukan konfigurasi, migrasi yang sesuai, dan akun login sebagaimana dijelaskan pada `RENTANG_KEGIATAN.md`.
