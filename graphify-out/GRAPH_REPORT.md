# Graph Report - petals-erp  (2026-11-10)

## Corpus Check
- 177 files · ~49,189 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .example 1, (none) 1, .toml 1)

## Summary
- 1182 nodes · 2421 edges · 94 communities (43 shown, 51 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 72 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0caa1573`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- redis/index.ts
- otp.service.ts
- 4.1 Director
- CacheService
- access.e2e-spec.ts
- env
- audit.interceptor.ts
- web/package.json
- redis
- common/index.ts
- compilerOptions
- src/index.ts
- AppModule
- dependencies
- package.json
- config/package.json
- CreateEmployeeDto
- devDependencies
- compilerOptions
- scripts
- types/package.json
- Diagrams by area
- api/package.json
- BranchService
- allowBuilds
- api/tsconfig.json
- types/tsconfig.json
- nest-cli.json
- seed.ts
- RequestContextStorage
- tsconfig.build.json
- roles.guard.spec.ts
- department.controller.ts
- CurrentUser
- UpdateUserDto
- class-validator
- Ponytail, lazy senior dev mode
- RoleKey
- auth.guard.ts
- @nestjs/common
- PrismaService
- UpdateRoleModulesDto
- UpdateRolePermissionsDto
- VersionService
- UpdateUserOverridesDto
- LoginDto
- common/index.ts
- CreateUserDto
- AuthGuard
- RoleKey
- auth.service.ts
- LockoutService
- AuthService
- OffsetPaginationDto
- EnvironmentVariables
- auth.controller.ts
- prisma.service.ts
- AssignBranchDto
- AppController
- TokenBucketGuard
- ChangePasswordDto
- ts-loader@^9.5.2

## God Nodes (most connected - your core abstractions)
1. `@nestjs/common` - 72 edges
2. `RoleKey` - 48 edges
3. `AppModule` - 46 edges
4. `PrismaService` - 34 edges
5. `PermissionAction` - 30 edges
6. `Roles()` - 29 edges
7. `CurrentUser` - 29 edges
8. `IRequestContext` - 28 edges
9. `AccessService` - 24 edges
10. `@nestjs/swagger` - 24 edges

## Surprising Connections (you probably didn't know these)
- `Decisions Made` --references--> `CacheService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/redis/cache.service.ts
- `Decisions Made` --references--> `LockoutService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/rate-limit/lockout.service.ts
- `AuthTokens` --references--> `RoleKey`  [EXTRACTED]
  apps/api/src/auth/auth.service.ts → packages/types/src/index.ts
- `CachedUserData` --references--> `RoleKey`  [EXTRACTED]
  apps/api/src/common/guards/auth.guard.ts → packages/types/src/index.ts
- `RolePermissionItemDto` --references--> `AppModule`  [EXTRACTED]
  apps/api/src/access/dto/update-role-permissions.dto.ts → packages/types/src/index.ts

## Import Cycles
- None detected.

## Communities (94 total, 51 thin omitted)

### Community 0 - "redis/index.ts"
Cohesion: 0.23
Nodes (4): MemoryCacheEntry, REDIS_CLIENT, RedisModule, ioredis

### Community 1 - "otp.service.ts"
Cohesion: 0.18
Nodes (9): @nestjs/config@^4.0.0, @nestjs/jwt@^11.0.2, AuthModule, ConsoleOtpSender, IOtpSender, OTP_SENDER, generateNumericOtp(), @nestjs/config (+1 more)

### Community 2 - "4.1 Director"
Cohesion: 0.04
Nodes (44): 10. Release Phasing, 11. Assumptions, 12. Decisions and Remaining Open Questions, 13.1 Proposed Stack, 13.2 RBAC Implementation, 13.3 Authentication, 13.4 PWA Requirements, 13.5 Suggested Build Order (+36 more)

### Community 4 - "access.e2e-spec.ts"
Cohesion: 0.23
Nodes (6): AppModule, GlobalExceptionFilter, bootstrap(), cookie-parser, @nestjs/testing, supertest

### Community 5 - "env"
Cohesion: 0.05
Nodes (36): COOKIE_SECRET, DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_URL (+28 more)

### Community 6 - "audit.interceptor.ts"
Cohesion: 0.07
Nodes (10): rxjs@^7.8.1, AuditController, AUDIT_ACTION_KEY, AUDIT_ENTITY_KEY, AUDIT_IGNORE_KEY, AUDIT_SENSITIVE_READ_KEY, AuditInterceptor, AuditService (+2 more)

### Community 7 - "web/package.json"
Cohesion: 0.08
Nodes (29): dependencies, next@^15.1.7, @petals/types@workspace:*, react@^19.0.0, react-dom@^19.0.0, devDependencies, @petals/config@workspace:*, @types/node@^22.13.4 (+21 more)

### Community 8 - "redis"
Cohesion: 0.07
Nodes (30): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_PASSWORD, interval, retries, test, timeout (+22 more)

### Community 9 - "common/index.ts"
Cohesion: 0.10
Nodes (16): BRANCH_SORT_FIELDS, BranchQueryDto, buildCursorMeta(), buildCursorPagination(), buildOffsetMeta(), buildOffsetPagination(), buildOrderBy(), CursorPaginatedResponse (+8 more)

### Community 10 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, alwaysStrict, declaration, declarationMap, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+16 more)

### Community 11 - "src/index.ts"
Cohesion: 0.15
Nodes (14): ResolvedModulePermissions, ResolvedPermissionsMap, PaginationMetaCursor, PaginationMetaOffset, PermissionAction, CREATE, DELETE, UPDATE (+6 more)

### Community 12 - "AppModule"
Cohesion: 0.06
Nodes (24): AccessService, sanitizeAuditMetadata(), PermissionGuard, AppModule, APPOINTMENTS, CLIENTS, COMMUNICATION, DASHBOARD (+16 more)

### Community 13 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, bullmq@^5.41.3, class-transformer@^0.5.1, class-validator@^0.14.1, cookie-parser@^1.4.7, dotenv@^16.4.7, ioredis@^5.5.0, jsonwebtoken@^9.0.3 (+19 more)

### Community 14 - "package.json"
Cohesion: 0.11
Nodes (20): devDependencies, eslint@^9.39.5, prettier@^3.4.2, typescript@^5.7.3, typescript-eslint@^8.72.1, eslint, prettier, typescript (+12 more)

### Community 15 - "config/package.json"
Cohesion: 0.13
Nodes (20): devDependencies, eslint@^9.20.1, eslint-config-prettier@^10.0.1, eslint-plugin-prettier@^5.2.3, prettier@^3.4.2, typescript@^5.7.3, @typescript-eslint/eslint-plugin@^8.24.0, @typescript-eslint/parser@^8.24.0 (+12 more)

### Community 16 - "CreateEmployeeDto"
Cohesion: 0.07
Nodes (4): CreateEmployeeDto, UpdateEmployeeDto, EmployeeController, EmployeeService

### Community 17 - "devDependencies"
Cohesion: 0.08
Nodes (25): devDependencies, jest@^29.7.0, @nestjs/schematics@^11.0.0, @nestjs/testing@^11.0.9, @petals/config@workspace:*, prisma@^6.3.1, supertest@^7.0.0, ts-jest@^29.2.5 (+17 more)

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
Cohesion: 0.11
Nodes (17): helmet@^8.0.0, rate-limiter-flexible@^5.0.5, @nestjs/cli@^11.0.2, tsconfig-paths@^4.2.0, @types/express@^5.0.0, @types/jsonwebtoken@^9.0.10, @types/qrcode@^1.5.5, name (+9 more)

### Community 23 - "BranchService"
Cohesion: 0.09
Nodes (4): BranchController, BranchService, CreateBranchDto, UpdateBranchDto

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
Cohesion: 0.22
Nodes (9): argon2@^0.41.1, ALL_ACTIONS, ALL_MODULES, hashPassword(), main(), prisma, ROLE_PERMISSIONS_CONFIG, RoleSeedConfig (+1 more)

### Community 30 - "tsconfig.build.json"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

### Community 32 - "department.controller.ts"
Cohesion: 0.14
Nodes (3): DepartmentController, DepartmentModule, DepartmentService

### Community 33 - "CurrentUser"
Cohesion: 0.07
Nodes (9): AccessController, AuthController, CurrentUser, Public(), RequirePermission(), Roles(), UserController, UserService (+1 more)

### Community 36 - "Ponytail, lazy senior dev mode"
Cohesion: 0.50
Nodes (3): Before you write, Ponytail, lazy senior dev mode, The smallest complete change

### Community 37 - "RoleKey"
Cohesion: 0.31
Nodes (3): IRequestContext, RequestContextMiddleware, RequestContext

### Community 38 - "auth.guard.ts"
Cohesion: 0.24
Nodes (6): CurrentBranch, IS_PUBLIC_KEY, PERMISSION_KEY, PermissionRequirement, ROLES_KEY, CachedUserData

### Community 39 - "@nestjs/common"
Cohesion: 0.14
Nodes (8): AccessModule, AppService, AuditModule, BranchModule, ClinicalHistoryModule, EmployeeModule, @nestjs/common, @nestjs/core

### Community 72 - "VersionService"
Cohesion: 0.13
Nodes (4): AuditSensitiveRead(), ClinicalHistoryController, VersionHistoryQueryDto, VersionService

### Community 74 - "LoginDto"
Cohesion: 0.11
Nodes (6): LoginDto, RequestOtpDto, VerifyOtpDto, Disable2faDto, Enable2faDto, Verify2faLoginDto

### Community 75 - "common/index.ts"
Cohesion: 0.23
Nodes (7): CommonModule, LockoutResult, MemoryLockEntry, RateLimitModule, Throttle(), THROTTLE_KEY, ThrottleOptions

### Community 78 - "RoleKey"
Cohesion: 0.11
Nodes (8): RecordVersionParams, UserModule, RoleKey, DIRECTOR, MANAGER, PARENT, THERAPIST, @nestjs/swagger

### Community 79 - "auth.service.ts"
Cohesion: 0.24
Nodes (9): AuthTokens, TokenPayload, decryptSecret(), encryptSecret(), generateRandomToken(), getEncryptionKey(), hashPassword(), sha256() (+1 more)

### Community 80 - "LockoutService"
Cohesion: 0.17
Nodes (4): LockoutService, Decisions Made, Open Items, Petals ERP – Build Progress

### Community 82 - "OffsetPaginationDto"
Cohesion: 0.21
Nodes (3): RestoreEntityDto, CursorPaginationDto, OffsetPaginationDto

### Community 88 - "prisma.service.ts"
Cohesion: 0.28
Nodes (4): PrismaModule, BRANCH_SCOPED_MODELS, FILTERABLE_READ_OPS, SCOPED_WRITE_OPS

## Knowledge Gaps
- **35 isolated node(s):** `CREATE`, `DELETE`, `UPDATE`, `VIEW`, `VIEW_ALL` (+30 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 519 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **51 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `@nestjs/common` to `redis/index.ts`, `otp.service.ts`, `access.e2e-spec.ts`, `audit.interceptor.ts`, `common/index.ts`, `src/index.ts`, `dependencies`, `api/package.json`, `BranchService`, `roles.guard.spec.ts`, `department.controller.ts`, `RoleKey`, `auth.guard.ts`, `PrismaService`, `common/index.ts`, `RoleKey`, `auth.service.ts`, `auth.controller.ts`, `prisma.service.ts`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **What connects `CREATE`, `DELETE`, `UPDATE` to the rest of the system?**
  _35 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `4.1 Director` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Why does `AppModule` connect `AppModule` to `CurrentUser`, `class-validator`, `access.e2e-spec.ts`, `UpdateRoleModulesDto`, `auth.guard.ts`, `UpdateRolePermissionsDto`, `UpdateUserOverridesDto`, `common/index.ts`, `src/index.ts`, `RoleKey`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Should `env` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/swagger` connect `RoleKey` to `class-validator`, `access.e2e-spec.ts`, `auth.guard.ts`, `@nestjs/common`, `UpdateUserOverridesDto`, `LoginDto`, `common/index.ts`, `dependencies`, `OffsetPaginationDto`, `BranchService`, `api/package.json`, `auth.controller.ts`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Should `audit.interceptor.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06606606606606606 - nodes in this community are weakly interconnected._