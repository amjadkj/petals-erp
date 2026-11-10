# Product Requirements Document: Therapy Clinic ERP System

**Version:** 1.0 (Draft) | **Status:** For review | **Owner:** Product

## 1. Overview

### 1.1 Purpose

This document defines the requirements for a web-based ERP system for a therapy clinic. The system centralises clinical records, scheduling, finance, communication, HR, leads and reporting in one platform. The Director has full control and delegates access to other staff through configurable role-based permissions.

### 1.2 Problem Statement

Therapy clinics typically run on disconnected tools: paper case files, spreadsheets for payments, WhatsApp for communication and manual attendance registers. This causes missed reports, unclear payment status, poor visibility of therapist workload, and no single view of a child's progress.

### 1.3 Goals

- Give the Director a real-time view of the whole business (operations, clinical, finance, HR).
- Provide a single client profile covering case history, assessments, goals, progress, documents, payments and sessions.
- Reduce missed or overdue reports and payments.
- Let therapists spend less time on admin and more on documentation tied to each session.
- Give parents transparent, controlled, view-only access to their child's information.
- Allow the Director to switch any action or view on or off for any role.

### 1.4 Non-Goals (v1)

- Insurance claim processing.
- Full accounting/GST filing (P&L is operational, not statutory).
- Native mobile apps (responsive web only in v1).
- Telehealth/video sessions.

## 2. User Roles

| Role | Description | Default access |
| --- | --- | --- |
| Director | Owner/administrator. Access to every module and controls all permissions. | Full |
| Manager | Runs front-office, billing follow-up, HR admin and lead management. | Limited (see 4.3) |
| Therapist | Delivers sessions and documents clinical work. | Own caseload only (see 4.2) |
| Parent | Guardian of a client (child). | View-only, own child only (see 4.4) |

**Key principle:** The Director's access is not restricted. Defaults for other roles are shown below, but every default can be changed by the Director through the Role & Permission Manager (Section 5).

## 3. Module Map by Role

Each cell is the default module toggle (On or Off) for that role. The Director can change any cell; the actions allowed inside each module (Create, Update, View, View All, Delete) are set in Section 5. The Manager's Client Profile access covers administrative data only (contact details, guardians, schedule, payment status), not assessments, observations, goals or progress.

| Module | Director | Manager | Therapist | Parent |
| --- | --- | --- | --- | --- |
| Dashboard | On | On | On | On |
| Appointments / Schedule view | On | On | On | On |
| Clients | On | On | On | Off |
| Client Profile | On | On | On | On |
| Financial | On | On | Off | Off |
| Communication | On | On | Off | Off |
| Schedule Planning | On | Off | Off | Off |
| HRMS | On | On | On | Off |
| Employees | On | On | Off | Off |
| Leads | On | On | Off | Off |
| Reports | On | On | On | On |
| Role-Based Access (Permission Manager) | On | Off | Off | Off |

## 4. Functional Requirements by Role

### 4.1 Director

#### 4.1.1 Dashboard

Quick business overview, configurable widgets:

- Today's sessions (scheduled, completed, cancelled, no-show).
- Active clients, new clients this month, new leads.
- Revenue today / this week / this month.
- Pending and advance payments summary.
- Reports due or overdue.
- Staff present today, staff on leave.
- Therapist utilisation (booked vs available hours).

#### 4.1.2 Appointments

- Weekly calendar view of the current week (with navigation to other weeks).
- Each slot shows: client name, department/therapy type, therapist first name.
- Cancelled sessions remain visible on the slot with a clear cancelled marker (colour/strike-through and reason on hover).
- Filters: therapist, department, status.
- Click a slot to view details, reschedule or cancel (permission controlled).

#### 4.1.3 Clients List

- Searchable, filterable list of all clients.
- Columns: name, department, assigned therapist, sessions scheduled, sessions attended, status.
- Clicking a client opens the User Profile **in the same tab**.

