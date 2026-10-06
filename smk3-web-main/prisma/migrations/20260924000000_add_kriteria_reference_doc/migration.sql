-- CreateTable
CREATE TABLE IF NOT EXISTS "KriteriaReferenceDoc" (
    "id" TEXT NOT NULL,
    "kriteriaNo" TEXT NOT NULL,
    "docNumber" TEXT NOT NULL,
    "docTitle" TEXT,
    "filePath" TEXT,
    "fileName" TEXT,
    "keterangan" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KriteriaReferenceDoc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "KriteriaReferenceDoc_kriteriaNo_key" ON "KriteriaReferenceDoc"("kriteriaNo");
