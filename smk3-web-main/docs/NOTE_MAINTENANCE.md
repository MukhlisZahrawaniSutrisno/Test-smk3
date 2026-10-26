# Catatan maintenance SMK3 Monitoring

Panduan pemilik aplikasi. `smk3-web-main` adalah aplikasi utama. Catatan ini membahas kode sumber, bukan dependency dan hasil build.

## Teknologi dan alur kerja

- **TypeScript (`.ts`)**: backend, Server Actions, API, aturan bisnis, akses data.
- **TSX (`.tsx`)**: halaman dan komponen React.
- **CSS/Tailwind**: tampilan, terutama `app/globals.css` dan kelas dalam TSX.
- **SQL**: migrasi PostgreSQL di `prisma/migrations`.
- **JavaScript (`.mjs`, `.cjs`)**: konfigurasi dan skrip pemeriksaan.
- **HTML, CSS, JavaScript**: `public/dashboard-smk3l-2026.html`, dashboard agenda mandiri, terpisah dari Next.js.

Alur aplikasi: rute di `app/` menampilkan halaman → halaman/server action/API memakai Prisma untuk PostgreSQL → aksi menyimpan data → UI diperbarui. File upload sekarang ditulis ke `public/uploads`; penyimpanan ini bukan storage permanen di Vercel.

## Peta file fitur

### Kerangka, login, dan navigasi

| File | Fungsi |
|---|---|
| `app/layout.tsx` | Kerangka HTML dan layout global. |
| `app/page.tsx` | Halaman awal dan navigasi awal. |
| `app/globals.css` | CSS global dan Tailwind. |
| `app/login/page.tsx` | Halaman login. |
| `app/login/LoginForm.tsx` | Form browser yang memanggil aksi login. |
| `app/actions/auth.ts` | Cek akun, buat dan hapus cookie login. |
| `app/admin/layout.tsx` | Layout/pemeriksaan akses area admin. |
| `app/admin/AdminLayoutClient.tsx` | Layout admin interaktif. |
| `app/admin/AdminHeader.tsx` | Header admin dan profil/notifikasi. |
| `app/admin/AdminSidebar.tsx` | Menu samping admin. |
| `app/pegawai/layout.tsx` | Layout/pemeriksaan akses area pegawai. |
| `app/pegawai/components/PegawaiLayoutClient.tsx` | Layout pegawai interaktif. |
| `app/pegawai/components/PegawaiHeader.tsx` | Header pegawai. |
| `app/pegawai/components/SidebarContent.tsx` | Menu samping pegawai. |
| `app/pegawai/components/NavLink.tsx` | Link menu pegawai dengan status aktif. |

### Halaman admin

| File | Fungsi |
|---|---|
| `app/admin/dashboard/page.tsx` | Data dashboard utama admin. |
| `app/admin/dashboard/ArchiveCharts.tsx` | Grafik arsip. |
| `app/admin/dashboard/IncidentChart.tsx` | Grafik kecelakaan/insiden. |
| `app/admin/monitoring/page.tsx` | Monitoring laporan bulanan Witel. |
| `app/admin/audit/page.tsx` | Daftar temuan audit. |
| `app/admin/audit/AuditFilter.tsx` | Filter daftar temuan. |
| `app/admin/audit/TombolAksi.tsx` | Aksi pada temuan audit. |
| `app/admin/audit/[id]/page.tsx` | Detail dan tindak lanjut temuan. |
| `app/admin/audit/create/page.tsx` | Form tambah temuan audit. |
| `app/admin/ibpr/page.tsx` | Halaman data IBPR. |
| `app/admin/ibpr/form.tsx` | Form IBPR. |
| `app/admin/ibpr/client-page.tsx` | Interaksi browser IBPR. |
| `app/admin/kecelakaan/page.tsx` | Monitoring insiden. |
| `app/admin/kecelakaan/IncidentFilter.tsx` | Filter insiden. |
| `app/admin/kecelakaan/DeleteButton.tsx` | Hapus insiden. |
| `app/admin/kecelakaan/MarkDoneButton.tsx` | Tandai tindak lanjut selesai. |
| `app/admin/evidence/page.tsx` | Halaman data evidence SMK3. |
| `app/admin/evidence/client-page.tsx` | Interaksi evidence di browser. |
| `app/admin/archive/page.tsx` | Halaman arsip dokumen digital. |
| `app/admin/archive/client-page.tsx` | UI aksi/pencarian arsip digital. |
| `app/admin/arsip/page.tsx` | Halaman arsip surat. |
| `app/admin/arsip/ArsipClient.tsx` | Pencarian dan aksi arsip surat. |
| `app/admin/surat/page.tsx` | Halaman pembuatan/pengelolaan surat. |
| `app/admin/surat/SuratClient.tsx` | Form dan interaksi surat. |
| `app/admin/surat/types.ts` | Tipe data modul surat. |
| `app/admin/kriteria-referensi/page.tsx` | Halaman dokumen referensi kriteria. |
| `app/admin/kriteria-referensi/KriteriaClient.tsx` | Daftar dan aksi dokumen referensi. |
| `app/admin/document-tools/page.tsx` | Halaman alat dokumen. |
| `app/admin/document-tools/ToolsClient.tsx` | Kamera, watermark, dan alat PDF. |
| `app/admin/users/page.tsx` | Manajemen pengguna. |
| `app/admin/users/create/page.tsx` | Form tambah pengguna. |
| `app/admin/users/DeleteUserButton.tsx` | Hapus pengguna. |

