# Graph Report - petals-erp  (2026-11-10)

## Corpus Check
- 160 files · ~44,651 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .example 1, (none) 1, .toml 1)

## Summary
- 1100 nodes · 2212 edges · 88 communities (37 shown, 51 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 64 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `763ec691`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- token-bucket.guard.ts
- auth.service.ts
- 4.1 Director
- CacheService
- @nestjs/common
- env
- @nestjs/swagger
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
- auth.guard.ts
- department.controller.ts
- CurrentUser
- UpdateUserDto
- class-validator
- Ponytail, lazy senior dev mode
- RoleKey
- auth.guard.ts
- helmet
- jest@^29.7.0
- UpdateRoleModulesDto
- UpdateRolePermissionsDto
- @nestjs/schematics@^11.0.0
- UpdateUserOverridesDto
- VerifyOtpDto
- two-factor.dto.ts
- CreateUserDto
- AuthGuard
- RoleKey
- bullmq@^5.41.3
- prisma@^6.3.1
- ts-node@^10.9.2
- @types/cookie-parser@^1.4.8
- @types/jest@^29.5.14

## God Nodes (most connected - your core abstractions)
1. `@nestjs/common` - 62 edges
2. `AppModule` - 45 edges
3. `RoleKey` - 45 edges
4. `PrismaService` - 34 edges
5. `PermissionAction` - 29 edges
6. `IRequestContext` - 28 edges
7. `CurrentUser` - 28 edges
8. `Roles()` - 27 edges
9. `AccessService` - 25 edges
10. `compilerOptions` - 23 edges

## Surprising Connections (you probably didn't know these)
- `Decisions Made` --references--> `LockoutService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/rate-limit/lockout.service.ts
- `Decisions Made` --references--> `CacheService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/redis/cache.service.ts
- `AuthTokens` --references--> `RoleKey`  [EXTRACTED]
  apps/api/src/auth/auth.service.ts → packages/types/src/index.ts
- `CachedUserData` --references--> `RoleKey`  [EXTRACTED]
  apps/api/src/common/guards/auth.guard.ts → packages/types/src/index.ts
- `RolePermissionItemDto` --references--> `AppModule`  [EXTRACTED]
  apps/api/src/access/dto/update-role-permissions.dto.ts → packages/types/src/index.ts

## Import Cycles
- None detected.

## Communities (88 total, 51 thin omitted)

### Community 0 - "token-bucket.guard.ts"
Cohesion: 0.11
Nodes (11): LockoutResult, MemoryLockEntry, RateLimitModule, Throttle(), THROTTLE_KEY, ThrottleOptions, TokenBucketGuard, MemoryCacheEntry (+3 more)

### Community 1 - "auth.service.ts"
Cohesion: 0.05
Nodes (23): @nestjs/config@^4.0.0, @nestjs/jwt@^11.0.2, COOKIE_OPTIONS, AuthModule, AuthService, AuthTokens, TokenPayload, ChangePasswordDto (+15 more)

### Community 2 - "4.1 Director"
Cohesion: 0.04
Nodes (44): 10. Release Phasing, 11. Assumptions, 12. Decisions and Remaining Open Questions, 13.1 Proposed Stack, 13.2 RBAC Implementation, 13.3 Authentication, 13.4 PWA Requirements, 13.5 Suggested Build Order (+36 more)

### Community 3 - "CacheService"
Cohesion: 0.12
Nodes (5): CacheService, UserService, Decisions Made, Open Items, Petals ERP – Build Progress

### Community 4 - "@nestjs/common"
Cohesion: 0.05
Nodes (20): AccessModule, AppController, AppModule, AppService, BranchModule, CommonModule, GlobalExceptionFilter, PrismaModule (+12 more)

### Community 5 - "env"
Cohesion: 0.05
Nodes (36): COOKIE_SECRET, DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_URL (+28 more)

### Community 7 - "web/package.json"
Cohesion: 0.08
Nodes (29): dependencies, next@^15.1.7, @petals/types@workspace:*, react@^19.0.0, react-dom@^19.0.0, devDependencies, @petals/config@workspace:*, @types/node@^22.13.4 (+21 more)

### Community 8 - "redis"
Cohesion: 0.07
Nodes (30): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_PASSWORD, interval, retries, test, timeout (+22 more)

### Community 9 - "common/index.ts"
Cohesion: 0.07
Nodes (20): BRANCH_SORT_FIELDS, BranchQueryDto, EnvironmentVariables, validate(), CursorPaginationDto, OffsetPaginationDto, buildCursorMeta(), buildCursorPagination() (+12 more)

### Community 10 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, alwaysStrict, declaration, declarationMap, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+16 more)

### Community 11 - "src/index.ts"
Cohesion: 0.16
Nodes (14): ResolvedModulePermissions, ResolvedPermissionsMap, PaginationMetaCursor, PaginationMetaOffset, PermissionAction, CREATE, DELETE, UPDATE (+6 more)

### Community 12 - "AppModule"
Cohesion: 0.10
Nodes (21): AppModule, APPOINTMENTS, CLIENTS, COMMUNICATION, DASHBOARD, EMPLOYEE_SALARY, EMPLOYEES, FINANCIAL (+13 more)

### Community 13 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, class-transformer@^0.5.1, class-validator@^0.14.1, cookie-parser@^1.4.7, ioredis@^5.5.0, jsonwebtoken@^9.0.3, @nestjs/common@^11.0.9, @nestjs/core@^11.0.9 (+15 more)

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
Cohesion: 0.10
Nodes (21): devDependencies, @nestjs/cli@^11.0.2, @nestjs/testing@^11.0.9, @petals/config@workspace:*, supertest@^7.0.0, ts-jest@^29.2.5, ts-loader@^9.5.2, tsconfig-paths@^4.2.0 (+13 more)

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
Nodes (13): dotenv@^16.4.7, @nestjs/platform-express@^11.0.9, @petals/types@workspace:*, @types/jsonwebtoken@^9.0.10, @types/supertest@^6.0.2, @petals/types, name, private (+5 more)

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

### Community 31 - "auth.guard.ts"
Cohesion: 0.15
Nodes (4): ROLES_KEY, PermissionGuard, RolesGuard, @nestjs/core

### Community 32 - "department.controller.ts"
Cohesion: 0.14
Nodes (3): DepartmentController, DepartmentModule, DepartmentService

### Community 33 - "CurrentUser"
Cohesion: 0.08
Nodes (8): AccessController, AuthController, CurrentUser, Public(), RequirePermission(), Roles(), UserController, ApiResponse

### Community 36 - "Ponytail, lazy senior dev mode"
Cohesion: 0.50
Nodes (3): Before you write, Ponytail, lazy senior dev mode, The smallest complete change

### Community 37 - "RoleKey"
Cohesion: 0.21
Nodes (3): IRequestContext, RequestContextMiddleware, RequestContext

### Community 38 - "auth.guard.ts"
Cohesion: 0.28
Nodes (5): CurrentBranch, IS_PUBLIC_KEY, PERMISSION_KEY, PermissionRequirement, CachedUserData

### Community 75 - "two-factor.dto.ts"
Cohesion: 0.50
Nodes (3): Disable2faDto, Enable2faDto, Verify2faLoginDto

### Community 78 - "RoleKey"
Cohesion: 0.15
Nodes (6): AccessService, RoleKey, DIRECTOR, MANAGER, PARENT, THERAPIST

## Knowledge Gaps
- **35 isolated node(s):** `CREATE`, `DELETE`, `UPDATE`, `VIEW`, `VIEW_ALL` (+30 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 489 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **51 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `@nestjs/common` to `token-bucket.guard.ts`, `auth.service.ts`, `department.controller.ts`, `RoleKey`, `auth.guard.ts`, `common/index.ts`, `src/index.ts`, `dependencies`, `api/package.json`, `auth.guard.ts`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **What connects `CREATE`, `DELETE`, `UPDATE` to the rest of the system?**
  _35 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `token-bucket.guard.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10588235294117647 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/swagger` connect `@nestjs/swagger` to `department.controller.ts`, `auth.service.ts`, `class-validator`, `@nestjs/common`, `RoleKey`, `UpdateRoleModulesDto`, `UpdateRolePermissionsDto`, `UpdateUserOverridesDto`, `common/index.ts`, `two-factor.dto.ts`, `dependencies`, `api/package.json`, `BranchService`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Should `auth.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05297334244702666 - nodes in this community are weakly interconnected._
- **Why does `PrismaService` connect `@nestjs/common` to `department.controller.ts`, `auth.service.ts`, `CacheService`, `RoleKey`, `common/index.ts`, `src/index.ts`, `CreateEmployeeDto`, `BranchService`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Should `4.1 Director` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._