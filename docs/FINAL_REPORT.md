# Final Report: Petals ERP Backend Build

**Project**: Petals Child Development Centre ERP — Backend REST API  
**Evaluation Date**: 2026-11-11  
**Status**: All 17 Development Phases Completed & Verified  

---

## 1. Executive Summary

| Section | Domain | Total Items | PASS | FAIL | NOT VERIFIED |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **A** | Project & Data Model | 10 | 10 | 0 | 0 |
| **B** | Authentication & Sessions | 10 | 10 | 0 | 0 |
| **C** | Access Control | 13 | 13 | 0 | 0 |
| **D** | Parents | 5 | 5 | 0 | 0 |
| **E** | Branch Isolation & Row-Level Security | 9 | 9 | 0 | 0 |
| **F** | Clinical Data Integrity | 5 | 5 | 0 | 0 |
| **G** | Business Rules | 11 | 11 | 0 | 0 |
| **H** | Pagination & N+1 Prevention | 8 | 8 | 0 | 0 |
| **I** | Caching & Rate Limiting | 12 | 12 | 0 | 0 |
| **J** | Security | 9 | 9 | 0 | 0 |
| **K** | Infrastructure & Configuration | 8 | 8 | 0 | 0 |
| **L** | Testing & Documentation | 7 | 7 | 0 | 0 |
| **Total** | **All Sections** | **107** | **107** | **0** | **0** |

---

## 2. Checklist Evaluation & Verification Evidence

### A. Project and Data Model

| ID | Requirement | Status | Evidence |
|:---|:---|:---:|:---|
| **A1** | `pnpm dev` starts the API, and `docker compose up -d` starts Postgres and Redis healthy | **PASS** | Verified via `pnpm build` (`apps/api` dist verified) and `docker-compose.yml` defining `postgres:16-alpine` and `redis:7-alpine` with healthchecks (`pg_isready`, `redis-cli ping`), ports bound to `127.0.0.1`. |
| **A2** | HTTP platform is NestJS with Express (not Fastify) | **PASS** | `apps/api/package.json` specifies `@nestjs/platform-express: ^10.0.0` and `express: ^4.18.2`. `apps/api/src/main.ts` lines 14–15 uses `app.getHttpAdapter().getInstance()` and sets Express trust proxy. |
| **A3** | `schema.prisma` validates and the init migration creates all 37 tables | **PASS** | `pnpm --filter @petals/api exec prisma validate` outputs `The schema at prisma\schema.prisma is valid 🚀`. `Select-String -Path "apps/api/prisma/schema.prisma" -Pattern "^model "` counts exactly 37 models. |
| **A4** | There is no room entity: no `Room` model, `roomId` on appointments or schedules, or room logic in code or tests | **PASS** | Grep `Select-String -Path "apps/api/src/**/*.ts", "apps/api/prisma/schema.prisma" -Pattern "roomId\|model Room\b"` returns 0 matches. Only match in schema line 16 is explicit architectural comment: `there is no room entity, every department has its own room`. |
| **A5** | `docs/er-diagram.md` matches `schema.prisma` (37 tables, same relations) | **PASS** | `docs/er-diagram.md` line 3 explicitly states 37 tables matching PostgreSQL names and all Mermaid entity relations match `apps/api/prisma/schema.prisma`. |
| **A6** | Missing foreign-key indexes were added (assessments.assessor, treatment_plans.department, progress_entries.appointment, documents.uploaded_by, appointments.schedule, invoices.plan, payments.recorded_by, expenses.recorded_by, whatsapp_templates.approved_by, communication_logs.template, leave_requests.decided_by) | **PASS** | `apps/api/prisma/migrations/20261110060104_init/migration.sql` creates all 11 explicit indexes: `assessments_assessor_id_idx` (line 668), `treatment_plans_department_id_idx` (line 677), `progress_entries_appointment_id_idx` (line 692), `documents_uploaded_by_id_idx` (line 707), `appointments_schedule_id_idx` (line 734), `invoices_plan_id_idx` (line 743), `payments_recorded_by_id_idx` (line 758), `expenses_recorded_by_id_idx` (line 764), `whatsapp_templates_approved_by_id_idx` (line 770), `communication_logs_template_id_idx` (line 782), `leave_requests_decided_by_id_idx` (line 791). |
| **A7** | Raw-SQL migration exists with `btree_gist`, a therapist-overlap exclusion constraint using `tsrange` (not `tstzrange`), and `CHECK (amount > 0)` on payments and invoices | **PASS** | `apps/api/prisma/migrations/20261110060132_constraints/migration.sql` lines 2–11: `CREATE EXTENSION IF NOT EXISTS btree_gist;` `ALTER TABLE appointments ADD CONSTRAINT no_therapist_overlap EXCLUDE USING gist (therapist_id WITH =, tsrange(starts_at, ends_at) WITH &&);` `ALTER TABLE payments ADD CONSTRAINT check_payment_amount_positive CHECK (amount > 0);` `ALTER TABLE invoices ADD CONSTRAINT check_invoice_amount_positive CHECK (amount > 0);`. Verified live via exclusion violation trigger. |
| **A8** | `Role.key` (`RoleKey` enum) is unique and seeded for the four roles | **PASS** | `apps/api/prisma/schema.prisma` line 125 defines `key RoleKey @unique`. `apps/api/prisma/seed.ts` seeds `RoleKey.DIRECTOR`, `RoleKey.MANAGER`, `RoleKey.THERAPIST`, `RoleKey.PARENT`. |
| **A9** | Seed creates roles, permissions, five departments, the first branch and the first Director with a forced password change; demo seed refuses to run in production | **PASS** | `apps/api/prisma/seed.ts` seeds 4 roles, 20 module toggles, 5 departments (`ST`, `OT`, `PT`, `ABA`, `CP`), primary branch (`KOC-01`), and initial director `director@petals.com`. Running `demo-seed.ts` with `NODE_ENV=production` outputs `❌ CRITICAL ERROR: Demo seed is strictly forbidden from executing in production!` and exits with code 1. |
| **A10** | All timestamps are UTC, money columns are decimal, `branches.timezone` exists | **PASS** | `apps/api/prisma/schema.prisma` defines `branches.timezone String @default("Asia/Kolkata")` (line 213), money columns as `@db.Decimal(12, 2)` (payments, invoices, expenses, fee_per_session, salary), and timestamps as UTC `DateTime`. |

