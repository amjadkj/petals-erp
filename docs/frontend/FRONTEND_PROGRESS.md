# Petals ERP Frontend Progress Log

## Phase A: Foundation, Shell, Auth, Shared UI & PWA Setup
- **Status:** Complete
- **Date:** 2026-11-12
- **Scope:** `apps/web`

### 1. What was built:
- **Design Foundations & Tokens:**
  - Tailwind CSS 3 configuration with exact color tokens (Purple, Teal, Ink, Semantic danger/warning/success).
  - PostCSS configuration with Autoprefixer.
  - Global styles (`src/styles/globals.css`) with Quicksand and Inter font variables, safe-area insets.
  - Root layout (`src/app/layout.tsx`) self-hosting Quicksand (weights 600, 700) and Inter (weights 400, 500, 600).
  - React Query provider & custom Toast notification provider.
- **PWA Setup:**
  - Web App Manifest (`public/manifest.json`) standalone mode, `#6C3995` theme color.
  - High-res icons in SVG & PNG format (`192x192`, `512x512`, `maskable 512x512`).
  - `@serwist/next` configured in `next.config.ts`.
  - Service worker (`src/app/sw.ts`) with app shell precaching and runtime caching.
  - Install prompt banner component (`InstallBanner.tsx`) with second-visit detection.
  - Offline detector bar (`OfflineBanner.tsx`).
- **Core Library & Typed API Client (`src/lib/`):**
  - Base fetcher (`fetcher.ts`) with CSRF token handling, in-memory bearer token, automatic silent refresh on 401, active branch query injection, and permission error interception.
  - API modules: `auth.ts`, `clients.ts`, `appointments.ts`, `finance.ts`, `leads.ts`, `hr.ts`, `employees.ts`, `communication.ts`, `reports.ts`, `access.ts`, `branches.ts`, `dashboard.ts`, `schedules.ts`.
  - Auth session state in-memory (`session.ts`), CSRF cookie utility (`csrf.ts`), route guard (`guards.tsx`).
  - Zustand permission store (`permissions/store.ts`) with localStorage persistence for branch and sidebar state.
  - RBAC hook (`usePermissions.ts`), conditional render component (`Can.tsx`), and dynamic navigation builder (`navBuilder.ts`).
- **Shared UI Component System (`src/components/ui/`):**
  - Button (primary, teal, outline; 44px min-touch)
  - StatusChip (all states: attended, scheduled, pending, cancelled, advance, paid, etc.)
  - StatCard (Quicksand 32px metrics, skeleton state)
  - Input, Select, DatePicker, Checkbox, Switch
  - Tabs, SegmentedControl
  - DataTable (responsive: table view on desktop, card view on mobile; offset pagination)
  - Modal (centred desktop, BottomSheet on mobile)
  - BottomSheet, FilterBar, FiltersSheet, Toast
  - EmptyState, Skeleton, Avatar, ConfirmDialog, Drawer, Badge, Tooltip, Popover, ProgressBar
- **App Shell Components (`src/components/shell/`):**
  - Sidebar: collapsible 240px to 72px icon rail with keyboard shortcut `[`, brand logo, workspace nav, user card.
  - Header: sticky 88px desktop / 64px mobile, page title hook integration, BranchSwitcher, GlobalSearch with `Ctrl+K` shortcut, NotificationsPopover, UserMenu.
  - MobileDrawer: responsive off-canvas menu for mobile viewports.
  - InactivityLock: 15-minute idle detection overlay with re-authentication.
- **Route Skeleton (`src/app/`):**
  - Auth routes: full implementations for `/login`, `/login/2fa`, `/login/otp`.
  - Authenticated layout `(app)/layout.tsx` wrapping all subpages in the unified shell.
  - Placeholder pages for all 11 modules: dashboard, appointments, clients, schedule planning, financial, communication, leads, hrms, employees, reports, role-access, plus audit log and dynamic detail pages (`clients/[id]`, `employees/[id]`, `reports/[id]`).
  - Custom friendly 404 (`not-found.tsx`) and 403 (`403.tsx` and `403/page.tsx`).
- **Testing & Tooling:**
  - Vitest + JSDOM test suite covering core UI primitives (`Button`, `StatusChip`, `StatCard`, `DataTable`).
  - Playwright configuration with desktop and iPhone viewports.

### 2. Test & Verification Status:
- TypeScript (`tsc --noEmit`): Clean (0 errors)
- ESLint (`eslint`): Clean (0 errors, 0 warnings)
- Vitest unit tests: 16/16 Passing across 4 test suites
- Next.js production build (`next build`): Success (20 routes compiled, PWA sw bundled)
- Commit Hash: `a98b717`


## Phase B: Core Pages Implementation (13 ERP Modules)
- **Status:** Complete
- **Date:** 2026-11-12
- **Scope:** `apps/web/src/features/`, `apps/web/src/app/(app)/`

