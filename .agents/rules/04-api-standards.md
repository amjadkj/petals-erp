PAGINATION STANDARD
- Every list endpoint is paginated. Never return an unbounded list.
- Offset pagination (page, pageSize; default 20, max 100) for filtered admin tables: clients, invoices, payments, employees, reports, leads.
- Cursor pagination (limit, cursor; default 20, max 100) for long append-heavy data: audit logs, communication logs, progress entries, session history, version history, attendance history.
- One response envelope: { data: [...], meta: { page, pageSize, total, hasNext } } for offset, { data: [...], meta: { nextCursor, hasNext } } for cursor. Skip the total count on very large tables.
- Sort fields come from a per-endpoint whitelist, with a stable tiebreaker (id). Exports and large reports are background jobs that return a download link, not big responses.

N+1 AND QUERY RULES
- No await inside a loop or map in service code. Load relations with select (only fields the screen needs), batch with where id in [...], and use groupBy or one SQL query for counts and aggregates.
- The number of queries an endpoint makes must depend on the shape of the response, never on the number of rows. Every list endpoint gets a query-count test (for example: client list of 50 rows makes at most 4 queries).
- Dashboards, P&L and utilisation use raw SQL via tagged templates or database views. Use relationLoadStrategy join only where it is supported and measured to help.
- Index every foreign key and every filter or sort column used by list endpoints (branchId, clientId, therapistId, startsAt, status, dueOn).

CACHING (server side, Redis)
- Use a CacheService with namespaced keys, TTLs and explicit invalidation. Cache: resolved permissions (invalidate on any role/override change), reference data (departments, rooms, report types; long TTL), the daily schedule, and dashboard aggregates (short TTL).
- Never cache anything user-specific in a shared key without applying the user's scope after reading. Never cache clinical text or payment detail in shared keys.
- API responses containing patient data send Cache-Control: no-store. Browser caching is handled by the web app, not by HTTP caching.

RATE LIMITING (Redis-backed, shared across instances)
- Global per-user token bucket: capacity 40, refill 2 tokens/second. Unauthenticated: by IP, capacity 10, refill 0.5/second. Never rate-limit authenticated traffic by IP alone (branches share an office IP). Enable trust proxy so the real client IP is used.
- Strict counters and lockouts (not token buckets) for: login 5 failures per 15 min per account and 20 per 15 min per IP with escalating delays (not permanent lock); OTP request 3 per 10 min and 10 per day per phone/email; OTP verify 5 attempts per code then invalidate; password reset 3 per hour; refresh 30 per hour; bulk messaging 5 per hour plus a daily cap per branch; exports 10 per hour; uploads 30 per hour; search 60 per minute.
- Return 429 in the standard error format with Retry-After. If Redis is down: general limits fail open with an alert; login/OTP fail closed or fall back to a small in-memory limit. Webhooks are exempt from user limits but must pass signature verification first.
- Heavy work (exports, bulk sends, reports) also has a concurrency limit per user.