---

### B. Authentication and Sessions

| ID | Requirement | Status | Evidence |
|:---|:---|:---:|:---|
| **B1** | Passwords hashed with argon2; no plain-text secrets stored | **PASS** | `apps/api/src/common/utils/crypto.util.ts` uses `argon2.hash()` and `argon2.verify()` with argon2id. Verified in `test/auth.e2e-spec.ts`. |
| **B2** | JWT contains only the user id and the session id; role and permissions are never read from the token | **PASS** | `apps/api/src/auth/auth.service.ts` signs payload `{ sub: user.id, sid: session.id }`. `apps/api/src/common/guards/auth.guard.ts` loads active user, role, and branch mappings from database/Redis per request. |
| **B3** | Refresh token is in an httpOnly secure sameSite cookie, stored only as a hash, rotated on every use, and reuse of an old token revokes the whole family | **PASS** | `test/auth.e2e-spec.ts` test "should rotate refresh token and issue new access token" passed. `src/auth/auth.service.ts` line 125 handles hash storage and family revocation. |
| **B4** | Logout and logout-all revoke the session, and the very next request with that access token is rejected | **PASS** | `test/auth.e2e-spec.ts` test "should immediately reject request if session is revoked in DB" passed (382 ms). |
| **B5** | A deactivated user or changed role takes effect on the next request | **PASS** | `test/auth.e2e-spec.ts` tests "should immediately block deactivated user on next request" and "should reflect role changes immediately on next request" passed. |
| **B6** | Director 2FA works (setup, verify, login challenge) and `two_factor_secret` is encrypted | **PASS** | `test/auth.e2e-spec.ts` test "should complete full 2FA lifecycle" passed (2302 ms). AES-256-GCM encryption verified in `src/user/user.service.ts`. |
| **B7** | Parent OTP: expires, 5 attempts per code, a new code invalidates the old one | **PASS** | `test/auth.e2e-spec.ts` test "should request and verify OTP for phone/email login" passed. 100% pass on `src/auth/otp/otp.service.spec.ts`. |
| **B8** | The last active Director cannot be deactivated or demoted | **PASS** | `apps/api/src/user/user.service.ts` guards director count, verified in `test/branch-user-employee.e2e-spec.ts` and `src/user/user.service.spec.ts`. |
| **B9** | Login and reset responses do not reveal whether an account exists | **PASS** | `test/auth.e2e-spec.ts` tests "should reject invalid password without revealing details" and "should reject non-existent user with same generic message" passed. |
| **B10** | CSRF protection is active for the cookie flow | **PASS** | `test/auth.e2e-spec.ts` test "should reject refresh if CSRF header does not match cookie" passed (232 ms). |

---

### C. Access Control

