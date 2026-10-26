# Activity Date Ranges Implementation Plan

> **For agentic workers:** Use subagent-driven-development for independent range logic and backend work; integrate HTML and verification in the main agent.

**Goal:** Extend the existing calendar with inclusive multi-day activities and database persistence.

**Architecture:** Keep existing table/calendar dialogs. Add a dependency-free range helper and weekly lanes; add authenticated PostgreSQL schedule CRUD while preserving legacy browser data and IDs.

**Tech Stack:** Existing Next.js 16.1, Prisma 5.22/PostgreSQL, plain JavaScript/CSS, node:test, installed browser automation.

**Spec:** `docs/superpowers/specs/2026-10-26-activity-date-ranges-design.md`

## Global Constraints

Preserve main design, Telkom watermark, silent bell, stable activity/document IDs, single-day backwards compatibility. No new application dependencies. Work in the established maintenance copy; do not overwrite the distinct tracked root application or old ZIP releases.

## Tasks

- [x] Range logic: test inclusive durations, date validity, effective ranges, inclusive intersections, stable weekly lanes and overflow; implement `public/calendar-range.js` with `activityRange`, `inclusiveDays`, `overlaps`, `layoutWeek` and standalone date helpers.
- [x] Backend: tests first, additive Prisma model/migration, validation, authenticated CRUD plus atomic empty-database initialization and version conflict checks. Confirm schema and generated client.
- [x] Existing HTML integration: paired date inputs and duration on add/edit/reschedule, render connected fragments in existing date buttons, update date/month/year filtering and unique counts, show complete ranges in detail/list/document views.
- [x] Persistence integration: load server before mutations; initialize once, write through API before local success, preserve local mode with truthful status; propagate conflict/failure instead of claiming success.
- [x] Verification: full tests, targeted lint, TypeScript/build, browser multi-day CRUD/filter/navigation/reload tests, existing silent bell regressions, desktop/mobile screenshots and independent review. Exercise PostgreSQL if available.
- [x] Release: document setup/migration and limitations, package v7.0 with verified archive entries; preserve older ZIP files.

## Review focus

Prevent stale browser overwrite, duplicate counting, invisible middle-date events, broken row alignment on mobile, and loss of legacy activity/document relationships. Do not assume a database-backed save passed without evidence.
