# Final Checklist: Petals ERP Backend

Run this after Phase 17. Save the result in `docs/FINAL_REPORT.md`.

## Instructions for the agent

For every item below:

1. Verify it by running a test or command, or by reading the code. Do not rely on memory or on earlier phase reports.
2. Set the status to **PASS**, **FAIL** or **NOT VERIFIED**.
3. Write the evidence: a test name and result, a command and its output, or a file and line number. An item without evidence cannot be PASS.
4. For FAIL and NOT VERIFIED, fix the problem or explain exactly what blocks it.
5. Never weaken, skip or delete a test to make an item pass.

Status values: `PASS` | `FAIL` | `NOT VERIFIED`

---

## A. Project and data model

| ID | Requirement | How to verify | Status | Evidence |
|---|---|---|---|---|
| A1 | `pnpm dev` starts the API, and `docker compose up -d` starts Postgres and Redis healthy | Run both, check `docker compose ps` | | |
| A2 | HTTP platform is NestJS with Express (not Fastify) | Check `package.json` and `main.ts` | | |
| A3 | `schema.prisma` validates and the init migration creates all 37 tables | `npx prisma validate`, `migrate dev`, count tables | | |
| A4 | There is no room entity: no `Room` model, `roomId` on appointments or schedules, or room logic in code or tests | `grep -ri "room" apps/api/src apps/api/prisma` | | |
| A5 | `docs/er-diagram.md` matches `schema.prisma` (37 tables, same relations) | Compare table list and relations | | |
| A6 | Missing foreign-key indexes were added (assessments.assessor, treatment_plans.department, progress_entries.appointment, documents.uploaded_by, appointments.schedule, invoices.plan, payments.recorded_by, expenses.recorded_by, whatsapp_templates.approved_by, communication_logs.template, leave_requests.decided_by) | Inspect the migration or `\d table` | | |
| A7 | Raw-SQL migration exists with `btree_gist`, a therapist-overlap exclusion constraint using `tsrange` (not `tstzrange`), and `CHECK (amount > 0)` on payments and invoices | Read the migration, try to insert an overlapping appointment and a zero payment | | |
| A8 | `Role.key` (`RoleKey` enum) is unique and seeded for the four roles | Query the roles table | | |
| A9 | Seed creates roles, permissions, five departments, the first branch and the first Director with a forced password change; demo seed refuses to run in production | Run the seeds, test with `NODE_ENV=production` | | |
| A10 | All timestamps are UTC, money columns are decimal, `branches.timezone` exists | Inspect schema and a sample query | | |

## B. Authentication and sessions

| ID | Requirement | How to verify | Status | Evidence |
|---|---|---|---|---|
| B1 | Passwords hashed with argon2; no plain-text secrets stored | Read auth code, inspect a user row | | |
| B2 | JWT contains only the user id and the session id; role and permissions are never read from the token | Decode a token, read `AuthGuard` | | |
| B3 | Refresh token is in an httpOnly secure sameSite cookie, stored only as a hash, rotated on every use, and reuse of an old token revokes the whole family | e2e test | | |
| B4 | Logout and logout-all revoke the session, and the very next request with that access token is rejected | e2e test | | |
| B5 | A deactivated user or changed role takes effect on the next request | e2e test | | |
| B6 | Director 2FA works (setup, verify, login challenge) and `two_factor_secret` is encrypted | e2e test, inspect a row | | |
| B7 | Parent OTP: expires, 5 attempts per code, a new code invalidates the old one | e2e test | | |
| B8 | The last active Director cannot be deactivated or demoted | e2e test | | |
| B9 | Login and reset responses do not reveal whether an account exists | e2e test | | |
| B10 | CSRF protection is active for the cookie flow | e2e test | | |

## C. Access control

