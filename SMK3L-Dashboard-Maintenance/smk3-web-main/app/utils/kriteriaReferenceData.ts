export interface KriteriaItem {
  id: string; // e.g. "1.1.1"
  elemenNumber: number; // 1 - 12
  elemenTitle: string;
  nomor: string; // e.g. "1.1.1"
  deskripsi?: string;
  tingkat?: 'AWAL' | 'TRANSISI' | 'LANJUTAN';
  defaultDocRef?: string;
  category?: string;
}

export const ELEMEN_LIST = [
  { number: 1, title: 'Pembangunan dan Pemeliharaan Komitmen' },
  { number: 2, title: 'Strategi Pendokumentasian' },
  { number: 3, title: 'Peninjauan Ulang Desain dan Kontrak' },
  { number: 4, title: 'Pengendalian Dokumen' },
  { number: 5, title: 'Pembelian & Pengendalian Produk' },
  { number: 6, title: 'Keamanan Bekerja Berdasarkan SMK3' },
  { number: 7, title: 'Standar Pemantauan' },
  { number: 8, title: 'Pelaporan dan Perbaikan Kekurangan' },
  { number: 9, title: 'Pengelolaan Material & Perpindahannya' },
  { number: 10, title: 'Pengumpulan dan Penggunaan Data' },
  { number: 11, title: 'Pemeriksaan SMK3 (Audit Internal)' },
  { number: 12, title: 'Pengembangan Keterampilan & Kemampuan' },
];

