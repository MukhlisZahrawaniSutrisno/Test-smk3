// lib/evidence-master-data.ts
// Master data 41 Manual & Prosedur SMK3L dan 327 Formulir Lampiran dengan URL Google Docs / Sheets Asli dari Spreadsheet

export interface EvidenceItem {
  code?: string;
  title: string;
  templateUrl?: string;
  targetCount: number;
}

export interface ProcedureGroup {
  no: number;
  name: string;
  mainDocCode?: string;
  mainDocUrl?: string;
  items: EvidenceItem[];
}

export const EVIDENCE_AREAS = [
  "-TELKOM REGIONAL-III",
  "WITEL SURAMADU",
  "WITEL SOLO JATENG TIMUR",
  "WITEL SEMARANG JATENG UTARA",
  "WITEL YOGYAKARTA JATENG SELATAN",
  "WITEL JATIM TIMUR",
  "WITEL JATIM BARAT",
  "WITEL BALI",
  "WITEL NUSA TENGGARA"
];

export const EVIDENCE_PERIODS = [2026, 2025, 2024, 2023];

export const EVIDENCE_MASTER_DATA: ProcedureGroup[] = [
  {
    no: 1,
    name: "MANUAL SMK3L CORPORATE",
    mainDocCode: "M.00/UM410/COP-M3000000/2026",
    mainDocUrl: "https://docs.google.com/document/d/edit?usp=sharing",
    items: [
      {
        code: "M.00/UM410/COP-M3000000/2026",
        title: "MANUAL SMK3L CORPORATE",
        templateUrl: "https://docs.google.com/document/d/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.00.00.01",
        title: "Struktur Organisasi Corporate",
        targetCount: 1,
      },
      {
        code: "LP.00.00.02",
        title: "Struktur Organisasi P2K3 Corporate",
        targetCount: 1,
      },
      {
        code: "LP.00.00.06",
        title: "Kebijakan K3",
        targetCount: 1,
      },
      {
        code: "LP.00.00.07",
        title: "Kebijakan Khusus K3",
        targetCount: 1,
      },
      {
        code: "LP.00.00.08",
        title: "Komitmen K3",
        targetCount: 1,
      },
    ],
  },
  {
    no: 2,
    name: "MANUAL SMK3L REGIONAL",
    mainDocCode: "M.00/UM410/TR3-00000000/2026",
    mainDocUrl: "https://docs.google.com/document/d/1rzBXnLAulJQSrJk-1JB51kyU1yBJZc-9uMnQBzx-aqM/edit?usp=sharing",
    items: [
      {
        code: "M.00/UM410/TR3-00000000/2026",
        title: "MANUAL SMK3L REGIONAL",
        templateUrl: "https://docs.google.com/document/d/1rzBXnLAulJQSrJk-1JB51kyU1yBJZc-9uMnQBzx-aqM/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.00.00.01-REG",
        title: "Struktur Organisasi Regional",
        targetCount: 1,
      },
      {
        code: "LP.00.00.02-REG",
        title: "Struktur Organisasi P2K3 Regional",
        targetCount: 1,
      },
      {
        code: "LP.00.00.06-REG",
        title: "Kebijakan K3",
        targetCount: 1,
      },
      {
        code: "LP.00.00.07-REG",
        title: "Kebijakan Khusus K3",
        targetCount: 1,
      },
      {
        code: "LP.00.00.08-REG",
        title: "Komitmen K3",
        targetCount: 1,
      },
    ],
  },
  {
    no: 3,
    name: "MANUAL SMK3L WITEL",
    mainDocCode: "M.00/UM410/WTL-M3000000/2026",
    mainDocUrl: "https://docs.google.com/document/d/edit?usp=sharing",
    items: [
      {
        code: "M.00/UM410/WTL-M3000000/2026",
        title: "MANUAL SMK3L WITEL",
        templateUrl: "https://docs.google.com/document/d/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.00.00.01",
        title: "Struktur Organisasi WITEL",
        targetCount: 1,
      },
      {
        code: "LP.00.00.02",
        title: "Struktur Organisasi P2K3 WITEL",
        targetCount: 1,
      },
      {
        code: "LP.00.00.06",
        title: "Kebijakan K3",
        targetCount: 1,
      },
      {
        code: "LP.00.00.07",
        title: "Kebijakan Khusus K3",
        targetCount: 1,
      },
      {
        code: "LP.00.00.08",
        title: "Komitmen K3",
        targetCount: 1,
      },
    ],
  },
  {
    no: 4,
    name: "PEMBENTUKAN ORGANISASI P2K3",
    mainDocCode: "P.01/UM410/TR3-00000000/2026",
    mainDocUrl: "https://docs.google.com/document/d/1K_ChMVqgpdYHlsu0-V5Wyro6V3Iv-jxLOZYoQI14uaI/edit?usp=sharing",
    items: [
      {
        code: "P.01/UM410/TR3-00000000/2026",
        title: "PEMBENTUKAN ORGANISASI P2K3",
        templateUrl: "https://docs.google.com/document/d/1YejwP8ry3H7habNG8_uUlqby0jrqJs0vn2Xi5U3bS1k/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.01.00.01",
        title: "SK Pembentukan P2K3",
        templateUrl: "https://docs.google.com/document/d/16SN7i7U87-pfXm1GxtbBt9uE77e4jpjXvSVfsKd8KG0/edit?usp=sharing",
        targetCount: 1,
      },
      {
        title: "SK Pengesahan Pembentukan P2K3 DISNAKER",
        targetCount: 1,
      },
      {
        title: "SK Tim Peran Lantai / Tanggap Darurat",
        targetCount: 1,
      },
      {
        title: "SK Crisis Management Team (CMT)",
        targetCount: 1,
      },
      {
        title: "Sertifikat Sekretaris P2K3 / NDE Tim Pengelola SMK3",
        targetCount: 1,
      },
    ],
  },
  {
    no: 5,
    name: "PROSEDUR MANAJEMEN RESIKO",
    mainDocCode: "P.02/UM410/TR3-00000000/2026",
    mainDocUrl: "https://docs.google.com/document/d/1jtViv0Scj4kL3Z7w2pcoEiik-IZaYGx__k-z6OWkzNk/edit?usp=sharing",
    items: [
      {
        code: "P.02/UM410/TR3-00000000/2026",
        title: "PROSEDUR MANAJEMEN RESIKO",
        templateUrl: "https://docs.google.com/document/d/1QFQaD2ArTtpczBk_RdVE1pvOQly8MAm9um1Uh5-3fUg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 02 00 01/UM410/2024",
        title: "Form Identifikasi Bahaya Penilaian dan Pengendalian Resiko IBPR = Access",
        templateUrl: "https://docs.google.com/document/d/1uM9M8T5hqO6u4XAXbOhrtrK7-x6yHwwH7qWkWVs-WMQ/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 02 00 01/UM410/2024",
        title: "Form Identifikasi Bahaya Penilaian dan Pengendalian Resiko IBPR = Network",
        templateUrl: "https://docs.google.com/document/d/1uM9M8T5hqO6u4XAXbOhrtrK7-x6yHwwH7qWkWVs-WMQ/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 02 00 01/UM410/2024",
        title: "Form Identifikasi Bahaya Penilaian dan Pengendalian Resiko IBPR = Mekanikal Elektrikal",
        templateUrl: "https://docs.google.com/document/d/1uM9M8T5hqO6u4XAXbOhrtrK7-x6yHwwH7qWkWVs-WMQ/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 02 00 01/UM410/2024",
        title: "Form Identifikasi Bahaya Penilaian dan Pengendalian Resiko IBPR = Sipil",
        templateUrl: "https://docs.google.com/document/d/1uM9M8T5hqO6u4XAXbOhrtrK7-x6yHwwH7qWkWVs-WMQ/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 02 00 01/UM410/2024",
        title: "Form Identifikasi Bahaya Penilaian dan Pengendalian Resiko IBPR = General Support",
        templateUrl: "https://docs.google.com/document/d/1uM9M8T5hqO6u4XAXbOhrtrK7-x6yHwwH7qWkWVs-WMQ/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 02 00 01/UM410/2024",
        title: "Form Identifikasi Bahaya Penilaian dan Pengendalian Resiko IBPR = Administrasi",
        templateUrl: "https://docs.google.com/document/d/1uM9M8T5hqO6u4XAXbOhrtrK7-x6yHwwH7qWkWVs-WMQ/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 02 00 02/UM410/2024",
        title: "Form Tindak Lanjut / Evaluasi Identifikasi Bahaya",
        targetCount: 1,
      },
      {
        code: "FM 02 00 03/UM410/2024",
        title: "Form Matrik Resiko Pekerjaan",
        targetCount: 1,
      },
      {
        code: "FM 02 00 04/UM410/2024",
        title: "Form Matrik Penilaian Resiko",
        targetCount: 1,
      },
      {
        title: "Sertifikasi Manajemen Risiko",
        targetCount: 1,
      },
    ],
  },
  {
    no: 6,
    name: "PROSEDUR PENETAPAN TUJUAN, SASARAN DAN PROGRAM K5L",
    mainDocCode: "P.03/UM410//C0P-M3000000/2026",
    mainDocUrl: "https://docs.google.com/document/d/1N6elJWL-Xx5zUnpmVkdqkRyRBSAJ1Qiz-2o_6rJFXLQ/edit?usp=sharing",
    items: [
      {
        code: "P.03/UM410/TR3-00000000/2026",
        title: "PROSEDUR PENETAPAN TUJUAN, SASARAN DAN PROGRAM K3L",
        templateUrl: "https://docs.google.com/document/d/1KXeUxwPbQ2WcS54YrDV3a6cVIsK_JTcnMQizDkrX5To/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 03 00 01/UM410/2024",
        title: "Form Tujuan, Sasaran dan Program SMK3",
        templateUrl: "https://docs.google.com/spreadsheets/d/1PmymvGiEY7vPwjxzkWdT-NlSFO7BusoYQg1lpKEibpg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 03 00 02/UM410/2024",
        title: "Form Evaluasi Sasaran dan Program SMK3 - Semester I",
        templateUrl: "https://docs.google.com/document/d/1SQeBzfE3uYy8srWmQS4PbdpcG_N6I5mJPlaP5lXmL5E/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 03 00 02/UM410/2024",
        title: "Form Evaluasi Sasaran dan Program SMK3 - Semester II",
        templateUrl: "https://docs.google.com/document/d/1SQeBzfE3uYy8srWmQS4PbdpcG_N6I5mJPlaP5lXmL5E/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 03 00 03/UM410/2024",
        title: "Form Timeplan Program Kerja SMK3L",
        templateUrl: "https://docs.google.com/spreadsheets/d/17i4nj2LZYjWhJDN8GXVUSWR7LHdIq_EdFvx7k8tNPt0/edit?usp=sharing",
        targetCount: 1,
      },
    ],
  },
  {
    no: 7,
    name: "PROSEDUR PELATIHAN",
    mainDocCode: "P.04/UM410//C0P-M3000000/2026",
    mainDocUrl: "https://docs.google.com/document/d/1yJg8BEHzp0m1ns6QgllClhDDLGhz4_LVnG4r9pm-MhI/edit?usp=sharing",
    items: [
      {
        code: "P.04/UM410/TR3-00000000/2026",
        title: "PROSEDUR PELATIHAN",
        templateUrl: "https://docs.google.com/document/d/1RTcN88kds3BYhNyCpt2rrqou9WqTwPVyjBuRkhyFDiY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 04 00 01/UM410/2024",
        title: "Form Matrik Analisa Kebutuhan Pelatihan (TNA)",
        templateUrl: "https://docs.google.com/document/d/1Iqf57uTfpZNs_-oVvg9JeJah3ooV9cnkfZfxz3b5pG0/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 04 00 02/UM410/2024",
        title: "Form Evaluasi Pelatihan",
        templateUrl: "https://docs.google.com/document/d/1JPYCW40xO-7i9d8UfQbomSYN7_1_fy3iJCKfHuCsh3Y/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.04.00.01",
        title: "NDE Usulan Pelatihan SAS-HR Witel",
        templateUrl: "https://docs.google.com/document/d/1woGGC9El0bYdzS1e28w6PtX7bQWpRsqjX_sw3GvHUDY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.04.00.02",
        title: "NDE Usulan Pelatihan K3 HR-HC Treg",
        templateUrl: "https://docs.google.com/document/d/1yEhtAU_SUNw9btfpbNui_dKkO1Uv0bAMxGcxz81Isyw/edit?usp=sharing",
        targetCount: 1,
      },
      {
        title: "Sertifikasi Ahli K3 Umum & Auditor SMK3",
        targetCount: 1,
      },
      {
        title: "Sertifikasi Manajemen Risiko",
        targetCount: 1,
      },
      {
        title: "Sertifikasi Auditor SMK3",
        targetCount: 1,
      },
      {
        title: "Sertifikasi P3K",
        targetCount: 1,
      },
      {
        title: "Sertifikasi DAMKAR D",
        targetCount: 1,
      },
      {
        title: "Sertifikasi DAMKAR C",
        targetCount: 1,
      },
      {
        title: "Sertifikasi DAMKAR B",
        targetCount: 1,
      },
      {
        title: "Sertifikasi DAMKAR A",
        targetCount: 1,
      },
      {
        title: "Sertifikasi K3 Listrik",
        targetCount: 1,
      },
    ],
  },
  {
    no: 8,
    name: "PROSEDUR KOMUNIKASI DAN KONSULTASI",
    mainDocCode: "P.05/UM410/C0P-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/1UeQZtxIJVC6logyWuxL79IRdlLZvB9nPHjSo1Q8IyX0/edit?usp=sharing",
    items: [
      {
        code: "P.05/UM410/TR3-00000000/2026",
        title: "PROSEDUR KOMUNIKASI DAN KONSULTASI",
        templateUrl: "https://docs.google.com/document/d/1lznd2dHLNvmWlvxM1ithzabWyIacHItaAzsGTUEcQC0/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 05 00 01/UM410/2024",
        title: "Form Jadwal Konsultasi",
        templateUrl: "https://docs.google.com/document/d/19dTs-9zhPRFdX2uiRLgRX15a-071I-VqtK2KRKvZnZc/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 05 00 02/UM410/2024",
        title: "Form Dokumen Daftar Informasi K3",
        templateUrl: "https://docs.google.com/document/d/1EZSq4O58Z8WWQvaYfw6tCsIw8enKYWUktGT0dLf5TD4/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 05 00 03/UM410/2024",
        title: "Form Induksi Pegawai Baru / Mutasi",
        templateUrl: "https://docs.google.com/document/d/1uYM6MmUMkMq4riPafiKxyJw4yrxLnsjPKaqjPSx8zNY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 05 00 03/UM410/2024",
        title: "Form Induksi Gladi Magang / PKL",
        templateUrl: "https://docs.google.com/document/d/1uYM6MmUMkMq4riPafiKxyJw4yrxLnsjPKaqjPSx8zNY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 05 00 03/UM410/2024",
        title: "Form Induksi Karyawan CLTP / CUBES / Mitra",
        templateUrl: "https://docs.google.com/document/d/1uYM6MmUMkMq4riPafiKxyJw4yrxLnsjPKaqjPSx8zNY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 05 00 04/UM410/2024",
        title: "Form Dokumen Photo",
        templateUrl: "https://docs.google.com/document/d/1sBEjVnBpAmNE8b1I1UVfeIQsnIKQi4EFwmONEpcP8BI/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 05 00 05/UM410/2024",
        title: "Form Komunikasi dan Konsultasi",
        templateUrl: "https://docs.google.com/document/d/1Ut-FHjl8KaGQwwFX9Vd8m4hu7RXqhFnktWM8_HZo_K8/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 05 00 06/UM410/2024",
        title: "Form Safety Briefing",
        templateUrl: "https://docs.google.com/document/d/1XpHkCaBojOf6CIcTpHLN3mbUwMIEpxqpP55X7RXba84/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.05.00.01",
        title: "NDE Perihal SMK3 Induksi & Magang",
        targetCount: 1,
      },
      {
        code: "LP.05.00.02",
        title: "NDE Perihal Kebijakan dan Komitment K3",
        targetCount: 1,
      },
      {
        code: "LP.05.00.02",
        title: "NDE Perihal Daftar Peraturan Perundang-Undangan K3",
        targetCount: 1,
      },
      {
        code: "LP.05.00.02",
        title: "NDE Perihal Jam Kerja Selamat",
        targetCount: 1,
      },
      {
        code: "LP.05.00.02",
        title: "NDE Perihal Sosialisasi PP.50/Tahun 2012",
        targetCount: 1,
      },
      {
        code: "LP.05.00.02",
        title: "NDE Perihal Laporan Kecelakaan Kerja",
        targetCount: 1,
      },
      {
        code: "LP.05.00.02",
        title: "NDE Perihal Sosialisasi Ijin Masuk Lokasi",
        targetCount: 1,
      },
      {
        code: "LP.05.00.02",
        title: "NDE Perihal Tujuan, Sasaran dan Program SMK3",
        targetCount: 1,
      },
      {
        code: "LP.05.00.02",
        title: "NDE Tindak Lanjur RTM kepada All Tim P2K3",
        targetCount: 1,
      },
    ],
  },
  {
    no: 9,
    name: "PROSEDUR PENGENDALIAN DOKUMEN",
    mainDocCode: "P.06/UM410/TR3-00000000/2026",
    mainDocUrl: "https://docs.google.com/document/d/1Ck9b1S8GztkoIoICgSHWSyIs6bMdE_CyanS4dYi6aCo/edit?usp=sharing",
    items: [
      {
        code: "P.06/UM410/TR3-00000000/2026",
        title: "PROSEDUR PENGENDALIAN DOKUMEN",
        templateUrl: "https://docs.google.com/document/d/1I9qVbDOvCrGovCla6a60zsG1YqBBNL63mbV_TJiESaM/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 06 00 01/UM410/2024",
        title: "Form Daftar Induk Dokumen",
        templateUrl: "https://docs.google.com/document/d/1crD4vhNS2S5ExVqCMJRpWAuuWrdIyolsTZijkNhhk_o/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 06 00 02/UM410/2024",
        title: "Form Daftar Distribusi Dokumen",
        templateUrl: "https://docs.google.com/document/d/1btT7yoJ9GPdeTlBaouZYu_U9x06igZLrpAeEzgXaYTc/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 06 00 03/UM410/2026",
        title: "Form Usulan Perubahan Dokumen",
        templateUrl: "https://docs.google.com/document/d/1hLwChR3WerrJ6LwhYmyTHRMewlOqmFgFqyJdOFtpz-8/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 06 00 04/UM410/2026",
        title: "Form Pemusnahan & Penghapusan Dokumen Usang",
        templateUrl: "https://docs.google.com/document/d/1noay5hPKTLrcYraAlKvp7LeEkYePkkCeE6JkBZbw1R8/edit?usp=sharing",
        targetCount: 1,
      },
    ],
  },
  {
    no: 10,
    name: "PROSEDUR PENGENDALIAN CATATAN",
    mainDocCode: "P.07/UM410/COP-M3000000/2026",
    mainDocUrl: "https://docs.google.com/document/d/19wrDTlHbFCRRNBYB6jtOuLSNuP5BdiAMz51dKwejob0/edit?usp=sharing",
    items: [
      {
        code: "P.07/UM410/TR3-00000000/2026",
        title: "PROSEDUR PENGENDALIAN CATATAN",
        templateUrl: "https://docs.google.com/document/d/19wrDTlHbFCRRNBYB6jtOuLSNuP5BdiAMz51dKwejob0/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 07 00 01/UM410/2024",
        title: "Form Daftar Catatan K3",
        templateUrl: "https://docs.google.com/document/d/1vBcoIi9r_MO1PJH-7sd9ttA3hK_zi3fIHY2n0yUZMNk/edit?usp=sharing",
        targetCount: 1,
      },
    ],
  },
  {
    no: 11,
    name: "PROSEDUR PENYEDIAAN ALAT PELINDUNG DIRI",
    mainDocCode: "P.08/UM410/COP-M3000000/2026",
    mainDocUrl: "https://docs.google.com/document/d/1ycuMEqyti72YeXb0Klfa0LEvgXggbLDlkueOSypjudE/edit?usp=sharing",
    items: [
      {
        code: "P.08/UM410/TR3-00000000/2026",
        title: "PROSEDUR PENYEDIAAN ALAT PELINDUNG DIRI",
        templateUrl: "https://docs.google.com/document/d/1ycuMEqyti72YeXb0Klfa0LEvgXggbLDlkueOSypjudE/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 08 00 01/UM410/2024",
        title: "Form Daftar Inventarisasi APD",
        templateUrl: "https://docs.google.com/document/d/1D_X9OuRLkwY5-1Oy9V1hLStuwxYqiRpiMH3gFdjaSHU/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 08 00 02/UM410/2024",
        title: "Form Permintaan APD",
        templateUrl: "https://docs.google.com/document/d/1ydEfaoEr_fbhIyJKm0YOCvexMfuiICoENIE9BnKM1Hc/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 08 00 03/UM410/2024",
        title: "Form Log Book Penggunaan & Pengambilan APD",
        templateUrl: "https://docs.google.com/document/d/10kkfLLqi5IiQpvUKY6hu8UxeMtWLGeYmheSERBF622s/edit?usp=sharing",
        targetCount: 1,
      },
    ],
  },
  {
    no: 12,
    name: "PROSEDUR PENGUKURAN DAN INSPEKSI LINGKUNGAN KERJA",
    mainDocCode: "P.09/UM410/COP-M3000000/2026",
    mainDocUrl: "https://docs.google.com/document/d/1Qv9kNEH2WtDktnMqjV3B7yWtcIYFaNMguFU5Hsn0_Z0/edit?usp=sharing",
    items: [
      {
        code: "P.09/UM410/TR3-00000000/2026",
        title: "PROSEDUR PENGUKURAN DAN INSPEKSI LINGKUNGAN KERJA",
        templateUrl: "https://docs.google.com/document/d/1Qv9kNEH2WtDktnMqjV3B7yWtcIYFaNMguFU5Hsn0_Z0/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 09 00 01/UM410/2024",
        title: "Form Jadwal Inspeksi K3",
        templateUrl: "https://docs.google.com/document/d/122WEKHmgh4qexDK4IRt9gYwRjRWVp8_kHckFQRGYLIs/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 09 00 02/UM410/2026",
        title: "Form Checklist Inspeksi K3L",
        templateUrl: "https://docs.google.com/document/d/1UjqYylIht77j4RbLMXq9fk5nM3hDzuWJUdOjB1BHWII/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 09 00 02/UM410/2024",
        title: "Form Checklist Inspeksi K3-Gedung Treg / Witel",
        templateUrl: "https://docs.google.com/document/d/1UjqYylIht77j4RbLMXq9fk5nM3hDzuWJUdOjB1BHWII/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 09 00 02/UM410/2024",
        title: "Form Checklist Inspeksi K3-HOTD",
        templateUrl: "https://docs.google.com/document/d/1UjqYylIht77j4RbLMXq9fk5nM3hDzuWJUdOjB1BHWII/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 09 00 02/UM410/2024",
        title: "Form Checklist Inspeksi K3-HOTD",
        templateUrl: "https://docs.google.com/document/d/1UjqYylIht77j4RbLMXq9fk5nM3hDzuWJUdOjB1BHWII/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 09 00 02/UM410/2024",
        title: "Form Checklist Inspeksi K3-HOTD",
        templateUrl: "https://docs.google.com/document/d/1UjqYylIht77j4RbLMXq9fk5nM3hDzuWJUdOjB1BHWII/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 09 00 02/UM410/2024",
        title: "Form Checklist Inspeksi K3-HOTD",
        templateUrl: "https://docs.google.com/document/d/1UjqYylIht77j4RbLMXq9fk5nM3hDzuWJUdOjB1BHWII/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 09 00 03/UM410/2024",
        title: "Form Laporan Inspeksi K3",
        templateUrl: "https://docs.google.com/document/d/1YyEHqhDoVwZguqLwPjs_Nt-7EenaxWBbkk953ZaMXbg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 09 00 04/UM410/2024",
        title: "Form Kuesioner K3 (Manager, Asman, Officer 1-3)",
        templateUrl: "https://docs.google.com/document/d/1mWHZJzFpYelENL2pFjGHZ_bILXds9QNHzY4WrS8qezo/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 09 00 04/UM410/2024",
        title: "Form Kuesioner K3 Manager",
        templateUrl: "https://docs.google.com/document/d/1mWHZJzFpYelENL2pFjGHZ_bILXds9QNHzY4WrS8qezo/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 09 00 04/UM410/2024",
        title: "Form Kuesioner K3 Asman",
        templateUrl: "https://docs.google.com/document/d/1mWHZJzFpYelENL2pFjGHZ_bILXds9QNHzY4WrS8qezo/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 09 00 04/UM410/2024",
        title: "Form Kuesioner K3 Officer-1",
        templateUrl: "https://docs.google.com/document/d/1mWHZJzFpYelENL2pFjGHZ_bILXds9QNHzY4WrS8qezo/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 09 00 04/UM410/2024",
        title: "Form Kuesioner K3 Officer-2",
        templateUrl: "https://docs.google.com/document/d/1mWHZJzFpYelENL2pFjGHZ_bILXds9QNHzY4WrS8qezo/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 09 00 04/UM410/2024",
        title: "Form Kuesioner K3 Officer-3",
        templateUrl: "https://docs.google.com/document/d/1mWHZJzFpYelENL2pFjGHZ_bILXds9QNHzY4WrS8qezo/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 09 00 04/UM410/2024",
        title: "Form Kuesioner K3",
        templateUrl: "https://docs.google.com/document/d/1mWHZJzFpYelENL2pFjGHZ_bILXds9QNHzY4WrS8qezo/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 09 00 05/UM410/2024",
        title: "Form Bispro SROT",
        templateUrl: "https://docs.google.com/document/d/1NDgLSBVtp5xKGVHfbUeRYiPEMiDYn4sd9-3PiEJ6Y7E/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 09 00 06/UM410/2024",
        title: "Form Laporan Bahaya Lingkungan Kerja",
        templateUrl: "https://docs.google.com/document/d/1Cj2zrg3l6aCoG30okYleJIhM8EtPUPtNjRBQ0fzIRVo/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 09 00 07/UM410/2024",
        title: "Form Inspeksi Manajemen Bagi Pekerja & Lingkungan",
        templateUrl: "https://docs.google.com/document/d/1Yk97-8EvVDqy-ARu3pk-mm-Yb--0xhLyCpxmXZUT_Ug/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.09.00.01",
        title: "NDE Team Inspeksi Lingkungan Kerja",
        templateUrl: "https://docs.google.com/document/d/1vylN4EJWslYXaJD0Sc4GSKGs-FkKUKqsFzsMe9JTAxw/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.09.00.02",
        title: "NDE Tindaklanjut Temuan Inspeksi Lingkungan",
        templateUrl: "https://docs.google.com/document/d/1MWZ77EYPont-tzYBJ1bZLLoqOCRwSgjdtWJVv-67r_4/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.09.00.03",
        title: "NDE Tindaklanjut Temuan Pengukuran Lingkungan",
        templateUrl: "https://docs.google.com/document/d/1y9EL7L5eFOcFaUsq61djBvJ8eb1VcxXSlYsfklJPASc/edit?usp=sharing",
        targetCount: 1,
      },
      {
        title: "Hasil Pengukuran Lingkungan Kerja Faktor Fisika",
        targetCount: 1,
      },
      {
        title: "Hasil Pengukuran Lingkungan Kerja Faktor Kimia",
        targetCount: 1,
      },
      {
        title: "Hasil Pengukuran Lingkungan Kerja Faktor Biologi",
        targetCount: 1,
      },
      {
        title: "Hasil Pengukuran Lingkungan Kerja Faktor Psikologi",
        targetCount: 1,
      },
      {
        title: "Hasil Pengukuran Lingkungan Kerja Faktor Ergonomi",
        targetCount: 1,
      },
    ],
  },
  {
    no: 13,
    name: "PROSEDUR PERTOLONGAN PERTAMA PADA KECELAKAAN (P3K)",
    mainDocCode: "P.10/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/1AXAfI-Q7oScTImZWK7oJb1FUaD4IggZiNAvWhA3aMn8/edit?usp=sharing",
    items: [
      {
        code: "P.10/UM410/TR3-00000000/2026",
        title: "PROSEDUR PERTOLONGAN PERTAMA PADA KECELAKAAN (P3K)",
        templateUrl: "https://docs.google.com/document/d/1AXAfI-Q7oScTImZWK7oJb1FUaD4IggZiNAvWhA3aMn8/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 10 00 01/UM410/2024",
        title: "Form Checklist Kotak P3K",
        templateUrl: "https://docs.google.com/document/d/1dmCgJS-XjjtosZ2xzNfWV6oZXY1Ebxs5GAnJdACOOvw/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 10 00 02/UM410/2024",
        title: "Form Permintaan Obat P3K",
        templateUrl: "https://docs.google.com/document/d/1T6Cr3778lLj1ZEs6kWBJ-uC53SsRiVh3Vg3QT4gbx88/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 10 00 03/UM410/2024",
        title: "Form Monitoring Pemakaian Isi Kotak P3K",
        templateUrl: "https://docs.google.com/document/d/1EHBsl2R210MFSRxwCbhYvRq5L55LSPer0tibNZ3fV0w/edit?usp=sharing",
        targetCount: 1,
      },
      {
        title: "Sertifikasi P3K",
        targetCount: 1,
      },
      {
        code: "IK 10.00.01/UM410/2024",
        title: "Instruksi Kerja Pertolongan Pertama Pada Kecelakaan",
        templateUrl: "https://docs.google.com/document/d/1VCdvagoLFuH92tEJidB443u2D9Gtc1Zrocd-sL4mJMg/edit?usp=sharing",
        targetCount: 1,
      },
    ],
  },
  {
    no: 14,
    name: "Instruksi Kerja Pertolongan Pertama Pada Kecelakaan",
    mainDocCode: "IK 10.00.01/UM410/2024",
    mainDocUrl: "https://docs.google.com/document/d/1VCdvagoLFuH92tEJidB443u2D9Gtc1Zrocd-sL4mJMg/edit?usp=sharing",
    items: [
      {
        code: "IK 10.00.01/UM410/2024",
        title: "Instruksi Kerja Pertolongan Pertama Pada Kecelakaan",
        templateUrl: "https://docs.google.com/document/d/1VCdvagoLFuH92tEJidB443u2D9Gtc1Zrocd-sL4mJMg/edit?usp=sharing",
        targetCount: 1,
      },
    ]
  },
  {
    no: 15,
    name: "PROSEDUR TINJAUAN KONTRAK",
    mainDocCode: "P.11/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/13u0RQvNeWell45wkUoAgckJr7c3EZaFg7t01UC0gpyE/edit?usp=sharing",
    items: [
      {
        code: "P.11/UM410/TR3-00000000/2026",
        title: "PROSEDUR TINJAUAN KONTRAK",
        templateUrl: "https://docs.google.com/document/d/13u0RQvNeWell45wkUoAgckJr7c3EZaFg7t01UC0gpyE/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 11 00 01/UM410/2024",
        title: "Form Verifikasi Kontrak",
        templateUrl: "https://docs.google.com/document/d/1dETWp0QMqkd3LTimKk09sCCKjqmRPNXVQFDMiLfs9Ao/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 11 00 01/UM410/2024",
        title: "Form Verifikasi Kontrak",
        templateUrl: "https://docs.google.com/document/d/1dETWp0QMqkd3LTimKk09sCCKjqmRPNXVQFDMiLfs9Ao/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 11 00 02/UM410/2024",
        title: "Form Job Safety Analysis (JSA)",
        templateUrl: "https://docs.google.com/document/d/1IPnTml2aXEX87K5U9y_f8_RHdEAmn_VCmq8tBM-wNcI/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 11 00 02/UM410/2024",
        title: "Form Job Safety Analysis (JSA)",
        templateUrl: "https://docs.google.com/document/d/1IPnTml2aXEX87K5U9y_f8_RHdEAmn_VCmq8tBM-wNcI/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 11 00 03/UM410/2024",
        title: "Form Penilaian Kinerja Mitra Kerja",
        templateUrl: "https://docs.google.com/spreadsheets/d/1ziy7upDo8DHLH6D31t1RllGOjRWpM471UH4RNnCvxV8/edit?usp=sharing",
        targetCount: 1,
      },

    ],
  },
  {
    no: 16,
    name: "PROSEDUR HYGIENE INDUSTRY",
    mainDocCode: "P.12/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/1KfSuyLPr-UfzL5fvVwrA712kc_wbkobUwkXSvGZU7N0/edit?usp=sharing",
    items: [
      {
        code: "P.12/UM410/TR3-00000000/2026",
        title: "PROSEDUR HYGIENE INDUSTRY",
        templateUrl: "https://docs.google.com/document/d/1KfSuyLPr-UfzL5fvVwrA712kc_wbkobUwkXSvGZU7N0/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 12 00 01/UM410/2024",
        title: "Form Checklist Hygiene Makanan & Kantin",
        templateUrl: "https://docs.google.com/document/d/1aAn4IGGiOUeuSbMAmuhZ7ohxb5D-xAu_CAGd77XZQCQ/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 12 00 02/UM410/2024",
        title: "Form Checklist Kebersihan Ruangan & Toilet",
        templateUrl: "https://docs.google.com/document/d/1fmt_9aoCY0LjOJ9opbD11ehnDzCavktxa9Bd5-C4yT0/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 12 00 02/UM410/2024",
        title: "Form Checklist Kebersihan Ruangan & Toilet",
        templateUrl: "https://docs.google.com/document/d/1fmt_9aoCY0LjOJ9opbD11ehnDzCavktxa9Bd5-C4yT0/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 12 00 02/UM410/2024",
        title: "Form Checklist Kebersihan Ruangan & Toilet",
        templateUrl: "https://docs.google.com/document/d/1fmt_9aoCY0LjOJ9opbD11ehnDzCavktxa9Bd5-C4yT0/edit?usp=sharing",
        targetCount: 1,
      },
    ],
  },
  {
    no: 17,
    name: "PROSEDUR PERANCANGAN K3L",
    mainDocCode: "P.13/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/1EbympUjloQAjH9RliRc58EXxKpvNw__6nOdj3mBT-mQ/edit?usp=sharing",
    items: [
      {
        code: "P.13/UM410/TR3-00000000/2026",
        title: "PROSEDUR PERANCANGAN K3L",
        templateUrl: "https://docs.google.com/document/d/1EbympUjloQAjH9RliRc58EXxKpvNw__6nOdj3mBT-mQ/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 13 00 01/UM410/2024",
        title: "Form Hasil Usulan & Verifikasi Perancangan K3L",
        templateUrl: "https://docs.google.com/document/d/1sZxJWUY-LGmqYfB1KbsY71B0On5S2a5KsFzTzcI3RJg/edit?usp=sharing",
        targetCount: 1,
      },
    ],
  },
  {
    no: 18,
    name: "PROSEDUR BEKERJA PADA KETINGGIAN",
    mainDocCode: "P.14/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/1A6g39GuTSMA0yIC6-A4G6ONx-2GI3nxlOJysDn6IrL4/edit?usp=sharing",
    items: [
      {
        code: "P.14/UM410/TR3-00000000/2026",
        title: "PROSEDUR BEKERJA PADA KETINGGIAN",
        templateUrl: "https://docs.google.com/document/d/1A6g39GuTSMA0yIC6-A4G6ONx-2GI3nxlOJysDn6IrL4/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 14 00 01/UM410/2024",
        title: "Form Checklist Bekerja Pada Ketinggian",
        templateUrl: "https://docs.google.com/document/d/11j8Tb9PbYHwOv2eKq26A8bmZu41lF-S8x9jqxjHl_2M/edit?usp=sharing",
        targetCount: 1,
      },
      {
        title: "Sertifikasi Bekerja Pada Ketinggian",
        targetCount: 1,
      },
    ],
  },
  {
    no: 19,
    name: "PROSEDUR IJIN KERJA, IJIN MASUK LOKASI & PENGAMANAN ALPRO",
    mainDocCode: "P.15/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/1VFahRHaTz3e-O_kN75HpAT8yCUeVywO9Sx5_Cy2nMKg/edit?usp=sharing",
    items: [
      {
        code: "P.15/UM410/TR3-00000000/2026",
        title: "PROSEDUR IJIN KERJA, IJIN MASUK LOKASI & PENGAMANAN ALPRO",
        templateUrl: "https://docs.google.com/document/d/1VFahRHaTz3e-O_kN75HpAT8yCUeVywO9Sx5_Cy2nMKg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 15 00 01/UM410/2024",
        title: "Form Ketentuan K3 Mitra Ijin Masuk Lokasi",
        templateUrl: "https://docs.google.com/document/d/145uKnFQML-FWoDOi7Hh2PdYY0YC8jJRbjskIoUgIbLI/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 15 00 02/UM410/2024",
        title: "Form Ijin Kerja Khusus",
        templateUrl: "https://docs.google.com/document/d/145uKnFQML-FWoDOi7Hh2PdYY0YC8jJRbjskIoUgIbLI/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 15 00 03/UM410/2024",
        title: "Form Checklist Work Permit",
        templateUrl: "https://docs.google.com/document/d/145uKnFQML-FWoDOi7Hh2PdYY0YC8jJRbjskIoUgIbLI/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 15 00 04/UM410/2024",
        title: "BISPRO Ijin Masuk Lokasi",
        templateUrl: "https://docs.google.com/document/d/145uKnFQML-FWoDOi7Hh2PdYY0YC8jJRbjskIoUgIbLI/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 15 00 05/UM410/2024",
        title: "BISPRO Ijin Masuk Lokasi Troubleshorting",
        templateUrl: "https://docs.google.com/document/d/145uKnFQML-FWoDOi7Hh2PdYY0YC8jJRbjskIoUgIbLI/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.15.00.01",
        title: "NDE Izin Kerja UBIS",
        templateUrl: "https://docs.google.com/document/d/145uKnFQML-FWoDOi7Hh2PdYY0YC8jJRbjskIoUgIbLI/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.15.00.02",
        title: "NDE Masuk Lokasi",
        templateUrl: "https://docs.google.com/document/d/1mUz1Xvr4qPpbeal6fGt2vqktB_TYiIQi0f7EdWKavB0/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.15.00.03",
        title: "Surat Ijin Masuk Lokasi Non NDE",
        templateUrl: "https://docs.google.com/document/d/145uKnFQML-FWoDOi7Hh2PdYY0YC8jJRbjskIoUgIbLI/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.15.00.04",
        title: "Surat Tugas Pengawasan & Pengamanan ALPRO",
        templateUrl: "https://docs.google.com/document/d/145uKnFQML-FWoDOi7Hh2PdYY0YC8jJRbjskIoUgIbLI/edit?usp=sharing",
        targetCount: 1,
      },
    ],
  },
  {
    no: 20,
    name: "PROSEDUR PENYIMPANAN DAN PENANGANAN BARANG",
    mainDocCode: "P.16/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/1Hb1kg3Wl25mexbsR8uBZfmnI9JXcjmfSGk-pAIpGaio/edit?usp=sharing",
    items: [
      {
        code: "P.16/UM410/TR3-00000000/2026",
        title: "PROSEDUR PENYIMPANAN DAN PENANGANAN BARANG",
        templateUrl: "https://docs.google.com/document/d/1Hb1kg3Wl25mexbsR8uBZfmnI9JXcjmfSGk-pAIpGaio/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM.16.00.01",
        title: "Daftar Penyimpanan Bahan Kimia & MSDS",
        templateUrl: "https://docs.google.com/document/d/1w6hKSHfe-VZ9mdPaCXdDv--NRtpMRCJgcx95w0_0woo/edit?usp=sharing",
        targetCount: 1,
      },
      {
        title: "MSDS Minyak (Pertamax/Pertalite)",
        targetCount: 1,
      },
      {
        title: "MSDS Solar",
        targetCount: 1,
      },
      {
        title: "MSDS Oli",
        targetCount: 1,
      },
      {
        title: "MSDS Preon",
        targetCount: 1,
      },
      {
        title: "MSDS Air Accu",
        targetCount: 1,
      },
      {
        title: "MSDS Softsoap Antibacterial Cleaning Service",
        targetCount: 1,
      },
      {
        title: "MSDS Hand Sanitizer",
        targetCount: 1,
      },
    ],
  },
  {
    no: 21,
    name: "PROSEDUR PENGELOLAAN BAHAN DAN LIMBAH B3",
    mainDocCode: "P.17/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/1jPXpKFZohdmkWVW9-jZHpdNn-9fADEsGzOLSNxUpHwY/edit?usp=sharing",
    items: [
      {
        code: "P.17/UM410/TR3-00000000/2026",
        title: "PROSEDUR PENGELOLAAN BAHAN DAN LIMBAH B3",
        templateUrl: "https://docs.google.com/document/d/1jPXpKFZohdmkWVW9-jZHpdNn-9fADEsGzOLSNxUpHwY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 17 00 01/UM410/2024",
        title: "Form Daftar Material B3 dan Pengelolaannya",
        templateUrl: "https://docs.google.com/document/d/1rtcJEmDaVqPkU3owp-JcdyAycunIQT-DASEUsrMXN1g/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 17 00 02/UM410/2024",
        title: "Form Daftar Limbah B3",
        templateUrl: "https://docs.google.com/document/d/1s2p6tR9bF3W5aN2BADBwd03XJ3EUxl-y1w4zVkgBOUY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 17 00 03/UM410/2024",
        title: "Form Neraca Limbah B3",
        templateUrl: "https://docs.google.com/document/d/1O5ECVrT4BZJ46sANBoWCmRoe2QKlJexih9OlxFVSVPs/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 17 00 04/UM410/2024",
        title: "Form Log Book Pembuangan Sampah Umum",
        templateUrl: "https://docs.google.com/document/d/1rvpBk4a-WWbZKEn2XdQiaMu6gmzx47ottRe-jqDsIqc/edit?usp=sharing",
        targetCount: 1,
      },
      {
        title: "PKS Pembuangan Limbah Oli Bekas",
        targetCount: 1,
      },
      {
        title: "PKS Pembuangan Limbah Medis",
        targetCount: 1,
      },
    ],
  },
  {
    no: 22,
    name: "PROSEDUR PEMELIHARAAN & PERBAIKAN PERALATAN",
    mainDocCode: "P.18/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/1JChMD8dzG58BBuJgfhg4ba-XF8Mi5Y5_fiCCk7yjiUw/edit?usp=sharing",
    items: [
      {
        code: "P.18/UM410/COP-M3000000/2024",
        title: "PROSEDUR PEMELIHARAAN & PERBAIKAN PERALATAN",
        templateUrl: "https://docs.google.com/document/d/1JChMD8dzG58BBuJgfhg4ba-XF8Mi5Y5_fiCCk7yjiUw/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 18 00 01/UM410/2024",
        title: "Form Jadwal Perawatan Alat",
        templateUrl: "https://docs.google.com/document/d/1YYJBV4wOilUtMlIRihtMpeIpt40bFbrEUjf9IaGyhaw/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 18 00 02/UM410/2024",
        title: "Form Tabel Peralatan Kerja",
        templateUrl: "https://docs.google.com/document/d/1ybmtWZo7jXR8hiITf_3G4hLdi3fXCPs7Lzi7hCW0GPQ/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 18 00 03/UM410/2024",
        title: "Form Checklist Perawatan",
        templateUrl: "https://docs.google.com/document/d/1XswSDJ_aBwFDAespE8mG7mpEnLy-LHr0mNHLMYtygLc/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 18 00 04/UM410/2024",
        title: "Form Permintaan Perbaikan",
        templateUrl: "https://docs.google.com/document/d/1iBQh8qXxcStBithC9LpbD1o_BZfZU1x_1nQRsGV2iyE/edit?usp=sharing",
        targetCount: 1,
      },
      {
        title: "Sertifikasi Genset",
        targetCount: 1,
      },
      {
        title: "Sertifikasi FAP",
        targetCount: 1,
      },
      {
        title: "Sertifikasi Listrik",
        targetCount: 1,
      },
      {
        title: "Sertifikasi Petir",
        targetCount: 1,
      },
      {
        title: "Sertifikasi Tangki Timbun",
        targetCount: 1,
      },
      {
        title: "Sertifikasi Lift",
        targetCount: 1,
      },
      {
        title: "SIO Genset/Diesel",
        targetCount: 1,
      },
      {
        title: "STO Listrik",
        targetCount: 1,
      },
      {
        title: "SIO Lift",
        targetCount: 1,
      },
      {
        title: "SIO FAP",
        targetCount: 1,
      },
      {
        title: "SIO Gondola",
        targetCount: 1,
      },
      {
        title: "SIO Scafolding",
        targetCount: 1,
      },
      {
        title: "SIO Bekerja Pada Ketinggian",
        targetCount: 1,
      },
    ],
  },
  {
    no: 23,
    name: "Instruksi Kerja LOTO Pemeliharaan & Perbaikan Peralatan",
    mainDocCode: "IK 18 00 01/UM410/2024",
    mainDocUrl: "https://docs.google.com/document/d/1tSQ7GHkia8TH1RVy-kEPiiF3YDcZl40yT4PvQAKwRN8/edit?usp=sharing",
    items: [
      {
        code: "IK 18 00 01/UM410/2024",
        title: "Instruksi Kerja LOTO Pemeliharaan & Perbaikan Peralatan",
        templateUrl: "https://docs.google.com/document/d/1tSQ7GHkia8TH1RVy-kEPiiF3YDcZl40yT4PvQAKwRN8/edit?usp=sharing",
        targetCount: 1,
      },
    ]
  },
  {
    no: 24,
    name: "Instruksi Kerja Bekerja Pada Ruang Terbatas",
    mainDocCode: "IK 18 00 02/UM410/2024",
    mainDocUrl: "https://docs.google.com/document/d/1Gkymr6_aezOufECrmmBii9C9pcz1-sPJRS1jUjmMZ14/edit?usp=sharing",
    items: [
      {
        code: "IK 18 00 02/UM410/2024",
        title: "Instruksi Kerja Bekerja Pada Ruang Terbatas",
        templateUrl: "https://docs.google.com/document/d/1Gkymr6_aezOufECrmmBii9C9pcz1-sPJRS1jUjmMZ14/edit?usp=sharing",
        targetCount: 1,
      },
      {
        title: "NDE Ijin Kerja pada Ruang Terbatas",
        targetCount: 1,
      },
      {
        title: "SIO Bekerja pada Ruang Terbatas",
        targetCount: 1,
      },
    ]
  },
  {
    no: 25,
    name: "PROSEDUR TANGGAP DARURAT",
    mainDocCode: "P.19/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/1BrBaW3NTWeI3wPxfJIhUCypuUteE4jCA7iP3QcSY7Ko/edit?usp=sharing",
    items: [
      {
        code: "P.19/UM410/TR3-00000000/2024",
        title: "PROSEDUR TANGGAP DARURAT",
        templateUrl: "https://docs.google.com/document/d/1BrBaW3NTWeI3wPxfJIhUCypuUteE4jCA7iP3QcSY7Ko/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 19 00 01",
        title: "Form Checklist Inspeksi APAB",
        templateUrl: "https://docs.google.com/document/d/1Z7Pfl7wj7bbP2AJFd1B48k4nRXFQEAXtCcVahc4TSGg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 19 00 02",
        title: "Form Checklist Inspeksi APAR",
        templateUrl: "https://docs.google.com/document/d/1Z7Pfl7wj7bbP2AJFd1B48k4nRXFQEAXtCcVahc4TSGg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 19 00 03",
        title: "Form Checklist Inspeksi Hydrant Indoor",
        templateUrl: "https://docs.google.com/document/d/1Z7Pfl7wj7bbP2AJFd1B48k4nRXFQEAXtCcVahc4TSGg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 19 00 04",
        title: "Form Checklist Inspeksi Hydrant Outdoor",
        templateUrl: "https://docs.google.com/document/d/1Z7Pfl7wj7bbP2AJFd1B48k4nRXFQEAXtCcVahc4TSGg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 19 00 05",
        title: "Form Checklist Inspeksi FAP",
        templateUrl: "https://docs.google.com/document/d/1Z7Pfl7wj7bbP2AJFd1B48k4nRXFQEAXtCcVahc4TSGg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 19 00 06",
        title: "Berita Acara Test Uji Fungsi FAP & Hydrant",
        templateUrl: "https://docs.google.com/document/d/1Z7Pfl7wj7bbP2AJFd1B48k4nRXFQEAXtCcVahc4TSGg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 19 00 07",
        title: "Form Daftar Peralatan Tanggap Darurat",
        templateUrl: "https://docs.google.com/document/d/1Z7Pfl7wj7bbP2AJFd1B48k4nRXFQEAXtCcVahc4TSGg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 19 00 08",
        title: "Form Kuisoner Simulasi Tanggap Darurat",
        templateUrl: "https://docs.google.com/document/d/1Z7Pfl7wj7bbP2AJFd1B48k4nRXFQEAXtCcVahc4TSGg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 19 00 09",
        title: "Form Waktu Pencapaian Evakuasi Per Lantai",
        templateUrl: "https://docs.google.com/document/d/1Z7Pfl7wj7bbP2AJFd1B48k4nRXFQEAXtCcVahc4TSGg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 19 00 10",
        title: "Berita Acara Waktu Pencapaian Evakuasi",
        templateUrl: "https://docs.google.com/document/d/1Z7Pfl7wj7bbP2AJFd1B48k4nRXFQEAXtCcVahc4TSGg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 19 00 11",
        title: "Form Pendataan Aset Protection APAR",
        templateUrl: "https://docs.google.com/document/d/1Z7Pfl7wj7bbP2AJFd1B48k4nRXFQEAXtCcVahc4TSGg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 19 00 12",
        title: "Form Pendataan Aset Protection APAB",
        templateUrl: "https://docs.google.com/document/d/1Z7Pfl7wj7bbP2AJFd1B48k4nRXFQEAXtCcVahc4TSGg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 19 00 13",
        title: "Form Pendataan Aset Protection FAP",
        templateUrl: "https://docs.google.com/document/d/1Z7Pfl7wj7bbP2AJFd1B48k4nRXFQEAXtCcVahc4TSGg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 19 00 14",
        title: "Form Pendataan Aset Protection Hydrant",
        templateUrl: "https://docs.google.com/document/d/1Z7Pfl7wj7bbP2AJFd1B48k4nRXFQEAXtCcVahc4TSGg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 19 00 15",
        title: "Form Checklist Lampu Emergency",
        templateUrl: "https://docs.google.com/document/d/1Z7Pfl7wj7bbP2AJFd1B48k4nRXFQEAXtCcVahc4TSGg/edit?usp=sharing",
        targetCount: 1,
      },
    ],
  },
  {
    no: 26,
    name: "PROSEDUR PEMULIHAN KEADAAN DARURAT",
    mainDocCode: "P.20/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/1A9BePy1KPL8HTbH28pG4hEOWiNd7We8CSUDEGN8vVdY/edit?usp=sharing",
    items: [
      {
        code: "P.20/UM410/TR3-00000000/2026",
        title: "PROSEDUR PEMULIHAN KEADAAN DARURAT",
        templateUrl: "https://docs.google.com/document/d/1A9BePy1KPL8HTbH28pG4hEOWiNd7We8CSUDEGN8vVdY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 20 00 01/UM410/2024",
        title: "Form Pemulihan Keadaan Darurat Unjuk Rasa",
        templateUrl: "https://docs.google.com/document/d/1G4I6WvuNMPbbWJWPe9XCquIDU31eJ6XVeH0lscY1uFo/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 20 00 02/UM410/2024",
        title: "Form Pelaporan Pemulihan Keadaan Darurat",
        templateUrl: "https://docs.google.com/document/d/1cOTge1lNKZs7yqpcHX4FZqy7cKtoL6NyZq0YxW2OL_A/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 20 00 03/UM410/2024",
        title: "Form Laporan Musibah Bencana Alam",
        templateUrl: "https://docs.google.com/document/d/1cPNVC65u5L2LVhWgQhcNok0xdRTFjSgoO8dn5nZlxlU/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 20 00 04/UM410/2024",
        title: "Form Laporan Korban Internal",
        templateUrl: "https://docs.google.com/document/d/1e7Ko76Am5lwNgFUZN6Vzw9IZH436_wGy3pkLpOZeYzs/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 20 00 05/UM410/2024",
        title: "Form Laporan Korban Eksternal",
        templateUrl: "https://docs.google.com/document/d/1oozsr7TSOXs_uwBhns-XCmIcAHqC57rN3scLAZUVZqs/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 20 00 06/UM410/2024",
        title: "Form Laporan Kerusakan Rumah Karyawan",
        templateUrl: "https://docs.google.com/document/d/1wL0lt_yUKdWfwfvvIIZP-sRh95i394S0TmTP2GP9H_U/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 20 00 07/UM410/2024",
        title: "Form Laporan Kerusakan Infratruktur Sipil, Mechanical Engginering & Alat Produksi",
        templateUrl: "https://docs.google.com/document/d/18GkjVMPJ_YSJ-E2m-q7t4slqLl8fYLPLuc46Iqy3aTU/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 20 00 08/UM410/2024",
        title: "Form Perbaikan Infratruktur Sipil, Mechanical Engginering & Alat Produksi",
        templateUrl: "https://docs.google.com/document/d/1IHisRElWSmQQahZxEfdinVZbUGSYa90sPuNSCJUhKXQ/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 20 00 09/UM410/2024",
        title: "Form Penerimaan Bantuan",
        templateUrl: "https://docs.google.com/document/d/1XicA7hLpDL5YpWKPSMwCVGRMpDRHsACknXtEHcSsz6I/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 20 00 10/UM410/2024",
        title: "Form Penyaluran Bantuan",
        templateUrl: "https://docs.google.com/document/d/1Mz60WwPWdLIx_YK9TDpeDeqwwfsFQYgM3R7fHTA1z5M/edit?usp=sharing",
        targetCount: 1,
      },
    ],
  },
  {
    no: 27,
    name: "PROSEDUR IDENTIFIKASI DAN PENELUSURAN PRODUK",
    mainDocCode: "P.21/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/1lQyYVC9NCXqey8_dnkq2GzZWQlnDph25EdK95lJC7dY/edit?usp=sharing",
    items: [
      {
        code: "P.21/UM410/TR3-00000000/2024",
        title: "PROSEDUR IDENTIFIKASI DAN PENELUSURAN PRODUK",
        templateUrl: "https://docs.google.com/document/d/1lQyYVC9NCXqey8_dnkq2GzZWQlnDph25EdK95lJC7dY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 21 00 01/UM410/2024",
        title: "Form Identifikasi dan Penelusuran Produk",
        templateUrl: "https://docs.google.com/document/d/1eiKESskdCNPQYXee5_7GuN3V9oTbcDZvbrDblA2_2FM/edit?usp=sharing",
        targetCount: 1,
      },
    ],
  },
  {
    no: 28,
    name: "PROSEDUR KESELAMATAN BERKENDARA",
    mainDocCode: "P.22/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/14RwmW5HT_JBZJWYRLkOKcjznXohPPt5bFPTORLUDu_c/edit?usp=sharing",
    items: [
      {
        code: "P.22/UM410/TR3-00000000/2026",
        title: "PROSEDUR KESELAMATAN BERKENDARA",
        templateUrl: "https://docs.google.com/document/d/14RwmW5HT_JBZJWYRLkOKcjznXohPPt5bFPTORLUDu_c/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 22 00 01/UM410/2024",
        title: "Form Checklist Penggunaan KBM Operasional",
        templateUrl: "https://docs.google.com/document/d/12ZLcfkiDlE03RYo-X3UP87xzvzW2oFJF4OIFJf_lSqw/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 22 00 02/UM410/2024",
        title: "Form Penitipan KBM",
        templateUrl: "https://docs.google.com/document/d/15g2T7CVKOz4iNmDvplTM-wvVVwjNEc-J1x1VzcsI55g/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 22 00 03/UM410/2024",
        title: "Form Statistik Penggunaan KBM Pelanggaran Lalu Lintas & Kecelakaan Kerja",
        templateUrl: "https://docs.google.com/spreadsheets/d/15zlzEXVyLjbhBbZH99RStjCuGlfHCwZkXw3fOTSRi_g/edit?usp=sharing",
        targetCount: 1,
      },
      {
        title: "SIM Pengemudi KBM Manage Service",
        targetCount: 1,
      },
      {
        title: "SIM Pengemudi KBM Unit Lain",
        targetCount: 1,
      },
    ],
  },
  {
    no: 29,
    name: "PROSEDUR PENGENDALIAN TUMPAHAN BAHAN KIMIA",
    mainDocCode: "P.23/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/1Wt7qy3XIxQwsJwrrgnjJJGbF1XD8OdW0ETL7EaDxJqM/edit?usp=sharing",
    items: [
      {
        code: "P.23/UM410/TR3-00000000/2026",
        title: "PROSEDUR PENGENDALIAN TUMPAHAN BAHAN KIMIA",
        templateUrl: "https://docs.google.com/document/d/1Wt7qy3XIxQwsJwrrgnjJJGbF1XD8OdW0ETL7EaDxJqM/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 23 00 01/UM410/2024",
        title: "Form Laporan Pengendalian Tumpahan Minyak",
        templateUrl: "https://docs.google.com/document/d/1RxR9HCqpiTnBhbhDBdirTzD3VqLPAcCUzsdlJFOuGh8/edit?usp=sharing",
        targetCount: 1,
      },
    ],
  },
  {
    no: 30,
    name: "PROSEDUR PEMERIKSAAN KESEHATAN (MCU)",
    mainDocCode: "P.24/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/17BjnffK1BXcGme2fNDO1bl-CevTrHXYR7jQQ53YzTl0/edit?usp=sharing",
    items: [
      {
        code: "P.24/UM410/TR3-00000000/2026",
        title: "PROSEDUR PEMERIKSAAN KESEHATAN (MCU)",
        templateUrl: "https://docs.google.com/document/d/17BjnffK1BXcGme2fNDO1bl-CevTrHXYR7jQQ53YzTl0/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 24 00 01/UM410/2024",
        title: "Form Status Drajat Kesehatan Hasil MCU",
        templateUrl: "https://docs.google.com/document/d/1Td9LYWqA7MwU697xduEjIoIpwEryPLMnNwEHfad3shU/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 24 00 02/UM410/2024",
        title: "Form Laporan Diagnosa PAK",
        templateUrl: "https://docs.google.com/document/d/1G_MJoLmC2N4kilQlvzNnafudg1YU5c0KoEDazP47reM/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 24 00 03/UM410/2024",
        title: "Form Daftar Rumah Sakit/Klinik Rujukan",
        templateUrl: "https://docs.google.com/document/d/1kAgFJRQmGGYVlFZWl3d97aySCkZcOYYIxfhCnOF5M2Q/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.24.00.01",
        title: "NDE Pemberitahuan Pelaksanaan MCU",
        targetCount: 1,
      },
      {
        code: "LP.24.00.02",
        title: "NDE Laporan Hasil MCU ke DISNAKER",
        templateUrl: "https://docs.google.com/document/d/1NzFVEO2qdhADpo0x20laulRt6uGVkD_EPU2OrQIbNW4/edit?usp=sharing",
        targetCount: 1,
      },
      {
        title: "SIO Hyperkes Dokter Umum",
        targetCount: 1,
      },
      {
        title: "SIO Hyperkes Dokter Gigi",
        targetCount: 1,
      },
      {
        title: "SIO Hiperkes Perawat Umum",
        targetCount: 1,
      },
      {
        title: "SIO Hyperkes Gigi",
        targetCount: 1,
      },
    ],
  },
  {
    no: 31,
    name: "PROSEDUR PELAPORAN DAN PENGKAJIAN KECELAKAAN & PAK",
    mainDocCode: "P.25/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/19yAFvs8vGHqhS-Upz6bQ5AQ4NA-kcDl_LFdBOLQ-Cn0/edit?usp=sharing",
    items: [
      {
        code: "P.25/UM410/TR3-00000000/2026",
        title: "PROSEDUR PELAPORAN DAN PENGKAJIAN KECELAKAAN & PAK",
        templateUrl: "https://docs.google.com/document/d/19yAFvs8vGHqhS-Upz6bQ5AQ4NA-kcDl_LFdBOLQ-Cn0/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 25 00 01/UM410/2024",
        title: "Form Laporan Insiden Lingkungan",
        templateUrl: "https://docs.google.com/document/d/1xX9WuwfdUQQrQvVVKOKRl4Peq1b5DPed1IjGgKJ-MtE/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 25 00 02/UM410/2026",
        title: "Form Laporan Insiden Lingkungan Kerja",
        templateUrl: "https://docs.google.com/document/d/1vcvXTxYEs9qSzWCPcx3Ebs0aWK6ltXgIYzxr3LGffls/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 25 00 03/UM410/2024",
        title: "Form Laporan Penyidikan Kecelakaan Kerja",
        templateUrl: "https://docs.google.com/document/d/1pbnLJyy21PFK0R74VY85oiI-xV5OsKaPtY8YojYLoLY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 25 00 04/UM410/2024",
        title: "Form Laporan Pengkajian PAK",
        targetCount: 1,
      },
    ],
  },
  {
    no: 32,
    name: "PROSEDUR PELAPORAN KEGIATAN K5L, JAM KERJA SELAMAT & STATISTIK INSIDEN",
    mainDocCode: "P.26/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/1spWxz4UJYa-Cl5pHm1ms9kW2EXN795PzgQuY5ZExzZo/edit?usp=sharing",
    items: [
      {
        code: "P.26/UM410/TR3-00000000/2026",
        title: "PROSEDUR PELAPORAN KEGIATAN K5L, JAM KERJA SELAMAT & STATISTIK INSIDEN",
        templateUrl: "https://docs.google.com/document/d/1spWxz4UJYa-Cl5pHm1ms9kW2EXN795PzgQuY5ZExzZo/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.26.00.01",
        title: "NDE Laporan Bulanan & Kegiatan P2K3 Manajemen Januari",
        templateUrl: "https://docs.google.com/document/d/1Q32PRw7-foXMhfuQ8sPvTZiRGy6M_BbjCqnm8YJqK68/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 26 00 01-05/UM410/2024",
        title: "Form Data Jam Hilang, Kerja Selamat, Kecelakaan  & Penggunaan KBM Maret Januari",
        templateUrl: "https://docs.google.com/spreadsheets/d/14T2Nvy-E70EmaB0YI29tR-iyFhjpQTd7wVsnxaVj1XY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.26.00.01",
        title: "NDE Laporan Bulanan & Kegiatan P2K3 Manajemen Februari",
        templateUrl: "https://docs.google.com/document/d/1Q32PRw7-foXMhfuQ8sPvTZiRGy6M_BbjCqnm8YJqK68/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 26 00 01-05/UM410/2024",
        title: "Form Data Jam Hilang, Kerja Selamat, Kecelakaan & Penggunaan KBM Maret Februari",
        templateUrl: "https://docs.google.com/spreadsheets/d/14T2Nvy-E70EmaB0YI29tR-iyFhjpQTd7wVsnxaVj1XY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.26.00.01",
        title: "NDE Laporan Bulanan & Kegiatan P2K3 Manajemen Maret",
        templateUrl: "https://docs.google.com/document/d/1Q32PRw7-foXMhfuQ8sPvTZiRGy6M_BbjCqnm8YJqK68/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 26 00 01-05/UM410/2024",
        title: "Form Data Jam Hilang, Kerja Selamat, Kecelakaan & Penggunaan KBM Maret",
        templateUrl: "https://docs.google.com/spreadsheets/d/14T2Nvy-E70EmaB0YI29tR-iyFhjpQTd7wVsnxaVj1XY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.26.00.01",
        title: "NDE Laporan Bulanan & Kegiatan P2K3 Manajemen April",
        templateUrl: "https://docs.google.com/document/d/1Q32PRw7-foXMhfuQ8sPvTZiRGy6M_BbjCqnm8YJqK68/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 26 00 01-05/UM410/2024",
        title: "Form Data Jam Hilang, Kerja Selamat, Kecelakaan & Penggunaan KBM April",
        templateUrl: "https://docs.google.com/spreadsheets/d/14T2Nvy-E70EmaB0YI29tR-iyFhjpQTd7wVsnxaVj1XY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.26.00.01",
        title: "NDE Laporan Bulanan & Kegiatan P2K3 Manajemen Mei",
        templateUrl: "https://docs.google.com/document/d/1Q32PRw7-foXMhfuQ8sPvTZiRGy6M_BbjCqnm8YJqK68/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 26 00 01-05/UM410/2024",
        title: "Form Data Jam Hilang, Kerja Selamat, Kecelakaan & Penggunaan KBM Mei",
        templateUrl: "https://docs.google.com/spreadsheets/d/14T2Nvy-E70EmaB0YI29tR-iyFhjpQTd7wVsnxaVj1XY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.26.00.01",
        title: "NDE Laporan Bulanan & Kegiatan P2K3 Manajemen Juni",
        templateUrl: "https://docs.google.com/document/d/1Q32PRw7-foXMhfuQ8sPvTZiRGy6M_BbjCqnm8YJqK68/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 26 00 01-05/UM410/2024",
        title: "Form Data Jam Hilang, Kerja Selamat, Kecelakaan & Penggunaan KBM Juni",
        templateUrl: "https://docs.google.com/spreadsheets/d/14T2Nvy-E70EmaB0YI29tR-iyFhjpQTd7wVsnxaVj1XY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.26.00.01",
        title: "NDE Laporan Bulanan & Kegiatan P2K3 Manajemen Juli",
        templateUrl: "https://docs.google.com/document/d/1Q32PRw7-foXMhfuQ8sPvTZiRGy6M_BbjCqnm8YJqK68/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 26 00 01-05/UM410/2024",
        title: "Form Data Jam Hilang, Kerja Selamat, Kecelakaan & Penggunaan KBM Juli",
        templateUrl: "https://docs.google.com/spreadsheets/d/14T2Nvy-E70EmaB0YI29tR-iyFhjpQTd7wVsnxaVj1XY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.26.00.01",
        title: "NDE Laporan Bulanan & Kegiatan P2K3 Manajemen Agustus",
        templateUrl: "https://docs.google.com/document/d/1Q32PRw7-foXMhfuQ8sPvTZiRGy6M_BbjCqnm8YJqK68/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 26 00 01-05/UM410/2024",
        title: "Form Data Jam Hilang, Kerja Selamat, Kecelakaan & Penggunaan KBM Agustus",
        templateUrl: "https://docs.google.com/spreadsheets/d/14T2Nvy-E70EmaB0YI29tR-iyFhjpQTd7wVsnxaVj1XY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.26.00.01",
        title: "NDE Laporan Bulanan & Kegiatan P2K3 Manajemen September",
        templateUrl: "https://docs.google.com/document/d/1Q32PRw7-foXMhfuQ8sPvTZiRGy6M_BbjCqnm8YJqK68/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 26 00 01-05/UM410/2024",
        title: "Form Data Jam Hilang, Kerja Selamat, Kecelakaan & Penggunaan KBM September",
        templateUrl: "https://docs.google.com/spreadsheets/d/14T2Nvy-E70EmaB0YI29tR-iyFhjpQTd7wVsnxaVj1XY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.26.00.01",
        title: "NDE Laporan Bulanan & Kegiatan P2K3 Manajemen Oktober",
        templateUrl: "https://docs.google.com/document/d/1Q32PRw7-foXMhfuQ8sPvTZiRGy6M_BbjCqnm8YJqK68/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 26 00 01-05/UM410/2024",
        title: "Form Data Jam Hilang, Kerja Selamat, Kecelakaan & Penggunaan KBM Oktober",
        templateUrl: "https://docs.google.com/spreadsheets/d/14T2Nvy-E70EmaB0YI29tR-iyFhjpQTd7wVsnxaVj1XY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.26.00.01",
        title: "NDE Laporan Bulanan & Kegiatan P2K3 Manajemen November",
        templateUrl: "https://docs.google.com/document/d/1Q32PRw7-foXMhfuQ8sPvTZiRGy6M_BbjCqnm8YJqK68/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 26 00 01-05/UM410/2024",
        title: "Form Data Jam Hilang, Kerja Selamat, Kecelakaan & Penggunaan KBM November",
        templateUrl: "https://docs.google.com/spreadsheets/d/14T2Nvy-E70EmaB0YI29tR-iyFhjpQTd7wVsnxaVj1XY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.26.00.01",
        title: "NDE Laporan Bulanan & Kegiatan P2K3 Manajemen Desember",
        templateUrl: "https://docs.google.com/document/d/1Q32PRw7-foXMhfuQ8sPvTZiRGy6M_BbjCqnm8YJqK68/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 26 00 01-05/UM410/2024",
        title: "Form Data Jam Hilang, Kerja Selamat, Kecelakaan & Penggunaan KBM Desember",
        templateUrl: "https://docs.google.com/spreadsheets/d/14T2Nvy-E70EmaB0YI29tR-iyFhjpQTd7wVsnxaVj1XY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.26.00.02",
        title: "NDE Eksternal Laporan Kegiatan P2K3 Triwulanan DISNAKER (Triwulan 1)",
        templateUrl: "https://docs.google.com/document/d/1o08cYfav76c4RXZTU6FYhmJGDp3KmY-zlrS_wptRCa0/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 26 00 01-05/UM410/2024",
        title: "Form Data Jam Hilang, Kerja Selamat, Kecelakaan & Penggunaan KBM Maret",
        templateUrl: "https://docs.google.com/spreadsheets/d/14T2Nvy-E70EmaB0YI29tR-iyFhjpQTd7wVsnxaVj1XY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.26.00.02",
        title: "NDE Eksternal Laporan Kegiatan P2K3 Triwulanan DISNAKER (Triwulan 2)",
        templateUrl: "https://docs.google.com/document/d/1o08cYfav76c4RXZTU6FYhmJGDp3KmY-zlrS_wptRCa0/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 26 00 01-05/UM410/2024",
        title: "Form Data Jam Hilang, Kerja Selamat, Kecelakaan & Penggunaan KBM Juni",
        templateUrl: "https://docs.google.com/spreadsheets/d/14T2Nvy-E70EmaB0YI29tR-iyFhjpQTd7wVsnxaVj1XY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.26.00.02",
        title: "NDE Eksternal Laporan Kegiatan P2K3 Triwulanan DISNAKER (Triwulan 3)",
        templateUrl: "https://docs.google.com/document/d/1o08cYfav76c4RXZTU6FYhmJGDp3KmY-zlrS_wptRCa0/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 26 00 01-05/UM410/2024",
        title: "Form Data Jam Hilang, Kerja Selamat, Kecelakaan & Penggunaan KBM September",
        templateUrl: "https://docs.google.com/spreadsheets/d/14T2Nvy-E70EmaB0YI29tR-iyFhjpQTd7wVsnxaVj1XY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.26.00.02",
        title: "NDE Eksternal Laporan Kegiatan P2K3 Triwulanan DISNAKER (Triwulan 4)",
        templateUrl: "https://docs.google.com/document/d/1o08cYfav76c4RXZTU6FYhmJGDp3KmY-zlrS_wptRCa0/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 26 00 01-05/UM410/2024",
        title: "Form Data Jam Hilang, Kerja Selamat, Kecelakaan & Penggunaan KBM Desember",
        templateUrl: "https://docs.google.com/spreadsheets/d/14T2Nvy-E70EmaB0YI29tR-iyFhjpQTd7wVsnxaVj1XY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.26.00.04",
        title: "Formulir Audit Zero Accident GM",
        templateUrl: "https://docs.google.com/document/d/1B0WjpqAOwtdP_tG4QH4cr0Hh8Mln7DRfIh6mL1c0jLo/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.26.00.05",
        title: "Formulir Jam Kerja Selamat JKO",
        templateUrl: "https://docs.google.com/spreadsheets/d/14T2Nvy-E70EmaB0YI29tR-iyFhjpQTd7wVsnxaVj1XY/edit?usp=sharing",
        targetCount: 1,
      },
    ],
  },
  {
    no: 33,
    name: "PROSEDUR PELAPORAN KEGIATAN K5L, JAM KERJA SELAMAT & STATISTIK INSIDEN",
    mainDocCode: "P.27/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/1SEoCiC6MjMZQWpFzW-yW3H2xuE8vUR_PxxBONNCbM3w/edit?usp=sharing",
    items: [
      {
        code: "P.27/UM410/TR3-00000000/2026",
        title: "PROSEDUR AUDIT INTERNAL",
        templateUrl: "https://docs.google.com/document/d/1SEoCiC6MjMZQWpFzW-yW3H2xuE8vUR_PxxBONNCbM3w/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 27 00 01/UM410/2024",
        title: "Form Laporan Ketidaksesuaian",
        templateUrl: "https://docs.google.com/document/d/1amW2fe6tggjp7d_2mOZguWL7S7475vRQj7mvoePBnh8/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 27 00 02/UM410/2024",
        title: "Form Rekapitulasi Ketidaksesuaian Audit Internal",
        templateUrl: "https://docs.google.com/document/d/1lTy2AB9L7akF60BodVhCqWK5XDobS5oJMFsjH0hnKGI/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 27 00 03/UM410/2024",
        title: "Form Berita Acara Audit Internal",
        templateUrl: "https://docs.google.com/document/d/1iRFMk8nB2Ox_0uD6sPGSUy6HoGUUInmqdUzfjIztgBk/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 27 00 04/UM410/2024",
        title: "Form Rekapitulasi Closing Ketidaksesuain Audit Internal",
        templateUrl: "https://docs.google.com/document/d/19N-JUwgWEOCe014M7aRglA5pIUZi2Q45N85Qv6EApGU/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.27.00.01",
        title: "NDE Pelaksanaan Audit Internal dan Audit Plan SMK3",
        templateUrl: "https://docs.google.com/document/d/1BAlTIkcOwXYCWJKBBD8esgDYQkYdVX2Cd1-ovbf9Ixs/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.27.00.02",
        title: "NDE Undangan Opening & Closing Meeting AI SMK3",
        templateUrl: "https://docs.google.com/document/d/19DKdCOoieI9nk0WuBNJMlzBMNlb4YMZ_nv7ZEw8TpTY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.27.00.03",
        title: "NDE Laporan Hasil Audit Internal",
        templateUrl: "https://docs.google.com/document/d/1whuQnqI7r0DyXvkFKazFFLU11dkPQFMcQeiu_Qb7Gnk/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.27.00.04",
        title: "NDE Laporan Closing Temuan Audit Internal",
        templateUrl: "https://docs.google.com/document/d/1yo3tqipb9EDSh685z3DD_trumm6e2Um-XkBhZN-IqZM/edit?usp=sharing",
        targetCount: 1,
      },
    ],
  },
  {
    no: 34,
    name: "PROSEDUR MANAJEMEN PERUBAHAN",
    mainDocCode: "P.28/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/155wopJ2YKKf8TP5NTR05oZPa1lP2_CJkQ4pxyob9gCQ/edit?usp=sharing",
    items: [
      {
        code: "P.28/UM410/TR3-00000000/2026",
        title: "PROSEDUR MANAJEMEN PERUBAHAN",
        templateUrl: "https://docs.google.com/document/d/155wopJ2YKKf8TP5NTR05oZPa1lP2_CJkQ4pxyob9gCQ/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 28 00 01/UM410/2024",
        title: "Form Manajemen Perubahan",
        templateUrl: "https://docs.google.com/document/d/1YVpg2buHB85NKywlJq_NzdoQcYx3MvpliN_zrp_Eruo/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 28 00 02/UM410/2024",
        title: "Form Manajemen Perubahan Dokumen",
        templateUrl: "https://docs.google.com/document/d/1cXfY-kVE9lj3y1Xyb19dXFuK029bdj0LXzCi_Ex5dAo/edit?usp=sharing",
        targetCount: 1,
      },
    ],
  },
  {
    no: 35,
    name: "PROSEDUR RAPAT TINJAUAN MANAJEMEN & BULANAN",
    mainDocCode: "P.29/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/1SuubkHReD0GacitAjUMDHyZX0Zp1dir_3S7d89xw4mQ/edit?usp=sharing",
    items: [
      {
        code: "P.29/UM410/TR3-00000000/2024",
        title: "PROSEDUR RAPAT TINJAUAN MANAJEMEN & BULANAN",
        templateUrl: "https://docs.google.com/document/d/1SuubkHReD0GacitAjUMDHyZX0Zp1dir_3S7d89xw4mQ/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.29.00.02",
        title: "NDE Undangan Rapat Tinjauan Manajemen 1",
        templateUrl: "https://docs.google.com/document/d/10dzNvSM-VEhP1e_qSzNhH8Sy4sbGyNu7EZELm4U6Fk4/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 01/UM410/2024",
        title: "Form Daftar Hadir RTM 1",
        templateUrl: "https://docs.google.com/document/d/1u7xMw5eDhhpfnHiOEjsllwSb-FKDZBz9UdtncIq_snA/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 02/UM410/2024",
        title: "Form MoM RTM 1",
        templateUrl: "https://docs.google.com/document/d/1Bu6uHP-Ckm0MD4hB-1tJSS4fdoFxEJW_q5hWh34b4zU/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.29.00.02",
        title: "NDE Undangan Rapat Tinjauan Manajemen 2",
        templateUrl: "https://docs.google.com/document/d/10dzNvSM-VEhP1e_qSzNhH8Sy4sbGyNu7EZELm4U6Fk4/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 01/UM410/2024",
        title: "Form Daftar Hadir RTM 2",
        templateUrl: "https://docs.google.com/document/d/1u7xMw5eDhhpfnHiOEjsllwSb-FKDZBz9UdtncIq_snA/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 02/UM410/2024",
        title: "Form MoM RTM 2",
        templateUrl: "https://docs.google.com/document/d/1Bu6uHP-Ckm0MD4hB-1tJSS4fdoFxEJW_q5hWh34b4zU/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.29.00.01",
        title: "NDE Undangan Rapat Bulanan-1",
        templateUrl: "https://docs.google.com/document/d/1kKygkQSX-6RvQyTK_rNxt1XTtrlOJ6pzFLylTCE6yKg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 01/UM410/2024",
        title: "Form Daftar Hadir Rapat Bulanan-1",
        templateUrl: "https://docs.google.com/document/d/1u7xMw5eDhhpfnHiOEjsllwSb-FKDZBz9UdtncIq_snA/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 02/UM410/2024",
        title: "Form MoM Rapat Bulanan-1",
        templateUrl: "https://docs.google.com/document/d/1Bu6uHP-Ckm0MD4hB-1tJSS4fdoFxEJW_q5hWh34b4zU/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.29.00.01",
        title: "NDE Undangan Rapat Bulanan-2",
        templateUrl: "https://docs.google.com/document/d/1kKygkQSX-6RvQyTK_rNxt1XTtrlOJ6pzFLylTCE6yKg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 01/UM410/2024",
        title: "Form Daftar Hadir Rapat Bulanan-2",
        templateUrl: "https://docs.google.com/document/d/1u7xMw5eDhhpfnHiOEjsllwSb-FKDZBz9UdtncIq_snA/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 02/UM410/2024",
        title: "Form MoM Rapat Bulanan-2",
        templateUrl: "https://docs.google.com/document/d/1Bu6uHP-Ckm0MD4hB-1tJSS4fdoFxEJW_q5hWh34b4zU/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.29.00.01",
        title: "NDE Undangan Rapat Bulanan-3",
        templateUrl: "https://docs.google.com/document/d/1kKygkQSX-6RvQyTK_rNxt1XTtrlOJ6pzFLylTCE6yKg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 01/UM410/2024",
        title: "Form Daftar Hadir Rapat Bulanan-3",
        templateUrl: "https://docs.google.com/document/d/1u7xMw5eDhhpfnHiOEjsllwSb-FKDZBz9UdtncIq_snA/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 02/UM410/2024",
        title: "Form MoM Rapat Bulanan-3",
        templateUrl: "https://docs.google.com/document/d/1Bu6uHP-Ckm0MD4hB-1tJSS4fdoFxEJW_q5hWh34b4zU/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.29.00.01",
        title: "NDE Undangan Rapat Bulanan-4",
        templateUrl: "https://docs.google.com/document/d/1kKygkQSX-6RvQyTK_rNxt1XTtrlOJ6pzFLylTCE6yKg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 01/UM410/2024",
        title: "Form Daftar Hadir Rapat Bulanan-4",
        templateUrl: "https://docs.google.com/document/d/1u7xMw5eDhhpfnHiOEjsllwSb-FKDZBz9UdtncIq_snA/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 02/UM410/2024",
        title: "Form MoM Rapat Bulanan-4",
        templateUrl: "https://docs.google.com/document/d/1Bu6uHP-Ckm0MD4hB-1tJSS4fdoFxEJW_q5hWh34b4zU/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.29.00.01",
        title: "NDE Undangan Rapat Bulanan-5",
        templateUrl: "https://docs.google.com/document/d/1kKygkQSX-6RvQyTK_rNxt1XTtrlOJ6pzFLylTCE6yKg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 01/UM410/2024",
        title: "Form Daftar Hadir Rapat Bulanan-5",
        templateUrl: "https://docs.google.com/document/d/1u7xMw5eDhhpfnHiOEjsllwSb-FKDZBz9UdtncIq_snA/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 02/UM410/2024",
        title: "Form MoM Rapat Bulanan-5",
        templateUrl: "https://docs.google.com/document/d/1Bu6uHP-Ckm0MD4hB-1tJSS4fdoFxEJW_q5hWh34b4zU/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.29.00.01",
        title: "NDE Undangan Rapat Bulanan-6",
        templateUrl: "https://docs.google.com/document/d/1kKygkQSX-6RvQyTK_rNxt1XTtrlOJ6pzFLylTCE6yKg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 01/UM410/2024",
        title: "Form Daftar Hadir Rapat Bulanan-6",
        templateUrl: "https://docs.google.com/document/d/1u7xMw5eDhhpfnHiOEjsllwSb-FKDZBz9UdtncIq_snA/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 02/UM410/2024",
        title: "Form MoM Rapat Bulanan-6",
        templateUrl: "https://docs.google.com/document/d/1Bu6uHP-Ckm0MD4hB-1tJSS4fdoFxEJW_q5hWh34b4zU/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.29.00.01",
        title: "NDE Undangan Rapat Bulanan-7",
        templateUrl: "https://docs.google.com/document/d/1kKygkQSX-6RvQyTK_rNxt1XTtrlOJ6pzFLylTCE6yKg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 01/UM410/2024",
        title: "Form Daftar Hadir Rapat Bulanan-7",
        templateUrl: "https://docs.google.com/document/d/1u7xMw5eDhhpfnHiOEjsllwSb-FKDZBz9UdtncIq_snA/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 02/UM410/2024",
        title: "Form MoM Rapat Bulanan-7",
        templateUrl: "https://docs.google.com/document/d/1Bu6uHP-Ckm0MD4hB-1tJSS4fdoFxEJW_q5hWh34b4zU/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.29.00.01",
        title: "NDE Undangan Rapat Bulanan-8",
        templateUrl: "https://docs.google.com/document/d/1kKygkQSX-6RvQyTK_rNxt1XTtrlOJ6pzFLylTCE6yKg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 01/UM410/2024",
        title: "Form Daftar Hadir Rapat Bulanan-8",
        templateUrl: "https://docs.google.com/document/d/1u7xMw5eDhhpfnHiOEjsllwSb-FKDZBz9UdtncIq_snA/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 02/UM410/2024",
        title: "Form MoM Rapat Bulanan-8",
        templateUrl: "https://docs.google.com/document/d/1Bu6uHP-Ckm0MD4hB-1tJSS4fdoFxEJW_q5hWh34b4zU/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.29.00.01",
        title: "NDE Undangan Rapat Bulanan-9",
        templateUrl: "https://docs.google.com/document/d/1kKygkQSX-6RvQyTK_rNxt1XTtrlOJ6pzFLylTCE6yKg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 01/UM410/2024",
        title: "Form Daftar Hadir Rapat Bulanan-9",
        templateUrl: "https://docs.google.com/document/d/1u7xMw5eDhhpfnHiOEjsllwSb-FKDZBz9UdtncIq_snA/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 02/UM410/2024",
        title: "Form MoM Rapat Bulanan-9",
        templateUrl: "https://docs.google.com/document/d/1Bu6uHP-Ckm0MD4hB-1tJSS4fdoFxEJW_q5hWh34b4zU/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.29.00.01",
        title: "NDE Undangan Rapat Bulanan-10",
        templateUrl: "https://docs.google.com/document/d/1kKygkQSX-6RvQyTK_rNxt1XTtrlOJ6pzFLylTCE6yKg/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 01/UM410/2024",
        title: "Form Daftar Hadir Rapat Bulanan-10",
        templateUrl: "https://docs.google.com/document/d/1u7xMw5eDhhpfnHiOEjsllwSb-FKDZBz9UdtncIq_snA/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 29 00 02/UM410/2024",
        title: "Form MoM Rapat Bulanan-10",
        templateUrl: "https://docs.google.com/document/d/1Bu6uHP-Ckm0MD4hB-1tJSS4fdoFxEJW_q5hWh34b4zU/edit?usp=sharing",
        targetCount: 1,
      },
    ],
  },
  {
    no: 36,
    name: "PROSEDUR IDENTIFIKASI PERATURAN",
    mainDocCode: "P.30/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/1CHOpVpq2ClpCvLB3mhfzvJ2A_TH6CkIrZIt5j4L2Myw/edit?usp=sharing",
    items: [
      {
        code: "P.30/UM410/TR3-00000000/2026",
        title: "PROSEDUR IDENTIFIKASI PERATURAN",
        templateUrl: "https://docs.google.com/document/d/1CHOpVpq2ClpCvLB3mhfzvJ2A_TH6CkIrZIt5j4L2Myw/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 30 00 01/UM410/2024",
        title: "Form Daftar Peraturan dan Persyaratan K3L",
        templateUrl: "https://docs.google.com/document/d/1dYqPp4j02w8V1SdRu546UQBNZzyzjYLdMx9StpyQdQI/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 30 00 02/UM410/2024",
        title: "Form Evaluasi Kepatuhan Peraturan Perundangan",
        templateUrl: "https://docs.google.com/document/d/1dYqPp4j02w8V1SdRu546UQBNZzyzjYLdMx9StpyQdQI/edit?usp=sharing",
        targetCount: 1,
      },
    ],
  },
  {
    no: 37,
    name: "PROSEDUR KEAMANAN DAN KESEHATAN BAGI KARYAWAN, TAMU DAN DISABILITAS",
    mainDocCode: "P.31/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/1WOYQ49pOERovSLT_DqcLgh_S0-7ck4PQNvxKGfkKnww/edit?usp=sharing",
    items: [
      {
        code: "P.31/UM410/TR3-00000000/2024",
        title: "PROSEDUR KEAMANAN DAN KESEHATAN BAGI KARYAWAN, TAMU DAN DISABILITAS",
        templateUrl: "https://docs.google.com/document/d/1WOYQ49pOERovSLT_DqcLgh_S0-7ck4PQNvxKGfkKnww/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 31 00 01/UM410/2024",
        title: "Form Deklarasi",
        templateUrl: "https://docs.google.com/document/d/1ExII96N831tApyQVwVJ_Nn5iK1ojwJxcupJpEXSFV3w/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 31 00 02/UM410/2024",
        title: "Form Himbauan Sanitasi",
        templateUrl: "https://docs.google.com/document/d/17oxpuHRdaOyWp0PDcTfbh0XE-4Gejv7cmgqzjQ-DKas/edit?usp=sharing",
        targetCount: 1,
      },
    ],
  },
  {
    no: 38,
    name: "PROSEDUR PENGENDALIAN & PENANGGULANGAN TUBERKOLOSIS",
    mainDocCode: "P.32/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/17IsdhZukEObHi_e_Bhw654lEFZqj1c4Xu9Da7Zhdkss/edit?usp=sharing",
    items: [
      {
        code: "P.32/UM410/TR3-00000000/2026",
        title: "PROSEDUR PENGENDALIAN & PENANGGULANGAN TUBERKOLOSIS DI TEMPAT KERJA",
        templateUrl: "https://docs.google.com/document/d/17IsdhZukEObHi_e_Bhw654lEFZqj1c4Xu9Da7Zhdkss/edit?usp=sharing",
        targetCount: 1,
      },
    ],
  },
  {
    no: 39,
    name: "PROSEDUR REWARD DAN PUNISHMENT SMK3L",
    mainDocCode: "P.33/UM410/COP-M3000000/2024",
    mainDocUrl: "https://docs.google.com/document/d/1DtDzbOtWjgZ161CiY3daa-0rxwy8kIA9MhztLIooZGs/edit?usp=sharing",
    items: [
      {
        code: "P.33/UM410/TR3-00000000/2026",
        title: "PROSEDUR REWARD DAN PUNISHMENT SMK3L",
        templateUrl: "https://docs.google.com/document/d/1DtDzbOtWjgZ161CiY3daa-0rxwy8kIA9MhztLIooZGs/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 33 00 01/UM410/2024",
        title: "Form Reward Hasil Audit Internal SMK3",
        templateUrl: "https://docs.google.com/document/d/1gbuJHcox5RlfGKM3cu9dvUGJhjewuRHmzcfkrTQKOdQ/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 33 00 02/UM410/2024",
        title: "Form Reward Implementasi Aplikasi SMK3",
        templateUrl: "https://docs.google.com/document/d/1eueR32tESuiMST1uYpSDhJ3lkg7-Kw7DegxcaJ0yfeY/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 33 00 03/UM410/2024",
        title: "Form Reward SROT Unit",
        templateUrl: "https://docs.google.com/document/d/1lJnxpfoyDzrts3FCgr0Qo4jpbH32jvu0BmpWDixlrwc/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "FM 33 00 04/UM410/2024",
        title: "Form Reward SROT Individu",
        templateUrl: "https://docs.google.com/document/d/1l5JSj1c31Fr3GlnVrDRkNcdqoqIcFNeE63FNfNoIjOI/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.33.00.01",
        title: "NDE Sanksi Pelanggran SMK3",
        templateUrl: "https://docs.google.com/document/d/1QQU0qYftj_087BgXuSersHsORyATpvNDVPi-i8e39s4/edit?usp=sharing",
        targetCount: 1,
      },
      {
        code: "LP.33.00.02",
        title: "Surat Sanksi Pelanggaran SMK3",
        templateUrl: "https://docs.google.com/document/d/1QvHHCZP5V58Y6PHhuMwbdSeW-WapemgL1v2q6fb2xAY/edit?usp=sharing",
        targetCount: 1,
      },
    ],
  },
];

// Helper untuk menghitung total target seluruh evidence master
export const TOTAL_EVIDENCE_COUNT = EVIDENCE_MASTER_DATA.reduce(
  (acc, group) => acc + group.items.reduce((itemAcc, item) => itemAcc + item.targetCount, 0),
  0
);
