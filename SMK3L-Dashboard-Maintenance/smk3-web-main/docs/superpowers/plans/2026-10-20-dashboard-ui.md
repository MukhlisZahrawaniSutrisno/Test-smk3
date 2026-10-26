# SMK3L Dashboard UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the 2026 SMK3L dashboard easier to scan by adding a table/grid switcher and presenting document management as a responsive drawer, without changing application data or storage.

**Architecture:** Keep the existing single-file HTML application and its current state, filtering, activity CRUD, document, and PDF-merger functions. Add only presentation markup, CSS, and ephemeral view state in `public/dashboard-smk3l-2026.html`; keep the existing native `<dialog>` behavior for the document drawer.

**Tech Stack:** HTML5, CSS, Vanilla JavaScript ES6, Lucide Icons CDN, `pdf-lib` CDN; no new dependencies.

**Spec:** `smk3-web-main/docs/superpowers/specs/2026-10-20-dashboard-ui-design.md`

## Global Constraints

- Preserve all existing activity values, attachments, browser storage keys and values, API behavior, and database schema.
- The agenda view selection is in-memory only and is not persisted.
- Preserve the four KPI cards, filters, 12-month selector, 24 seeded activities, CRUD/rescheduling, document management, and client-side PDF merger.
- Keep Telkom red `#E30613`, white/slate surfaces, existing Plus Jakarta Sans/Inter typography, accessible labels, and reduced-motion support.
- Do not add dependencies or introduce horizontal overflow at mobile widths.

## Review Focus

- Filtering, year changes, activity updates, and document counts must stay synchronized in both agenda views; check both views after search/status/year/month filters.
- Empty document lists must retain usable view behavior and disable unavailable download actions; check an activity with no attachments.
- Drawer close, backdrop, and Escape interactions must remain consistent; test each close path without changing the data snapshot.
- Long activity titles, descriptions, and document names must wrap without clipping; check desktop and narrow mobile widths.
- Reduced-motion mode must not leave the drawer hidden or open; verify the drawer remains usable when reduced motion is enabled.

---

### Task 1: Add accessible table/grid agenda presentation

**Files:**
- Modify: `smk3-web-main/public/dashboard-smk3l-2026.html`

**Interfaces:**
- Consumes: Existing `filteredActivities()`, `badge(activity.status)`, `documentButtons(activity)`, and `actionButtons(activity)`.
- Produces: In-memory `agendaView` state (`'table' | 'grid'`), a toolbar switch with `data-view` buttons, and `#gridSchedule` cards rendered from the same filtered activity list.

- [ ] Add **Tabel** and **Kartu** controls beside agenda filters with `aria-pressed`, keyboard focus styling, and table selected by default.
- [ ] Render grid cards from the same `visible` activities as the existing table, retaining month, status, name, description, dates, document shortcuts, and the existing action menu.
- [ ] Update the view switch handler to change presentation only; do not write to IndexedDB/local storage or mutate activity/document records.
- [ ] Verify with a browser smoke check that search, status, year, and month filters show the same activity set in both views and that activity actions work in each view.
- [ ] Verify no horizontal overflow at 360px, 768px, and 1440px; run inline script syntax check and `git diff --check`.

### Task 2: Present document management as a responsive drawer

**Files:**
- Modify: `smk3-web-main/public/dashboard-smk3l-2026.html`

**Interfaces:**
- Consumes: Existing `#documentDialog`, `openDocuments(id)`, `renderDocuments()`, dialog backdrop/close handlers, and all merger/document controls.
- Produces: The same document dialog displayed as a right-side desktop drawer and a full-width mobile sheet, retaining top **X**, bottom **Selesai**, and existing close semantics.

- [ ] Style the native document dialog as a right-side drawer on desktop and full-width sheet on narrow screens; retain the current content order and working scroll behavior.
- [ ] Add a restrained backdrop/edge treatment and a reduced-motion-safe entrance transition without changing data or dialog event behavior.
- [ ] Verify top **X**, bottom **Selesai**, backdrop click, and Escape close the drawer; compare a test-profile snapshot of activities and documents before and after opening/closing.
- [ ] Verify the merger, template management, upload, preview, download, and delete actions remain available and usable at 360px and 1440px; run inline script syntax check and `git diff --check`.

### Task 3: Final preservation review

**Files:**
- Review: `smk3-web-main/public/dashboard-smk3l-2026.html`
- Review: `smk3-web-main/docs/superpowers/specs/2026-10-20-dashboard-ui-design.md`

**Interfaces:**
- Consumes: Completed agenda and drawer presentation.
- Produces: Verified UI-only diff with no storage/data edits.

- [ ] Inspect the diff and confirm only markup, CSS, and ephemeral view-state/rendering changed; reject changes to seed data, record serialization, storage keys, or persistence functions.
- [ ] Run the browser smoke checks above against an isolated test profile and confirm the 24 seeded activities remain unchanged.
- [ ] Commit the verified UI changes.
