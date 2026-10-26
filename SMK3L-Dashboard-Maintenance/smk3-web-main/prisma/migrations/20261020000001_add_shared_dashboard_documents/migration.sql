CREATE TABLE "DashboardActivityDocument" (
  "id" TEXT NOT NULL,
  "activityId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'Unggahan',
  "blobPathname" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "pages" INTEGER NOT NULL DEFAULT 0,
  "uploadedById" TEXT NOT NULL,
  "uploadedByName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DashboardActivityDocument_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DashboardActivityDocument_blobPathname_key"
  ON "DashboardActivityDocument"("blobPathname");
CREATE INDEX "DashboardActivityDocument_activityId_createdAt_idx"
  ON "DashboardActivityDocument"("activityId", "createdAt");
