# Petals ERP Frontend — Build Plan & Specification

## 1. Route Map

| Route | Page | Module | Default Roles | Layout / Spec Source |
|---|---|---|---|---|
| `/login` | Staff Login | AUTH | Public | Centred card, soft purple-50 bg (`design-login.md`) |
| `/login/2fa` | TOTP 2FA Verification | AUTH | Director / Staff with 2FA | 6-digit code auto-advance (`design-login.md`) |
| `/login/otp` | Parent OTP Login | AUTH | Parent | Phone/email → 6-digit code step (`design-login.md`) |
| `/dashboard` | Main Dashboard | DASHBOARD | Director, Manager, Therapist, Parent | 4 role-specific variants (`design-dashboard.md`) |
| `/appointments` | Appointments Calendar | APPOINTMENTS | Director, Manager, Therapist, Parent | Week/Day/Month IST calendar (`design-appointments.md`) |
| `/clients` | Clients Directory | CLIENTS | Director, Manager, Therapist | Search, filter bar, table-to-card mobile (`design-clients.md`) |
| `/clients/[id]` | Client Profile | CLIENTS | Director, Manager, Therapist, Parent | 7 permission-driven tabs (`design-client-profile.md`) |
| `/schedule-planning` | Schedule Planning | SCHEDULE_PLANNING | Director | Recurring schedules, availability matrix (`design-schedule-planning.md`) |
| `/financial` | Financial & Billing | FINANCIAL, FINANCIAL_PNL | Director, Manager | Payments, Record Payment (teal), P&L, Revenue (`design-financial.md`) |
| `/communication` | Communication Hub | COMMUNICATION | Director, Manager | Logs, WhatsApp templates, bulk send (`design-communication.md`) |
| `/leads` | Lead Management | LEADS | Director, Manager | 5-stage Kanban board, conversion flow (`design-leads.md`) |
| `/hrms` | HR Management System | HRMS | Director, Manager, Therapist | Attendance (daily/monthly), Leave approvals, Holidays (`design-hrms.md`) |
| `/employees` | Staff Directory | EMPLOYEES, EMPLOYEE_SALARY | Director, Manager | List with role-gated salary (`design-employees.md`) |
| `/employees/[id]` | Employee Profile | EMPLOYEES | Director, Manager | Detail view, 6 tabs, Recharts performance trend (`design-employees.md`) |
| `/reports` | Clinical Reports Directory | REPORTS | Director, Manager, Therapist, Parent | Overdue indicators, filterable table (`design-reports.md`) |
| `/reports/[id]` | Report Editor & Viewer | REPORTS | Director, Manager, Therapist, Parent | Editor with Draft→Submitted→Reviewed→Shared (`design-reports.md`) |
| `/role-access` | Permission Manager & Branches | ROLE_ACCESS | Director only | 7-column matrix table with autosave (`design-role-access.md`) |
| `/role-access/audit-log`| Audit Log | ROLE_ACCESS | Director only | Cursor-paginated system audit log (`design-audit-log.md`) |

---

## 2. Shared Component Registry (`apps/web/src/components/ui/`)

| Component | Purpose & Visual Styling |
|---|---|
| `Button` | Variants: `primary` (purple-600 bg, hover purple-800), `teal` (teal-500 bg, dark text), `outline` (white bg, purple border). Min touch target 44px, radius 8px. |
| `StatusChip` | Pill chip (12-13px font). Semantic colors: success (attended/paid/active/present/approved), purple-100 (scheduled/on-leave), warning (pending/late), danger (cancelled/overdue), teal-50 (advance). |
| `StatCard` | Metric summary card. White surface, 1px border, 12px radius, zero shadow. Quicksand 32px purple metric. Built-in skeleton state. |
| `DataTable` | Responsive table. Purple-50 header row, uppercase tracked labels, 48px row height, offset pagination. Automatically converts to stacked card list on mobile (<768px). |
| `Modal` & `BottomSheet` | Responsive dialog. Desktop: centred 480px card with focus trap and Esc handling. Mobile: slides up as 90% max-height bottom sheet with swipe-down indicator. |
| `FilterBar` & `FiltersSheet` | Desktop inline search & dropdowns. Mobile collapses into a single "Filters" trigger opening a bottom sheet. |
| `Tabs` & `SegmentedControl` | Underline tabs with 2px purple indicator; pill segmented control (Day/Week/Month) with purple-50 active fill. |
| `Input`, `Select`, `DatePicker` | Form fields: 44px height, 8px radius, focus border purple-600 + 2px purple-200 ring. Select includes trailing chevron. |
| `Switch` & `Checkbox` | Toggle switch and 16px checkbox with purple-600 active fill. |
| `Drawer` | Slide-in side panel (right 400px on desktop, bottom sheet on mobile) for appointment and lead details. |
| `Toast` | Notifications toast provider (bottom-right desktop, bottom-centre mobile) with auto-dismiss. |
| `Avatar` | Initials avatar circle with alternating purple/teal background. |
| `ProgressBar` | Teal filled bar on purple-200 track. |
| `Skeleton`, `EmptyState`, `ConfirmDialog`, `Badge`, `Tooltip`, `Popover` | Common UI feedback, loading, and dialog utilities. |

