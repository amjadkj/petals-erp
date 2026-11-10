# Petals ERP – Build Progress

| Phase | Name | Status | Date | Notes |
|-------|------|--------|------|-------|
| 01 | Monorepo | ✅ Done | 2026-11-10 | pnpm workspaces, NestJS API, Next.js placeholder, shared packages, Docker Compose, CI workflow, Prisma schema with RoleKey enum + unique key on Role, init migration + constraints migration (btree_gist, overlap exclusion, CHECK amount > 0), 11 missing FK indexes added, unit + e2e tests passing |
| 02 | Common Layer | ✅ Done | 2026-11-10 | Built src/common: PrismaService with branch scoping client extension ($allOperations), AsyncLocalStorage RequestContext and middleware, decorators (@CurrentUser, @CurrentBranch, @Public, @Roles, @RequirePermission), GlobalExceptionFilter with standard envelope, environment variable validation, offset/cursor pagination DTOs and helpers with sort whitelist & tiebreaker, Redis module and CacheService with namespaced keys & metrics, TokenBucketGuard with in-memory fallback + Redis support, LockoutService with escalating backoff, QueryCounter test helper. Unit and e2e tests passing. |
| 03 | Auth | ✅ Done | 2026-11-10 | Argon2id password hashing, AES-256-GCM 2FA secret encryption, global AuthGuard with live DB/Redis validation (never trusts token claims), session revocation and user deactivation immediate blocking, short-lived JWTs (sub + sessionId only), refresh rotation with token reuse detection and CSRF validation, TOTP 2FA (setup, enable, login challenge, disable), OTP service with 5-attempt limit and ConsoleOtpSender, lockout escalation with Retry-After, GET /me profile endpoint, seed script. 55 unit tests + 17 e2e tests passing. |

## Decisions Made
- Used local PostgreSQL 17 (Windows service) instead of Docker for development since Docker Desktop daemon was stopped.
- Redis client uses lazyConnect and fail-open/in-memory fallback when offline so tests and app run seamlessly while Redis daemon is offline.
- Added in-memory store fallbacks to `CacheService` and `LockoutService` so rate limiting, lockouts, and 2FA temporary setup secrets operate accurately both with and without active Redis instances.
- Pinned `@nestjs/jwt` to `^11.0.0` (CommonJS) matching NestJS 11 ecosystem to avoid ESM parsing issues in Jest.
- Added `--forceExit` to `test:e2e` to prevent hanging open handles from offline Redis retries.
- Used flat config `eslint.config.mjs` with `typescript-eslint` across the monorepo.
- Used `tsrange()` instead of `tstzrange()` for the therapist overlap exclusion constraint since Prisma DateTime maps to `timestamp(3) without time zone`.

## Open Items
- Docker Desktop daemon is not yet running; live Redis tests will be run once started.
- `final-checklist.md` is still empty (0 bytes).