### 1. What was built:
- **Track 1: Clinical Pages:**
  - **Dashboard (`features/dashboard/`):**
    - 4 role-specific views (Director, Manager, Therapist, Parent).
    - Stat cards for sessions, active clients, new leads, revenue, pending payments, reports due, staff present.
    - Widgets: Therapist utilisation progress bars, Centre pulse actionable alerts, Today's sessions table with status chips, Overdue reports with reminder action, Parent upcoming schedule widget with child switcher.
    - Configure Widgets modal with local persistence.
  - **Clients (`features/clients/`):**
    - Searchable, filterable client table with All / My recent / Archived tabs.
    - Stat cards for Active clients, New this month, Departments.
    - Responsive table-to-card view on mobile.
    - Add Client modal with child DOB, branch selector, guardian details, relationship select, and privacy consent checkbox.
  - **Client Profile (`features/client-profile/`):**
    - Profile header with demographic chips, status badge, assigned care team avatars.
    - 7 permission-driven tabs via `allowedTabs`:
      1. Overview (guardians, demographics, case history).
      2. Assessments (scores visualization, + Add Assessment modal).
      3. Treatment Plans (frequency, fee, session count, + New Treatment Plan drawer).
      4. Progress (domain baselines, long-term goals, subgoals grouped Daily/Weekly/Monthly, progress entry timeline).
      5. Reports (report records, share with parent toggle).
      6. Documents (file dropzone upload and viewer).
      7. Sessions (attendance logs, attendance status chips, linked goals).
    - Edit Client modal and role-based filtering (Manager administrative view, Parent view-only).
  - **Appointments (`features/appointments/`):**
    - Interactive weekly, daily, and monthly IST calendar grid (9:00 - 17:00).
    - Real-time teal current-time line indicator.
    - Column splitting for concurrent therapist sessions.
    - Cancelled sessions marked with strikethrough styling and tooltip.
    - Session detail drawer with Mark Attended, Mark No-show, Reschedule, and Cancel flows.
    - New Appointment modal with conflict detection (409 feedback) and therapist availability filtering.
    - Mobile Agenda view with horizontal day strip.
  - **Schedule Planning (`features/schedule-planning/`):**
    - Recurring schedules table with frequency, date range, and pause/end actions.
    - Therapist availability matrix with leave/holiday hatched cells.
    - Needs Attention tab highlighting sessions affected by approved leaves or holidays.
    - New Recurring Schedule modal with rolling window generation and live date preview.

- **Track 2: Operations Pages:**
  - **Financial (`features/financial/`):**
    - Payments tab with INR formatting (Lakh shorthand), receipt status chips, PDF receipt download.
    - Teal primary CTA for Record Payment modal (client invoice search, payment method, auto receipt generation).
    - "A gentle reminder can help" overdue accounts panel with WhatsApp reminder integration.
    - Revenue Overview with day/week/month trend charts, department breakdown, and category distribution.
    - Profit & Loss tab (permission-gated with `FINANCIAL_PNL`) comparing revenue vs expenses.
    - Expenses tab with `+ Add Expense` modal.
    - Monthly tracking tab comparing billed, collected, and pending amounts.
  - **Leads (`features/leads/`):**
    - 5-stage Kanban board (New, Contacted, Assessment Scheduled, Converted, Lost) with drag-and-drop.
    - Stage transition protection: dragging to Converted opens Convert to Client modal (preventing invalid direct transitions).
    - Lead card highlighting overdue follow-ups and converted status bands.
    - Lead detail drawer with timeline, notes, and quick actions.
    - Convert to Client modal prefilling child data, guardian contacts, and department intake.
    - List view toggle with sortable table.
  - **HRMS (`features/hrms/`):**
    - Attendance tab with live Check-in/Check-out button, daily staff list, monthly employee matrix, and manual entry modal.
    - Leave tab with 4 leave balance cards (Casual, Sick, Earned, Pending), leave requests table with Approve/Reject actions, and Director away/backup availability toggle.
    - Holiday calendar tab with interactive month view, clinic closure markers, and Add Holiday modal.
  - **Employees (`features/employees/`):**
    - Staff directory table with role, branch, and status chips.
    - Role-gated salary column visible strictly to users with `EMPLOYEE_SALARY:view`.
    - Add Employee modal with department, branch, joining date, and salary fields.
    - Employee detail page with breadcrumb navigation, profile card, and 6 tabs (Overview, Performance, Reports Submitted, Activity Log, Sessions Conducted, Assigned Cases).
    - Performance tab featuring Recharts session completion area trend, care quality metrics, and assigned cases goal progress.

- **Track 3: Admin & Governance Pages:**
  - **Reports (`features/reports/`):**
    - Reports management table with overdue indicators, status chips (Draft, Submitted, Reviewed, Shared), and Send Reminder action.
    - Therapist-scoped view with `+ New Report` modal.
    - Parent portal view with shared reports list and direct download.
    - Full-featured Clinical Report Editor (`/reports/[id]`) with Markdown/rich content editing, review & share workflows, and version history drawer.
  - **Communication (`features/communication/`):**
    - Message logs tab with multi-channel badges (WhatsApp, Email, Call) and message detail drawer.
    - WhatsApp templates management tab with Director/Manager approval workflow.
    - Bulk send stepped wizard (Audience selection with consent verification, template picker, cost preview, and send execution).
    - New Message modal with dynamic template variable interpolation and guardian consent validation.
  - **Role Access (`features/role-access/`):**
    - Director-only Permission Manager with role cards (Manager, Therapist, Parent).
    - 7-column permissions matrix (Module on/off, Create, Update, View, ViewAll, Delete) with autosave optimistic updates.
    - Enforced hierarchy rules: View is prerequisite for other permissions; ViewAll requires View; sub-module rows indented.
    - User overrides panel for granular per-user permission modifications.
    - Branch management tab with branch cards (rooms, clients, staff counts) and user-branch assignment table with bulk assign modal.
    - Responsive module accordions for mobile viewports.
  - **Audit Log (`features/audit-log/`):**
    - Cursor-paginated system audit log with filter bar (user, action, entity, date range).
    - Detail drawer showing before/after diffs and event metadata.

### 2. Test & Verification Status:
- TypeScript (`tsc --noEmit`): Clean (0 errors across all 13 pages and shared components)
- Vitest unit tests: 57/57 Passing across 13 test suites
- Next.js production build (`next build`): Success (20/20 static and dynamic routes compiled, Serwist PWA service worker bundled)