export const KRITERIA_SMK3_DATA: KriteriaItem[] = [
  // =========================================================================
  // ELEMEN 1: PEMBANGUNAN DAN PEMELIHARAAN KOMITMEN
  // =========================================================================
  {
    id: '1',
    elemenNumber: 1,
    elemenTitle: 'Pembangunan dan Pemeliharaan Komitmen',
    nomor: '1'
  },
  {
    id: '1.1',
    elemenNumber: 1,
    elemenTitle: 'Kebijakan K3',
    nomor: '1.1'
  },
  {
    id: '1.1.1',
    elemenNumber: 1,
    elemenTitle: 'Terdapat kebijakan K3 yang tertulis, ditandatangani oleh perusaha atau pengurus, secara jelas menyatakan tujuan dan sasaran K3 serta komitmen terhadap peningkatan K3',
    nomor: '1.1.1',
    defaultDocRef: 'M.01/UM410/COP-M3000000/2024'
  },
  {
    id: '1.1.2',
    elemenNumber: 1,
    elemenTitle: 'Kebijakan disusun oleh pengusaha dan/atau pengurus setelah melalui proses konsultasi dengan wakil tenaga kerja"',
    nomor: '1.1.2',
    defaultDocRef: 'M.01/UM410/COP-M3000000/2024'
  },
  {
    id: '1.1.3',
    elemenNumber: 1,
    elemenTitle: 'Perusahaan mengkomunikasikan kebijakan kepada seluruh tenaga kerja, tamu, kontraktor, pelanggan, dan pemasok dengan tata cara yang tepat',
    nomor: '1.1.3',
    defaultDocRef: 'P.05/UM410/COP-M3000000/2024'
  },
  {
    id: '1.1.4',
    elemenNumber: 1,
    elemenTitle: 'Kebijakan khusus dibuat untuk masalah K3 yang bersifat khusus.',
    nomor: '1.1.4',
    defaultDocRef: 'P.32/UM410/COP-M3000000/2024'
  },
  {
    id: '1.1.5',
    elemenNumber: 1,
    elemenTitle: 'Kebijakan K3 dan kebijakan khusus lainnya ditinjau ulang secara berkala untuk menjamin bahwa kebijakan tersebut sesuai dengan perubahan yang terjadi dalam perusahaan dan dalam peraturan perundang-undangan',
    nomor: '1.1.5',
    defaultDocRef: 'P.29/UM410/COP-M3000000/2024'
  },
  {
    id: '1.2',
    elemenNumber: 1,
    elemenTitle: 'Tanggungjawab dan Wewenang untuk Bertindak',
    nomor: '1.2',
  },
  {
    id: '1.2.1',
    elemenNumber: 1,
    elemenTitle: 'Tanggungjawab dan wewenang untuk mengambil tindakan dan melaporkan kepada semua pihak yang terkait dalam perusahaan di bidang K3 telah ditetapkan, diinformasikan dan didokumentasikan',
    nomor: '1.2.1',
  },
  {
    id: '1.2.2',
    elemenNumber: 1,
    elemenTitle: 'Penunjukan penanggung jawab K3 harus sesuai dengan peraturan perundang-undangan.',
    nomor: '1.2.2',
  },
  {
    id: '1.2.3',
    elemenNumber: 1,
    elemenTitle: 'Pemimpin unit kerja dalam suatu perusahaan bertanggungjawab atas kinerja K3 pada unit kerjanya.',
    nomor: '1.2.3',
  },
  {
    id: '1.2.4',
    elemenNumber: 1,
    elemenTitle: 'Pengusaha atau pengurus bertanggung jawab secara penuh untuk menjamin pelaksanaan SMK3.',
    nomor: '1.2.4',
  },
  {
    id: '1.2.5',
    elemenNumber: 1,
    elemenTitle: 'Petugas yang bertanggung jawab penanganan keadaan darurat telah ditetapkan dan mendapatkan pelatihan.',
    nomor: '1.2.5',
    defaultDocRef: 'P.19/UM410/COP-M3000000/2024'
  },
  {
    id: '1.2.6',
    elemenNumber: 1,
    elemenTitle: 'Perusahaan mendapatkan saran saran dari para ahli dibidang K3 yang berasal dari dalam dan/atau luar perusahaan.',
    nomor: '1.2.6',
    defaultDocRef: 'P.30/UM410/COP-M3000000/2024'
  },
  {
    id: '1.2.7',
    elemenNumber: 1,
    elemenTitle: 'Kinerja K3 termuat dalam laporan tahunan perusahaan atau laporan lainnya yang setingkat',
    nomor: '1.2.7',
    defaultDocRef: 'P.26/UM410/COP-M3000000/2024'
  },
  {
    id: '1.3',
    elemenNumber: 1,
    elemenTitle: 'Tinjauan dan Evaluasi',
    nomor: '1.3',
  },
  {
    id: '1.3.1',
    elemenNumber: 1,
    elemenTitle: 'Tinjauan terhadap penerapan SMK3 meliputi kebijakan, perencanaan, pelaksanaan, pemantauan dan evaluasi telah dilakukan, dicatat dan didokumentasikan.',
    nomor: '1.3.1',
    defaultDocRef: 'P.29/UM410/COP-M3000000/2024'
  },
  {
    id: '1.3.2',
    elemenNumber: 1,
    elemenTitle: 'Hasil tinjauan dimasukkan dalam perencanaan tindakan manajemen',
    nomor: '1.3.2',
    defaultDocRef: 'P.29/UM410/COP-M3000000/2024'
  },
  {
    id: '1.3.3',
    elemenNumber: 1,
    elemenTitle: 'Pengurus harus meninjau ulang pelaksanaan SMK3 secara berkala untuk menilai keseruan dan efectivitas SMK3',
    nomor: '1.3.3',
    defaultDocRef: 'P.29/UM410/COP-M3000000/2024'
  },
  {
    id: '1.4',
    elemenNumber: 1,
    elemenTitle: 'Keterlibatan dan Konsultasi dengan Tenaga Kerja',
    nomor: '1.4',
  },
  {
    id: '1.4.1',
    elemenNumber: 1,
    elemenTitle: 'Keterlibatan dan penjadwalan konsultasi tenaga kerja dengan wakil perusahaan didokumentasikan dan disebarluaskan ke seluruh tenaga kerja.',
    nomor: '1.4.1',
    defaultDocRef: 'P.05/UM410/COP-M3000000/2024'
  },
  {
    id: '1.4.2',
    elemenNumber: 1,
    elemenTitle: 'Terdapat prosedur yang memudahkan konsultasi mengenai perubahan yang mempunyai implikasi terhadap K3',
    nomor: '1.4.2',
    defaultDocRef: 'P.28/UM410/COP-M3000000/2024'
  },
  {
    id: '1.4.3',
    elemenNumber: 1,
    elemenTitle: 'Perusahaan telah membentuk P2K3 Sesuai dengan peraturan perundang-undangan.',
    nomor: '1.4.3',
  },
  {
    id: '1.4.4',
    elemenNumber: 1,
    elemenTitle: 'Ketua P2K3 adalah pimpinan puncak atau pengurus',
    nomor: '1.4.4',
  },
  {
    id: '1.4.5',
    elemenNumber: 1,
    elemenTitle: 'Sekretaris P2K3 adalah ahli K3 sesuai dengan peraturan perundang-undangan.',
    nomor: '1.4.5',
  },
  {
    id: '1.4.6',
    elemenNumber: 1,
    elemenTitle: 'P2K3 menitikberatkan kegiatan pada pengembangan kebijakan dan prosedur mengendalikan risiko.',
    nomor: '1.4.6',
  },
  {
    id: '1.4.7',
    elemenNumber: 1,
    elemenTitle: 'Susunan pengurus P2K3 didokumentasikan dan diinformasikan kepada tenaga kerja',
    nomor: '1.4.7',
    defaultDocRef: 'P.06/UM410/COP-M3000000/2024'
  },
  {
    id: '1.4.8',
    elemenNumber: 1,
    elemenTitle: 'P2K3 mengadakan pertemuan secara teratur dan hasilnya disebarluaskan di tempat kerja.',
    nomor: '1.4.8',
    defaultDocRef: 'P.29/UM410/COP-M3000000/2024'
  },
  {
    id: '1.4.9',
    elemenNumber: 1,
    elemenTitle: 'P2K3 melaporkan kegiatannya secara teratur sesuai dengan peraturan perundangan.',
    nomor: '1.4.9',
    defaultDocRef: 'P.26/UM410/COP-M3000000/2024'
  },
  {
    id: '1.4.10',
    elemenNumber: 1,
    elemenTitle: 'Dibentuk kelompok-kelompok kerja dan dipilih dari wakil-wakil tenaga kerja yang ditunjuk sebagai penanggung jawab K3 di tempat kerjanya dan kepadanya diberikan pelatihan sesuai dengan peraturan perundang-undangan.',
    nomor: '1.4.10',
    defaultDocRef: 'P.04/UM410/COP-M3000000/2024'
  },
  {
    id: '1.4.11',
    elemenNumber: 1,
    elemenTitle: 'Susunan kelompok-kelompok kerja yang telah terbentuk didokumentasikan dan diinformasikan kepada tenaga kerja.',
    nomor: '1.4.11',
    defaultDocRef: 'P.05/UM410/COP-M3000000/2024'
  },

  // =========================================================================
  // ELEMEN 2: STRATEGI PENDOKUMENTASIAN
  // =========================================================================
  {
    id: '2',
    elemenNumber: 2,
    elemenTitle: 'Pembuatan dan Pendokumentasian Rencana K3',
    nomor: '2',
  },
  {
    id: '2.1',
    elemenNumber: 2,
    elemenTitle: 'RENCANA STRATEGIS K3',
    nomor: '2.1',
  },
  {
    id: '2.1.1',
    elemenNumber: 2,
    elemenTitle: 'Terdapat prosedur terdokumentasi untuk identifikasi potensi bahaya, penilaian, dan pengendalian risiko K3.',
    nomor: '2.1.1',
    defaultDocRef: 'P.02/UM410/COP-M3000000/2024'
  },
  {
    id: '2.1.2',
    elemenNumber: 2,
    elemenTitle: 'Identifikasi potensi bahaya, penilaian, dan pengendalian risiko K3 sebagai rencana strategi K3 dilakukan oleh petugas yang berkompeten.',
    nomor: '2.1.2',
    defaultDocRef: 'P.04/UM410/COP-M3000000/2024'
  },
  {
    id: '2.1.3',
    elemenNumber: 2,
    elemenTitle: 'Rencana strategi K3 sekurang-kurangnya berdasarkan tinjauan awal, identifikasi potensi bahaya, penilaian, pengendalian risiko, dan peraturan perundang-undangan serta informasi K3 lain baik dari dalam maupun luar perusahaan.',
    nomor: '2.1.3',
    defaultDocRef: 'P.03/UM410/COP-M3000000/2024'
  },
  {
    id: '2.1.4',
    elemenNumber: 2,
    elemenTitle: 'Rencana strategi K3 yang telah ditetapkan digunakan untuk mengendalikan risiko K3 dengan menetapkan tujuan dan sasaran yang dapat diukur dan menjadi prioritas serta menyediakan sumber daya.',
    nomor: '2.1.4',
    defaultDocRef: 'P.03/UM410/COP-M3000000/2024'
  },
  {
    id: '2.1.5',
    elemenNumber: 2,
    elemenTitle: 'Rencana kerja dan rencana khusus yang berkaitan dengan produk, proses, proyek atau tempat kerja tertentu telah dibuat dengan menetapkan tujuan dan sasaran yang dapat diukur, menetapkan waktu pencapaian dan menyediakan sumber daya.',
    nomor: '2.1.5',
    defaultDocRef: 'P.03/UM410/COP-M3000000/2024'
  },
  {
    id: '2.1.6',
    elemenNumber: 2,
    elemenTitle: 'Rencana K3 diselaraskan dengan rencana sistem managemen perusahaan.',
    nomor: '2.1.6',
    defaultDocRef: 'P.03/UM410/COP-M3000000/2024'
  },
  {
    id: '2.2',
    elemenNumber: 2,
    elemenTitle: 'SMK3',
    nomor: '2.2',
  },
  {
    id: '2.2.1',
    elemenNumber: 2,
    elemenTitle: 'Manual SMK3 meliputi kebijakan, tujuan, rencana, prosedur K3, instruksi kerja, formulir, catatan dan tanggung jawab serta wewenang tanggung jawab K3 untuk semua tingkatan dalam perusahaan.',
    nomor: '2.2.1',
    defaultDocRef: 'M.01/UM410/COP-M3000000/2024'
  },
  {
    id: '2.2.2',
    elemenNumber: 2,
    elemenTitle: 'Terdapat manual khusus yang berkaitan dengan produk, proses, atau tempat kerja tertentu.',
    nomor: '2.2.2',
  },
  {
    id: '2.2.3',
    elemenNumber: 2,
    elemenTitle: 'Manual SMK3 mudah didapat oleh semua personil dalam perusahaan sesuai kebutuhan.',
    nomor: '2.2.3',
    defaultDocRef: 'P.06/UM410/COP-M3000000/2024'
  },
  {
    id: '2.3',
    elemenNumber: 2,
    elemenTitle: 'Peraturan perundangan dan persyaratan lain dibidang K3',
    nomor: '2.3',
  },
  {
    id: '2.3.1',
    elemenNumber: 2,
    elemenTitle: 'Terdapat prosedur yang terdokumentasi untuk mengidentifikasi, memperoleh, memelihara dan memahami peraturan perundang-undangan, standar, pedoman teknis, dan persyaratan lain yang relevan dibidang K3 untuk seluruh tenaga kerja di perusahaan.',
    nomor: '2.3.1',
    defaultDocRef: 'P.30/UM410/COP-M3000000/2024'
  },
  {
    id: '2.3.2',
    elemenNumber: 2,
    elemenTitle: 'Penanggung jawab untuk memelihara dan mendistribusikan informasi terbaru mengenai peraturan perundang-undangan, standar, pedoman teknis, dan persyaratan lain telah ditetapkan.',
    nomor: '2.3.2',
    defaultDocRef: 'P.06/UM410/COP-M3000000/2024'
  },
  {
    id: '2.3.3',
    elemenNumber: 2,
    elemenTitle: 'Persyaratan pada peraturan perundang-undangan, standar, pedoman teknis, dan persyaratan lain yang relevan di bidang K3 dimasukkan pada prosedur-prosedur dan petunjuk-petunjuk kerja.',
    nomor: '2.3.3',
    defaultDocRef: 'P.30/UM410/COP-M3000000/2024'
  },
  {
    id: '2.3.4',
    elemenNumber: 2,
    elemenTitle: 'Perubahan pada peraturan perundang-undangan, standar, pedoman teknis, dan persyaratan lain yang relevan di bidang K3 digunakan untuk peninjauan prosedur-prosedur dan petunjuk-petunjuk kerja.',
    nomor: '2.3.4',
    defaultDocRef: 'P.30/UM410/COP-M3000000/2024'
  },
  {
    id: '2.4',
    elemenNumber: 2,
    elemenTitle: 'Informasi K3',
    nomor: '2.4',
  },
  {
    id: '2.4.1',
    elemenNumber: 2,
    elemenTitle: 'Informasi yang dibutuhkan mengenai kegiatan K3 disebarluaskan secara sistematis kepada seluruh tenaga kerja, tamu, kontraktor, pelanggan, dan pemasok.',
    nomor: '2.4',
    defaultDocRef: 'P.05/UM410/COP-M3000000/2024'
  },

  //

  // =========================================================================
  // ELEMEN 3: PENINJAUAN ULANG DESAIN DAN KONTRAK
  // =========================================================================
  {
    id: '3',
    elemenNumber: 3,
    elemenTitle: 'Pengendalian Perancangan dan Peninjauan Kontrak',
    nomor: '3',
  },
  {
    id: '3.1',
    elemenNumber: 3,
    elemenTitle: 'Pengendalian Perancangan',
    nomor: '3.1',
  },
  {
    id: '3.1.1',
    elemenNumber: 3,
    elemenTitle: 'Prosedur yang terdokumentasi mempertimbangkan identifikasi potensi bahaya, penilaian, dan pengendalian risiko yang dilakukan pada tahap perancangan dan modifikasi.',
    nomor: '3.1.1',
    defaultDocRef: 'P.13/UM410/COP-M3000000/2024'
  },
  {
    id: '3.1.2',
    elemenNumber: 3,
    elemenTitle: 'Prosedur, instruksi kerja dalam penggunaan produk, pengoperasian mesin dan peralatan, instalasi, pesawat atau proses serta informasi lainnya yang berkaitan dengan K3 telah dikembangkan selama perancangan dan/atau modifikasi.',
    nomor: '3.1.2',
  },
  {
    id: '3.1.3',
    elemenNumber: 3,
    elemenTitle: 'Petugas yang berkompeten melakukan verifikasi bahwa perancangan dan/atau modifikasi memenuhi persyaratan K3 yang ditetapkan sebelum penggunaan hasil rancangan.',
    nomor: '3.1.3',
    defaultDocRef: 'P.13/UM410/COP-M3000000/2024'
  },
  {
    id: '3.1.4',
    elemenNumber: 3,
    elemenTitle: 'Semua perubahan dan modifikasi perancangan yang mempunyai implikasi terhadap K3 diidentifikasi, didokumentasikan, ditinjau ulang dan disetujui oleh petugas yang berwenang sebelum pelaksanaan.',
    nomor: '3.1.4',
    defaultDocRef: 'P.28/UM410/COP-M3000000/2024'
  },
  {
    id: '3.2',
    elemenNumber: 3,
    elemenTitle: 'Peninjauan Ulang Desain dan Kontrak',
    nomor: '3.2',
  },
  {
    id: '3.2.1',
    elemenNumber: 3,
    elemenTitle: 'Prosedur yang terdokumentasi harus mampu mengidentifikasi bahaya dan menilai risiko K3 bagi tenaga kerja, lingkungan, dan masyarakat, dimana prosedur tersebut digunakan pada saat memasok barang dan jasa dalam suatu kontrak.',
    nomor: '3.2.1',
    defaultDocRef: 'P.06/UM410/COP-M3000000/2024'
  },
  {
    id: '3.2.2',
    elemenNumber: 3,
    elemenTitle: 'Identifikasi bahaya dan penilaian risiko dilakukan pada tinjauan kontrak oleh petugas yang berkompeten.',
    nomor: '3.2.2',
    defaultDocRef: 'P.02/UM410/COP-M3000000/2024'
  },
  {
    id: '3.2.3',
    elemenNumber: 3,
    elemenTitle: 'Kontrak ditinjau ulang untuk menjamin bahwa pemasok dapat memenuhi persyaratan K3 bagi pelanggan.',
    nomor: '3.2.3',
    defaultDocRef: 'P.11/UM410/COP-M3000000/2024'
  },
  {
    id: '3.2.4',
    elemenNumber: 3,
    elemenTitle: 'Catatan tinjauan kontrak dipelihara dan didokumentasikan.',
    nomor: '3.2.4',
    defaultDocRef: 'P.11/UM410/COP-M3000000/2024'
  },

  // =========================================================================
  // ELEMEN 4: PENGENDALIAN DOKUMEN
  // =========================================================================
  {
    id: '4',
    elemenNumber: 4,
    elemenTitle: 'Pengendalian Dokumen',
    nomor: '4',
  },
  {
    id: '4.1',
    elemenNumber: 4,
    elemenTitle: 'Persetujuan, Pengeluaran dan Pengendalian Dokumen',
    nomor: '4.1',
  },
  {
    id: '4.1.1',
    elemenNumber: 4,
    elemenTitle: 'Dokumen K3 mempunyai identifikasi status, wewenang, tanggal pengeluaran dan tanggal modifikasi.',
    nomor: '4.1.1',
    defaultDocRef: 'P.06/UM410/COP-M3000000/2024'
  },
  {
    id: '4.1.2',
    elemenNumber: 4,
    elemenTitle: 'Penerima distribusi dokumen tercantum dalam dokumen tersebut.',
    nomor: '4.1.2',
    defaultDocRef: 'P.06/UM410/COP-M3000000/2024'
  },
  {
    id: '4.1.3',
    elemenNumber: 4,
    elemenTitle: 'Dokumen K3 edisi terbaru disimpan secara sistematis pada tempat yang ditentukan.',
    nomor: '4.1.3',
    defaultDocRef: 'P.06/UM410/COP-M3000000/2024'
  },
  {
    id: '4.1.4',
    elemenNumber: 4,
    elemenTitle: 'Dokumen usang segera disingkirkan dari penggunaannya sedangkan dokumen usang yang disimpan untuk keperluan tertentu diberi tanda khusus.',
    nomor: '4.1.4',
    defaultDocRef: 'P.06/UM410/COP-M3000000/2024'
  },
  {
    id: '4.2',
    elemenNumber: 4,
    elemenTitle: 'Perubahan dan Modifikasi Dokumen',
    nomor: '4.2',
  },
  {
    id: '4.2.1',
    elemenNumber: 4,
    elemenTitle: 'Terdapat sistem untuk membuat, menyetujui perubahan terhadap dokumen K3.',
    nomor: '4.2.1',
    defaultDocRef: 'P.28/UM410/COP-M3000000/2024'
  },
  {
    id: '4.2.2',
    elemenNumber: 4,
    elemenTitle: 'Dalam hal terjadi perubahan diberikan alasan terjadinya perubahan dan tertera dalam dokumen atau lampirannya dan menginformasikan kepada pihak terkait.',
    nomor: '4.2.2',
    defaultDocRef: 'P.28/UM410/COP-M3000000/2024'
  },
  {
    id: '4.2.3',
    elemenNumber: 4,
    elemenTitle: 'Terdapat prosedur pengendalian dokumen atau daftar seluruh dokumen yang mencantumkan status dari setiap dokumen tersebut, dalam upaya mencegah penggunaan dokumen yang usang.',
    nomor: '4.2.3',
    defaultDocRef: 'P.06/UM410/COP-M3000000/2024'
  },

  // =========================================================================
  // ELEMEN 5: PEMBELIAN & PENGENDALIAN PRODUK
  // =========================================================================
  {
    id: '5',
    elemenNumber: 5,
    elemenTitle: 'Pembelian dan Pengendalian Produk',
    nomor: '5'
  },
  {
    id: '5.1',
    elemenNumber: 5,
    elemenTitle: 'Spesifikasi Pembelian Barang dan Jasa',
    nomor: '5.1',
  },
  {
    id: '5.1.1',
    elemenNumber: 5,
    elemenTitle: 'Terdapat prosedur yang terdokumentasi yang dapat menjamin bahwa spesifikasi teknik dan informasi lain yang relevan dengan K3 telah diperiksa sebelum keputusan untuk membeli.',
    nomor: '5.1.1',
    defaultDocRef: 'P.11/UM410/COP-M3000000/2024'
  },
  {
    id: '5.1.2',
    elemenNumber: 5,
    elemenTitle: 'Spesifikasi pembelian untuk setiap sarana produksi, zat kimia atau jasa harus dilengkapi spesifikasi yang sesuai dengan persyaratan peraturan perundang-undangan dan standar K3.',
    nomor: '5.1.2',
    defaultDocRef: 'P.16/UM410/COP-M3000000/2024'
  },
  {
    id: '5.1.3',
    elemenNumber: 5,
    elemenTitle: 'Konsultasi dengan tenaga kerja yang kompeten pada saat keputusan pembelian, dilakukan untuk menetapkan persyaratan K3 yang dicantumkan dalam spesifikasi pembelian dan diinformasikan kepada tenaga kerja yang menggunakannya.',
    nomor: '5.1.3',
    defaultDocRef: 'P.05/UM410/COP-M3000000/2024'
  },
  {
    id: '5.1.4',
    elemenNumber: 5,
    elemenTitle: 'Kebutuhan pelatihan, pasokan alat pelindung diri dan perubahan terhadap prosedur kerja harus dipertimbangkan sebelum pembelian dan penggunaannya.',
    nomor: '5.1.4',
    defaultDocRef: 'P.11/UM410/COP-M3000000/2024'
  },
  {
    id: '5.1.5',
    elemenNumber: 5,
    elemenTitle: 'Persyaratan K3 dievaluasi dan menjadi pertimbangan dalam seleksi pembelian.',
    nomor: '5.1.5',
    defaultDocRef: 'P.11/UM410/COP-M3000000/2024'
  },
  {
    id: '5.2',
    elemenNumber: 5,
    elemenTitle: 'Sistem Verifikasi Barang dan Jasa Yang Telah Dibeli',
    nomor: '5.2',
  },
  {
    id: '5.2.1',
    elemenNumber: 5,
    elemenTitle: 'Barang dan jasa yang dibeli diperiksa kesesuaiannya dengan spesifikasi pembelian.',
    nomor: '5.2.1',
    defaultDocRef: 'P.11/UM410/COP-M3000000/2024'
  },
  {
    id: '5.3',
    elemenNumber: 5,
    elemenTitle: 'Pengendalian Barang dan Jasa Yang Dipasok Pelanggan',
    nomor: '5.3',
  },
  {
    id: '5.3.1',
    elemenNumber: 5,
    elemenTitle: 'Barang dan jasa yang dipasok pelanggan, sebelum digunakan terlebih dahulu diidentifikasi potensi bahaya dan dinilai risikonya dan catatan tersebut dipelihara untuk memeriksa prosedur.',
    nomor: '5.3.1',
    defaultDocRef: 'P.02/UM410/COP-M3000000/2024'
  },
  {
    id: '5.4',
    elemenNumber: 5,
    elemenTitle: 'Kemampuan Telusur Produk',
    nomor: '5.4',
  },
  {
    id: '5.4.1',
    elemenNumber: 5,
    elemenTitle: 'Semua produk yang digunakan dalam proses produksi dapat diidentifikasi di seluruh tahapan produksi dan instalasi, jika terdapat potensi masalah K3.',
    nomor: '5.4.1',
    defaultDocRef: 'P.21/UM410/COP-M3000000/2024'
  },
  {
    id: '5.4.2',
    elemenNumber: 5,
    elemenTitle: 'Terdapat prosedur yang terdokumentasi untuk penelusuran produk yang telah terjual, jika terdapat potensi masalah K3 di dalam penggunaannya.',
    nomor: '5.4.2',
    defaultDocRef: 'P.21/UM410/COP-M3000000/2024'
  },

  // =========================================================================
  // ELEMEN 6: KEAMANAN BEKERJA BERDASARKAN SMK3
  // =========================================================================
  {
    id: '6',
    elemenNumber: 6,
    elemenTitle: 'Keamanan Bekerja Berdasarkan SMK3',
    nomor: '6',
  },
  {
    id: '6.1',
    elemenNumber: 6,
    elemenTitle: 'Sistem Kerja',
    nomor: '6.1',
  },
  {
    id: '6.1.1',
    elemenNumber: 6,
    elemenTitle: 'Petugas yang kompeten telah mengidentifikasi bahaya, menilai dan mengendalikan risiko yang timbul dari suatu proses kerja.',
    nomor: '6.1.1',
    defaultDocRef: 'P.02/UM410/COP-M3000000/2024'
  },
  {
    id: '6.1.2',
    elemenNumber: 6,
    elemenTitle: 'Apabila upaya pengendalian risiko diperlukan maka upaya tersebut ditetapkan melalui tingkat pengendalian.',
    nomor: '6.1.2',
    defaultDocRef: 'P.15/UM410/COP-M3000000/2024'
  },
  {
    id: '6.1.3',
    elemenNumber: 6,
    elemenTitle: 'Terdapat Prosedur atau petunjuk kerja yang terdokumentasi untuk mengendalikan risiko yang teridentifikasi dan dibuat atas dasar masukan dari personil yang kompeten serta tenaga kerja yang terkait dan disahkan oleh orang yang berwenang di perusahaan.',
    nomor: '6.1.3',
    defaultDocRef: 'P.15/UM410/COP-M3000000/2024'
  },
  {
    id: '6.1.4',
    elemenNumber: 6,
    elemenTitle: 'Kepatuhan terhadap peraturan perundang-undangan, standar serta pedoman teknis yang relevan diperhatikan pada saat mengembangkan atau melakukan modifikasi atau petunjuk kerja.',
    nomor: '6.1.4',
    defaultDocRef: 'P.30/UM410/COP-M3000000/2024'
  },
  {
    id: '6.1.5',
    elemenNumber: 6,
    elemenTitle: 'Terdapat sistem izin kerja untuk tugas berisiko tinggi.',
    nomor: '6.1.5',
    defaultDocRef: 'P.14/UM410/COP-M3000000/2024'
  },
  {
    id: '6.1.6',
    elemenNumber: 6,
    elemenTitle: 'Alat pelindung diri yang digunakan dipastikan telah layak pakai sesuai dengan standar dan atau peraturan perundangan yang berlaku.',
    nomor: '6.1.6',
    defaultDocRef: 'P.08/UM410/COP-M3000000/2024'
  },
  {
    id: '6.1.7',
    elemenNumber: 6,
    elemenTitle: 'Alat pelindung diri yang digunakan dipastikan telah dinyatakan layak pakai sesuai dengan standar dan/atau peraturan undangan yang berlaku.',
    nomor: '6.1.7',
    defaultDocRef: 'P.08/UM410/COP-M3000000/2024'
  },
  {
    id: '6.1.8',
    elemenNumber: 6,
    elemenTitle: 'Upaya pengendalian risiko dievaluasi secara berkala apabila terjadi ketidaksesuaian atau perubahan pada proses kerja.',
    nomor: '6.1.8',
    defaultDocRef: 'P.13/UM410/COP-M3000000/2024'
  },
  {
    id: '6.2',
    elemenNumber: 6,
    elemenTitle: 'Pengawasan',
    nomor: '6.2',
  },
  {
    id: '6.2.1',
    elemenNumber: 6,
    elemenTitle: 'Dilakukan pengawasan untuk menjamin bahwa setiap pekerjaan dilaksanakan dengan aman dan mengikuti prosedur dan petunjuk kerja yang telah ditentukan.',
    nomor: '6.2.1',
    defaultDocRef: 'P.15/UM410/COP-M3000000/2024'
  },
  {
    id: '6.2.2',
    elemenNumber: 6,
    elemenTitle: 'Setiap orang diawasi sesuai dengan tingkat kemampuan dan tingkat risiko tugas.',
    nomor: '6.2.2',
    defaultDocRef: 'P.15/UM410/COP-M3000000/2024'
  },
  {
    id: '6.2.3',
    elemenNumber: 6,
    elemenTitle: 'Pengawas/penyelia ikut serta dalam identifikasi bahaya dan membuat upaya pengendalian.',
    nomor: '6.2.3',
    defaultDocRef: 'P.15/UM410/COP-M3000000/2024'
  },
  {
    id: '6.2.4',
    elemenNumber: 6,
    elemenTitle: 'Pengawas/penyelia diikut sertakan dalam melakukan penyelidikan dan pembuatan laporan terhadap terjadinya kecelakaan dan penyakit akibat kerja serta wajib menyerahkan laporan dan saran-saran kepada pengusaha atau pengurus.',
    nomor: '6.2.4',
    defaultDocRef: 'P.25/UM410/COP-M3000000/2024'
  },
  {
    id: '6.2.5',
    elemenNumber: 6,
    elemenTitle: 'Pengawas/penyelia ikut serta dalam proses konsultasi.',
    nomor: '6.2.5',
    defaultDocRef: 'P.05/UM410/COP-M3000000/2024'
  },
  {
    id: '6.3',
    elemenNumber: 6,
    elemenTitle: 'Seleksi dan Penempatan Personil',
    nomor: '6.3',
  },
  {
    id: '6.3.1',
    elemenNumber: 6,
    elemenTitle: 'Persyaratan tugas tertentu termasuk persyaratan kesehatan diidentifikasi dan dipakai untuk menyeleksi dan menempatkan tenaga kerja.',
    nomor: '6.3.1',
    defaultDocRef: 'P.09/UM410/COP-M3000000/2024'
  },
  {
    id: '6.3.2',
    elemenNumber: 6,
    elemenTitle: 'Penugasan pekerjaan harus berdasarkan kempuan dan keterampilan serta kewenangan yang dimiliki.',
    nomor: '6.3.2',
    defaultDocRef: 'P.09/UM410/COP-M3000000/2024'
  },
  {
    id: '6.4',
    elemenNumber: 6,
    elemenTitle: 'Area Terbatas',
    nomor: '6.4',
  },
  {
    id: '6.4.1',
    elemenNumber: 6,
    elemenTitle: 'Pengusaha atau pengurus melakukan penilaian risiko lingkungan kerja untuk mengetahui daerah-daerah yang memerlukan pembatasan izin masuk.',
    nomor: '6.4.1',
    defaultDocRef: 'P.15/UM410/COP-M3000000/2024'
  },
  {
    id: '6.4.2',
    elemenNumber: 6,
    elemenTitle: 'Terdapat pengendalian atas daerah/tempat dengan pembatasan izin masuk.',
    nomor: '6.4.2',
  },
  {
    id: '6.4.3',
    elemenNumber: 6,
    elemenTitle: 'Tersedianya fasilitas dan layanan di tempat kerja sesuai dengan standar dan pedoman teknis.',
    nomor: '6.4.3',
    defaultDocRef: 'P.12/UM410/COP-M3000000/2024'
  },
  {
    id: '6.4.4',
    elemenNumber: 6,
    elemenTitle: 'Ramburambu K3 harus dipasang sesuai dengan standar dan pedoman teknis.',
    nomor: '6.4.4',
    defaultDocRef: 'P.19/UM410/COP-M3000000/2024'
  },
  {
    id: '6.5',
    elemenNumber: 6,
    elemenTitle: 'Pemeliharaan, Perbaikan, dan Perubahan Sarana Produksi',
    nomor: '6.5',
  },
  {
    id: '6.5.1',
    elemenNumber: 6,
    elemenTitle: 'Penjadualan pemeriksaan dan pemeliharaan sarana produksi serta peralatan mencakup verifikasi alat-alat pengaman serta persyaratan yang ditetapkan oleh peraturan perundang-undangan, standar dan pedoman teknis yang relevan.',
    nomor: '6.5.1',
    defaultDocRef: 'P.18/UM410/COP-M3000000/2024'
  },
  {
    id: '6.5.2',
    elemenNumber: 6,
    elemenTitle: 'Semua catatan yang memuat data secara rinci dari kegiatan pemeriksaan, pemeliharaan, perbaikan dan perubahan yang dilakukan atas sarana dan peralatan produksi harus disimpan dan dipelihara.',
    nomor: '6.5.2',
    defaultDocRef: 'P.07/UM410/COP-M3000000/2024'
  },
  {
    id: '6.5.3',
    elemenNumber: 6,
    elemenTitle: 'Sarana dan peralatan produksi memiliki sertifikat yang masih berlaku sesuai dengan persyaratan peraturan perundang-undangan dan standar.',
    nomor: '6.5.3',
    defaultDocRef: 'P.18/UM410/COP-M3000000/2024'
  },
  {
    id: '6.5.4',
    elemenNumber: 6,
    elemenTitle: 'Pemeriksaan, pemeliharaan, perawatan, perbaikan dan setiap perubahan harus dilakukan petugas yang kompeten dan berwenang.',
    nomor: '6.5.4',
    defaultDocRef: 'P.18/UM410/COP-M3000000/2024'
  },
  {
    id: '6.5.5',
    elemenNumber: 6,
    elemenTitle: 'Terdapat prosedur untuk menjamin bahwa jika terjadi perubahan terhadap sarana dan peralatan produksi, perubahan tersebut harus sesuai dengan persyaratan peraturan perundang-undangan, standar dan pedoman teknis yang relevan.',
    nomor: '6.5.5',
    defaultDocRef: 'P.28/UM410/COP-M3000000/2024'
  },
  {
    id: '6.5.6',
    elemenNumber: 6,
    elemenTitle: 'Terdapat prosedur permintaan pemeliharaan sarana dan peralatan produksi dengan kondisi K3 yang tidak memenuhi persyaratan dan perlu segera diperbaiki.',
    nomor: '6.5.6',
    defaultDocRef: 'P.18/UM410/COP-M3000000/2024'
  },
  {
    id: '6.5.7',
    elemenNumber: 6,
    elemenTitle: 'Terdapat sistem untuk penandaan bagi peralatan yang sudah tidak aman lagi untuk digunakan atau sudah tidak digunakan.',
    nomor: '6.5.7',
    defaultDocRef: 'P.18/UM410/COP-M3000000/2024'
  },
  {
    id: '6.5.8',
    elemenNumber: 6,
    elemenTitle: 'Apabila diperlukan dilakukan penerapan sistem penguncian pengoperasian (lock out system) untuk mencegah agar sarana produksi tidak dihidupkan sebelum saatnya.',
    nomor: '6.5.8',
  },
  {
    id: '6.5.9',
    elemenNumber: 6,
    elemenTitle: 'Terdapat prosedur yang dapat menjamin keselamatan dan kesehatan tenaga kerja atau orang lain yang berada didekat sarana dan peralatan produksi pada saat proses pemeriksaan, pemeliharaan, perbaikan dan perubahan.',
    nomor: '6.5.9',
    defaultDocRef: 'P.18/UM410/COP-M3000000/2024'
  },
  {
    id: '6.5.10',
    elemenNumber: 6,
    elemenTitle: 'Terdapat penanggung jawab untuk menyetujui bahwa sarana dan peralatan produksi telah aman digunakan setelah proses pemeliharaan, perawatan, perbaikan atau perubahan.',
    nomor: '6.5.10',
  },
  {
    id: '6.6',
    elemenNumber: 6,
    elemenTitle: 'Pelayanan',
    nomor: '6.6',
  },
  {
    id: '6.6.1',
    elemenNumber: 6,
    elemenTitle: 'Apabila perusahaan dikontrak untuk menyediakan pelayanan yang tunduk pada standar dan peraturan perundang-undangan mengenai K3, maka perlu disusun prosedur untuk menjamin bahwa pelayanan memenuhi persyaratan.',
    nomor: '6.6.1',
    defaultDocRef: 'P.30/UM410/COP-M3000000/2024'
  },
  {
    id: '6.6.2',
    elemenNumber: 6,
    elemenTitle: 'Apabila perusahaan diberi pelayanan melalui kontrak, dan pelayanan tunduk pada standar dan peraturan perundang-undangan K3, maka perlu disusun prosedur untuk menjamin bahwa pelayanan memenuhi persyaratan.',
    nomor: '6.6.2',
    defaultDocRef: 'P.30/UM410/COP-M3000000/2024'
  },
  {
    id: '6.7',
    elemenNumber: 6,
    elemenTitle: 'Kesiapan untuk Menangani Keadaan Darurat',
    nomor: '6.7',
  },
  {
    id: '6.7.1',
    elemenNumber: 6,
    elemenTitle: 'Keadaan darurat yang potensial di dalam dan/atau di luar tempat kerja telah diidentifikasi dan prosedur keadaan darurat telah didokumentasikan dan diinformasikan agar diketahui oleh seluruh orang yang ada di tempat kerja.',
    nomor: '6.7.1',
    defaultDocRef: 'P.19/UM410/COP-M3000000/2024'
  },
  {
    id: '6.7.2',
    elemenNumber: 6,
    elemenTitle: 'Penyediaan alat/sarana dan prosedur keadaan darurat berdasarkan hasil identifikasi dan diuji serta ditinjau secara rutin oleh petugas yang berkompeten dan berwenang.',
    nomor: '6.7.2',
    defaultDocRef: 'P.19/UM410/COP-M3000000/2024'
  },
  {
    id: '6.7.3',
    elemenNumber: 6,
    elemenTitle: 'Tenaga kerja mendapat instruksi dan pelatihan mengenai prosedur keadaan darurat yang sesuai dengan tingkat risiko.',
    nomor: '6.7.3',
  },
  {
    id: '6.7.4',
    elemenNumber: 6,
    elemenTitle: 'Petugas penanganan keadaan darurat ditetapkan dan diberikan pelatihan khusus serta diinformasikan kepada seluruh orang yang ada di tempat kerja.',
    nomor: '6.7.4',
    defaultDocRef: 'P.19/UM410/COP-M3000000/2024'
  },
  {
    id: '6.7.5',
    elemenNumber: 6,
    elemenTitle: 'Instruksi/prosedur keadaan darurat dan hubungan keadaan darurat diperlihatkan secara jelas dan menyolok serta diketahui oleh seluruh tenaga kerja di perusahaan.',
    nomor: '6.7.5',
  },
  {
    id: '6.7.6',
    elemenNumber: 6,
    elemenTitle: 'Peralatan, dan sistem tanda bahaya keadaan darurat disediakan, diperiksa, diuji dan dipelihara secara berkala sesuai dengan peraturan perundang-undangan, standar dan pedoman teknis yang relevan.',
    nomor: '6.7.6',
    defaultDocRef: 'P.19/UM410/COP-M3000000/2024'
  },
  {
    id: '6.7.7',
    elemenNumber: 6,
    elemenTitle: 'Jenis, jumlah, penempatan dan kemudahan untuk mendapatkan alat keadaan darurat telah sesuai dengan peraturan perundang-undangan atau standar dan dinilai oleh petugas yang berkompeten dan berwenang.',
    nomor: '6.7.7',
    defaultDocRef: 'P.19/UM410/COP-M3000000/2024'
  },
  {
    id: '6.8',
    elemenNumber: 6,
    elemenTitle: 'Pertolongan Pertama Pada Kecelakaan',
    nomor: '6.8',
  },
  {
    id: '6.8.1',
    elemenNumber: 6,
    elemenTitle: 'Perusahaan telah mengevaluasi alat P3K dan menjamin bahwa sistem P3K yang ada memenuhi peraturan perundang-undangan, standar dan pedoman teknis.',
    nomor: '6.8.1',
    defaultDocRef: 'P.10/UM410/COP-M3000000/2024'
  },
  {
    id: '6.8.2',
    elemenNumber: 6,
    elemenTitle: 'Petugas P3K telah dilatih dan ditunjuk sesuai dengan peraturan perundang-undangan.',
    nomor: '6.8.2',
    defaultDocRef: 'P.04/UM410/COP-M3000000/2024'
  },
  {
    id: '6.9',
    elemenNumber: 6,
    elemenTitle: 'Rencana dan Pemulihan Keadaan Darurat',
    nomor: '6.9',
  },
  {
    id: '6.9.1',
    elemenNumber: 6,
    elemenTitle: 'Prosedur untuk pemulihan kondisi tenaga kerja maupun sarana dan peralatan produksi yang mengalami kerusakan telah ditetapkan dan dapat diterapkan sesegera mungkin setelah terjadinya kecelakaan dan penyakit akibat kerja.',
    nomor: '6.9.1',
    defaultDocRef: 'P.20/UM410/COP-M3000000/2024'
  },

  // =========================================================================
  // ELEMEN 7: STANDAR PEMANTAUAN
  // =========================================================================
  {
    id: '7',
    elemenNumber: 7,
    elemenTitle: 'Standar Pemantauan',
    nomor: '7',
  },
  {
    id: '7.1',
    elemenNumber: 7,
    elemenTitle: 'Pemeriksaan Bahaya',
    nomor: '7.1',
  },
  {
    id: '7.1.1',
    elemenNumber: 7,
    elemenTitle: 'Pemeriksaan/inspeksi terhadap tempat kerja dan cara kerja dilaksanakan secara teratur.',
    nomor: '7.1.1',
    defaultDocRef: 'P.09/UM410/COP-M3000000/2024'
  },
  {
    id: '7.1.2',
    elemenNumber: 7,
    elemenTitle: 'Pemeriksaan/inspeksi dilaksanakan oleh petugas yang berkompeten dan berwenang yang telah memperoleh pelatihan mengenai identifikasi bahaya.',
    nomor: '7.1.2',
    defaultDocRef: 'P.04/UM410/COP-M3000000/2024'
  },
  {
    id: '7.1.3',
    elemenNumber: 7,
    elemenTitle: 'Pemeriksaan/inspeksi mencari masukan dari tenaga kerja yang melakukan tugas di tempat yang diperiksa',
    nomor: '7.1.3',
    defaultDocRef: 'P.09/UM410/COP-M3000000/2024'
  },
  {
    id: '7.1.4',
    elemenNumber: 7,
    elemenTitle: 'Daftar periksa (check list) tempat kerja telah disusun untuk digunakan pada saat pemeriksaan/inspeksi.',
    nomor: '7.1.4',
    defaultDocRef: 'P.09/UM410/COP-M3000000/2024'
  },
  {
    id: '7.1.5',
    elemenNumber: 7,
    elemenTitle: 'Laporan pemeriksaan/inspeksi berisi rekomendasi untuk tindakan perbaikan dan diajukan kepada pengurus dan P2K3 sesuai dengan kebutuhan.',
    nomor: '7.1.5',
    defaultDocRef: 'P.09/UM410/COP-M3000000/2024'
  },
  {
    id: '7.1.6',
    elemenNumber: 7,
    elemenTitle: 'Pengusaha atau pengurus telah menetapkan penanggung jawab untuk pelaksanaan tindakan perbaikan dari hasil laporan pemeriksaan/inspeksi.',
    nomor: '7.1.6',
    defaultDocRef: 'P.09/UM410/COP-M3000000/2024'
  },
  {
    id: '7.1.7',
    elemenNumber: 7,
    elemenTitle: 'Tindakan perbaikan dari hasil laporan pemeriksaan/inspeksi dipantau untuk menentukan efektifitasnya.',
    nomor: '7.1.7',
    defaultDocRef: 'P.09/UM410/COP-M3000000/2024'
  },
  {
    id: '7.2',
    elemenNumber: 7,
    elemenTitle: 'Pemantauan/Pengukuran Lingkungan Kerja',
    nomor: '7.2',
  },
  {
    id: '7.2.1',
    elemenNumber: 7,
    elemenTitle: 'Pemantauan/pengukuran lingkungan kerja dilaksanakan secara teratur dan hasilnya didokumentasikan, dipelihara dan digunakan untuk penilaian dan pengendalian risiko.',
    nomor: '7.2.1',
    defaultDocRef: 'P.09/UM410/COP-M3000000/2024'
  },
  {
    id: '7.2.2',
    elemenNumber: 7,
    elemenTitle: 'Pemantauan/pengukuran lingkungan kerja meliputi faktor fisik, kimia, biologi, ergonomi dan psikologi.',
    nomor: '7.2.2',
    defaultDocRef: 'P.09/UM410/COP-M3000000/2024'
  },
  {
    id: '7.2.3',
    elemenNumber: 7,
    elemenTitle: 'Pemantauan/pengukuran lingkungan kerja dilakukan oleh petugas atau pihak yang berkompeten dan berwenang dari dalam dan/atau luar perusahaan.',
    nomor: '7.2.3',
    defaultDocRef: 'P.09/UM410/COP-M3000000/2024'
  },
  {
    id: '7.3',
    elemenNumber: 7,
    elemenTitle: 'Peralatan Pemeriksaan/Inspeksi, Pengukuran dan Pengujian',
    nomor: '7.3',
  },
  {
    id: '7.3.1',
    elemenNumber: 7,
    elemenTitle: 'Terdapat prosedur yang terdokumentasi mengenai identifikasi, kalibrasi, pemeliharaan dan penyimpanan untuk alat pemeriksaan, ukur dan uji mengenai K3.',
    nomor: '7.3.1',
    defaultDocRef: 'P.18/UM410/COP-M3000000/2024'
  },
  {
    id: '7.3.2',
    elemenNumber: 7,
    elemenTitle: 'Alat dipelihara dan dikalibrasi oleh petugas atau pihak yang berkompeten dan berwenang dari dalam dan/atau luar perusahaan.',
    nomor: '7.3.2',
    defaultDocRef: 'P.18/UM410/COP-M3000000/2024'
  },
  {
    id: '7.4',
    elemenNumber: 7,
    elemenTitle: 'Pemantauan Kesehatan Tenaga Kerja',
    nomor: '7.4',
  },
  {
    id: '7.4.1',
    elemenNumber: 7,
    elemenTitle: 'Dilakukan pemantauan kesehatan tenaga kerja yang bekerja pada tempat kerja yang mengandung potensi bahaya tinggi sesuai dengan peraturan perundang-undangan dan kesehatan.',
    nomor: '7.4.1',
    defaultDocRef: 'P.09/UM410/COP-M3000000/2024'
  },
  {
    id: '7.4.2',
    elemenNumber: 7,
    elemenTitle: 'Pengusaha atau pengurus telah melaksanakan identifikasi keadaan dimana pemeriksaan kesehatan tenaga kerja perlu dilakukan dan telah melaksanakana sistem untuk membantu pemeriksaan ini.',
    nomor: '7.4.2',
    defaultDocRef: 'P.09/UM410/COP-M3000000/2024'
  },
  {
    id: '7.4.3',
    elemenNumber: 7,
    elemenTitle: 'Pemeriksaan kesehatan tenaga kerja dilakukan oleh dokter pemeriksa yang ditunjuk sesuai peraturan perundang-undangan.',
    nomor: '7.4.3',
    defaultDocRef: 'P.09/UM410/COP-M3000000/2024'
  },
  {
    id: '7.4.4',
    elemenNumber: 7,
    elemenTitle: 'Perusahaan menyediakan pelayanan kesehatan kerja sesuai peraturan perundang-undangan.',
    nomor: '7.4.4',
    defaultDocRef: 'P.09/UM410/COP-M3000000/2024'
  },
  {
    id: '7.4.5',
    elemenNumber: 7,
    elemenTitle: 'Catatan mengenai pemantauan kesehatan tenaga kerja dibuat sesuai dengan peraturan perundang-undangan.',
    nomor: '7.4.5',
    defaultDocRef: 'P.09/UM410/COP-M3000000/2024'
  },

  // =========================================================================
  // ELEMEN 8: PELAPORAN DAN PERBAIKAN KEKURANGAN
  // =========================================================================
  {
    id: '8',
    elemenNumber: 8,
    elemenTitle: 'Pelaporan dan Perbaikan Kekurangan',
    nomor: '8',
  },
  {
    id: '8.1',
    elemenNumber: 8,
    elemenTitle: 'Pelaporan Bahaya',
    nomor: '8.1',
  },
  {
    id: '8.1.1',
    elemenNumber: 8,
    elemenTitle: 'Terdapat prosedur pelaporan bahaya yang berhubungan dengan K3 dan prosedur ini diketahui oleh tenaga kerja.',
    nomor: '8.1.1',
    defaultDocRef: 'P.24/UM410/COP-M3000000/2024'
  },
  {
    id: '8.2',
    elemenNumber: 8,
    elemenTitle: 'Pelaporan Kecelakaan',
    nomor: '8.2',
  },
  {
    id: '8.2.1',
    elemenNumber: 8,
    elemenTitle: 'Terdapat prosedur terdokumentasi yang menjamin bahwa semua kecelakaan kerja, penyakit akibat kerja, kebakaran atau peledakan serta kejadian berbahaya lainnya di tempat kerja dicatat dan dilaporkan sesuai dengan peraturan perundang-undangan.',
    nomor: '8.2.1',
    defaultDocRef: 'P.25/UM410/COP-M3000000/2024'
  },
  {
    id: '8.2.2',
    elemenNumber: 8,
    elemenTitle: 'Kecelakaan dan penyakit akibat kerja dilaporkan sebagaimana ditetapkan oleh peraturan perundangan.',
    nomor: '8.2.2',
    defaultDocRef: 'P.25/UM410/COP-M3000000/2024'
  },
  {
    id: '8.3',
    elemenNumber: 8,
    elemenTitle: 'Pemeriksaan dan pengkajian Kecelakaan',
    nomor: '8.3',
  },
  {
    id: '8.3.1',
    elemenNumber: 8,
    elemenTitle: 'Tempat kerja/perusahaan mempunyai prosedur pemeriksaan dan pengkajian kecelakaan kerja dan penyakit akibat kerja.',
    nomor: '8.3.1',
    defaultDocRef: 'P.25/UM410/COP-M3000000/2024'
  },
  {
    id: '8.3.2',
    elemenNumber: 8,
    elemenTitle: 'Pemeriksaan dan pengkajian kecelakaan kerja dilakukan oleh petugas atau Ahli K3 yang ditunjuk sesuai peraturan perundangundangan atau pihak lain yang berkompeten dan berwenang.',
    nomor: '8.3.2',
    defaultDocRef: 'P.25/UM410/COP-M3000000/2024'
  },
  {
    id: '8.3.3',
    elemenNumber: 8,
    elemenTitle: 'Laporan pemeriksaan dan pengkajian berisi tentang sebab dan akibat serta rekomendasi/saran dan jadwal waktu pelaksanaan usaha perbaikan.',
    nomor: '8.3.3',
    defaultDocRef: 'P.25/UM410/COP-M3000000/2024'
  },
  {
    id: '8.3.4',
    elemenNumber: 8,
    elemenTitle: 'Penanggung jawab untuk melaksanakan tindakan perbaikan atas laporan pemeriksaan dan pengkajian telah ditetapkan.',
    nomor: '8.3.4',
    defaultDocRef: 'P.25/UM410/COP-M3000000/2024'
  },
  {
    id: '8.3.5',
    elemenNumber: 8,
    elemenTitle: 'Tindakan perbaikan diinformasikan kepada tenaga kerja yang bekerja di tempat terjadinya kecelakaan.',
    nomor: '8.3.5',
    defaultDocRef: 'P.25/UM410/COP-M3000000/2024'
  },
  {
    id: '8.3.6',
    elemenNumber: 8,
    elemenTitle: 'Pelaksanaan tindakan perbaikan dipantau, didokumentasikan dan diinformasikan ke seluruh tenaga kerja.',
    nomor: '8.3.6',
    defaultDocRef: 'P.25/UM410/COP-M3000000/2024'
  },
  {
    id: '8.4',
    elemenNumber: 8,
    elemenTitle: 'Penanganan Masalah.',
    nomor: '8.4',
  },
  {
    id: '8.4.1',
    elemenNumber: 8,
    elemenTitle: 'Terdapat prosedur untuk menangani masalah keselamatan dan kesehatan yang timbul dan sesuai dengan peraturan perundang-undangan yang berlaku.',
    nomor: '8.4.1',
    defaultDocRef: 'P.31/UM410/COP-M3000000/2024'
  },

  //

  // =========================================================================
  // ELEMEN 9: PENGELOLAAN MATERIAL & PERPINDAHANNYA
  // =========================================================================
  {
    id: '9',
    elemenNumber: 9,
    elemenTitle: 'Pengelolaan Material dan Perpindahannya',
    nomor: '9',
  },
  {
    id: '9.1',
    elemenNumber: 9,
    elemenTitle: 'Penanganan Secara Manual dan Mekanis',
    nomor: '9.1',
  },
  {
    id: '9.1.1',
    elemenNumber: 9,
    elemenTitle: 'Terdapat prosedur untuk mengidentifikasi potensi bahaya dan menilai risiko yang berhubungan dengan penanganan secara manual dan mekanis.',
    nomor: '9.1.1',
    defaultDocRef: 'P.24/UM410/COP-M3000000/2024'
  },
  {
    id: '9.1.2',
    elemenNumber: 9,
    elemenTitle: 'Identifikasi bahaya dan penilaian risiko dilaksanakan oleh petugas yang berkompeten dan berwenang.',
    nomor: '9.1.2',
    defaultDocRef: 'P.02/UM410/COP-M3000000/2024'
  },
  {
    id: '9.1.3',
    elemenNumber: 9,
    elemenTitle: 'Pengusaha atau pengurus menerapkan dan meninjau cara pengendalian risiko yang berhubungan dengan penanganan secara manual atau mekanis.',
    nomor: '9.1.3',
  },
  {
    id: '9.1.4',
    elemenNumber: 9,
    elemenTitle: 'Terdapat prosedur untuk penanganan bahan meliputi metode pencegahan terhadap kerusakan, tumpahan dan/atau kebocoran.',
    nomor: '9.1.4',
    defaultDocRef: 'P.23/UM410/COP-M3000000/2024'
  },
  {
    id: '9.2',
    elemenNumber: 9,
    elemenTitle: 'Sistem Pengangkutan, Penyimpanan dan Pembuangan',
    nomor: '9.2',
  },
  {
    id: '9.2.1',
    elemenNumber: 9,
    elemenTitle: 'Terdapat prosedur yang menjamin bahwa bahan disimpan dan dipindahkan dengan cara yang aman sesuai dengan peraturan perundang-undangan.',
    nomor: '9.2.1',
    defaultDocRef: 'P.16/UM410/COP-M3000000/2024'
  },
  {
    id: '9.2.2',
    elemenNumber: 9,
    elemenTitle: 'Terdapat prosedur yang menjelaskan persyaratan pengendalian bahan yang dapat rusak atau kadaluarsa.',
    nomor: '9.2.2',
    defaultDocRef: 'P.16/UM410/COP-M3000000/2024'
  },
  {
    id: '9.2.3',
    elemenNumber: 9,
    elemenTitle: 'Terdapat prosedur yang menjamin bahwa bahan dibuang dengan cara yang aman sesuai dengan peraturan perundang-undangan.',
    nomor: '9.2.3',
    defaultDocRef: 'P.17/UM410/COP-M3000000/2024'
  },
  {
    id: '9.3',
    elemenNumber: 9,
    elemenTitle: 'Pengendalian Bahan Kimia Berbahaya (BKB)',
    nomor: '9.3',
  },
  {
    id: '9.3.1',
    elemenNumber: 9,
    elemenTitle: 'Perusahaan telah mendokumentasikan dan menerapkan prosedur mengenai penyimpanan, penanganan dan pemindahan BKB sesuai dengan persyaratan peraturan perundang-undangan, standar dan pedoman teknis yang relevan.',
    nomor: '9.3.1',
    defaultDocRef: 'P.17/UM410/COP-M3000000/2024',
  },
  {
    id: '9.3.2',
    elemenNumber: 9,
    elemenTitle: 'Terdapat Lembar Data Keselamatan BKB (Material Safety Data Sheets) meliputi keterangan mengenai keselamatan bahan sebagaimana diatur pada peraturan perundang-undangan dan dengan mudah dapat diperoleh.',
    nomor: '9.3.2',
    defaultDocRef: 'P.16/UM410/COP-M3000000/2024',
  },
  {
    id: '9.3.3',
    elemenNumber: 9,
    elemenTitle: 'Terdapat sistem untuk mengidentifikasi dan pemberian label secara jelas pada bahan kimia berbahaya.',
    nomor: '9.3.3',
    defaultDocRef: 'P.17/UM410/COP-M3000000/2024',
  },
  {
    id: '9.3.4',
    elemenNumber: 9,
    elemenTitle: 'Rambu peringatan bahaya terpasang sesuai dengan persyaratan peraturan perundang-undangan dan/atau standar yang relevan.',
    nomor: '9.3.4',
    defaultDocRef: 'P.19/UM410/COP-M3000000/2024',
  },
  {
    id: '9.3.5',
    elemenNumber: 9,
    elemenTitle: 'Penanganan BKB dilakukan oleh petugas yang berkompeten dan berwenang.',
    nomor: '9.3.5',
    defaultDocRef: 'P.17/UM410/COP-M3000000/2024',
  },

  // =========================================================================
  // ELEMEN 10: PENGUMPULAN DAN PENGGUNAAN DATA
  // =========================================================================
  {
    id: '10',
    elemenNumber: 10,
    elemenTitle: 'Pengumpulan dan Penggunaan Data',
    nomor: '10',
  },
  {
    id: '10.1.1',
    elemenNumber: 10,
    elemenTitle: 'Pengusaha atau pengurus telah mendokumentasikan dan menerapkan prosedur pelaksanaan identifikasi, pengumpulan, pengarsipan, pemeliharaan, penyimpanan dan penggantian catatan K3.',
    nomor: '10.1.1',
    defaultDocRef: 'P.07/UM410/COP-M3000000/2024'
  },
  {
    id: '10.1.2',
    elemenNumber: 10,
    elemenTitle: 'Peraturan perundangundangan, standar dan pedoman teknis K3 yang relevan dipelihara pada tempat yang mudah didapat.',
    nomor: '10.1.2',
    defaultDocRef: 'P.07/UM410/COP-M3000000/2024'
  },
  {
    id: '10.1.3',
    elemenNumber: 10,
    elemenTitle: 'Terdapat prosedur yang menentukan persyaratan untuk menjaga kerahasiaan catatan.',
    nomor: '10.1.3',
    defaultDocRef: 'P.07/UM410/COP-M3000000/2024'
  },
  {
    id: '10.1.4',
    elemenNumber: 10,
    elemenTitle: 'Catatan kompensasi kecelakaan dan rehabilitasi kesehatan tenaga kerja dipelihara.',
    nomor: '10.1.4',
    defaultDocRef: 'P.25/UM410/COP-M3000000/2024'
  },
  {
    id: '10.2',
    elemenNumber: 10,
    elemenTitle: 'Data dan Laporan K3',
    nomor: '10.2',
  },
  {
    id: '10.2.1',
    elemenNumber: 10,
    elemenTitle: 'Data K3 yang terbaru dikumpulkan dan dianalisa.',
    nomor: '10.2.1',
    defaultDocRef: 'P.26/UM410/COP-M3000000/2024'
  },
  {
    id: '10.2.2',
    elemenNumber: 10,
    elemenTitle: 'Laporan rutin kinerja K3 dibuat dan disebarluaskan di dalam tempat kerja.',
    nomor: '10.2.2',
    defaultDocRef: 'P.26/UM410/COP-M3000000/2024'
  },


  // =========================================================================
  // ELEMEN 11: PEMERIKSAAN SMK3 (AUDIT INTERNAL)
  // =========================================================================
  {
    id: '11',
    elemenNumber: 11,
    elemenTitle: 'Pemeriksaan SMK3',
    nomor: '11',
  },
  {
    id: '11.1',
    elemenNumber: 11,
    elemenTitle: 'Audit Internal SMK3',
    nomor: '11.1',
  },
  {
    id: '11.1.1',
    elemenNumber: 11,
    elemenTitle: 'Audit internal SMK3 yang terjadwal dilaksanakan untuk memeriksa kesesuaian kegiatan perencanaan dan untuk menentukan efektifitas kegiatan tersebut.',
    nomor: '11.1.1',
    defaultDocRef: 'P.27/UM410/COP-M3000000/2024'
  },
  {
    id: '11.1.2',
    elemenNumber: 11,
    elemenTitle: 'Audit internal SMK3 dilakukan oleh petugas yang independen, berkompeten dan berwenang.',
    nomor: '11.1.2',
    defaultDocRef: 'P.27/UM410/COP-M3000000/2024'
  },
  {
    id: '11.1.3',
    elemenNumber: 11,
    elemenTitle: 'Laporan audit didistribusikan kepada pengusaha atau pengurus dan petugas lain yang berkepentingan dan dipantau untuk menjamin dilakukannya tindakan perbaikan.',
    nomor: '11.1.3',
    defaultDocRef: 'P.27/UM410/COP-M3000000/2024'
  },

  // =========================================================================
  // ELEMEN 12: PENGEMBANGAN KETERAMPILAN & KEMAMPUAN
  // =========================================================================
  {
    id: '12',
    elemenNumber: 12,
    elemenTitle: 'Pengembangan Keterampilan dan Kemampuan',
    nomor: '12',
  },
  {
    id: '12.1',
    elemenNumber: 12,
    elemenTitle: 'Strategi Pelatihan',
    nomor: '12.1',
  },
  {
    id: '12.1.1',
    elemenNumber: 12,
    elemenTitle: 'Analisis kebutuhan pelatihan K3 sesuai persyaratan peraturan perundang-undangan telah dilakukan.',
    nomor: '12.1.1',
    defaultDocRef: 'P.04/UM410/COP-M3000000/2024'
  },
  {
    id: '12.1.2',
    elemenNumber: 12,
    elemenTitle: 'Rencana pelatihan K3 bagi semua tingkatan telah disusun.',
    nomor: '12.1.2',
    defaultDocRef: 'P.04/UM410/COP-M3000000/2024'
  },
  {
    id: '12.1.3',
    elemenNumber: 12,
    elemenTitle: 'Jenis pelatihan K3 yang dilakukan harus disesuaikan dengan kebutuhan untuk pengendalian potensi bahaya.',
    nomor: '12.1.3',
    defaultDocRef: 'P.04/UM410/COP-M3000000/2024'
  },
  {
    id: '12.1.4',
    elemenNumber: 12,
    elemenTitle: 'Pelatihan dilakukan oleh orang atau badan yang berkompeten dan berwenang sesuai peraturan perundang-undangan.',
    nomor: '12.1.4',
    defaultDocRef: 'P.04/UM410/COP-M3000000/2024'
  },
  {
    id: '12.1.5',
    elemenNumber: 12,
    elemenTitle: 'Terdapat fasilitas dan sumber daya memadai untuk pelaksanaan pelatihan yang efektif.',
    nomor: '12.1.5',
    defaultDocRef: 'P.04/UM410/COP-M3000000/2024'
  },
  {
    id: '12.1.6',
    elemenNumber: 12,
    elemenTitle: 'Pengusaha atau pengurus mendokumentasikan dan menyimpan catatan seluruh pelatihan.',
    nomor: '12.1.6',
    defaultDocRef: 'P.04/UM410/COP-M3000000/2024'
  },
  {
    id: '12.1.7',
    elemenNumber: 12,
    elemenTitle: 'Program pelatihan ditinjau secara teratur untuk menjamin agar tetap relevan dan efektif.',
    nomor: '12.1.7',
    defaultDocRef: 'P.04/UM410/COP-M3000000/2024'
  },
  {
    id: '12.2',
    elemenNumber: 12,
    elemenTitle: 'Pelatihan Bagi Manajemen dan Penyelia',
    nomor: '12.2',
  },
  {
    id: '12.2.1',
    elemenNumber: 12,
    elemenTitle: 'Anggota manajemen eksekutif dan pengurus berperan serta dalam pelatihan yang mencakup penjelasan tentang kewajiban hukum dan prinsipp-rinsip serta pelaksanaan K3.',
    nomor: '12.2.1',
    defaultDocRef: 'P.04/UM410/COP-M3000000/2024'
  },
  {
    id: '12.2.2',
    elemenNumber: 12,
    elemenTitle: 'Manajer dan pengawas/penyelia menerima pelatihan yang sesuai dengan peran dan tanggung jawab mereka.',
    nomor: '12.2.2',
    defaultDocRef: 'P.04/UM410/COP-M3000000/2024'
  },
  {
    id: '12.3',
    elemenNumber: 12,
    elemenTitle: 'Pelatihan Bagi Tenaga Kerja',
    nomor: '12.3',
  },
  {
    id: '12.3.1',
    elemenNumber: 12,
    elemenTitle: 'Pelatihan diberikan kepada semua tenaga kerja termasuk tenaga kerja baru dan yang dipindahkan agar mereka dapat melaksanakan tugasnya secara aman.',
    nomor: '12.3.1',
    defaultDocRef: 'P.04/UM410/COP-M3000000/2024'
  },
  {
    id: '12.3.2',
    elemenNumber: 12,
    elemenTitle: 'Pelatihan diberikan kepada tenaga kerja apabila di tempat kerjanya terjadi perubahan sarana produksi atau proses,perubahan sarana produksi atau proses.',
    nomor: '12.3.2',
    defaultDocRef: 'P.04/UM410/COP-M3000000/2024'
  },
  {
    id: '12.3.3',
    elemenNumber: 12,
    elemenTitle: 'Pengusaha atau pengurus memberikan pelatihan penyegaran kepada semua tenaga kerja.',
    nomor: '12.3.3',
    defaultDocRef: 'P.04/UM410/COP-M3000000/2024'
  },
  {
    id: '12.4',
    elemenNumber: 12,
    elemenTitle: 'Pelatihan Pengenalan dan Pelatihan Untuk Pengunjung dan Kontraktor',
    nomor: '12.4',
  },
  {
    id: '12.4.1',
    elemenNumber: 12,
    elemenTitle: 'Terdapat prosedur yang menetapkan persyaratan untuk memberikan taklimat (briefing) kepada pengunjung dan mitra kerja guna menjamin K3.',
    nomor: '12.4.1',
    defaultDocRef: 'P.05/UM410/COP-M3000000/2024'
  },
  {
    id: '12.5',
    elemenNumber: 12,
    elemenTitle: 'Pelatihan Keahlian Khusus',
    nomor: '12.5',
  },
  {
    id: '12.5.1',
    elemenNumber: 12,
    elemenTitle: 'Perusahaan mempunyai sistem yang menjamin kepatuhan terhadap persyaratan lisensi atau kualifikasi sesuai dengan peraturan perundangan untuk melaksanakan tugas khusus, melaksanakan pekerjaan atau mengoperasikan peralatan.',
    nomor: '12.5.1',
    defaultDocRef: 'P.04/UM410/COP-M3000000/2024'
  },
];
