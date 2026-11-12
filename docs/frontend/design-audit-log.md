# Page: Audit log

Route: `/role-access/audit-log` · Header title: "Audit log" · Reached from the `Audit log` buttons on Role access and Branches.
Source: **derived from PRD 5 and 8 and the Phase 06 API (no mockup supplied)**. Director only.
API: `GET /audit-logs?cursor&limit&userId&entity&branchId&startDate&endDate` · `GET /clinical/history/:entityType/:entityId` · `POST /clinical/history/:entityType/:entityId/restore` (Director).

## 1. Layout
Breadcrumb `← Role access / Audit log`. Hero: "Every change, accounted for." · sub: "Who did what, and when."
**Filters:** user, entity (User, Branch, Assessment, …), branch, date range. Export optional.
**Table (cursor paginated, `Load more`):** Time · User (avatar + name) · Action (Create / Update / Delete / View / Login / Permission change) · Entity · Branch · Summary. Row click opens a drawer with metadata (sensitive fields are redacted by the server).

## 2. Version history (inside clinical pages)
`View history` on a clinical entry opens a drawer: versions with who, when, previous content (diff highlighted). Director sees `Restore this version` with a required reason (modal).

## 3. Mobile
Rows become cards; filters in a bottom sheet; detail drawer is a bottom sheet.