#### 4.1.4 User (Client) Profile

Tabbed profile with the following sub-tabs:

1. **Overview** – demographics, guardian details, case history, assigned therapists, status.
2. **Assessment Details** – assessments conducted, scores, observations, assessor and date.
3. **Payment & Treatment Plans** – treatment plan (therapy type, frequency, duration, fee), payments made, pending and advance balance.
4. **Progress**
   - Baseline (initial status per domain).
   - Long-term goals.
   - Sub-goals: daily, weekly and monthly.
   - Therapist description, client response, remarks and progress status per goal.
5. **Reports** – clinical reports, progress reports, with status (draft, submitted, shared with parent).
6. **Documents** – uploads (consent forms, prescriptions, external reports, ID proofs).
7. **Sessions** – session history with attendance status, therapist, notes and linked goals.

#### 4.1.5 Financial Dashboard

- Revenue by day, week and month (chart + table).
- Profit & Loss: revenue vs expenses (salaries, rent, utilities, consumables, other), by month.
- Payment status: paid, pending, advance.
- Filters by date range, department, therapist.
- Export to Excel/PDF.

**Revenue categories (P&L).** Revenue is recorded under two categories: Clinical Therapy Revenue (Speech Therapy, Occupational Therapy, Physical Therapy, ABA/Behavioral Therapy, Child Psychotherapy) and Assessment & Evaluation Fees (formal diagnoses, intake evaluations, standardized psychometric testing blocks). The Manager and the Director enter this financial data. Expense categories are still to be defined (see Section 12).

#### 4.1.6 Communication

- Send messages to clients/parents via WhatsApp, Email and phone (click-to-call/log).
- Message templates (appointment reminder, payment due, report ready).
- Communication log per client with timestamp and sender.
- Bulk send with filters (e.g. all clients with pending fees).

The Director and the Manager own WhatsApp template submission and approval, and manage the message costs.

#### 4.1.7 Schedule Planning

- Create recurring session schedules per client (e.g. Mon/Wed/Fri 4 pm).
- Check therapist and room availability; conflict detection.
- Handle leave and holidays (auto-flag affected sessions).
- Reschedule and cancel with reason.

#### 4.1.8 HRMS

- Employee records, attendance, leave management, holiday calendar.
- Leave types, balances, approval workflow.
- Attendance via manual entry/check-in (biometric integration in a later phase).

#### 4.1.9 Employees

- List of all employees with role, department and salary.
- Per-employee view of:
  - Reports submitted.
  - Everything they enter or fill in the system (activity log).
  - Total sessions conducted.
  - Assigned cases.
  - Long-term goals, short-term goals and sub-goals, with description, client response, remarks and progress for each assigned case.
- Performance indicators: session completion rate, report timeliness, attendance.

#### 4.1.10 Payments

- Record payments (cash, UPI, card, bank transfer) with receipt generation.
- Statuses: Paid, Pending, Advance.
- Payment history per client and consolidated view.
- Reminders for due payments.

#### 4.1.11 Attendance

- Staff attendance (daily and monthly views) and client session attendance.

#### 4.1.12 Leads

- Capture leads (name, contact, child age, concern, source).
- Pipeline stages: New, Contacted, Assessment scheduled, Converted, Lost.
- Follow-up reminders and owner assignment.
- One-click conversion of a lead to a client profile.

#### 4.1.13 Reports Module

- Shows reports due for each client (due date, therapist, status).
- Overdue highlighting and reminders to therapists.
- Filter by therapist, client, department, report type.

#### 4.1.14 Role-Based Access Control

See Section 5.

### 4.2 Therapist

- **Dashboard:** total clients handled, today's schedule count, pending reports, upcoming sessions, goals needing update.
- **Appointments:** weekly calendar showing only their own schedule.
- **Clients:** only assigned clients; can open profile tabs allowed by the Director (typically Overview, Assessment, Progress, Reports, Documents, Sessions).
- **HRMS:** apply for leave, view leave balance and status, view own attendance.
- **Reports:** create, edit and submit reports for own cases; see due reports.
- Cannot view other therapists' clients, financial data or salaries unless permitted.