### Halaman pegawai

| File | Fungsi |
|---|---|
| `app/pegawai/dashboard/page.tsx` | Dashboard pegawai. |
| `app/pegawai/audit/page.tsx` | Laporan/akses temuan audit pegawai. |
| `app/pegawai/kecelakaan/page.tsx` | Laporan/akses insiden pegawai. |
| `app/pegawai/ibpr/page.tsx` | Akses pegawai untuk IBPR. |
| `app/pegawai/evidence/page.tsx` | Akses pegawai untuk evidence. |
| `app/pegawai/archive/page.tsx` | Akses pegawai untuk arsip. |
| `app/pegawai/kriteria-referensi/page.tsx` | Akses dokumen referensi. |
| `app/pegawai/document-tools/page.tsx` | Alat dokumentasi pegawai. |

### Aksi backend, API, dan file upload

| File | Fungsi |
|---|---|
| `app/actions/audit.ts` | Simpan/perbarui/hapus audit dan bukti. |
| `app/actions/documentArchive.ts` | CRUD arsip digital dan file. |
| `app/actions/evidence.ts` | Upload/pengelolaan bukti SMK3. |
| `app/actions/ibpr.ts` | Simpan/perbarui IBPR dan lampiran. |
| `app/actions/kecelakaan.ts` | CRUD laporan kecelakaan dan lampiran. |
| `app/actions/kriteriaReference.ts` | Pengelolaan dokumen referensi. |
| `app/actions/laporan.ts` | Laporan bulanan Witel dan file. |
| `app/actions/surat.ts` | Pengelolaan surat. |
| `app/actions/user.ts` | Aksi data pengguna. |
| `app/api/apar/notifications/route.ts` | API data notifikasi APAR pengguna. |
| `app/api/cron/apar/route.ts` | Endpoint scheduler APAR, dilindungi `CRON_SECRET`. |
| `app/api/archive/route.ts` | API arsip dan file arsip. |
| `app/api/archive/save-tool-edit/route.ts` | Menyimpan hasil edit dokumen. |
| `app/api/kriteria-referensi/route.ts` | API dokumen referensi. |
| `app/uploads/[...path]/route.ts` | Baca file dari disk upload lokal. Ganti dengan object storage untuk Vercel. |

### Komponen, landing page, dan helper

| File | Fungsi |
|---|---|
| `app/components/AparNotificationBadge.tsx` | Badge/dropdown APAR. |
| `app/components/EvidenceDownloadDropdown.tsx` | Menu unduh bukti. |
| `app/components/EvidencePhotoCard.tsx` | Kartu foto bukti. |
| `app/components/TimestampModal.tsx` | Dialog informasi waktu/lokasi foto. |
| `app/components/TimestampPhotoInput.tsx` | Input foto dengan watermark. |
| `app/components/dashboard/AuditSeverityMeter.tsx` | Visual tingkat keparahan audit. |
| `app/components/dashboard/DashboardHero.tsx` | Ringkasan atas dashboard. |
| `app/components/dashboard/RecentActivityFeed.tsx` | Aktivitas terbaru. |
| `app/components/landing/HeroSection.tsx` | Bagian utama halaman depan. |
| `app/components/landing/LandingNavbar.tsx` | Navigasi halaman depan. |
| `app/components/landing/LandingFooter.tsx` | Footer halaman depan. |
| `app/components/landing/AuditSimulatorSection.tsx` | Simulasi audit. |
| `app/components/landing/EmergencyProtapHub.tsx` | Akses prosedur darurat. |
| `app/components/landing/LegalAndCycleSection.tsx` | Informasi peraturan/siklus SMK3. |
| `app/components/landing/QuickSosBar.tsx` | Akses kontak SOS. |
| `app/components/landing/RegulationComparison.tsx` | Perbandingan regulasi. |
| `app/utils/auditData.ts` | Data bantu audit. |
| `app/utils/imageStamper.ts` | Watermark gambar. |
| `app/utils/kriteriaReferenceData.ts` | Data referensi kriteria untuk UI. |
| `app/utils/photoParser.ts` | Membaca/menyiapkan foto. |
| `app/utils/protapData.ts` | Data prosedur tanggap darurat. |
| `app/utils/speechHelper.ts` | Bantuan text-to-speech browser. |
| `app/utils/useDarkTheme.ts` | Hook tema gelap. |