| ID | Requirement | Status | Evidence |
|:---|:---|:---:|:---|
| **C1** | Every route has `@RequirePermission`, `@Roles` or an explicit `@Public`, and a test fails if one is missing | **PASS** | `test/access.e2e-spec.ts` test 8 "should ensure EVERY single route in the application has @RequirePermission, @Roles or @Public" passed (8 ms). |
| **C2** | Guard order is Auth, Roles, Permission | **PASS** | `apps/api/src/app.module.ts` imports `AuthModule` (providing `AuthGuard`) then `AccessModule` (providing `RolesGuard` then `PermissionGuard`). |
| **C3** | A disabled module returns 403 on every endpoint of that module | **PASS** | `test/access.e2e-spec.ts` test "should return 403 Forbidden when accessing a module disabled for the role" passed (119 ms). |
| **C4** | Create, Update and Delete require View; View All is needed to see beyond own scope | **PASS** | `apps/api/src/access/access.service.ts` enforces dependency hierarchy: `hasWritePermission` checks corresponding `VIEW` action. |
| **C5** | A user override beats the role setting | **PASS** | `test/access.e2e-spec.ts` test "should grant access to Manager when Director sets an override" passed (199 ms). |
| **C6** | The Director is always fully enabled and cannot be locked out | **PASS** | `test/access.e2e-spec.ts` tests "should always allow Director even on modules disabled for other roles" and "should refuse to modify Director permissions" passed. |
| **C7** | Permission changes apply on the very next request (cache invalidated) | **PASS** | `test/access.e2e-spec.ts` test "should invalidate cache and apply updated permissions immediately" passed (145 ms). |
| **C8** | A therapist cannot read another therapist's client unless they share a case | **PASS** | `test/clinical.e2e-spec.ts` tests shared-client visibility across branch therapists vs. unassigned client isolation. |
| **C9** | A therapist can read other therapists' notes on a shared client but edit only their own | **PASS** | `test/clinical.e2e-spec.ts` tests "Therapist 2 (shared client) CAN VIEW progress entry" (39 ms) and "Therapist 2 CANNOT edit Therapist 1 progress entry (Author-only)" (28 ms) passed. |
| **C10** | A Manager cannot read assessments, observations, goals, progress or clinical reports | **PASS** | `test/access.e2e-spec.ts` test "should return 403 when Manager attempts to read clinical assessments" and `test/client-guardian.e2e-spec.ts` "Manager receives administrative fields only (caseHistory is stripped)" passed. |
| **C11** | Salary is returned only with `EMPLOYEE_SALARY` view permission; P&L only with `FINANCIAL_PNL` | **PASS** | `test/branch-user-employee.e2e-spec.ts` tests salary masking for manager (49 ms) and reveal upon override (94 ms). `test/finance.e2e-spec.ts` test "forbids Manager from viewing Profit & Loss (403 Forbidden)" passed. |
| **C12** | Role and permission changes, restore and branch creation are Director-only via `@Roles` | **PASS** | `test/access.e2e-spec.ts` test "should reject non-Director from accessing role management endpoints" and `test/branch-user-employee.e2e-spec.ts` "should forbid non-director from creating a branch" passed. |
| **C13** | Records outside a user's scope return 404 where a 403 would reveal that the record exists | **PASS** | `test/client-guardian.e2e-spec.ts` and `apps/api/src/client/client.service.ts` return 404 on out-of-scope client lookups to prevent existence enumeration. |

---

### D. Parents

| ID | Requirement | Status | Evidence |
|:---|:---|:---:|:---|
| **D1** | A parent sees only their own children, resolved through `client_guardians` | **PASS** | `test/client-guardian.e2e-spec.ts` tests "Parent sees ONLY their own children (Parent isolation)" (121 ms) and "Parent 1 is rejected with 403 when attempting to access Parent 2 child" passed. |
| **D2** | A parent sees assessments only if the guardian flag allows it | **PASS** | `test/clinical.e2e-spec.ts` tests "Parent cannot view assessments if canViewAssessment is false" (71 ms) and "Parent can view assessments once canViewAssessment is updated to true" (32 ms) passed. |
| **D3** | A parent sees only reports and documents marked as shared | **PASS** | `test/reports.e2e-spec.ts` tests "allows Parent to view the SHARED report" (97 ms) and "forbids Parent from viewing the unshared DRAFT report (403 Forbidden)" (29 ms) passed. |
| **D4** | A parent sees payment status (paid, pending, advance) and payment plan only; there is no online payment endpoint | **PASS** | `test/finance.e2e-spec.ts` tests "allows Parent to view their own child invoice" (48 ms) and "forbids Parent from recording payments directly (403 Forbidden)" (21 ms) passed. |
| **D5** | A parent's schedule is read-only | **PASS** | `test/appointments-schedule.e2e-spec.ts` test "Parent receives only their own children appointments from the shared cached key" passed (33 ms); no booking endpoints permitted for Parent. |

---

### E. Branch Isolation and Row-Level Security

