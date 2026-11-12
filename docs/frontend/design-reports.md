# Page: Reports

Route: `/reports` (list), `/reports/[id]` (editor/viewer) · Header title: "Reports"
Source: **derived from PRD 4.1.13, 4.2, 4.4 and the Phase 11 API (no mockup supplied)**. Reuse the Clients list pattern. Module: REPORTS.
API: `GET /reports/due` (Director/Manager, with `overdueOnly`) · `GET/POST /clients/:id/reports` · `GET/PATCH /reports/:id` · `POST /reports/:id/share` · `POST /reports/check-overdue` · documents upload via signed URLs.

## 1. Layout (Director / Manager)
**Hero:** encouraging headline (for example "Reports that help families see progress.") · action `Export`.
**Stat cards:** Reports due (7) · Overdue (3) · Due this week (4) · Shared with parents.
**Filters:** search · therapist · client · department · type (Assessment, Progress, Discharge, Other) · status · `Overdue only` toggle.

**Table:** Client · Report title/type · Therapist · Due date · Status chip (Draft, Submitted, Reviewed, Shared) · Overdue marker (red tint row with "Overdue by 2 days") · chevron.
- Row action `Send reminder` for overdue items (Director and Manager).
- Click opens the report page.

## 2. Therapist view
Same table limited to own cases, with `+ New report` (modal for metadata: client, type, title, due date, then continues on the editor page). Tabs: `Due`, `Drafts`, `Submitted`.

## 3. Report page
- Header: client, type, status chip, due date, author. Actions: `Save draft`, `Submit`, `Review` (Director), `Share with parent` (confirm modal: "Parent will be notified").
- Body: rich-text content area (or attached file with upload). Version history link (edits keep original versions).
- Status flow: Draft → Submitted → Reviewed → Shared.

## 4. Parent view
List of **shared** reports only: title, date, therapist, `Download`. No edit rights.

## 5. Mobile
Table → cards with overdue highlighted. Editor uses a single column with a sticky action bar at the bottom (Save / Submit). Share is a bottom sheet.