**Shared cases.** When a client has more than one therapist, each therapist can view the other therapists' notes, goals and progress entries for that client. Edit rights stay with the author and the Director.

### 4.3 Manager

Access limited to:

- **Dashboard** (operational view, no P&L unless permitted).
- **Appointments** (all therapists).
- **Clients** (list and profile as permitted).
- **Communication** (WhatsApp, Email, phone).
- **Financial:** payment due and monthly payment tracking only (no P&L, no salary data).
- **HRMS:** employees, attendance, leave and related functions.
- **Leads.**
- **Reports** (view due reports and follow up).

**Limits for Managers.** Managers see administrative client data only: no assessments, observations, goals, progress notes or clinical reports. They can view leave requests and balances, but the Director approves or rejects leave, and a Manager acts as backup approver when the Director is unavailable. Managers and the Director enter revenue and expense data for the financial module.

### 4.4 Parent

- **Dashboard:** total sessions, today's session.
- **Schedule:** view-only.
- **Child's profile:** payment plan, overview, assessment details and reports, shown only where the Director/clinic has granted access.
- Can only see their own child's data. Multiple children supported under one parent login.
- No edit rights; can download shared reports.

Parents see payment status only (paid, pending, advance). Online payment is not part of v1.

### 4.5 Multi-Branch Support

- The system supports multiple branches from the first release. Every branch-owned record (clients, appointments, employees, leads, invoices, payments, expenses) carries a `branch_id`.
- Users are assigned to one or more branches and see only data from their assigned branches.
- The Director has a branch switcher and an All Branches view on the dashboard, appointments, financial dashboard and reports.
- Revenue, expenses and P&L are available per branch and consolidated.
- Therapist schedules and rooms are managed per branch. A therapist who works at two branches sees one combined schedule, and double-booking is blocked.
- Branch creation and assignment are managed by the Director.

Each client belongs to a single branch and attends sessions only at that branch, so client records are not shared across branches.

## 5. Role-Based Access Control (RBAC)

The Director controls access through a **Permission Manager**.

### 5.1 Requirements

- **Module toggle.** For each role, the Director switches every module On or Off. Off hides the module from navigation, blocks its pages and API endpoints (403), and removes its data from dashboard widgets, search and notifications.
- **Five action toggles per module.** When a module is On, the Director sets each of these independently: **Create**, **Update**, **View**, **View All**, **Delete**.
- **View vs View All.** View shows only records in the user's own scope (a therapist's assigned clients and own schedule, a parent's linked child). View All shows every record in the clinic. View All requires View.
- **Dependencies.** Create, Update and Delete require View. Turning View off turns the other actions off. Turning a module off keeps its saved action settings but makes them inactive; turning it back on restores them.
- **Not-applicable actions** are greyed out (for example Create on the Dashboard).
- **Sub-modules.** Areas with sensitive data get their own toggle and the same five actions: Financial P&L, Employees salary, and each Client Profile tab (Assessment, Payment & Treatment Plans, Progress, Reports, Documents, Sessions).
- **Delete** is a soft delete, restorable by the Director.
- **Role defaults and user overrides.** Settings are defined per role; the Director can override any toggle for a single user.
- **Parent role.** Only the module toggle and View (own child) are offered; Create, Update, Delete and View All are not available. Reports and tabs stay hidden until marked Shared.
- **Director.** Always has every module and action On and cannot be locked out. Changes take effect immediately and every change is audit-logged (who, what, when).

**Clinical edit history.** Every edit or delete of a clinical entry, including those made by the Director, keeps the original version in a version history (who, when, previous content). The Director can restore deleted entries.

### 5.2 Example: Permission Manager Settings for the Manager Role