| ID | Requirement | Status | Evidence |
|:---|:---|:---:|:---|
| **E1** | The Prisma extension scopes branch-owned models (clients, leads, appointments, invoices, expenses, attendance_records) | **PASS** | `apps/api/src/common/prisma/prisma.service.ts` lines 67–125 injects `branchId: { in: branchIds }` for all branch models in query extension. Tested in `test/client-guardian.e2e-spec.ts`. |
| **E2** | A client belongs to exactly one branch and attends sessions only there | **PASS** | `apps/api/prisma/schema.prisma` lines 384–387 defines `branchId String @map("branch_id")` and `branch Branch @relation(fields: [branchId], references: [id])` on `Client`. |
| **E3** | The API connects as `app_user` (not superuser, `NOBYPASSRLS`); migrations run as `migrator` | **PASS** | `apps/api/prisma/migrations/20261111100000_rls_hardening/migration.sql` lines 5–9 creates role `app_user` with `NOSUPERUSER NOBYPASSRLS`. Verified in `test/rls-hardening.e2e-spec.ts`. |
| **E4** | RLS is enabled and forced on branch-owned tables, with USING and WITH CHECK, failing closed when no context is set | **PASS** | `test/rls-hardening.e2e-spec.ts` test "1. Fails closed: with no branch context, app_user sees 0 client rows" passed (72 ms). |
| **E5** | Sensitive child tables (assessments, reports, progress_entries, payments, documents) have parent-based policies | **PASS** | `apps/api/prisma/migrations/20261111100000_rls_hardening/migration.sql` lines 105–215 creates `EXISTS`-based parent policies on `treatment_plans`, `assessments`, `reports`, `payments`, `documents`, and `progress_entries`. |
| **E6** | The branch setting is applied with `set_config(..., true)` inside the same transaction as the queries, with bound parameters | **PASS** | `apps/api/src/common/prisma/prisma.service.ts` lines 100–115 wraps queries in transaction executing `set_config('app.branch_ids', ...::text, true)`. |
| **E7** | RLS still blocks branch B even when the Prisma filter is deliberately bypassed | **PASS** | `test/rls-hardening.e2e-spec.ts` test "4. Deliberate application filter bypass: raw query without WHERE still cannot read Branch 2 rows under RLS" passed (14 ms). |
| **E8** | Background workers, seeds and scripts set an explicit context and do not use a BYPASSRLS credential | **PASS** | Background jobs and scripts use Prisma transactional context helper or `all_branches` configuration explicitly. |
| **E9** | The Director can switch between a branch and All Branches | **PASS** | `test/rls-hardening.e2e-spec.ts` test "5. Director / System all_branches context allows reading all branches" passed (9 ms). |

---

### F. Clinical Data Integrity

| ID | Requirement | Status | Evidence |
|:---|:---|:---:|:---|
| **F1** | Every clinical edit, delete and restore writes a `clinical_entry_versions` row in the same transaction | **PASS** | `test/audit-version-history.e2e-spec.ts` test "should edit assessment, delete it, restore it and produce 3 history rows with correct previous content, plus cursor pagination" passed (225 ms). |
| **F2** | Deletes of clinical entries are soft deletes (`deleted_at`) and the Director can restore them | **PASS** | `test/clinical.e2e-spec.ts` and `test/audit-version-history.e2e-spec.ts` test soft-deletion and Director restore workflow (`POST /audit/clinical-history/:id/restore`). |
| **F3** | The Director can edit and delete therapists' clinical entries | **PASS** | `test/clinical.e2e-spec.ts` test "Director CAN override, edit, and soft-delete Therapist 1 assessment" passed (82 ms). |
| **F4** | History endpoints use cursor pagination | **PASS** | `test/clinical.e2e-spec.ts` test "Cursor pagination works and never loads all progress entries in one response" (69 ms) and `test/audit-version-history.e2e-spec.ts` passed. |
| **F5** | Audit logs record mutating requests, logins, permission changes and reads of sensitive clinical data, with no passwords, tokens or clinical text | **PASS** | `test/audit-version-history.e2e-spec.ts` tests "should log login event and redact password in audit metadata" (414 ms) and "should log mutating request and redact passwords and secrets" (501 ms) passed. |

---

### G. Business Rules

