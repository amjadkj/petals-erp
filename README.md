# Petals Child Development Centre ERP — Backend

Backend REST API for a multi-branch pediatric therapy clinic ERP (**Petals Child Development Centre**).

Built as a **modular monolith** in NestJS with PostgreSQL 16 (Row-Level Security), Redis caching, and BullMQ queue processing.

---

## Architecture & Tech Stack

- **Runtime & Language**: Node.js 22 LTS, TypeScript 5.7
- **Framework**: NestJS 11 (Modular Monolith)
- **Monorepo**: pnpm workspaces (`apps/api`, `apps/web`, `packages/types`, `packages/config`)
- **Database & ORM**: PostgreSQL 16 with Row-Level Security (RLS) & `btree_gist`, Prisma 6.3
- **Cache & Queue**: Redis 7, BullMQ 5
- **Security**: PostgreSQL RLS (`FORCE ROW LEVEL SECURITY`), Argon2id hashing, AES-256-GCM encryption for 2FA secrets, Helmet, Token-Bucket Rate Limiting with escalating login lockout
- **Documentation**: OpenAPI 3.0 / Swagger at `/api/docs`, exported spec at `docs/openapi.json`

---

## Getting Started (Local Development)

### 1. Prerequisites
- **Node.js**: $\ge 22.0.0$
- **pnpm**: $\ge 9.0.0$
- **Docker & Docker Compose** (for local PostgreSQL and Redis)

### 2. Setup Infrastructure
```bash
# Clone repository
git clone https://github.com/petals/petals-erp.git
cd petals-erp

# Copy environment variables
cp .env.example .env

# Start local PostgreSQL and Redis
docker compose up -d
```

### 3. Install Dependencies & Build Packages
```bash
# Install workspace dependencies
pnpm install

# Generate Prisma client
pnpm --filter @petals/api db:generate

# Build shared packages
pnpm --filter @petals/types build
```

### 4. Database Migrations & Seeding
```bash
# Run database migrations
pnpm --filter @petals/api db:migrate:deploy

# Seed initial roles, permissions, branches, departments, and Director
pnpm --filter @petals/api db:seed

# (Optional) Seed realistic demo data (refuses to run in production)
pnpm --filter @petals/api db:seed:demo
```

### 5. Run the Application
```bash
# Start API in watch mode
pnpm --filter @petals/api dev

# API server starts on http://localhost:3000
# Swagger API docs available at http://localhost:3000/api/docs
# Health check available at http://localhost:3000/health
```

---

## Environment Variable Reference

| Variable | Description | Default / Example | Required in Prod |
| :--- | :--- | :--- | :---: |
| `NODE_ENV` | Environment mode (`development`, `test`, `production`) | `development` | Yes |
| `PORT` | HTTP server listening port | `3000` | No |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://app_user:pass@localhost:5432/petals_erp?schema=public` | Yes |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` | Yes |
| `REDIS_PASSWORD` | Redis authentication password | `petals_redis_dev` | Yes |
| `JWT_ACCESS_SECRET` | Secret for signing short-lived access tokens (min 32 chars) | `your-secure-jwt-access-secret-32-chars` | Yes |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens (min 32 chars) | `your-secure-jwt-refresh-secret-32-chars` | Yes |
| `JWT_ACCESS_EXPIRATION` | Access token time-to-live | `15m` | No |
| `JWT_REFRESH_EXPIRATION`| Refresh token time-to-live | `7d` | No |
| `COOKIE_SECRET` | Secret for signed cookies (CSRF & Refresh cookies) | `your-secure-cookie-secret-min-32-chars` | Yes |
| `TWO_FACTOR_ENCRYPTION_KEY` | 32-byte hex key for encrypting TOTP secrets (AES-256-GCM) | `64-character-hex-string` | Yes |
| `DOCUMENT_HMAC_SECRET` | Secret for signing document download & upload URLs | `your-secure-hmac-secret-min-32-chars` | Yes |
| `WEBHOOK_SECRET` | Secret for verifying external WhatsApp/SMS webhooks | `your-secure-webhook-secret-min-32-chars` | Yes |
| `APP_CORS_ORIGIN` | Comma-separated list of allowed web frontend origins | `http://localhost:3001,https://erp.petals.com` | Yes |
| `RATE_LIMIT_USER_POINTS`| User token-bucket burst capacity | `40` | No |
| `RATE_LIMIT_USER_DURATION`| User token-bucket duration (seconds) | `20` | No |
| `RATE_LIMIT_IP_POINTS` | Unauthenticated IP token-bucket capacity | `10` | No |
| `RATE_LIMIT_IP_DURATION`| Unauthenticated IP token-bucket duration (seconds) | `20` | No |
| `CACHE_TTL_SCHEDULE` | Daily schedule cache TTL (seconds) | `300` | No |
| `CACHE_TTL_DASHBOARD` | Dashboard summary metrics cache TTL (seconds) | `60` | No |
| `CACHE_TTL_PERMISSIONS`| User permissions resolution cache TTL (seconds) | `3600` | No |

