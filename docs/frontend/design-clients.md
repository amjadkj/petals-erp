# Page: Clients (list) and Add client modal

Route: `/clients` · Header title: "Clients"
Source: mockup (list and Add client modal). Module: CLIENTS.
API: `GET /clients?page&pageSize&branchId&departmentId&therapistId&status&search&sort` · `POST /clients` (with optional `guardians[]`).

## 1. Layout (desktop)
**Hero:** "Care begins with knowing each child." · sub: "Manage client details, care teams, and session attendance in one place." · actions `Export` (outline), `+ Add client` (primary).

**Stat cards (3):** Active clients 128 ("Currently receiving care") · New this month 12 ("8 more than October") · Departments 3 ("Speech · OT · Behaviour").

**Filter bar:** search ("Search clients", name or code) · `All departments` · `All therapists` · `Active clients` (status: Active / On hold / Discharged) · `Reset filters` link.

**Table card:**
- Tabs: `All clients` (default), `My recent`, `Archived` · count on the right ("128 clients").
- Columns: checkbox · **Client** (avatar initials, name, code like `PN-001`) · **Department** · **Assigned therapist** · **Scheduled** · **Attended** · **Status** chip · chevron.
- Avatar tint alternates purple/teal.
- Footer: `Showing 1–10 of 128 clients` and numbered pagination (‹ 1 2 3 … 13 ›).
- Row click opens **Client profile in the same tab** (`/clients/[id]`), per PRD 4.1.3. Row checkbox enables bulk actions (Export selected, and later Send message).
- Sortable by Client name, Status, created date (whitelisted API sorts).

## 2. Add client (modal) (mockup)
Title "Add client" with close X. Section label `CHILD & GUARDIAN DETAILS`.

| Field | Type | Required |
| --- | --- | --- |
| Child's full name | text | Yes |
| Date of birth | date picker | Yes |
| Branch | select (user's branches) | Yes |
| Guardian name | text | Yes |
| Mobile number | tel with `+91` prefix | Yes |
| Department | select | Yes |
| Guardian email | email | No (but needed for parent portal login) |
| Consent checkbox | "Guardian consents to storing care information and receiving clinic updates. Read the privacy notice." | Required to submit |

- Footer: `Cancel` (outline), `Add client` (primary, disabled until valid).
- Maps to `CreateClientDto` (`branchId`, `name`, `dob`) plus one guardian (`name`, `phone`, `email`, `relation`, `whatsappConsent`, `emailConsent`). The consent checkbox sets both consent flags.
- Note for dev: the mockup has no Relation field, but the API requires `relation`. Default to "Guardian" or add a select (see open questions).
- On success: toast, close modal, navigate to the new client's profile (or stay on the list, to be decided).
- Server returns an auto client code (`BRANCH-YYYY-NNNN`).

## 3. Role behaviour
- Director: all branches, all columns.
- Manager: administrative columns only (no clinical data).
- Therapist: only assigned clients; no Add client unless granted.
- Parent: module off. Parents use the child profile instead.

## 4. Mobile
- Stat cards in a horizontal 2-up grid (or 3 compact chips).
- Search stays visible; the three filters collapse into a `Filters` bottom sheet.
- Rows become cards: avatar, name + code, department · therapist, `Attended / Scheduled` as `18 / 24`, status chip top-right. Tap opens the profile.
- Tabs scroll horizontally. Pagination becomes `Load more` or compact `‹ 1 / 13 ›`.
- `+ Add client` becomes a floating action button. The Add client modal is a bottom sheet with two columns collapsed to one.

## 5. States
Empty: "No clients yet. Add your first client to begin." Filtered empty: "No clients match these filters" with `Reset filters`. Skeleton rows while loading.
