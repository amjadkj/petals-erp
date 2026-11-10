SECURITY RULES
- Helmet, strict CORS allow-list, CSRF protection for the cookie-based refresh token, argon2 password hashing, secrets only from env/secret manager, request size limits and timeouts.
- Never build SQL from strings. No $queryRawUnsafe. Raw SQL only with tagged templates. Global ValidationPipe with whitelist and forbidNonWhitelisted. Return DTOs, never raw rows.
- All timestamps UTC. Money as Decimal. Soft delete clinical tables (deletedAt). Multi-step writes run in a Prisma transaction.
- Slow or external work (WhatsApp, email, push, recurring appointments, reminders, exports) goes through BullMQ jobs.
- Never log passwords, tokens or clinical content. One consistent error format. Every endpoint documented in Swagger.
- Every module ships with unit tests for its rules and e2e tests for its permissions. A test must fail if any route has neither @RequirePermission nor @Roles nor @Public.
- Work in small steps, run tests before saying a phase is done, and list anything you could not finish.