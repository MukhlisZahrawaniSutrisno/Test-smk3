Komponen pratinjau dokumen SMK3L

dashboard-smk3l-2026.html: panel pratinjau, detail dokumen, dan kontrol zoom.
document-preview.js: membaca DOCX dengan docx-preview, mempertahankan ukuran
halaman/margin, menunggu gambar dan font, kemudian membuat PDF per halaman.
Pratinjau memakai gambar halaman yang sama dengan gambar di PDF hasilnya,
sehingga tidak memerlukan plugin PDF pada ponsel. Berkas asli tidak ditimpa.

Pustaka lokal: docx-preview 0.3.7 (Apache-2.0), JSZip 3.10.1 (MIT/GPLv3),
html2canvas 1.4.1 (MIT), pdf-lib 1.17.1 (MIT). Lisensi disertakan di folder ini.
Salin folder vendor ini dan document-preview.js bersama dashboard ketika hosting.
Konversi berjalan di browser; berkas tidak dikirim ke layanan konversi eksternal.
Font, bentuk kompleks, dan pemenggalan halaman otomatis bisa berbeda dari Word.
Format .doc lama harus disimpan sebagai .docx terlebih dahulu.

Pemeriksaan: npm.cmd test
Uji browser: node scripts/verify-document-preview.mjs
CHROME_PATH dapat diisi dengan lokasi chrome.exe jika Chromium belum tersedia.
