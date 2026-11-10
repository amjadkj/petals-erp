# Petals ERP – Build Progress

| Phase | Name | Status | Date | Notes |
|-------|------|--------|------|-------|
| 01 | Monorepo | ✅ Done | 2026-11-10 | pnpm workspaces, NestJS API, Next.js placeholder, shared packages, Docker Compose, CI workflow, Prisma schema with RoleKey enum + unique key on Role, init migration + constraints migration (btree_gist, overlap exclusion, CHECK amount > 0), 11 missing FK indexes added, unit + e2e tests passing |

## Decisions Made
- Used local PostgreSQL 17 (Windows service) instead of Docker for development since Docker Desktop daemon was stopped.
- Redis not yet running locally; will need Docker or native install for Phase 02.
- Used `tsrange()` instead of `tstzrange()` for the therapist overlap exclusion constraint since Prisma DateTime maps to `timestamp(3) without time zone`.

## Open Items
- Docker Desktop installed but daemon not running — Redis unavailable until started.
- `final-checklist.md` is still empty (0 bytes).