| Module | Module on | Create | Update | View | View All | Delete |
| --- | --- | --- | --- | --- | --- | --- |
| Dashboard | On | – | – | On | On | – |
| Appointments | On | On | On | On | On | Off |
| Clients | On | On | On | On | On | Off |
| Communication | On | On | – | On | On | Off |
| Financial | On | Off | Off | On | On | Off |
| HRMS | On | Off | On | On | On | Off |
| Leads | On | On | On | On | On | Off |
| Reports | On | Off | Off | On | On | Off |
| Permission Manager | Off | Off | Off | Off | Off | Off |

## 6. Key Workflows

1. **New client onboarding:** Lead converted, then profile created, assessment scheduled, baseline recorded, treatment plan and fees set, schedule created, parent account issued.
2. **Session cycle:** Appointment scheduled, reminder sent, session conducted, attendance marked, notes and sub-goal progress logged, payment updated.
3. **Cancellation:** Slot marked cancelled with reason, remains on calendar, parent notified, optional reschedule.
4. **Report cycle:** Report due date generated from treatment plan, reminder to therapist, submitted, reviewed, shared with parent.
5. **Leave:** Employee applies, approver (Director/Manager as configured) approves, schedule conflicts flagged.
6. **Payment follow-up:** Pending payment flagged, reminder via WhatsApp/email, payment recorded, receipt generated.

## 7. Data Entities (high level)

User, Role, Permission, Employee, Client, Guardian, Lead, Appointment, Session, Department, Assessment, Observation, TreatmentPlan, Goal (long-term), SubGoal (daily/weekly/monthly), ProgressEntry, Report, Document, Invoice, Payment, Expense, LeaveRequest, AttendanceRecord, CommunicationLog, AuditLog.

## 8. Non-Functional Requirements