### Database, aturan bisnis, dan notifikasi

| File | Fungsi |
|---|---|
| `lib/prisma.ts` | Membuat Prisma Client untuk PostgreSQL. |
| `lib/auth.ts` | Verifikasi cookie sesi dengan secret, ambil user dari database, dan periksa role. |
| `lib/session-token.ts` | Membuat/memeriksa token sesi HMAC yang kedaluwarsa setelah 8 jam. |
| `lib/password.ts` | Hash password dengan scrypt serta verifikasi password lama untuk migrasi saat login. |
| `lib/apar-policy.ts` | Aturan tanggal/peringatan APAR. |
| `lib/apar-notifications.ts` | Proses peringatan APAR, mencatat peringatan web, dan mengirim email saat APAR kedaluwarsa. |
| `lib/apar-web-notifications.ts` | Bentuk data notifikasi untuk UI. |
| `lib/evidence-master-data.ts` | Data induk evidence SMK3. |
| `lib/riskMatrix.ts` | Perhitungan matriks risiko. |
| `lib/services/email.service.ts` | Pengiriman email melalui SMTP. |
| `lib/services/whatsapp.service.ts` | Integrasi gateway WhatsApp untuk fitur lain; peringatan APAR memakai email. |
| `prisma/schema.prisma` | Model tabel, relasi, dan enum database. |
| `prisma/seed.ts` | Data contoh awal; jangan jalankan di produksi tanpa tinjau efeknya. |
| `prisma/tsconfig.seed.json` | Konfigurasi TypeScript untuk seed. |
| `prisma/migrations/migration_lock.toml` | Menetapkan provider migrasi PostgreSQL. |
| `prisma/migrations/20260123074711_init_smk3_schema/migration.sql` | Skema database awal. |
| `prisma/migrations/20260202091435_sync_laporan_table/migration.sql` | Penyesuaian tabel laporan. |
| `prisma/migrations/20260206013603_add_arsip_surat/migration.sql` | Struktur arsip surat. |
| `prisma/migrations/20260213033330_add_ibpr_table/migration.sql` | Tabel IBPR. |
| `prisma/migrations/20260713041658_add_document_archive/migration.sql` | Arsip digital. |
| `prisma/migrations/20260908000000_add_evidence_smk3/migration.sql` | Evidence SMK3. |
| `prisma/migrations/20260924000000_add_kriteria_reference_doc/migration.sql` | Dokumen referensi kriteria. |
| `prisma/migrations/20261006000000_apar_notifications/migration.sql` | Aset dan catatan notifikasi APAR. |
| `prisma/migrations/20261020000000_remove_password_default/migration.sql` | Menghapus password default yang lemah untuk akun baru; tidak mengubah password akun yang sudah ada. |

## File dan folder pendukung

