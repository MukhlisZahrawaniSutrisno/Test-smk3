# Dashboard SMK3L UI Design

## Goal and boundaries

Make the existing SMK3L dashboard calmer and easier to scan while preserving all current behavior. This is a UI-only change. Do not edit seed activities, user-created activities, attachment records, document blobs, IndexedDB/local-storage keys or values, APIs, or database schema. New presentation state such as the selected agenda view stays in memory and is not written to storage.

Keep the corporate light palette: white and slate surfaces, subtle borders and shadows, clear typography using the existing Plus Jakarta Sans/Inter stack, and Telkom red `#E30613` for primary actions and active states. Avoid dense decoration, excessive colors, and competing card treatments.

## Existing behavior to preserve

- Four KPI cards and their existing calculations.
- Search, status, and year filters.
- The 12-month selector and all 24 seeded 2026 activities.
- Add, edit, delete, and reschedule activity flows.
- Existing activity and template uploads, previews, downloads, and deletion.
- Client-side PDF merging through `pdf-lib`.
- Current browser-local persistence and document ownership behavior.

## Agenda presentation

Add a compact, accessible **Table / Grid** view switch beside the existing agenda filters. Table remains the default. Both views consume the same filtered activity list and use the same current data; changing the view must not change sorting, filtering, status, dates, or saved records.

The table keeps the current columns and quick document actions. The grid view presents each activity as a restrained card with month, status, name, description, planned date, re-agenda date, document shortcuts, and the existing activity action menu. On narrow screens, keep the current responsive activity cards and avoid introducing horizontal scrolling. Clearly show the selected view with `aria-pressed` and visible focus states.

## Document management presentation

Present the existing document-management dialog as a right-side drawer on desktop and a full-width sheet on small screens. Preserve its current controls and layout order: PDF merger first, then template management and activity evidence. Keep the top close `X`, the bottom **Selesai** action, backdrop behavior, and keyboard focus behavior. Opening and closing the drawer must not alter activity or document data.

## Interaction and visual details

- Keep the current red primary buttons and use slate for secondary actions.
- Use restrained shadows and consistent corner radii; give the drawer a clear edge and backdrop without obscuring context excessively.
- Keep document view/download shortcuts labeled accessibly; disable download when an activity has no documents.
- Preserve all existing confirmation dialogs and success/error notifications.
- Respect reduced-motion preferences for drawer transitions.

## Acceptance checks

1. Existing 24 seeded activities and all stored data are unchanged after switching views or opening/closing the drawer.
2. Table and grid display identical filtered activities; all existing activity and document actions still work from their supported layouts.
3. The document drawer opens and closes from its top `X`, bottom **Selesai** action, and backdrop, and remains usable on desktop and mobile without horizontal overflow.
4. The four KPI values, month selector, filters, activity CRUD/rescheduling, document upload/management, and PDF merger remain available.
5. Verify inline JavaScript syntax, `git diff --check`, and a browser smoke check at desktop and mobile widths.