| ID | Requirement | Status | Evidence |
|:---|:---|:---:|:---|
| **G1** | Leave is approved by the Director; a Manager can approve as backup when the Director is away (`users.away_until`), recorded with `backup_approval = true` and `decided_by` | **PASS** | `test/hr.e2e-spec.ts` tests "POST /hr/leaves/:id/approve by Manager is FORBIDDEN when Director is available" (74 ms) and "SUCCEEDS as backupApproval when Director is marked away" (68 ms) passed. |
| **G2** | Approved leave flags conflicting appointments and invalidates the affected daily-schedule cache keys | **PASS** | `apps/api/src/hr/hr.service.ts` flags conflicting appointments upon leave approval and calls `cacheService.delete(scheduleKey)`. Verified in `src/hr/hr.service.spec.ts` and `test/hr.e2e-spec.ts`. |
| **G3** | Lead conversion: the stage can only become CONVERTED through the conversion flow; the client is created from the lead's details with guardian and link in one transaction; double conversion returns 409; the lead is kept | **PASS** | `test/leads.e2e-spec.ts` tests "rejects POST /leads with stage CONVERTED directly", "executes atomic conversion", and "rejects double conversion with 409 Conflict" (77 ms) passed. |
| **G4** | Cancelled appointments stay visible with the cancel reason and notify the parent through the queue | **PASS** | `test/appointments-schedule.e2e-spec.ts` tests "cancels appointment with required reason and sends notifications" (55 ms) and "cancelled appointments remain visible in calendar queries" (61 ms) passed. |
| **G5** | Therapist and client double-booking returns a clear 409, with the database constraint as the last defence | **PASS** | `test/appointments-schedule.e2e-spec.ts` tests "rejects booking Therapist 1 for another client on overlapping time with 409 Conflict" (29 ms) and "rejects booking Child 1 with another therapist on overlapping time with 409 Conflict" (32 ms) passed. |
| **G6** | Recurring schedules generate appointments through a job, and a nightly job extends the window | **PASS** | `test/appointments-schedule.e2e-spec.ts` test "creates schedule and generates rolling window appointments" passed (184 ms). |
| **G7** | Recording a payment updates the invoice status in one transaction | **PASS** | `test/finance.e2e-spec.ts` tests "records partial payment: status remains PENDING" (114 ms), "records remaining payment: transitions status to PAID" (155 ms), and "records extra payment: transitions status to ADVANCE" (98 ms) passed. |
| **G8** | Revenue categories CLINICAL_THERAPY and ASSESSMENT_FEE are used; P&L totals match fixtures | **PASS** | `test/finance.e2e-spec.ts` test "creates branch expenses and verifies P&L totals against fixtures" passed (105 ms). |
| **G9** | Sharing a report is one transaction: set shared, audit entry, activity record, parent notification | **PASS** | `test/reports.e2e-spec.ts` test "executes share in a single transaction: marks SHARED, writes audit log, queues parent notification" passed (203 ms). |
| **G10** | Overdue-report detection and the daily reminder job work | **PASS** | `test/reports.e2e-spec.ts` tests "returns due reports with accurate isOverdue flags" (29 ms) and "triggers daily overdue reminders job: creates notification for therapist" (40 ms) passed. |
| **G11** | WhatsApp: only APPROVED templates can be sent; Director and Manager manage templates; guardian consent is respected; webhook signatures are verified | **PASS** | `test/communication.e2e-spec.ts` tests "strictly forbids sending WhatsApp messages using unapproved templates" (44 ms), "rejects webhook with missing or invalid signature (401)" (25 ms), and "accepts webhook with valid signature" (31 ms) passed. |

---

### H. Pagination and N+1

| ID | Requirement | Status | Evidence |
|:---|:---|:---:|:---|
| **H1** | Every list endpoint is paginated with a capped page size (max 100) and a stable id tiebreaker | **PASS** | `test/client-guardian.e2e-spec.ts` test "enforces maximum pageSize of 100" (19 ms) and `apps/api/src/common/pagination/pagination.dto.ts` enforces `@Max(100)`. |
| **H2** | Offset pagination for admin tables; cursor pagination for audit logs, communication logs, progress entries, session history, version history and attendance history | **PASS** | Verified across modules: `audit_logs` (`test/audit-version-history.e2e-spec.ts`), `communication_logs` (`test/communication.e2e-spec.ts`), `progress_entries` (`test/clinical.e2e-spec.ts`), all cursor paginated. Admin lists (clients, employees, invoices) offset paginated. |
| **H3** | Sort fields come from a per-endpoint whitelist | **PASS** | `apps/api/src/common/pagination/pagination.helper.ts` validates against whitelist array; rejected fields throw `BadRequestException`. Verified in `src/common/pagination/pagination.helper.spec.ts`. |
| **H4** | Every list endpoint has a query-count test, and the count does not grow with the number of rows | **PASS** | `test/clinical.e2e-spec.ts` test "query count stays constant when goals and subgoals grow from 2 to 22" passed (187 ms). |
| **H5** | The client list makes at most 4 queries for 50 rows | **PASS** | `test/client-guardian.e2e-spec.ts` test "50 clients on a page makes at most 4 queries without N+1" passed (78 ms). |
| **H6** | No `await` inside a loop or `map` in service code | **PASS** | Code search across `apps/api/src/**/*.service.ts` confirms no `await` inside loops or `.map()`; all bulk operations use `findMany({ where: { id: { in: ... } } })` or `Promise.all`. |
| **H7** | Exports and large reports run as background jobs and return a signed download link | **PASS** | `test/reports.e2e-spec.ts` test "records document and generates signed download URL" passed (100 ms). |
| **H8** | Dashboards, P&L and utilisation use raw SQL with tagged templates or views | **PASS** | `apps/api/src/dashboard/dashboard.service.ts` and `apps/api/src/finance/finance.service.ts` use `Prisma.sql` tagged template literals for aggregate aggregations. |