- `public/dashboard-smk3l-2026.html`: dashboard agenda HTML terpisah dari Next.js. `public/dokumen/1769662107291_1717040789_ME-5-Form-P_01_IBPR_Pengisian_BBM_dari_Tangki_Timbun_ke_Tangki_Harian.docx`: dokumen statis.
- Aset `public/`: `Landmark.jpeg`, `Landmark-Tower.jpg`, `logo-telkom.jpg`, `sjabc.png`, `telkom-icon.png`, `Telkom-logo-fu.png`, `Telkom-logo-full.png`, `icon.png` adalah gambar/logo; `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` adalah aset ikon/template. `.gitkeep` menjaga folder upload tercatat di Git.
- `tests/apar-email.test.ts`: syarat SMTP, timeout, dan hasil kirim email.
- `tests/apar-notifications.test.ts`: jadwal, retry, idempotensi, dan konflik cron.
- `tests/apar-policy.test.ts`: aturan tanggal masa berlaku APAR.
- `tests/apar-routes.test.ts`: proteksi route notifikasi/cron.
- `tests/apar-web.test.ts`: data badge dan notifikasi browser.
- `tests/password.test.ts`: hash, password salah, dan transisi password plaintext lama.
- `tests/session-token.test.ts`: tanda tangan, manipulasi, dan masa berlaku sesi.
- `tests/whatsapp.test.ts`: hasil kirim gateway WhatsApp.
- `scripts/verify-smk3l.cjs`: pemeriksaan browser dashboard HTML. `scripts/test-wa.ts`: uji integrasi WhatsApp, jangan gunakan dengan penerima nyata sembarangan.
- `next.config.ts`: konfigurasi build Next.js, Turbopack, dan batas ukuran Server Action.
- `package.json`: dependency dan perintah kerja. `package-lock.json`: versi dependency terkunci; jangan edit manual.
- `tsconfig.json`: aturan TypeScript dan alias `@/*`. `eslint.config.mjs`: aturan lint. `postcss.config.mjs`: integrasi Tailwind/PostCSS.
- `.env.example`: daftar nama environment variable, bukan secret produksi.
- `Dockerfile` dan `docker-compose.yml`: menjalankan aplikasi/database dengan Docker.
- `README.md`: panduan Next.js dasar, sebagian masih template.
- `ARCHITECTURE.md` dan `IMPLEMENTATION.md`: dokumentasi lama; cek silang terhadap kode saat ini.
- `APAR_NOTIFICATIONS.md`: konfigurasi dan batasan notifikasi APAR.
- `docs/DEPLOY_VERCEL.md`: panduan deploy Vercel.
- `docs/superpowers/`: catatan spesifikasi/rencana perubahan terdahulu.
- `app/favicon.ico` dan `app/icon.png`: ikon browser.

Di folder repo induk (satu tingkat di atas `smk3-web-main`), `package.json` meneruskan perintah ke aplikasi; `package-lock.json` mengunci dependency tool repo; `README.md` dan `GITHUB_UPLOAD.md` berisi catatan proyek/GitHub; `.gitignore` mencegah dependency, hasil build, secret, dan artefak lokal ikut di-commit.

## Perintah maintenance

Jalankan dari folder repo utama (`PROJECT 1 SMK3-MAGANG`):

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

Untuk database lokal, jalankan dari `smk3-web-main`:

```powershell
npm.cmd run db:migrate
npm.cmd run dev
```

`db:migrate` menerapkan migrasi yang belum jalan. `db:reset` menghapus lalu membuat ulang database—jangan dipakai untuk data yang harus dipertahankan. `db:seed` memasukkan data contoh dan memiliki efek samping lain; jangan jalankan di produksi tanpa pemeriksaan. Buat backup sebelum perubahan database produksi.

## Cara menelusuri dan mengubah fitur

1. Cari URL fitur di folder `app/admin/` atau `app/pegawai/`.
2. Ikuti `action`/`fetch` ke `app/actions/` atau `app/api/`.
3. Ikuti query ke `lib/prisma.ts` dan model `prisma/schema.prisma`.
4. Perubahan struktur tabel dibuat sebagai migrasi baru. Jangan mengubah migrasi yang sudah dipakai deployment.
5. Jalankan tes, lint, dan build setelah perubahan.

## Batasan yang perlu dibereskan sebelum pemakaian produksi

- Login sudah memakai cookie sesi bertanda tangan dan menyimpan hash untuk akun baru; akun lama diubah ke hash setelah login berhasil. Atur `AUTH_SECRET` di setiap environment; semua sesi lama akan meminta login ulang.
- Server Action dan API yang mengubah data memeriksa sesi serta role dari database. `db:seed` ditolak di production dan tidak lagi menghapus Witel yang sudah ada.
- Tes/build lokal tidak menguji kredensial PostgreSQL, gateway email/WhatsApp, maupun runtime production. Periksa log deployment dan lakukan uji terkontrol.
- Upload file di disk lokal tidak persisten di Vercel; gunakan object storage.
- Tes/build lokal tidak menguji database live, kredensial Vercel, gateway email/WhatsApp, maupun runtime production. Periksa log Vercel dan lakukan uji terkontrol.
- Lint masih memberi warning lama terkait unused imports, `<img>`, dan dependency React hook; selesaikan per area tanpa mematikan aturan secara global.
