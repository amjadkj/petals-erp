# Page: Client profile

Route: `/clients/[id]` (same tab as the list) · Header title: "Clients" · breadcrumb `← Clients / Aadhya Nair`
Source: **derived from PRD 4.1.4 and the API (no mockup supplied)**. Follow the Employees detail page for visual structure (profile header card, underline tabs, stat cards).
API: `GET /clients/:id` (header + `allowedTabs`) · `/overview` · `/assessments` · `/treatment-plans` · `/goals` · `/subgoals/:id/progress-entries` · `/clients/:id/reports` · `/documents` · `/clients/:id/appointments` · `/guardians`.

## 1. Header card
Avatar initials, name, client code (`PN-001`), age, department chip(s), branch, status chip (Active / On hold / Discharged), assigned therapists (avatars). Actions: `Edit` (modal), `Send message` (Communication), `Schedule session`.

## 2. Tabs (permission driven)
Tab list is built from `allowedTabs` returned by the server. Hidden tabs are removed, not greyed. Mobile: tabs scroll horizontally or become a select.

1. **Overview**: demographics, guardian cards (name, relation, phone, WhatsApp, email, primary badge, visibility flags), case history, assigned therapists. Manager sees administrative data only (case history stripped).
2. **Assessment details**: list of assessments (date, tool, assessor, scores as mini bars, observation, summary). `+ Add assessment` opens a modal (date, tool, observation, scores key-values, summary).
3. **Payment & treatment plans**: plans as cards (department, therapist, sessions/week, minutes, fee/session, dates, status chip) and a payments summary (Paid / Pending / Advance balance) with link to invoices. `+ New plan` is a full-width drawer or page (larger form).
4. **Progress**: baseline per domain, long-term goals as expandable cards, each with sub-goals grouped Daily / Weekly / Monthly. Each shows description, status (Not started / In progress / Achieved / Discontinued), and a timeline of progress entries (date, description, client response, remarks, level: Regressed / No change / Emerging / Progressing / Achieved). `+ Add progress entry` is a modal. Edit/delete only for the author or the Director; every edit keeps version history ("View history" link, Director can restore).
5. **Reports**: table (title, type, due date, status Draft / Submitted / Reviewed / Shared, author). `Share with parent` action. Opens the report editor page.
6. **Documents**: upload dropzone (signed URL flow), list with type, date, "Shared with parent" switch, download.
7. **Sessions**: history (cursor paginated): date, time, therapist, attendance chip, notes, linked goals.

## 3. Shared cases
When a client has several therapists, each can view the other therapists' notes, goals and progress, but only the author and Director can edit. Show an "Author: Name" label on entries.

## 4. Parent view
Parent sees only the tabs the clinic allowed: Overview, Payment plan (status only: Paid / Pending / Advance), Assessment, Reports (shared only). Everything read-only; `Download` for shared reports. If a parent has several children, a child switcher sits in the header card.

## 5. Mobile
Header card compacts (avatar, name, chips). Tabs scroll horizontally. Goal cards are accordions. Create actions are floating buttons or modals as bottom sheets.