| ID | Requirement | How to verify | Status | Evidence |
|---|---|---|---|---|
| C1 | Every route has `@RequirePermission`, `@Roles` or an explicit `@Public`, and a test fails if one is missing | Run the route-coverage test, add a route without a decorator and confirm failure | | |
| C2 | Guard order is Auth, Roles, Permission | Read `app.module.ts` | | |
| C3 | A disabled module returns 403 on every endpoint of that module | e2e test per module | | |
| C4 | Create, Update and Delete require View; View All is needed to see beyond own scope | e2e test | | |
| C5 | A user override beats the role setting | e2e test | | |
| C6 | The Director is always fully enabled and cannot be locked out | e2e test | | |
| C7 | Permission changes apply on the very next request (cache invalidated) | e2e test | | |
| C8 | A therapist cannot read another therapist's client unless they share a case | e2e test | | |
| C9 | A therapist can read other therapists' notes on a shared client but edit only their own | e2e test | | |
| C10 | A Manager cannot read assessments, observations, goals, progress or clinical reports | e2e test | | |
| C11 | Salary is returned only with `EMPLOYEE_SALARY` view permission; P&L only with `FINANCIAL_PNL` | e2e test | | |
| C12 | Role and permission changes, restore and branch creation are Director-only via `@Roles` | e2e test | | |
| C13 | Records outside a user's scope return 404 where a 403 would reveal that the record exists | e2e test | | |

## D. Parents

| ID | Requirement | How to verify | Status | Evidence |
|---|---|---|---|---|
| D1 | A parent sees only their own children, resolved through `client_guardians` | e2e test with two families | | |
| D2 | A parent sees assessments only if the guardian flag allows it | e2e test | | |
| D3 | A parent sees only reports and documents marked as shared | e2e test | | |
| D4 | A parent sees payment status (paid, pending, advance) and payment plan only; there is no online payment endpoint | e2e test, review routes | | |
| D5 | A parent's schedule is read-only | e2e test | | |

## E. Branch isolation and row-level security

| ID | Requirement | How to verify | Status | Evidence |
|---|---|---|---|---|
| E1 | The Prisma extension scopes branch-owned models (clients, leads, appointments, invoices, expenses, attendance_records) | Test: branch A request never returns branch B rows | | |
| E2 | A client belongs to exactly one branch and attends sessions only there | Review schema and tests | | |
| E3 | The API connects as `app_user` (not superuser, `NOBYPASSRLS`); migrations run as `migrator` | Check roles and connection strings | | |
| E4 | RLS is enabled and forced on branch-owned tables, with USING and WITH CHECK, failing closed when no context is set | Run tests as `app_user`: no context returns 0 rows | | |
| E5 | Sensitive child tables (assessments, reports, progress_entries, payments, documents) have parent-based policies | Inspect policies, test cross-branch read | | |
| E6 | The branch setting is applied with `set_config(..., true)` inside the same transaction as the queries, with bound parameters | Read the extension, run a pooled-connection test | | |
| E7 | RLS still blocks branch B even when the Prisma filter is deliberately bypassed | e2e test | | |
| E8 | Background workers, seeds and scripts set an explicit context and do not use a BYPASSRLS credential | Read job code | | |
| E9 | The Director can switch between a branch and All Branches | e2e test | | |

## F. Clinical data integrity

| ID | Requirement | How to verify | Status | Evidence |
|---|---|---|---|---|
| F1 | Every clinical edit, delete and restore writes a `clinical_entry_versions` row in the same transaction | Test: edit, delete, restore, check three history rows | | |
| F2 | Deletes of clinical entries are soft deletes (`deleted_at`) and the Director can restore them | e2e test | | |
| F3 | The Director can edit and delete therapists' clinical entries | e2e test | | |
| F4 | History endpoints use cursor pagination | e2e test | | |
| F5 | Audit logs record mutating requests, logins, permission changes and reads of sensitive clinical data, with no passwords, tokens or clinical text | Inspect audit rows, grep logs | | |

## G. Business rules

