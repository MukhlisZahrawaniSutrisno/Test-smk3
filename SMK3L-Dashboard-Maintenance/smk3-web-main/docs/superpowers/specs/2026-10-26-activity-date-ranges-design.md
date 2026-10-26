# Rentang waktu kegiatan kalender SMK3L

## Kebutuhan yang diberikan pengguna

Tambahkan tanggal mulai/selesai pada tambah dan edit, durasi inklusif, validasi selesai tidak lebih awal, bar tersambung pada setiap hari termasuk lintas minggu/bulan, pencarian/filter/navigasi/jumlah tetap benar, simpan ke database, dan uji fungsi terdampak. Kalender, desain utama, watermark Telkom, lonceng tanpa suara, dan dokumen tetap dipertahankan.

## Pendekatan

Perluas tabel kalender dan tombol tanggal yang sudah ada dengan fragmen bar pada lajur mingguan yang stabil. Pilihan mengganti kalender dengan library baru ditolak karena pengguna meminta kalender yang ada tetap dipakai. Penyimpanan IndexedDB tetap kompatibel untuk mode lokal, sedangkan pengguna login memakai API jadwal PostgreSQL sebagai sumber data bersama. Tidak ada dependency aplikasi baru.

## Kontrak tanggal dan penyimpanan

- Pertahankan `plannedDate` dan `rescheduledDate`; tambahkan `plannedEndDate` dan `rescheduledEndDate`.
- Kegiatan lama tanpa tanggal selesai dianggap satu hari. Saat dijadwalkan ulang, tanggal akhir lama digeser dengan durasi yang sama jika tanggal akhir baru belum tersedia.
- Hari dihitung sebagai tanggal kalender UTC untuk menghindari pergeseran zona waktu; hari saat ini mengikuti Asia/Jakarta.
- Filter memakai irisan rentang inklusif, sedangkan jumlah kegiatan memakai ID unik, bukan jumlah kemunculan harian.
- Model baru `DashboardActivity` bersifat aditif, mempertahankan ID kegiatan, versi untuk konflik edit, dan soft delete; dokumen tidak dihapus oleh migrasi.
- API memerlukan login dan memvalidasi data serta origin permintaan mutasi. Jangan menulis ulang data server dari snapshot browser pada setiap reload.
- Bila database masih kosong, migrasikan agenda browser satu kali saat pengguna pertama menyimpan ke database. Inisialisasi harus atomik dan menolak overwrite jika server sudah terisi.
- Bila database tidak tersedia, tampilkan status lokal secara jujur; jangan mengklaim perubahan tersimpan di database. Konfigurasi produksi dan migrasi remote tidak dilakukan tanpa target yang jelas.

## Tampilan

Tetap memakai tabel, navigasi, dialog dan warna status saat ini. Maksimal dua lajur bar pada tiap minggu; kelebihan kegiatan ditunjukkan dengan jumlah tambahan, dan semua kegiatan tetap dapat dibuka melalui tanggal. Ujung bar menyambung tanpa sela di tengah rentang, dipotong secara jelas pada batas minggu. Durasi muncul pada formulir dan detail, bukan berulang pada seluruh sel kalender.

## Verifikasi

Uji tiga hari 26–28 Oktober 2026, satu hari, rentang invalid, lintas minggu/bulan/tahun, leap day, lajur bertumpuk, kompatibilitas agenda lama, hitungan unik, pencarian/filter, jadwal ulang, lonceng, dan reload. Uji API autentikasi/validasi/konflik serta migrasi aditif; lakukan uji database nyata jika PostgreSQL tersedia, dan laporkan batasan lingkungan jika tidak tersedia.