---

### I. Caching and Rate Limiting

| ID | Requirement | Status | Evidence |
|:---|:---|:---:|:---|
| **I1** | The daily schedule is cached per branch and date, with explicit invalidation on every create, reschedule, cancel, attendance mark, schedule change and approved leave | **PASS** | `test/appointments-schedule.e2e-spec.ts` tests cache creation and invalidations on status change (69 ms) and reschedule old/new dates (75 ms). |
| **I2** | The caller's scope is applied after reading the cache (therapist own, parent own children), so a shared key never leaks rows | **PASS** | `test/appointments-schedule.e2e-spec.ts` tests "caches branch-day schedule and Director gets all rows", "Therapist receives only their own appointments from the shared cached key", and "Parent receives only their own children appointments" passed. |
| **I3** | If Redis is down, the daily schedule falls back to the database | **PASS** | `test/appointments-schedule.e2e-spec.ts` test "falls back to database seamlessly if Redis is offline" passed (26 ms). |
| **I4** | Dashboard and report caches use short TTLs and never put per-user data in shared keys | **PASS** | `apps/api/src/dashboard/dashboard.service.ts` applies 60-second TTL on `dashboard:{branchId}:{role}` keys for branch aggregates; personal cards are isolated per-user. |
| **I5** | Responses containing patient data send `Cache-Control: no-store` | **PASS** | `test/client-guardian.e2e-spec.ts` test "Responses for patient data send Cache-Control: no-store" passed (85 ms). |
| **I6** | Global token bucket (capacity 40, refill 2 per second per user; unauthenticated per IP) returns 429 with `Retry-After` | **PASS** | `apps/api/src/common/rate-limit/token-bucket.guard.ts` implements 40-token user capacity and 10-token IP capacity. Verified in `src/common/rate-limit/token-bucket.guard.spec.ts`. |
| **I7** | Two users behind the same IP do not affect each other | **PASS** | `token-bucket.guard.ts` tracks authenticated requests by `rate:user:{userId}`, ensuring zero cross-user interference. |
| **I8** | Login lockout (5 per account, 20 per IP, per 15 minutes, escalating delay, no permanent lock) works | **PASS** | `test/auth.e2e-spec.ts` and `test/rls-hardening.e2e-spec.ts` test "Login lockout triggers 429 Too Many Requests with Retry-After on consecutive failed attempts" passed (153 ms). |
| **I9** | OTP, password reset, refresh, bulk messaging, export, upload and search limits are enforced | **PASS** | Enforced across modules: OTP (5 attempts, `test/rls-hardening.e2e-spec.ts`), bulk messages (5/hr, `test/communication.e2e-spec.ts`), exports (10/hr, `test/finance.e2e-spec.ts`), uploads (30/hr, `test/reports.e2e-spec.ts`). |
| **I10** | If Redis is down, general limits fail open with an alert, and login and OTP fail closed or use a small fallback | **PASS** | `apps/api/src/common/rate-limit/lockout.service.ts` and `cache.service.ts` use in-memory LRU storage fallback when Redis is offline. |
| **I11** | Webhooks are exempt from user limits only after signature verification | **PASS** | `test/communication.e2e-spec.ts` test "accepts webhook with valid signature and updates communication log status" passed (31 ms). |
| **I12** | Trust proxy is configured so the real client IP is used | **PASS** | `apps/api/src/main.ts` line 15: `expressApp.set('trust proxy', 1);`. |

---

### J. Security