| ID | Requirement | How to verify | Status | Evidence |
|---|---|---|---|---|
| G1 | Leave is approved by the Director; a Manager can approve as backup when the Director is away (`users.away_until`), recorded with `backup_approval = true` and `decided_by` | e2e test | | |
| G2 | Approved leave flags conflicting appointments and invalidates the affected daily-schedule cache keys | e2e test | | |
| G3 | Lead conversion: the stage can only become CONVERTED through the conversion flow; the client is created from the lead's details with guardian and link in one transaction; double conversion returns 409; the lead is kept | e2e test, force a failure to check rollback | | |
| G4 | Cancelled appointments stay visible with the cancel reason and notify the parent through the queue | e2e test | | |
| G5 | Therapist and client double-booking returns a clear 409, with the database constraint as the last defence | e2e test | | |
| G6 | Recurring schedules generate appointments through a job, and a nightly job extends the window | Job test | | |
| G7 | Recording a payment updates the invoice status in one transaction | e2e test | | |
| G8 | Revenue categories CLINICAL_THERAPY and ASSESSMENT_FEE are used; P&L totals match fixtures | Unit and e2e tests | | |
| G9 | Sharing a report is one transaction: set shared, audit entry, activity record, parent notification | e2e test | | |
| G10 | Overdue-report detection and the daily reminder job work | Job test | | |
| G11 | WhatsApp: only APPROVED templates can be sent; Director and Manager manage templates; guardian consent is respected; webhook signatures are verified | e2e test | | |

## H. Pagination and N+1

| ID | Requirement | How to verify | Status | Evidence |
|---|---|---|---|---|
| H1 | Every list endpoint is paginated with a capped page size (max 100) and a stable id tiebreaker | Review every list route | | |
| H2 | Offset pagination for admin tables; cursor pagination for audit logs, communication logs, progress entries, session history, version history and attendance history | Review and test | | |
| H3 | Sort fields come from a per-endpoint whitelist | Test an invalid sort field | | |
| H4 | Every list endpoint has a query-count test, and the count does not grow with the number of rows | Run tests with 10 and 100 fixture rows | | |
| H5 | The client list makes at most 4 queries for 50 rows | Query-count test | | |
| H6 | No `await` inside a loop or `map` in service code | Lint rule or code search | | |
| H7 | Exports and large reports run as background jobs and return a signed download link | e2e test | | |
| H8 | Dashboards, P&L and utilisation use raw SQL with tagged templates or views | Code review | | |

## I. Caching and rate limiting

| ID | Requirement | How to verify | Status | Evidence |
|---|---|---|---|---|
| I1 | The daily schedule is cached per branch and date, with explicit invalidation on every create, reschedule, cancel, attendance mark, schedule change and approved leave | e2e test per mutation | | |
| I2 | The caller's scope is applied after reading the cache (therapist own, parent own children), so a shared key never leaks rows | e2e test with three roles | | |
| I3 | If Redis is down, the daily schedule falls back to the database | Stop Redis and run the test | | |
| I4 | Dashboard and report caches use short TTLs and never put per-user data in shared keys | Review cache keys | | |
| I5 | Responses containing patient data send `Cache-Control: no-store` | Check response headers | | |
| I6 | Global token bucket (capacity 40, refill 2 per second per user; unauthenticated per IP) returns 429 with `Retry-After` | e2e test | | |
| I7 | Two users behind the same IP do not affect each other | e2e test | | |
| I8 | Login lockout (5 per account, 20 per IP, per 15 minutes, escalating delay, no permanent lock) works | e2e test | | |
| I9 | OTP, password reset, refresh, bulk messaging, export, upload and search limits are enforced | e2e test per limit | | |
| I10 | If Redis is down, general limits fail open with an alert, and login and OTP fail closed or use a small fallback | Stop Redis and test | | |
| I11 | Webhooks are exempt from user limits only after signature verification | e2e test | | |
| I12 | Trust proxy is configured so the real client IP is used | Test with `X-Forwarded-For` | | |

