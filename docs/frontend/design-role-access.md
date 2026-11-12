# Page: Role access (Permission Manager and Branches)

Route: `/role-access` with tabs `/role-access/permissions` and `/role-access/branches` · Sidebar item: "Role access" (active on both tabs) · Header title: "Role access" (Branches tab shows "Branches")
Source: mockups (Permission Manager, Branch management). Director only (module ROLE_ACCESS).
API: `GET /access/roles` · `GET /access/roles/:roleKey` · `PUT /access/roles/:roleKey/modules` · `PUT /access/roles/:roleKey/permissions` · `GET/PUT/DELETE /access/overrides/:userId` · `GET/POST/PATCH/DELETE /branches` · `GET /users` · `GET /audit-logs`.

## 1. Shared header
Tabs under the hero: `Permissions | Branches`. Hero actions on Permissions: `Manage branches`, `Audit log` (both outline). On Branches: `Audit log` (outline), `+ Create branch` (primary).

## 2. Permissions tab (mockup)
**Hero:** "Permission Manager" · sub: "Director only · Define role access and manage exceptions with confidence."

**Left column (roles panel):** inner tabs `Roles | User overrides`.
- Roles list as selectable cards: **Manager** (3 team members), **Therapist** (14 therapists), **Parent** (128 client families). Selected = purple fill.
- "How access works" legend: ✓ Allowed · ☐ Not granted · — Not applicable.
- Rules: "View is required: turning View off clears every other action in that row." · "Module off, settings kept: saved checks stay visible but inactive until the module is on." · "ViewAll needs View: expands the data scope; it cannot be granted alone."
- Footer card (purple-50): "Operational access: Clinical content is not available to this role." (Manager).

**Right card:** title "Manager permissions", subtitle "Front office, billing follow-up, HR admin and leads.", `Reset role` (outline).
Table columns: **Module · Module on · Create · Update · View · ViewAll · Delete.**
- Module on = toggle switch (purple on).
- Action cells: purple checkbox (allowed), empty outlined box (not granted), grey dash (not applicable), grey checked/disabled box (saved but inactive while module off).
- Sub-modules are indented with a small dash and a muted caption: Clients → Assessment (Clinical, not available), Payment & Treatment Plans, Progress (not available), Reports (not available), Documents, Sessions; Financial → Financial P&L; Employees → Employees salary; plus rows such as Schedule planning ("Director only").
- Row rules enforced in the UI **and** by the server:
  - Turning View off clears Create, Update, ViewAll, Delete in that row (cells shown as disabled/empty) with an inline notice banner (teal-50): "Reports: View is off, so Create, Update, ViewAll and Delete are cleared."
  - ViewAll needs View. Create/Update/Delete need View.
  - Module off greys the row (switch off, saved checks retained, disabled).
  - Not-applicable actions (for example Create on Dashboard) render a dash and are not clickable.
- Parent role: only module toggle and View are offered; Create, Update, Delete and ViewAll show dashes.
- Director is not editable (always full access).
- **Autosave:** every toggle saves immediately (optimistic update, rollback on error). Footer strip: "Changes apply immediately · Saved just now · All changes are recorded in the audit log." with an `Audit log` button.

**User overrides sub-tab:** search user, pick a user, see role defaults vs overrides in the same grid; overridden cells carry a small purple dot and a `Clear override` action (`DELETE /access/overrides/:userId?module&action`).

## 3. Branches tab (mockup)
**Hero:** "Branch management" · sub: "Director only · Create branches and give each team the right location access."

**Branch cards (2 across):** building icon, branch name, Active chip, address line, `Branch code: IND`, `Manage →`, stats row (`12 users`, `75 active clients`, `6 rooms`).
- `Manage` opens a drawer to edit name, address, code, rooms, active/inactive (deactivate, not delete).

**User branch assignments card:** title, `Assign users` (primary). Filters: search users, `All branches` select, summary "18 users · 4 multi-branch". Table: User · Role · Assigned branches (chips; Director shows "All Branches" purple chip) · Access ("Full access" for Director, "Role-based" others) · `Edit` link. Footer pagination.
- **Create branch** (modal): Name, Code (3 letters), Address, City, Rooms count, Active. `Cancel` / `Create branch`.
- **Assign users** (modal): user multi-select, branch multi-select, `Save assignments`.
- **Edit** (modal): per-user branch checkboxes.

## 4. Mobile
Roles list becomes a horizontally scrollable chip row above the matrix. The permission matrix becomes **accordions per module** (module toggle in the header, five small toggles/checks inside) because a 7-column table cannot fit. Branch cards stack. Assignment table becomes cards. Footer status strip becomes a snackbar.