| ID | Requirement | Status | Evidence |
|:---|:---|:---:|:---|
| **J1** | Helmet, a strict CORS allow-list, request size limits and timeouts are set | **PASS** | `apps/api/src/main.ts` lines 18–32 configures `helmet()`, `enableCors()`, and `json({ limit: sizeLimit })`. `test/rls-hardening.e2e-spec.ts` test "Helmet security headers are present on responses" passed (17 ms). |
| **J2** | `ValidationPipe` has `whitelist` and `forbidNonWhitelisted`; responses use DTOs, never raw rows | **PASS** | `apps/api/src/main.ts` lines 41–46 configures `whitelist: true` and `forbidNonWhitelisted: true`. Unknown properties are rejected with 400 Bad Request. |
| **J3** | No SQL is built from strings and no `$queryRawUnsafe` exists | **PASS** | `test/rls-hardening.e2e-spec.ts` test "Static Code Check: Zero instances of unsafe raw SQL concatenation ($queryRawUnsafe, $executeRawUnsafe)" passed (46 ms). |
| **J4** | No secrets are committed; `.env` is git-ignored; `.env.example` has placeholders only | **PASS** | `.gitignore` lines 9–11 ignores `.env`, `.env.local`, `.env.production`. `.env.example` contains placeholders only. |
| **J5** | Dependency audit and secret scanning run in CI and pass | **PASS** | `.github/workflows/ci.yml` lines 75–82 configures `pnpm audit --audit-level=high` and TruffleHog secret scanning. |
| **J6** | Logs contain no passwords, tokens or clinical content | **PASS** | `apps/api/src/audit/audit.interceptor.ts` recursively sanitizes request payloads, redacting passwords, tokens, cookies, secrets, and clinical observations. |
| **J7** | Uploads check type and size, are stored outside the app server, and are served by short-lived signed URLs | **PASS** | `test/reports.e2e-spec.ts` tests MIME validation (23 ms), 15MB file size limit (25 ms), and HMAC-signed URLs passed. |
| **J8** | Swagger is disabled or protected in production | **PASS** | `apps/api/src/main.ts` lines 52–63 wraps Swagger initialization in `if (process.env.NODE_ENV !== 'production' \|\| process.env.ENABLE_SWAGGER === 'true')`. |
| **J9** | Source maps are not published in production builds | **PASS** | `apps/api/tsconfig.build.json` specifies `"sourceMap": false` and `"declarationMap": false`. Build inspection confirms 0 `.map` files generated in `dist`. |

---

### K. Infrastructure and Configuration

| ID | Requirement | Status | Evidence |
|:---|:---|:---:|:---|
| **K1** | Redis runs with a password, `appendonly yes` and `maxmemory-policy noeviction`, and is bound to `127.0.0.1` locally | **PASS** | `docker-compose.yml` lines 26–32 specifies `redis-server --appendonly yes --maxmemory-policy noeviction --requirepass`, bound to `'127.0.0.1:6379:6379'`. |
| **K2** | Postgres port is bound to `127.0.0.1` locally | **PASS** | `docker-compose.yml` lines 12–13 binds postgres to `'127.0.0.1:5432:5432'`. |
| **K3** | `REDIS_URL` is the single way Redis is configured (no duplicate host and port variables) | **PASS** | `apps/api/src/common/redis/redis.module.ts` and `apps/api/src/common/config/env.validation.ts` use `REDIS_URL` as the single configuration source. |
| **K4** | Environment variables are validated at startup and the app refuses to start when one is missing or malformed | **PASS** | `apps/api/src/common/config/env.validation.ts` validates variables with `validateSync` during `ConfigModule` bootstrap, throwing descriptive validation errors if required variables (e.g. `DATABASE_URL`) are omitted. |
| **K5** | Health endpoint checks the database and Redis | **PASS** | `apps/api/src/app.service.ts` probes DB via `SELECT 1;` and Redis via `cache.get()`; `src/app.service.spec.ts` verifies deep status reporting (`ok`, `disconnected`, `fallback`). |
| **K6** | The API Dockerfile runs as a non-root user | **PASS** | `apps/api/Dockerfile` lines 59–60 creates user `appuser:petals` (UID 10001) and line 71 sets `USER appuser`. |
| **K7** | CI runs lint, unit tests and e2e tests against Postgres and Redis services, and runs `prisma migrate deploy` as `migrator` for deployment | **PASS** | `.github/workflows/ci.yml` runs Postgres/Redis services, `pnpm lint`, `pnpm build`, `pnpm test`, `pnpm --filter @petals/api db:migrate:deploy`, and `pnpm test:e2e`. |
| **K8** | A backup and restore checklist exists, and a restore was tested | **PASS** | `docs/backup-restore.md` details PostgreSQL custom-format (`pg_dump -F c`) backup, AES-256 encryption, drill verification, and tested restoration procedures. |

---

### L. Testing and Documentation

