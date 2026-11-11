# Petals Child Development Centre ERP — Backend

Backend REST API for a multi-branch pediatric therapy clinic ERP (Petals Child Development Centre).

## Tech Stack
- **Runtime & Language**: Node.js 22 LTS, TypeScript 5.7
- **Framework**: NestJS 11 (Modular Monolith)
- **Database & ORM**: PostgreSQL 16, Prisma 6.3
- **Cache & Queue**: Redis, BullMQ
- **Security**: PostgreSQL Row-Level Security (RLS), Argon2id, AES-256-GCM, Helmet, Rate Limiter (Token Bucket)

---

## Row-Level Security (RLS) & Hardening

Multi-branch data isolation is enforced at the database engine level via PostgreSQL Row-Level Security (RLS) with `FORCE ROW LEVEL SECURITY`.

### Isolation Model
1. **Direct Branch Entities**: `clients`, `leads`, `appointments`, `invoices`, `expenses`, `attendance_records` enforce:
   ```sql
   CREATE POLICY branch_isolation ON <table>
   AS RESTRICTIVE
   USING (app_all_branches() OR branch_id = ANY(app_branch_ids()))
   WITH CHECK (app_all_branches() OR branch_id = ANY(app_branch_ids()));
   ```
2. **Child Entities**: `treatment_plans`, `assessments`, `reports`, `payments`, `documents`, `progress_entries` enforce parent-relational `EXISTS` isolation policies.
3. **Database Users**:
   - `migrator`: DDL migrations and schema setup.
   - `app_user`: DML only (`SELECT, INSERT, UPDATE, DELETE`), `NOSUPERUSER`, `NOBYPASSRLS`.
4. **Context Passing**: Prisma client extension wraps queries in transactions setting session-local PostgreSQL configuration via parameterized `set_config('app.branch_ids', ...)`. Fails closed if unset.

---

## Performance & Load Test Results (Autocannon)

Key endpoints benchmarked using `autocannon` (10 concurrent connections, pipelining: 1, 5s duration):

| Endpoint | Method | Prisma Queries (per req) | Throughput (req/sec) | Latency p50 | Latency p95 | Latency p99 |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Client List** (`/api/v1/clients?page=1&pageSize=20`) | `GET` | 12 | 72.0 | 131 ms | 278 ms | 305 ms |
| **Daily Schedule** (`/api/v1/appointments/daily`) | `GET` | 44 | 132.0 | 70 ms | 141 ms | 143 ms |
| **Dashboard** (`/api/v1/dashboard`) | `GET` | 23 | 144.4 | 65 ms | 121 ms | 141 ms |

*Query counts are constant $O(1)$ with respect to branch dataset sizes with zero N+1 queries.*

---

## Security Hardening Verification
- **Route Permission Reflection**: 100% of controller routes protected by `@RequirePermission`, `@Roles`, or marked `@Public()`.
- **SQL Injection Prevention**: 0 instances of unsafe raw SQL concatenation (`$queryRawUnsafe` / `$executeRawUnsafe`).
- **Rate Limiting & Lockout**: Account lockout on 5 consecutive failed login attempts (429 with `Retry-After`), 5-attempt OTP limits, global token bucket per IP / user.
- **Data Protection**: `Cache-Control: no-store` on all clinical and financial routes, sensitive credentials redacted in logs.