---

## Module Overview & Caching Specifications

All mutating operations write an audit log, enforce permissions via `@RequirePermission` / `@Roles`, and invalidate related cache keys.

| Module | Core Endpoints | Auth & Permissions | Pagination Envelope | Redis Cache Key(s) | Invalidation Trigger(s) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/auth/login`, `/auth/refresh`, `/auth/2fa/*`, `/auth/me` | `@Public()` / `@CurrentUser` | None | `user_session:{userId}:{sessionId}` | Logout, deactivation, token reuse |
| **Access** | `/access/roles`, `/access/roles/:id/permissions`, `/access/overrides` | `DIRECTOR` | None | `user_perms:{userId}` | Permission edit, override create/delete |
| **Branch** | `/branches`, `/branches/:id` | `BRANCH:VIEW`, `DIRECTOR` for writes | Offset (`page`, `pageSize`) | `active_branch_ids` | Branch creation / deactivation |
| **Department**| `/departments` | `Authenticated` | None | Static memory | Department updates |
| **Employee** | `/employees`, `/employees/:id` | `EMPLOYEES:VIEW`, salary masked | Offset (`page`, `pageSize`) | None | Profile updates |
| **Clients** | `/clients`, `/clients/:id`, `/clients/:id/guardians` | `CLIENTS:VIEW` (Role scoped) | Offset (`page`, `pageSize`) | None | Client edits, soft delete |
| **Clinical** | `/clients/:id/treatment-plans`, `/goals`, `/progress-entries` | `PROFILE_PROGRESS:VIEW` | Cursor (`nextCursor`) | None | Goal edits, progress logs |
| **Schedule** | `/appointments`, `/appointments/daily`, `/appointments/book` | `APPOINTMENTS:VIEW` | None (date bounded $\le 31$d) | `schedule:{branchId}:{yyyy-mm-dd}` | Booking, cancel, reschedule, staff leave |
| **Finance** | `/finance/invoices`, `/finance/payments`, `/finance/pnl` | `FINANCIAL:VIEW`, `DIRECTOR` (P&L) | Offset (`page`, `pageSize`) | `finance:revenue:*`, `finance:pnl:*` | Payment recorded, invoice marked |
| **Reports** | `/reports`, `/reports/:id/share`, `/documents/upload-url` | `REPORTS:VIEW`, signed URLs | Offset (`page`, `pageSize`) | None | Report share, upload |
| **Leads** | `/leads`, `/leads/board`, `/leads/:id/convert` | `LEADS:VIEW`, atomic conversion | Cursor (per Kanban stage) | None | Stage change, conversion |
| **Communication**| `/communication/send`, `/communication/webhook` | `COMMUNICATION:CREATE` | Cursor (`nextCursor`) | `rate_limit:bulk:{userId}` | Webhook delivery updates |
| **HR** | `/hr/attendance`, `/hr/leaves`, `/hr/leaves/:id/approve` | `HRMS:VIEW`, Director / backup | Offset (`page`, `pageSize`) | None | Leave approved (clears schedule cache) |
| **Dashboard** | `/dashboard` | `DASHBOARD:VIEW` (Role tailored) | None (Aggregated) | `dashboard:{branchId}:{role}` | 60-second automatic TTL |
| **Audit** | `/audit/logs`, `/audit/clinical-history` | `DIRECTOR` only | Cursor (`nextCursor`) | None | Immutable append-only |

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
3. **Database Roles**:
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

## Production Deployment & Operations

### 1. Production Docker Compose
Deploy with a single command:
```bash
docker compose -f docker-compose.prod.yml up -d
```
The production stack includes:
- **`postgres`**: PostgreSQL 16 on persistent volume.
- **`redis`**: Redis 7 with AOF (`everysec`) and RDB (`save 60 1`) persistence, `volatile-lru` eviction.
- **`migrator`**: Runs `prisma migrate deploy` as the `migrator` role before API boots.
- **`api`**: Multi-stage minimal container running as non-root `appuser` (UID 10001) connecting as `app_user` (`NOBYPASSRLS`).

### 2. Health Checks
The health endpoint probes both database and cache:
```bash
curl -fsS http://localhost:3000/health
```
Response:
```json
{
  "status": "ok",
  "database": "ok",
  "redis": "ok",
  "uptime": 1420,
  "timestamp": "2026-11-11T11:30:00.000Z"
}
```

### 3. Backup & Disaster Recovery
Full backup, encryption, and tested restore procedures are documented in [`docs/backup-restore.md`](docs/backup-restore.md).
