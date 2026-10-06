-- Add APAR structures safely when legacy tables were already installed by db push.
-- Earlier migrations create the core application tables, including User.
DO $$ BEGIN
  CREATE TYPE "AparStatus" AS ENUM ('ACTIVE', 'IN_MAINTENANCE', 'REFILLED', 'DISPOSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "AparWarningStage" AS ENUM ('NORMAL', 'INFO_60', 'WARNING_30', 'URGENT_7', 'CRITICAL_1');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "NotificationStage" AS ENUM ('STAGE_60_INFO', 'STAGE_30_WARNING', 'STAGE_7_URGENT', 'STAGE_1_WHATSAPP');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "NotificationChannel" AS ENUM ('BELL_NOTIFICATION', 'DASHBOARD_BANNER', 'MODAL_POPUP', 'WHATSAPP_GATEWAY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "TipeNotifikasiApar" AS ENUM ('WEB_WARNING', 'WA_EXPIRED', 'EMAIL_EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "AparAsset" (
  "id" TEXT NOT NULL,
  "kodeApar" TEXT NOT NULL,
  "tipeMedia" TEXT NOT NULL DEFAULT '',
  "kapasitasKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "lokasiGedung" TEXT NOT NULL,
  "lokasiLantaiRuang" TEXT NOT NULL DEFAULT '',
  "tanggalProduksi" DATE,
  "tanggalRefillAkhir" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "tanggalKedaluwarsa" DATE NOT NULL,
  "status" "AparStatus" NOT NULL DEFAULT 'ACTIVE',
  "currentStage" "AparWarningStage" NOT NULL DEFAULT 'NORMAL',
  "isModalAcknowledged" BOOLEAN NOT NULL DEFAULT false,
  "picId" TEXT,
  "picNamaManual" TEXT,
  "picNomorWa" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AparAsset_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "AparAsset"
  ALTER COLUMN "tipeMedia" SET DEFAULT '',
  ALTER COLUMN "kapasitasKg" SET DEFAULT 0,
  ALTER COLUMN "lokasiLantaiRuang" SET DEFAULT '',
  ALTER COLUMN "tanggalRefillAkhir" SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN "picNomorWa" SET DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS "AparAsset_kodeApar_key" ON "AparAsset"("kodeApar");
CREATE INDEX IF NOT EXISTS "AparAsset_status_tanggalKedaluwarsa_idx" ON "AparAsset"("status", "tanggalKedaluwarsa");
CREATE INDEX IF NOT EXISTS "AparAsset_currentStage_idx" ON "AparAsset"("currentStage");
DO $$ BEGIN
  ALTER TABLE "AparAsset" ADD CONSTRAINT "AparAsset_picId_fkey"
    FOREIGN KEY ("picId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "NotificationLog" (
  "id" TEXT NOT NULL,
  "aparId" TEXT NOT NULL,
  "stage" "NotificationStage" NOT NULL,
  "channel" "NotificationChannel" NOT NULL,
  "recipient" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
  "expiredDateSnapshot" DATE NOT NULL,
  "rawResponse" JSONB,
  "errorMessage" TEXT,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "NotificationLog_aparId_stage_expiredDateSnapshot_key" ON "NotificationLog"("aparId", "stage", "expiredDateSnapshot");
CREATE INDEX IF NOT EXISTS "NotificationLog_recipient_status_idx" ON "NotificationLog"("recipient", "status");
CREATE INDEX IF NOT EXISTS "NotificationLog_sentAt_idx" ON "NotificationLog"("sentAt");
DO $$ BEGIN
  ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_aparId_fkey"
    FOREIGN KEY ("aparId") REFERENCES "AparAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "NotifikasiApar" (
  "id" TEXT NOT NULL,
  "aparId" TEXT NOT NULL,
  "tipe" "TipeNotifikasiApar" NOT NULL,
  "pesan" TEXT NOT NULL,
  "terkirimAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "tanggalExpiredSnapshot" DATE NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NotifikasiApar_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "NotifikasiApar_aparId_tipe_tanggalExpiredSnapshot_key" ON "NotifikasiApar"("aparId", "tipe", "tanggalExpiredSnapshot");
CREATE INDEX IF NOT EXISTS "NotifikasiApar_tipe_terkirimAt_idx" ON "NotifikasiApar"("tipe", "terkirimAt");
DO $$ BEGIN
  ALTER TABLE "NotifikasiApar" ADD CONSTRAINT "NotifikasiApar_aparId_fkey"
    FOREIGN KEY ("aparId") REFERENCES "AparAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