- **Security & privacy:** clinical data of minors is highly sensitive. Encryption in transit and at rest, strong password policy, optional 2FA (mandatory for Director), session timeout.
- **Compliance:** consent capture for data storage and communication; align with applicable data-protection law (e.g. India's DPDP Act).
- **Audit:** immutable log of data views/edits for clinical records and permission changes.
- **Performance:** pages load in under 3 seconds for typical clinic size (up to \~50 staff, \~1,000 active clients).
- **Availability:** 99.5% uptime, daily backups.
- **Usability:** responsive design for tablet and mobile browsers; simple UI for therapists.
- **Scalability:** multi-branch ready architecture.
- **Integrations:** WhatsApp Business API, email (SMTP/provider), telephony click-to-call, payment gateway (later).

## 9. Success Metrics

- 90% of sessions marked with attendance on the same day.
- Reports overdue reduced by 50% within 3 months.
- Pending payment collection time reduced by 30%.
- 80% of parents log in at least monthly.
- Director dashboard used weekly by 100% of Directors.

## 10. Release Phasing

| Phase | Scope |
| --- | --- |
| MVP | Auth, RBAC and multi-branch setup, Clients and Profile, Appointments and Schedule, Payments, Director/Therapist dashboards |
| Phase 2 | Reports module, Parent portal, Communication (WhatsApp/Email), Leads |
| Phase 3 | HRMS, Employees analytics, Financial dashboard and P&L, Manager role refinements |
| Phase 4 | Biometric attendance, mobile app |

## 11. Assumptions

- A parent account is created by the clinic and is linked to one or more children.
- Departments are configurable (e.g. Speech, Occupational, Behavioural, Special Education).
- Salary information is visible to the Director only by default.

## 12. Decisions and Remaining Open Questions

Decided:

- **Manager access to clinical data:** administrative data only (no assessments, observations, goals or progress).
- **Therapist visibility on shared clients:** a therapist can see other therapists' notes on the same client.
- **Leave approval:** the Director approves; the Manager is the backup approver when the Director is unavailable.
- **WhatsApp:** official WhatsApp Business API with message templates; the Director and Manager own template approval and message costs.
- **Branches:** multi-branch from the start (Section 4.5). A client belongs to one branch only and attends sessions only there.
- **Parent payments:** payment status view only, no online payment.
- **P&L revenue categories:** Clinical Therapy Revenue and Assessment & Evaluation Fees, entered by the Manager and the Director (Section 4.1.5).
- **Director on clinical entries:** the Director can edit and delete clinical entries made by therapists, and every edit or delete keeps a version history (Section 5).

Still open:

1. Which expense categories does the P&L need (for example rent, salaries, utilities, consumables)? Only revenue categories are defined so far.

## 13. Technical Approach & PWA Requirements

### 13.1 Proposed Stack

- **Frontend:** Next.js (App Router, TypeScript), served as an installable PWA.
- **Backend:** NestJS (TypeScript) REST API with OpenAPI/Swagger; shared types between frontend and backend (monorepo recommended).
- **Database:** PostgreSQL with Prisma or TypeORM; every table carries a `branch_id` to keep multi-branch support open.
- **Queue/cache:** Redis with BullMQ for reminders, WhatsApp/email sending, report-due checks and scheduled jobs.
- **File storage:** S3-compatible storage for documents and reports, accessed through short-lived signed URLs.
- **Messaging:** WhatsApp Business Cloud API, transactional email provider, push notifications via Web Push.

### 13.2 RBAC Implementation

- Permissions are stored per role as a module flag (`module.enabled`) plus action keys (`module.create`, `module.update`, `module.view`, `module.view_all`, `module.delete`), for example `clients.view_all`. Sub-modules extend the key, for example `employees.salary.view`.
- NestJS: a `@RequirePermission('clients', 'update')` decorator and a global guard enforce every endpoint, checking the module flag first and then the action.
- Scope: without `view_all`, the service layer filters queries to own, assigned or linked records (a therapist's clients, a parent's children); with `view_all` no filter is applied.
- Permissions are cached in Redis and invalidated immediately when the Director changes a toggle.
- Next.js: the permission set is loaded from a `/me/permissions` endpoint and drives middleware, navigation, tabs and button visibility, but the **server is always the authority**.
- A NestJS interceptor writes the audit log for clinical reads and edits and for permission changes.

### 13.3 Authentication

- Short-lived JWT access token with refresh token in an httpOnly, secure, same-site cookie.
- Director: mandatory 2FA. Parents: phone/email OTP login is recommended over passwords.
- Server-side session revocation (for example when an employee leaves).

### 13.4 PWA Requirements

- Web app manifest, icons and splash screens; installable on Android, iOS (Add to Home Screen) and desktop.
- Service worker (for example Serwist or next-pwa) caching the app shell and static assets.
- **Offline scope (v1):** app shell plus a read-only view of today's schedule for therapists. Clinical data and financial data are **not** cached offline by default, because of privacy risk on shared or lost devices.
- **Optional later:** offline queue for marking attendance and saving session-note drafts, synced via background sync with conflict handling.
- Web Push notifications for session reminders, report-due alerts, leave approvals and payment due. iOS push works only when the PWA is installed to the home screen (iOS 16.4+), so this must be communicated in onboarding.
- HTTPS everywhere; service worker cache and local storage cleared on logout; auto-lock after inactivity.
- Responsive layouts: the weekly calendar must collapse to a day/agenda view on phones.
- Performance target: Lighthouse PWA and performance scores above 90 on mid-range Android devices.

### 13.5 Suggested Build Order

1. Monorepo setup, auth, user/role/permission model and guards.
2. Clients, client profile tabs and treatment plans.
3. Appointments and schedule planning with conflict detection.
4. Payments and Director/Therapist dashboards.
5. Reports module and parent portal.
6. Communication, leads, HRMS, employees analytics, financial dashboard.
7. PWA hardening: offline shell, push notifications, install prompts.
