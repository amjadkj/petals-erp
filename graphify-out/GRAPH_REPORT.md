# Graph Report - petals-erp  (2026-11-10)

## Corpus Check
- 188 files · ~55,093 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .example 1, (none) 1, .toml 1)

## Summary
- 1269 nodes · 2693 edges · 100 communities (43 shown, 57 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 83 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f475d2e7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- client.service.ts
- otp.service.ts
- 4.1 Director
- CacheService
- Roles
- env
- audit.interceptor.ts
- web/package.json
- redis
- employee.service.ts
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
- AuthController
- UpdateUserDto
- class-validator
- Ponytail, lazy senior dev mode
- RoleKey
- auth.guard.ts
- @nestjs/common
- RoleKey
- UserController
- UpdateRolePermissionsDto
- VersionService
- update-user-overrides.dto.ts
- LoginDto
- common/index.ts
- CreateUserDto
- AuthGuard
- src/index.ts
- auth.service.ts
- OtpService
- OffsetPaginationDto
- CurrentUser
- AccessService
- auth.controller.ts
- AuthService
- AssignBranchDto
- .getHealth
- CreateBranchDto
- LoginDto
- ts-loader@^9.5.2
- pagination/index.ts
- UserQueryDto
- BranchQueryDto
- PermissionGuard
- EmployeeQueryDto

## God Nodes (most connected - your core abstractions)
1. `@nestjs/common` - 78 edges
2. `RoleKey` - 69 edges
3. `AppModule` - 48 edges
4. `CurrentUser` - 37 edges
5. `PrismaService` - 34 edges
6. `PermissionAction` - 32 edges
7. `Roles()` - 29 edges
8. `@nestjs/swagger` - 29 edges
9. `IRequestContext` - 28 edges
10. `AccessService` - 26 edges

## Surprising Connections (you probably didn't know these)
- `Decisions Made` --references--> `CacheService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/redis/cache.service.ts
- `Decisions Made` --references--> `LockoutService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/rate-limit/lockout.service.ts
- `CachedUserData` --references--> `RoleKey`  [EXTRACTED]
  apps/api/src/common/guards/auth.guard.ts → packages/types/src/index.ts
- `AuthTokens` --references--> `RoleKey`  [EXTRACTED]
  apps/api/src/auth/auth.service.ts → packages/types/src/index.ts
- `IRequestContext` --references--> `RoleKey`  [EXTRACTED]
  apps/api/src/common/context/request-context.ts → packages/types/src/index.ts

## Import Cycles
- None detected.

## Communities (100 total, 57 thin omitted)

### Community 0 - "client.service.ts"
Cohesion: 0.05
Nodes (16): ALL_PROFILE_TABS, CLIENT_SORT_FIELDS, TAB_MODULE_MAP, ClientQueryDto, CreateClientDto, CreateGuardianDto, UpdateClientDto, AppointmentStatus (+8 more)

### Community 1 - "otp.service.ts"
Cohesion: 0.18
Nodes (9): @nestjs/config@^4.0.0, @nestjs/jwt@^11.0.2, AuthModule, ConsoleOtpSender, IOtpSender, OTP_SENDER, generateNumericOtp(), @nestjs/config (+1 more)

### Community 2 - "4.1 Director"
Cohesion: 0.04
Nodes (44): 10. Release Phasing, 11. Assumptions, 12. Decisions and Remaining Open Questions, 13.1 Proposed Stack, 13.2 RBAC Implementation, 13.3 Authentication, 13.4 PWA Requirements, 13.5 Suggested Build Order (+36 more)

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

### Community 9 - "employee.service.ts"
Cohesion: 0.29
Nodes (8): BRANCH_SORT_FIELDS, buildCursorMeta(), buildCursorPagination(), buildOffsetMeta(), buildOffsetPagination(), buildOrderBy(), EMPLOYEE_SORT_FIELDS, USER_SORT_FIELDS

### Community 10 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, alwaysStrict, declaration, declarationMap, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+16 more)

### Community 11 - "src/index.ts"
Cohesion: 0.15
Nodes (12): ResolvedModulePermissions, ResolvedPermissionsMap, PermissionAction, CREATE, DELETE, UPDATE, VIEW, VIEW_ALL (+4 more)

### Community 12 - "AppModule"
Cohesion: 0.10
Nodes (21): AppModule, APPOINTMENTS, CLIENTS, COMMUNICATION, DASHBOARD, EMPLOYEE_SALARY, EMPLOYEES, FINANCIAL (+13 more)

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
Cohesion: 0.13
Nodes (3): BranchController, BranchService, UpdateBranchDto

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
Cohesion: 0.15
Nodes (3): DepartmentController, DepartmentModule, DepartmentService

### Community 36 - "Ponytail, lazy senior dev mode"
Cohesion: 0.50
Nodes (3): Before you write, Ponytail, lazy senior dev mode, The smallest complete change

### Community 37 - "RoleKey"
Cohesion: 0.26
Nodes (4): IRequestContext, RequestContext, CachedUserData, @nestjs/core

### Community 38 - "auth.guard.ts"
Cohesion: 0.32
Nodes (5): CurrentBranch, IS_PUBLIC_KEY, PERMISSION_KEY, PermissionRequirement, ROLES_KEY

### Community 39 - "@nestjs/common"
Cohesion: 0.05
Nodes (24): AccessModule, AppController, AppModule, AppService, AuditModule, sanitizeAuditMetadata(), BranchModule, ClientModule (+16 more)

### Community 69 - "RoleKey"
Cohesion: 0.15
Nodes (6): ClientService, RoleKey, DIRECTOR, MANAGER, PARENT, THERAPIST

### Community 72 - "VersionService"
Cohesion: 0.13
Nodes (4): AuditSensitiveRead(), ClinicalHistoryController, VersionHistoryQueryDto, VersionService

### Community 73 - "update-user-overrides.dto.ts"
Cohesion: 0.12
Nodes (4): RoleModuleItemDto, UpdateRoleModulesDto, UpdateUserOverridesDto, UserOverrideItemDto

### Community 74 - "LoginDto"
Cohesion: 0.20
Nodes (5): RequestOtpDto, VerifyOtpDto, Disable2faDto, Enable2faDto, Verify2faLoginDto

### Community 75 - "common/index.ts"
Cohesion: 0.06
Nodes (20): CommonModule, EnvironmentVariables, validate(), RequestContextMiddleware, PrismaModule, LockoutResult, LockoutService, MemoryLockEntry (+12 more)

### Community 78 - "src/index.ts"
Cohesion: 0.23
Nodes (4): NoStoreInterceptor, PaginationMetaCursor, PaginationMetaOffset, @nestjs/swagger

### Community 79 - "auth.service.ts"
Cohesion: 0.29
Nodes (8): AuthTokens, TokenPayload, decryptSecret(), encryptSecret(), generateRandomToken(), getEncryptionKey(), hashPassword(), sha256()

### Community 82 - "OffsetPaginationDto"
Cohesion: 0.23
Nodes (3): RestoreEntityDto, CursorPaginationDto, OffsetPaginationDto

### Community 83 - "CurrentUser"
Cohesion: 0.24
Nodes (3): ClientController, CurrentUser, RequirePermission()

### Community 94 - "pagination/index.ts"
Cohesion: 0.46
Nodes (4): CursorPaginatedResponse, CursorPaginationMeta, OffsetPaginatedResponse, OffsetPaginationMeta

## Knowledge Gaps
- **42 isolated node(s):** `DIRECTOR`, `MANAGER`, `THERAPIST`, `PARENT`, `ACTIVE` (+37 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 556 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **57 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `@nestjs/common` to `client.service.ts`, `otp.service.ts`, `department.controller.ts`, `RoleKey`, `audit.interceptor.ts`, `RoleKey`, `auth.guard.ts`, `employee.service.ts`, `src/index.ts`, `common/index.ts`, `dependencies`, `src/index.ts`, `auth.service.ts`, `api/package.json`, `auth.controller.ts`, `roles.guard.spec.ts`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **What connects `DIRECTOR`, `MANAGER`, `THERAPIST` to the rest of the system?**
  _42 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `client.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05319148936170213 - nodes in this community are weakly interconnected._
- **Why does `RoleKey` connect `RoleKey` to `client.service.ts`, `department.controller.ts`, `Roles`, `RoleKey`, `auth.guard.ts`, `@nestjs/common`, `employee.service.ts`, `src/index.ts`, `src/index.ts`, `auth.service.ts`, `CreateEmployeeDto`, `CurrentUser`, `AccessService`, `auth.controller.ts`, `roles.guard.spec.ts`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `4.1 Director` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/swagger` connect `src/index.ts` to `client.service.ts`, `department.controller.ts`, `class-validator`, `RoleKey`, `UpdateRolePermissionsDto`, `@nestjs/common`, `update-user-overrides.dto.ts`, `LoginDto`, `dependencies`, `api/package.json`, `auth.controller.ts`, `CreateBranchDto`, `LoginDto`, `pagination/index.ts`, `audit-log-query.dto.ts`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Should `env` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._