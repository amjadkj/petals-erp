Project: Backend for a multi-branch therapy clinic ERP (Petals Child Development Centre).
Roles: Director, Manager, Therapist, Parent. The Director has access to everything and controls everyone else's access.

Stack: pnpm monorepo (apps/api NestJS + TypeScript, apps/web placeholder, packages/types, packages/config), Prisma 6, PostgreSQL 16, Redis + BullMQ, REST at /api/v1 with Swagger/OpenAPI, class-validator, Jest + supertest, Docker Compose for local db and redis.

Architecture: modular monolith, feature folders. Each module = controller (thin, permission decorator, DTOs) -> service (business rules, transactions) -> Prisma. Add a repository file only for complex queries. Modules call each other only through exported services. Shared code lives in src/common (guards, decorators, interceptors, filters, prisma, redis, queue).

Source of truth for the data model: apps/api/prisma/schema.prisma. Do not change it without telling me why.