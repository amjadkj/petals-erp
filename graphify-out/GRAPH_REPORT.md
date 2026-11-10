# Graph Report - petals-erp  (2026-11-10)

## Corpus Check
- 131 files · ~38,104 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .example 1, (none) 1, .toml 1)

## Summary
- 903 nodes · 1692 edges · 87 communities (36 shown, 51 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d4ffb547`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- common/index.ts
- otp.service.ts
- 4.1 Director
- CacheService
- app.module.ts
- env
- @nestjs/swagger
- web/package.json
- redis
- AuthController
- compilerOptions
- src/index.ts
- AppModule
- dependencies
- package.json
- config/package.json
- PrismaService
- devDependencies
- compilerOptions
- scripts
- types/package.json
- Diagrams by area
- api/package.json
- auth.service.ts
- allowBuilds
- api/tsconfig.json
- types/tsconfig.json
- nest-cli.json
- seed.ts
- RequestContextStorage
- tsconfig.build.json
- auth.guard.ts
- AuthService
- AccessService
- LockoutService
- ChangePasswordDto
- Ponytail, lazy senior dev mode
- RoleKey
- @types/supertest@^6.0.2
- OtpService
- auth.controller.ts
- UpdateRoleModulesDto
- UpdateRolePermissionsDto
- @types/node@^22.13.4
- UpdateUserOverridesDto
- VerifyOtpDto
- two-factor.dto.ts
- LoginDto
- AuthGuard
- .resolvePermission
- bullmq@^5.41.3
- ts-jest@^29.2.5
- ts-node@^10.9.2
- @types/jsonwebtoken@^9.0.10

## God Nodes (most connected - your core abstractions)
1. `@nestjs/common` - 46 edges
2. `AppModule` - 40 edges
3. `RoleKey` - 35 edges
4. `PermissionAction` - 23 edges
5. `PrismaService` - 23 edges
6. `compilerOptions` - 23 edges
7. `AccessService` - 22 edges
8. `AuthService` - 21 edges
9. `Roles()` - 20 edges
10. `CurrentUser` - 20 edges

## Surprising Connections (you probably didn't know these)
- `Decisions Made` --references--> `LockoutService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/rate-limit/lockout.service.ts
- `Decisions Made` --references--> `CacheService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/redis/cache.service.ts
- `CachedUserData` --references--> `RoleKey`  [EXTRACTED]
  apps/api/src/common/guards/auth.guard.ts → packages/types/src/index.ts
- `AuthTokens` --references--> `RoleKey`  [EXTRACTED]
  apps/api/src/auth/auth.service.ts → packages/types/src/index.ts
- `RoleModuleItemDto` --references--> `AppModule`  [EXTRACTED]
  apps/api/src/access/dto/update-role-modules.dto.ts → packages/types/src/index.ts

## Import Cycles
- None detected.

## Communities (87 total, 51 thin omitted)

### Community 0 - "common/index.ts"
Cohesion: 0.05
Nodes (26): CommonModule, EnvironmentVariables, validate(), CursorPaginationDto, OffsetPaginationDto, buildCursorMeta(), buildCursorPagination(), buildOffsetMeta() (+18 more)

### Community 1 - "otp.service.ts"
Cohesion: 0.22
Nodes (8): @nestjs/config@^4.0.0, @nestjs/jwt@^11.0.2, AuthModule, ConsoleOtpSender, IOtpSender, OTP_SENDER, @nestjs/config, @nestjs/jwt

### Community 2 - "4.1 Director"
Cohesion: 0.04
Nodes (44): 10. Release Phasing, 11. Assumptions, 12. Decisions and Remaining Open Questions, 13.1 Proposed Stack, 13.2 RBAC Implementation, 13.3 Authentication, 13.4 PWA Requirements, 13.5 Suggested Build Order (+36 more)

### Community 3 - "CacheService"
Cohesion: 0.16
Nodes (4): CacheService, Decisions Made, Open Items, Petals ERP – Build Progress

### Community 4 - "app.module.ts"
Cohesion: 0.16
Nodes (9): AppController, AppModule, AppService, GlobalExceptionFilter, bootstrap(), cookie-parser, @nestjs/common, @nestjs/testing (+1 more)

### Community 5 - "env"
Cohesion: 0.05
Nodes (36): COOKIE_SECRET, DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_URL (+28 more)

### Community 6 - "@nestjs/swagger"
Cohesion: 0.36
Nodes (3): class-transformer, class-validator, @nestjs/swagger

### Community 7 - "web/package.json"
Cohesion: 0.08
Nodes (29): dependencies, next@^15.1.7, @petals/types@workspace:*, react@^19.0.0, react-dom@^19.0.0, devDependencies, @petals/config@workspace:*, @types/node@^22.13.4 (+21 more)

### Community 8 - "redis"
Cohesion: 0.07
Nodes (30): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_PASSWORD, interval, retries, test, timeout (+22 more)

### Community 9 - "AuthController"
Cohesion: 0.20
Nodes (3): AuthController, Public(), ApiResponse

### Community 10 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, alwaysStrict, declaration, declarationMap, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+16 more)

### Community 11 - "src/index.ts"
Cohesion: 0.11
Nodes (18): ResolvedModulePermissions, ResolvedPermissionsMap, CurrentBranch, PERMISSION_KEY, PermissionRequirement, ROLES_KEY, PaginationMetaCursor, PaginationMetaOffset (+10 more)

### Community 12 - "AppModule"
Cohesion: 0.10
Nodes (21): AppModule, APPOINTMENTS, CLIENTS, COMMUNICATION, DASHBOARD, EMPLOYEE_SALARY, EMPLOYEES, FINANCIAL (+13 more)

### Community 13 - "dependencies"
Cohesion: 0.08
Nodes (24): dependencies, class-transformer@^0.5.1, class-validator@^0.14.1, cookie-parser@^1.4.7, helmet@^8.0.0, ioredis@^5.5.0, jsonwebtoken@^9.0.3, @nestjs/common@^11.0.9 (+16 more)

### Community 14 - "package.json"
Cohesion: 0.11
Nodes (20): devDependencies, eslint@^9.39.5, prettier@^3.4.2, typescript@^5.7.3, typescript-eslint@^8.72.1, eslint, prettier, typescript (+12 more)

### Community 15 - "config/package.json"
Cohesion: 0.13
Nodes (20): devDependencies, eslint@^9.20.1, eslint-config-prettier@^10.0.1, eslint-plugin-prettier@^5.2.3, prettier@^3.4.2, typescript@^5.7.3, @typescript-eslint/eslint-plugin@^8.24.0, @typescript-eslint/parser@^8.24.0 (+12 more)

### Community 16 - "PrismaService"
Cohesion: 0.11
Nodes (5): BRANCH_SCOPED_MODELS, FILTERABLE_READ_OPS, PrismaService, SCOPED_WRITE_OPS, QueryCounter

### Community 17 - "devDependencies"
Cohesion: 0.09
Nodes (23): devDependencies, jest@^29.7.0, @nestjs/cli@^11.0.2, @nestjs/schematics@^11.0.0, @nestjs/testing@^11.0.9, prisma@^6.3.1, supertest@^7.0.0, tsconfig-paths@^4.2.0 (+15 more)

### Community 18 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 19 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, db:generate, db:migrate, db:migrate:deploy, db:seed, dev, format (+9 more)

### Community 20 - "types/package.json"
Cohesion: 0.14
Nodes (16): devDependencies, @petals/config@workspace:*, rimraf@^6.0.1, typescript@^5.7.3, @petals/config, typescript, main, name (+8 more)

### Community 21 - "Diagrams by area"
Cohesion: 0.13
Nodes (14): Access control and identity, Branches, people and leads, Clinical records, Communication and system, Diagrams by area, Entity Relationship Diagram, Finance, Full diagram (+6 more)

### Community 22 - "api/package.json"
Cohesion: 0.14
Nodes (13): dotenv@^16.4.7, rate-limiter-flexible@^5.0.5, reflect-metadata@^0.2.2, @petals/config@workspace:*, ts-loader@^9.5.2, @petals/config, name, private (+5 more)

### Community 23 - "auth.service.ts"
Cohesion: 0.32
Nodes (7): AuthTokens, TokenPayload, decryptSecret(), encryptSecret(), generateRandomToken(), getEncryptionKey(), hashPassword()

### Community 24 - "allowBuilds"
Cohesion: 0.22
Nodes (8): allowBuilds, argon2, msgpackr-extract, prisma, @prisma/client, @prisma/engines, @scarf/scarf, packages

### Community 25 - "api/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, baseUrl, outDir, paths, extends, include, @petals/config/tsconfig.base.json

### Community 26 - "types/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, outDir, rootDir, extends, include, @petals/config/tsconfig.base.json

### Community 27 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 28 - "seed.ts"
Cohesion: 0.18
Nodes (11): argon2@^0.41.1, @prisma/client@^6.3.1, ALL_ACTIONS, ALL_MODULES, hashPassword(), main(), prisma, ROLE_PERMISSIONS_CONFIG (+3 more)

### Community 30 - "tsconfig.build.json"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

### Community 31 - "auth.guard.ts"
Cohesion: 0.17
Nodes (5): AccessModule, IS_PUBLIC_KEY, CachedUserData, RolesGuard, @nestjs/core

### Community 33 - "AccessService"
Cohesion: 0.12
Nodes (5): AccessController, AccessService, CurrentUser, RequirePermission(), Roles()

### Community 36 - "Ponytail, lazy senior dev mode"
Cohesion: 0.50
Nodes (3): Before you write, Ponytail, lazy senior dev mode, The smallest complete change

### Community 37 - "RoleKey"
Cohesion: 0.18
Nodes (8): IRequestContext, RequestContextMiddleware, RequestContext, RoleKey, DIRECTOR, MANAGER, PARENT, THERAPIST

### Community 39 - "OtpService"
Cohesion: 0.19
Nodes (3): OtpService, generateNumericOtp(), sha256()

### Community 75 - "two-factor.dto.ts"
Cohesion: 0.50
Nodes (3): Disable2faDto, Enable2faDto, Verify2faLoginDto

## Knowledge Gaps
- **35 isolated node(s):** `DIRECTOR`, `MANAGER`, `THERAPIST`, `PARENT`, `DASHBOARD` (+30 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 405 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **51 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `app.module.ts` to `common/index.ts`, `otp.service.ts`, `RoleKey`, `auth.controller.ts`, `src/index.ts`, `dependencies`, `PrismaService`, `api/package.json`, `auth.service.ts`, `auth.guard.ts`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `DIRECTOR`, `MANAGER`, `THERAPIST` to the rest of the system?**
  _35 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `common/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.053613053613053616 - nodes in this community are weakly interconnected._
- **Why does `AppModule` connect `AppModule` to `AccessService`, `RoleKey`, `@nestjs/swagger`, `UpdateRoleModulesDto`, `UpdateRolePermissionsDto`, `UpdateUserOverridesDto`, `src/index.ts`, `.resolvePermission`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Should `4.1 Director` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/swagger` connect `@nestjs/swagger` to `common/index.ts`, `app.module.ts`, `auth.controller.ts`, `RoleKey`, `two-factor.dto.ts`, `dependencies`, `api/package.json`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Should `env` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._