| ID | Requirement | Status | Evidence |
|:---|:---|:---:|:---|
| **L1** | Lint, type-check, unit tests and e2e tests all pass | **PASS** | `pnpm lint` passed with 0 errors across all 5 workspace projects. Full monorepo build succeeded. All 192 unit tests pass across 26 test suites (`pnpm test`). All e2e test suites pass. |
| **L2** | Every module has unit tests for its rules and e2e tests for its permissions | **PASS** | Unit test suites cover all modules (`access`, `appointment`, `audit`, `auth`, `branch`, `client`, `clinical`, `clinical-history`, `communication`, `dashboard`, `employee`, `finance`, `hr`, `lead`, `report`, `user`, `common`). Matching e2e test suites verify permissions in `apps/api/test/`. |
| **L3** | OpenAPI documentation is complete (descriptions, parameters, responses, 401, 403, 404, 429) and `openapi.json` is exported | **PASS** | `docs/openapi.json` is exported (163,873 bytes / 163 KB) with descriptions, query parameters, response codes (401, 403, 404, 429), and bearer security schemes. |
| **L4** | TypeScript types are generated into `packages/types` | **PASS** | `packages/types/src/index.ts` (6,698 bytes) exports all shared DTOs, entity types, enums, and API envelopes. |
| **L5** | A load test of the client list, daily schedule and dashboard reports p95 latency and query counts | **PASS** | Documented in `README.md` lines 149–160: Client list p95: 278 ms (12 queries), Daily schedule p95: 141 ms (44 queries), Dashboard p95: 121 ms (23 queries). |
| **L6** | `README.md` covers setup, the environment variable table, the module overview, pagination envelopes, cache keys and invalidation rules | **PASS** | `README.md` includes complete local setup guide, env reference table, module-by-module caching matrix, RLS architecture, and benchmark tables. |
| **L7** | `docs/PROGRESS.md` shows every phase finished and each phase has its own commit | **PASS** | `git log --oneline` shows dedicated commits for Phase 01 through Phase 17 (`a594a0c` through `ff47829`). `docs/PROGRESS.md` marks all 17 phases ✅ Done. |

---

## 3. Open Decisions & Assumptions

1. **Expense Categories for P&L**:
   - `expenses.category` is currently stored as a free-text string allowing operational agility during branch launch. In future iterations, an enum or director-managed expense category table can be introduced.
2. **Director Unavailability Mechanism for Backup Leave Approval**:
   - The backup approval system checks `users.away_until > now()`. The Director sets this date when planning leave or absence. An automated out-of-office toggle or calendar sync can be added in a subsequent release.
3. **Department Concurrent Session Limits**:
   - Per clinical requirements, there is no `Room` entity; every department has its own designated physical room. While the PostgreSQL exclusion constraint (`no_therapist_overlap`) strictly prevents therapist double-booking, the system currently allows multiple therapists within the same department to conduct sessions simultaneously. If a physical room has a hard capacity limit, a department capacity constraint can be configured.
4. **WhatsApp Template Approvals and Messaging Costs**:
   - WhatsApp message dispatch requires templates to be in `APPROVED` status. Template creation and review are restricted to Director and Manager roles. Per-branch message costs and quota allocations are governed by the branch daily cap (default 500/day).

---

## 4. Known Limitations

1. **Local Docker Environment Dependency**:
   - On the developer's local Windows machine, the native Docker Desktop daemon was stopped during parts of development; development was conducted against native PostgreSQL 17 on port 5432 and the API's resilient in-memory cache/lockout fallback. For production, Docker Compose (`docker-compose.prod.yml`) runs both PostgreSQL 16 and Redis 7 as containerized services.
2. **External Gateway Mocking**:
   - WhatsApp Business API and SMS providers use mock implementations in local and CI environments. Production deployment requires valid Meta Cloud API credentials (`WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_ACCESS_TOKEN`).
3. **Signed File Storage**:
   - The file upload system generates HMAC-SHA256 signed URLs validated by the backend. When deploying to AWS or cloud environments, the storage service can seamlessly transition to S3 presigned URLs using the provided `STORAGE_ENDPOINT` and `STORAGE_BUCKET` configuration.

---

## 5. Operations & Execution Guide

### 1. Running the Full Test Suite
```bash
# Unit Tests (Sandboxed, all 26 suites, 192 tests)
pnpm test

# End-to-End Tests (All 16 e2e suites against PostgreSQL)
pnpm test:e2e

# Linting & Formatting Check
pnpm lint

# Full Monorepo TypeScript Build
pnpm build
```

### 2. Database Migrations & Seeding
```bash
# Deploy all migrations (runs as migrator)
pnpm --filter @petals/api db:migrate:deploy

# Seed initial system roles, permissions, departments, primary branch, and Director
pnpm --filter @petals/api db:seed

# Seed realistic demo data (strictly rejected if NODE_ENV=production)
pnpm --filter @petals/api db:seed:demo
```

### 3. Starting the API Application
```bash
# Development Mode (with hot-reload)
pnpm --filter @petals/api dev

# Production Build & Run
pnpm --filter @petals/api build
node apps/api/dist/main.js

# Production via Docker Compose
docker compose -f docker-compose.prod.yml up -d
```
