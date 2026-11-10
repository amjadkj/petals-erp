# Graph Report - petals-erp  (2026-11-10)

## Corpus Check
- 206 files · ~62,686 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .example 1, (none) 1, .toml 1)

## Summary
- 1443 nodes · 3234 edges · 112 communities (52 shown, 60 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 113 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1e16dea8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ClientQueryDto
- auth.service.ts
- 4.1 Director
- CacheService
- CreateClientDto
- env
- audit.interceptor.ts
- web/package.json
- redis
- CurrentUser
- compilerOptions
- PermissionAction
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
- @nestjs/core
- department.controller.ts
- Roles
- CreateTreatmentPlanDto
- class-transformer
- Ponytail, lazy senior dev mode
- RoleKey
- decorators/index.ts
- app.module.ts
- ClientService
- UserController
- UpdateRolePermissionsDto
- CreateSubgoalDto
- update-role-modules.dto.ts
- LoginDto
- common/index.ts
- AccessController
- AuthGuard
- @nestjs/common
- update-user-overrides.dto.ts
- access.e2e-spec.ts
- clinical.service.ts
- RestoreEntityDto
- two-factor.dto.ts
- RoleKey
- CreateProgressEntryDto
- otp.service.ts
- CreateUserDto
- CreateGoalDto
- employee.service.ts
- @nestjs/swagger
- PrismaService
- AppointmentStatus
- .getHistory
- @types/jsonwebtoken@^9.0.10
- @types/node@^22.13.4
- EmployeeQueryDto
- AuthService
- CreateBranchDto
- OtpService
- CreateAssessmentDto
- GlobalExceptionFilter
- pagination/index.ts
- UpdateAssessmentDto
- LoginDto
- AssessmentQueryDto
- UserQueryDto
- BranchQueryDto

## God Nodes (most connected - your core abstractions)
1. `RoleKey` - 112 edges
2. `@nestjs/common` - 83 edges
3. `CurrentUser` - 56 edges
4. `AppModule` - 49 edges
5. `RequirePermission()` - 45 edges
6. `@nestjs/swagger` - 41 edges
7. `class-validator` - 36 edges
8. `PrismaService` - 34 edges
9. `PermissionAction` - 33 edges
10. `Roles()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `Petals ERP – Build Progress` --references--> `VersionService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/clinical-history/version.service.ts
- `Decisions Made` --references--> `CacheService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/redis/cache.service.ts
- `Decisions Made` --references--> `LockoutService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/rate-limit/lockout.service.ts
- `AuthTokens` --references--> `RoleKey`  [EXTRACTED]
  apps/api/src/auth/auth.service.ts → packages/types/src/index.ts
- `CachedUserData` --references--> `RoleKey`  [EXTRACTED]
  apps/api/src/common/guards/auth.guard.ts → packages/types/src/index.ts

## Import Cycles
- None detected.

## Communities (112 total, 60 thin omitted)

### Community 0 - "ClientQueryDto"
Cohesion: 0.20
Nodes (5): ClientQueryDto, ClientStatus, ACTIVE, DISCHARGED, ON_HOLD

### Community 1 - "auth.service.ts"
Cohesion: 0.21
Nodes (9): AuthTokens, TokenPayload, decryptSecret(), encryptSecret(), generateRandomToken(), getEncryptionKey(), hashPassword(), sha256() (+1 more)

### Community 2 - "4.1 Director"
Cohesion: 0.04
Nodes (44): 10. Release Phasing, 11. Assumptions, 12. Decisions and Remaining Open Questions, 13.1 Proposed Stack, 13.2 RBAC Implementation, 13.3 Authentication, 13.4 PWA Requirements, 13.5 Suggested Build Order (+36 more)

### Community 4 - "CreateClientDto"
Cohesion: 0.06
Nodes (4): AuditController, AuditLogQueryDto, CreateClientDto, CreateGuardianDto

### Community 5 - "env"
Cohesion: 0.05
Nodes (36): COOKIE_SECRET, DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_URL (+28 more)

### Community 6 - "audit.interceptor.ts"
Cohesion: 0.13
Nodes (7): AUDIT_ACTION_KEY, AUDIT_ENTITY_KEY, AUDIT_IGNORE_KEY, AUDIT_SENSITIVE_READ_KEY, AuditInterceptor, AuditModule, AuditService

### Community 7 - "web/package.json"
Cohesion: 0.08
Nodes (29): dependencies, next@^15.1.7, @petals/types@workspace:*, react@^19.0.0, react-dom@^19.0.0, devDependencies, @petals/config@workspace:*, @types/node@^22.13.4 (+21 more)

### Community 8 - "redis"
Cohesion: 0.07
Nodes (30): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_PASSWORD, interval, retries, test, timeout (+22 more)

### Community 9 - "CurrentUser"
Cohesion: 0.20
Nodes (4): ClientController, ClinicalController, CurrentUser, RequirePermission()

### Community 10 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, alwaysStrict, declaration, declarationMap, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+16 more)

### Community 11 - "PermissionAction"
Cohesion: 0.11
Nodes (13): AccessService, ResolvedModulePermissions, ResolvedPermissionsMap, PermissionAction, CREATE, DELETE, UPDATE, VIEW (+5 more)

### Community 12 - "AppModule"
Cohesion: 0.10
Nodes (21): AppModule, APPOINTMENTS, CLIENTS, COMMUNICATION, DASHBOARD, EMPLOYEE_SALARY, EMPLOYEES, FINANCIAL (+13 more)

### Community 13 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, class-transformer@^0.5.1, class-validator@^0.14.1, cookie-parser@^1.4.7, dotenv@^16.4.7, helmet@^8.0.0, ioredis@^5.5.0, jsonwebtoken@^9.0.3 (+19 more)

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
Nodes (25): devDependencies, @nestjs/cli@^11.0.2, @nestjs/schematics@^11.0.0, @nestjs/testing@^11.0.9, @petals/config@workspace:*, prisma@^6.3.1, supertest@^7.0.0, ts-loader@^9.5.2 (+17 more)

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
Nodes (17): bullmq@^5.41.3, otplib@^12.0.1, reflect-metadata@^0.2.2, jest@^29.7.0, ts-jest@^29.2.5, @types/express@^5.0.0, @types/jest@^29.5.14, name (+9 more)

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

### Community 31 - "@nestjs/core"
Cohesion: 0.12
Nodes (6): AccessModule, IS_PUBLIC_KEY, CachedUserData, PermissionGuard, RolesGuard, @nestjs/core

### Community 33 - "Roles"
Cohesion: 0.24
Nodes (3): AuthController, Public(), Roles()

### Community 34 - "CreateTreatmentPlanDto"
Cohesion: 0.08
Nodes (7): CreateTreatmentPlanDto, UpdateTreatmentPlanDto, PlanStatus, ACTIVE, CANCELLED, COMPLETED, PAUSED

### Community 35 - "class-transformer"
Cohesion: 0.23
Nodes (3): CursorPaginationDto, OffsetPaginationDto, class-transformer

### Community 36 - "Ponytail, lazy senior dev mode"
Cohesion: 0.50
Nodes (3): Before you write, Ponytail, lazy senior dev mode, The smallest complete change

### Community 37 - "RoleKey"
Cohesion: 0.18
Nodes (3): COOKIE_OPTIONS, IRequestContext, RequestContext

### Community 38 - "decorators/index.ts"
Cohesion: 0.39
Nodes (4): CurrentBranch, PERMISSION_KEY, PermissionRequirement, ROLES_KEY

### Community 39 - "app.module.ts"
Cohesion: 0.10
Nodes (8): AppController, AppService, BranchModule, ClientModule, ClinicalModule, DepartmentModule, EmployeeModule, UserModule

### Community 72 - "CreateSubgoalDto"
Cohesion: 0.09
Nodes (11): CreateSubgoalDto, UpdateSubgoalDto, GoalStatus, ACHIEVED, DISCONTINUED, IN_PROGRESS, NOT_STARTED, SubgoalFrequency (+3 more)

### Community 75 - "common/index.ts"
Cohesion: 0.05
Nodes (20): CommonModule, EnvironmentVariables, validate(), RequestContextMiddleware, PrismaModule, LockoutResult, LockoutService, MemoryLockEntry (+12 more)

### Community 78 - "@nestjs/common"
Cohesion: 0.14
Nodes (7): NoStoreInterceptor, BRANCH_SCOPED_MODELS, FILTERABLE_READ_OPS, SCOPED_WRITE_OPS, PaginationMetaCursor, PaginationMetaOffset, @nestjs/common

### Community 80 - "access.e2e-spec.ts"
Cohesion: 0.32
Nodes (5): AppModule, QueryCounter, cookie-parser, @nestjs/testing, supertest

### Community 81 - "clinical.service.ts"
Cohesion: 0.13
Nodes (9): sanitizeAuditMetadata(), ALL_PROFILE_TABS, CLIENT_SORT_FIELDS, TAB_MODULE_MAP, ASSESSMENT_SORT_FIELDS, ClinicalHistoryModule, RecordVersionParams, VersionService (+1 more)

### Community 83 - "two-factor.dto.ts"
Cohesion: 0.50
Nodes (3): Disable2faDto, Enable2faDto, Verify2faLoginDto

### Community 84 - "RoleKey"
Cohesion: 0.12
Nodes (6): ClinicalService, RoleKey, DIRECTOR, MANAGER, PARENT, THERAPIST

### Community 87 - "CreateProgressEntryDto"
Cohesion: 0.10
Nodes (8): CreateProgressEntryDto, UpdateProgressEntryDto, ProgressLevel, ACHIEVED, EMERGING, NO_CHANGE, PROGRESSING, REGRESSED

### Community 88 - "otp.service.ts"
Cohesion: 0.18
Nodes (9): @nestjs/config@^4.0.0, @nestjs/jwt@^11.0.2, AuthModule, ConsoleOtpSender, IOtpSender, OTP_SENDER, generateNumericOtp(), @nestjs/config (+1 more)

### Community 89 - "CreateUserDto"
Cohesion: 0.09
Nodes (3): AssignBranchDto, CreateUserDto, UpdateUserDto

### Community 90 - "CreateGoalDto"
Cohesion: 0.12
Nodes (5): CreateGoalDto, UpdateGoalDto, GoalTerm, LONG, SHORT

### Community 91 - "employee.service.ts"
Cohesion: 0.29
Nodes (8): BRANCH_SORT_FIELDS, buildCursorMeta(), buildCursorPagination(), buildOffsetMeta(), buildOffsetPagination(), buildOrderBy(), EMPLOYEE_SORT_FIELDS, USER_SORT_FIELDS

### Community 94 - "AppointmentStatus"
Cohesion: 0.40
Nodes (5): AppointmentStatus, ATTENDED, CANCELLED, NO_SHOW, SCHEDULED

### Community 95 - ".getHistory"
Cohesion: 0.18
Nodes (3): AuditSensitiveRead(), ClinicalHistoryController, VersionHistoryQueryDto

### Community 106 - "pagination/index.ts"
Cohesion: 0.46
Nodes (4): CursorPaginatedResponse, CursorPaginationMeta, OffsetPaginatedResponse, OffsetPaginationMeta

## Knowledge Gaps
- **60 isolated node(s):** `DIRECTOR`, `MANAGER`, `THERAPIST`, `PARENT`, `ACTIVE` (+55 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 641 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **60 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RoleKey` connect `RoleKey` to `auth.service.ts`, `RoleKey`, `ClientService`, `decorators/index.ts`, `CurrentUser`, `PermissionAction`, `AccessController`, `@nestjs/common`, `CreateEmployeeDto`, `clinical.service.ts`, `access.e2e-spec.ts`, `employee.service.ts`, `@nestjs/core`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **What connects `DIRECTOR`, `MANAGER`, `THERAPIST` to the rest of the system?**
  _60 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `4.1 Director` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/common` connect `@nestjs/common` to `auth.service.ts`, `RoleKey`, `audit.interceptor.ts`, `app.module.ts`, `decorators/index.ts`, `GlobalExceptionFilter`, `PermissionAction`, `common/index.ts`, `dependencies`, `access.e2e-spec.ts`, `clinical.service.ts`, `api/package.json`, `otp.service.ts`, `employee.service.ts`, `@nestjs/core`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Should `CreateClientDto` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/swagger` connect `@nestjs/swagger` to `class-transformer`, `RoleKey`, `CreateBranchDto`, `UpdateRolePermissionsDto`, `app.module.ts`, `update-role-modules.dto.ts`, `CreateSubgoalDto`, `pagination/index.ts`, `GlobalExceptionFilter`, `dependencies`, `@nestjs/common`, `update-user-overrides.dto.ts`, `AssessmentQueryDto`, `RestoreEntityDto`, `two-factor.dto.ts`, `api/package.json`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Should `env` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._