-- CreateTable
CREATE TABLE "EvidenceSmk3" (
    "id" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "periode" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "keterangan" TEXT,
    "uploadedBy" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvidenceSmk3_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceSmk3_itemCode_area_periode_key" ON "EvidenceSmk3"("itemCode", "area", "periode");