---

## 3. API-to-Page Mapping

| Page Route | API Module File | Core Endpoints Consumed |
|---|---|---|
| Auth (`/login/*`) | `src/lib/api/auth.ts` | `POST /auth/login`, `/2fa/verify-login`, `/otp/request`, `/otp/verify`, `/refresh`, `/logout`, `/me` |
| Dashboard (`/dashboard`) | `src/lib/api/dashboard.ts` | `GET /dashboard?branchId=` |
| Appointments (`/appointments`) | `src/lib/api/appointments.ts` | `GET /appointments`, `POST /appointments`, `PUT /appointments/:id/reschedule`, `PUT /appointments/:id/cancel`, `GET /appointments/daily` |
| Clients (`/clients`, `/clients/[id]`) | `src/lib/api/clients.ts` | `GET /clients`, `POST /clients`, `GET /clients/:id`, `/overview`, `/assessments`, `/treatment-plans`, `/goals`, `/documents`, `/appointments` |
| Schedule Planning (`/schedule-planning`) | `src/lib/api/schedules.ts` | `GET /schedules`, `POST /schedules`, `PUT /schedules/:id`, `GET /hr/holidays`, `GET /hr/leaves` |
| Financial (`/financial`) | `src/lib/api/finance.ts` | `GET /finance/payments`, `/invoices`, `POST /finance/invoices/:id/payments`, `/payments-due`, `/monthly-tracking`, `/expenses`, `/pnl`, `/revenue` |
| Leads (`/leads`) | `src/lib/api/leads.ts` | `GET /leads`, `GET /leads/board`, `POST /leads`, `PATCH /leads/:id`, `POST /leads/:id/convert` |
| HRMS (`/hrms`) | `src/lib/api/hr.ts` | `POST /hr/attendance/check-in`, `/check-out`, `GET /hr/attendance/daily`, `/monthly`, `GET/POST /hr/leaves`, `/leaves/:id/approve`, `GET/POST /hr/holidays` |
| Employees (`/employees`, `/employees/[id]`) | `src/lib/api/employees.ts` | `GET /employees`, `POST /employees`, `GET /users`, `GET /hr/employees/:id/summary`, `/goals`, `/activity-log` |
| Reports (`/reports`, `/reports/[id]`) | `src/lib/api/reports.ts` | `GET /reports/due`, `GET/POST /clients/:id/reports`, `GET/PATCH /reports/:id`, `POST /reports/:id/share` |
| Role Access (`/role-access`, `/audit-log`) | `src/lib/api/access.ts`, `branches.ts` | `GET /access/roles`, `PUT /access/roles/:key/modules`, `PUT /access/roles/:key/permissions`, `GET /access/overrides/:id`, `GET/POST /branches`, `GET /audit-logs` |

---

## 4. Architectural Rules Enforced

1. **Persistent App Shell:** The root shell (`Sidebar` + `Header`) renders once in `apps/web/src/app/(app)/layout.tsx` and never remounts across route navigation.
2. **Server-Driven Permissions:** Navigation items, tabs, and action buttons are strictly driven by `usePermissions()` and `<Can>` evaluating `GET /api/v1/access/me/permissions`. Modules marked off are completely omitted from the UI.
3. **PWA Scope & Security:** Serwist service worker precaches static assets, fonts, and the app shell. A read-only cache is enabled strictly for today's therapist schedule. **Clinical and financial data are explicitly bypassed with `NetworkOnly` and never stored in offline caches.**
4. **Indian Localization:** Monetary figures format using Indian digit grouping (`₹4.2L`, `₹48,000`). Dates follow standard `04 Nov 2026` IST formatting.
5. **No Shadows:** Clean typography-first design using 1px `#E6D8F1`/`#D9D4DE` borders and 12px card border radius.
