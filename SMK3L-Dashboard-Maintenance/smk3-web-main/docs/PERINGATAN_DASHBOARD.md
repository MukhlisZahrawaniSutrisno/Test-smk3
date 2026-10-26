# Dashboard dan notifikasi kegiatan — v6.2

Paket ini menambahkan peringatan di dalam dashboard kalender SMK3L. Pengiriman otomatis Telegram belum termasuk: pengaturan server dan penjadwal menunggu konfirmasi hosting.

Versi v6.2 memakai logo Telkom besar sebagai watermark di latar belakang. Aset logo `telkom-icon.png` disimpan lokal; tampilan tidak bergantung pada situs gambar eksternal.

## Cara menggunakan

1. Buka `/dashboard-smk3l-2026.html`.
2. Klik **ikon lonceng di samping profil** pada bagian atas dashboard. Badge merah menunjukkan jumlah kegiatan yang perlu diingatkan; badge hilang bila tidak ada pengingat. Daftar kecil menampilkan kegiatan dari H-7 hingga hari kegiatan, terurut dari yang paling dekat. Hitungan tanggal mengikuti WIB (Asia/Jakarta).
3. Tahap peringatan meningkat pada H-7, H-5, H-3, dan H-1. Peringatan tetap terlihat di antara tahap tersebut. Kegiatan yang sudah lewat mengikuti bagian kegiatan terlewat yang sudah ada.
4. Pilih **Lihat kegiatan** untuk membuka agenda pada kalender. Tombol ini membersihkan pencarian dan filter status agar kegiatan dapat terlihat.
5. Tutup daftar dengan tombol silang, klik di luar daftar, atau tekan Esc. Notifikasi tidak menggunakan suara. Panel besar pada halaman telah diganti dengan ikon lonceng.
6. Kegiatan selesai atau terlewat tidak diberi pengingat. Kegiatan yang dijadwalkan ulang mengikuti tanggal baru; kegiatan yang dihapus hilang dari panel.

Peringatan diperiksa ulang setiap menit dan saat kembali ke tab dashboard. Angka pada ikon menunjukkan jumlah kegiatan yang mendekati jadwal, bukan jumlah pesan yang belum dibaca.

## Memasang pembaruan tampilan

Cadangkan halaman dashboard lama. Salin keempat berkas berikut dari folder `public` paket ini ke lokasi dashboard yang sama pada hosting:

- `dashboard-smk3l-2026.html`
- `dashboard-reminders.js`
- `dashboard-reminders.css`
- `telkom-icon.png`

Keempat berkas harus berada dalam folder yang sama. Pertahankan `document-preview.js` dan folder `vendor` yang sudah digunakan dashboard. Jangan mengganti database atau `.env`. Bila situs memakai deployment Next.js, sertakan empat berkas tersebut pada folder `public`, lalu deploy ulang seperti biasa. Muat ulang browser dengan Ctrl+F5 setelah pemasangan.

Data kegiatan tetap menggunakan penyimpanan browser yang sudah ada. Memasang pembaruan pada domain atau port berbeda tidak memindahkan data browser lama secara otomatis.

## Verifikasi pengembangan

Jalankan `npm test` untuk tes hitungan tanggal dan regresi lainnya. Dengan server lokal berjalan di port 3002, jalankan `node scripts/verify-dashboard-reminders.cjs` untuk memeriksa ikon lonceng, badge, buka/tutup daftar, navigasi, status selesai, dan tampilan ponsel memakai browser yang sudah terpasang. Variabel `SMK3L_URL`, `SMK3L_PLAYWRIGHT`, dan `SMK3L_BROWSER` dapat dipakai untuk menyesuaikan lingkungan uji.
