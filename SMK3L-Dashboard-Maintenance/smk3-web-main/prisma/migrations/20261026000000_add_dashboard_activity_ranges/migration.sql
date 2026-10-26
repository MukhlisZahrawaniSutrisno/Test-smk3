-- Additive only: existing activity document IDs and uploaded files are untouched.
CREATE TABLE "DashboardActivity" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT '',
  "owner" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "reason" TEXT NOT NULL DEFAULT '',
  "plannedDate" DATE NOT NULL,
  "plannedEndDate" DATE NOT NULL,
  "rescheduledDate" DATE,
  "rescheduledEndDate" DATE,
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "DashboardActivity_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "DashboardActivity_planned_range_check" CHECK ("plannedDate" >= DATE '2026-01-01' AND "plannedEndDate" >= "plannedDate" AND "plannedEndDate" <= DATE '9999-12-31'),
  CONSTRAINT "DashboardActivity_rescheduled_range_check" CHECK (("rescheduledDate" IS NULL AND "rescheduledEndDate" IS NULL) OR ("rescheduledDate" IS NOT NULL AND "rescheduledEndDate" IS NOT NULL AND "rescheduledDate" > "plannedDate" AND "rescheduledEndDate" >= "rescheduledDate" AND "rescheduledEndDate" <= DATE '9999-12-31')),
  CONSTRAINT "DashboardActivity_status_check" CHECK ("status" IN ('upcoming','completed','missed','rescheduled') AND ("status" <> 'rescheduled' OR "rescheduledDate" IS NOT NULL)),
  CONSTRAINT "DashboardActivity_version_check" CHECK ("version" > 0)
);
CREATE INDEX "DashboardActivity_deletedAt_plannedDate_idx" ON "DashboardActivity"("deletedAt", "plannedDate");