## J. Security

| ID | Requirement | How to verify | Status | Evidence |
|---|---|---|---|---|
| J1 | Helmet, a strict CORS allow-list, request size limits and timeouts are set | Check headers and config | | |
| J2 | `ValidationPipe` has `whitelist` and `forbidNonWhitelisted`; responses use DTOs, never raw rows | Test an unknown field; review controllers | | |
| J3 | No SQL is built from strings and no `$queryRawUnsafe` exists | `grep -r "queryRawUnsafe\|executeRawUnsafe" apps/api/src` | | |
| J4 | No secrets are committed; `.env` is git-ignored; `.env.example` has placeholders only | Check git history and files | | |
| J5 | Dependency audit and secret scanning run in CI and pass | CI results | | |
| J6 | Logs contain no passwords, tokens or clinical content | Grep logs from a test run | | |
| J7 | Uploads check type and size, are stored outside the app server, and are served by short-lived signed URLs | e2e test | | |
| J8 | Swagger is disabled or protected in production | Run with `NODE_ENV=production` | | |
| J9 | Source maps are not published in production builds | Check build output | | |

## K. Infrastructure and configuration

| ID | Requirement | How to verify | Status | Evidence |
|---|---|---|---|---|
| K1 | Redis runs with a password, `appendonly yes` and `maxmemory-policy noeviction`, and is bound to `127.0.0.1` locally | `redis-cli config get`, `docker compose config` | | |
| K2 | Postgres port is bound to `127.0.0.1` locally | `docker compose config` | | |
| K3 | `REDIS_URL` is the single way Redis is configured (no duplicate host and port variables) | Read config module | | |
| K4 | Environment variables are validated at startup and the app refuses to start when one is missing or malformed | Remove a variable and start | | |
| K5 | Health endpoint checks the database and Redis | Call it with Redis stopped | | |
| K6 | The API Dockerfile runs as a non-root user | Read the Dockerfile | | |
| K7 | CI runs lint, unit tests and e2e tests against Postgres and Redis services, and runs `prisma migrate deploy` as `migrator` for deployment | CI config and run | | |
| K8 | A backup and restore checklist exists, and a restore was tested | Read docs, show the test | | |

## L. Testing and documentation

| ID | Requirement | How to verify | Status | Evidence |
|---|---|---|---|---|
| L1 | Lint, type-check, unit tests and e2e tests all pass | Run the full suite | | |
| L2 | Every module has unit tests for its rules and e2e tests for its permissions | Review test folders | | |
| L3 | OpenAPI documentation is complete (descriptions, parameters, responses, 401, 403, 404, 429) and `openapi.json` is exported | Open `/api/docs`, check the file | | |
| L4 | TypeScript types are generated into `packages/types` | Run the generate script | | |
| L5 | A load test of the client list, daily schedule and dashboard reports p95 latency and query counts | Read the README results | | |
| L6 | `README.md` covers setup, the environment variable table, the module overview, pagination envelopes, cache keys and invalidation rules | Read the README | | |
| L7 | `docs/PROGRESS.md` shows every phase finished and each phase has its own commit | `git log` | | |

---

## Open decisions to record in the final report

1. Expense categories for the P&L (`expenses.category` is free text until decided).
2. How the Director is marked unavailable for backup leave approval (currently a manual `away_until` date).
3. Whether a department room can host several sessions at the same time (there is no room entity, so no limit exists today).
4. WhatsApp template approval and message-cost ownership, which sits with the Director and Manager.

## Report format for `docs/FINAL_REPORT.md`

1. Summary: totals of PASS, FAIL and NOT VERIFIED per section.
2. The full table with status and evidence for every item.
3. Open decisions (above) and any assumptions made during the build.
4. Known limitations and anything unfinished, in priority order.
5. The commands to run the full test suite, start the app and run migrations and seeds.