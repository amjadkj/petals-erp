# Graph Report - petals-erp  (2026-11-10)

## Corpus Check
- 221 files · ~68,380 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .example 1, (none) 1, .toml 1)

## Summary
- 1557 nodes · 3533 edges · 114 communities (56 shown, 58 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 122 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `63682506`
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
- AppointmentService
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
- PrismaService
- allowBuilds
- api/tsconfig.json
- types/tsconfig.json
- nest-cli.json
- seed.ts
- RequestContextStorage
- tsconfig.build.json
- @nestjs/core
- department.controller.ts
- CurrentUser
- CreateTreatmentPlanDto
- class-transformer
- Ponytail, lazy senior dev mode
- RoleKey
- app.module.ts
- app.controller.ts
- ClientService
- src/index.ts
- UpdateRolePermissionsDto
- CreateSubgoalDto
- update-role-modules.dto.ts
- LoginDto
- redis/index.ts
- LockoutService
- AuthGuard
- clinical.controller.ts
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
- AuditLogQueryDto
- AppointmentStatus
- .getHistory
- EnvironmentVariables
- common/index.ts
- CreateUserDto
- ChangePasswordDto
- CreateGuardianDto
- AuthService
- TokenBucketGuard
- create-client.dto.ts
- pagination/index.ts
- RestoreEntityDto
- LoginDto
- AuditController
- UserQueryDto
- LeaveStatus
- ClientStatus
- ts-loader@^9.5.2

## God Nodes (most connected - your core abstractions)
1. `RoleKey` - 132 edges
2. `@nestjs/common` - 88 edges
3. `CurrentUser` - 64 edges
4. `RequirePermission()` - 53 edges
5. `AppModule` - 50 edges
6. `@nestjs/swagger` - 49 edges
7. `class-validator` - 43 edges
8. `PermissionAction` - 34 edges
9. `PrismaService` - 34 edges
10. `Roles()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `Petals ERP – Build Progress` --references--> `generateScheduleSlots()`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/appointment/schedule-generator.helper.ts
- `Petals ERP – Build Progress` --references--> `VersionService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/clinical-history/version.service.ts
- `Decisions Made` --references--> `CacheService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/redis/cache.service.ts
- `Decisions Made` --references--> `LockoutService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/rate-limit/lockout.service.ts
- `AuthTokens` --references--> `RoleKey`  [EXTRACTED]
  apps/api/src/auth/auth.service.ts → packages/types/src/index.ts

## Import Cycles
- None detected.

## Communities (114 total, 58 thin omitted)

### Community 1 - "auth.service.ts"
Cohesion: 0.24
Nodes (9): AuthTokens, TokenPayload, decryptSecret(), encryptSecret(), generateRandomToken(), getEncryptionKey(), hashPassword(), sha256() (+1 more)

### Community 2 - "4.1 Director"
Cohesion: 0.04
Nodes (44): 10. Release Phasing, 11. Assumptions, 12. Decisions and Remaining Open Questions, 13.1 Proposed Stack, 13.2 RBAC Implementation, 13.3 Authentication, 13.4 PWA Requirements, 13.5 Suggested Build Order (+36 more)

### Community 5 - "env"
Cohesion: 0.05
Nodes (36): COOKIE_SECRET, DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_URL (+28 more)

### Community 6 - "audit.interceptor.ts"
Cohesion: 0.14
Nodes (6): AUDIT_ACTION_KEY, AUDIT_ENTITY_KEY, AUDIT_IGNORE_KEY, AUDIT_SENSITIVE_READ_KEY, AuditInterceptor, AuditService

### Community 7 - "web/package.json"
Cohesion: 0.08
Nodes (29): dependencies, next@^15.1.7, @petals/types@workspace:*, react@^19.0.0, react-dom@^19.0.0, devDependencies, @petals/config@workspace:*, @types/node@^22.13.4 (+21 more)

### Community 8 - "redis"
Cohesion: 0.07
Nodes (30): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_PASSWORD, interval, retries, test, timeout (+22 more)

### Community 9 - "AppointmentService"
Cohesion: 0.05
Nodes (7): AppointmentService, AppointmentQueryDto, CancelAppointmentDto, CreateAppointmentDto, CreateScheduleDto, DailyScheduleQueryDto, RescheduleAppointmentDto

### Community 10 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, alwaysStrict, declaration, declarationMap, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+16 more)

### Community 11 - "PermissionAction"
Cohesion: 0.09
Nodes (15): AccessService, ResolvedModulePermissions, ResolvedPermissionsMap, PERMISSION_KEY, PermissionRequirement, PermissionAction, CREATE, DELETE (+7 more)

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
Nodes (3): CreateEmployeeDto, UpdateEmployeeDto, EmployeeController

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

### Community 23 - "PrismaService"
Cohesion: 0.05
Nodes (7): BranchController, BranchModule, BRANCH_SORT_FIELDS, BranchService, CreateBranchDto, UpdateBranchDto, PrismaService

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
Cohesion: 0.15
Nodes (6): AuditModule, IS_PUBLIC_KEY, PermissionGuard, RolesGuard, @nestjs/common, @nestjs/core

### Community 32 - "department.controller.ts"
Cohesion: 0.15
Nodes (3): DepartmentController, DepartmentModule, DepartmentService

### Community 33 - "CurrentUser"
Cohesion: 0.05
Nodes (10): AccessController, AppointmentController, AuthController, ClientController, CurrentUser, Public(), RequirePermission(), Roles() (+2 more)

### Community 34 - "CreateTreatmentPlanDto"
Cohesion: 0.08
Nodes (7): CreateTreatmentPlanDto, UpdateTreatmentPlanDto, PlanStatus, ACTIVE, CANCELLED, COMPLETED, PAUSED

### Community 35 - "class-transformer"
Cohesion: 0.15
Nodes (4): BranchQueryDto, CursorPaginationDto, OffsetPaginationDto, EmployeeQueryDto

### Community 36 - "Ponytail, lazy senior dev mode"
Cohesion: 0.50
Nodes (3): Before you write, Ponytail, lazy senior dev mode, The smallest complete change

### Community 37 - "RoleKey"
Cohesion: 0.14
Nodes (4): COOKIE_OPTIONS, IRequestContext, RequestContextMiddleware, RequestContext

### Community 38 - "app.module.ts"
Cohesion: 0.11
Nodes (8): AppointmentModule, ClientModule, ClinicalModule, ClinicalHistoryModule, CommonModule, PrismaModule, EmployeeModule, UserModule

### Community 39 - "app.controller.ts"
Cohesion: 0.19
Nodes (3): AppController, AppService, ApiResponse

### Community 70 - "src/index.ts"
Cohesion: 0.15
Nodes (8): AccessModule, BRANCH_SCOPED_MODELS, FILTERABLE_READ_OPS, SCOPED_WRITE_OPS, EMPLOYEE_SORT_FIELDS, EmployeeService, PaginationMetaCursor, PaginationMetaOffset

### Community 72 - "CreateSubgoalDto"
Cohesion: 0.11
Nodes (6): CreateSubgoalDto, UpdateSubgoalDto, SubgoalFrequency, DAILY, MONTHLY, WEEKLY

### Community 75 - "redis/index.ts"
Cohesion: 0.21
Nodes (5): MemoryLockEntry, MemoryCacheEntry, REDIS_CLIENT, RedisModule, ioredis

### Community 76 - "LockoutService"
Cohesion: 0.17
Nodes (4): LockoutService, Decisions Made, Open Items, Petals ERP – Build Progress

### Community 78 - "clinical.controller.ts"
Cohesion: 0.18
Nodes (5): rxjs@^7.8.1, NoStoreInterceptor, CurrentBranch, ROLES_KEY, rxjs

### Community 80 - "access.e2e-spec.ts"
Cohesion: 0.23
Nodes (7): AppModule, GlobalExceptionFilter, QueryCounter, bootstrap(), cookie-parser, @nestjs/testing, supertest

### Community 81 - "clinical.service.ts"
Cohesion: 0.13
Nodes (10): DAY_MAP, GeneratedSlot, generateScheduleSlots(), sanitizeAuditMetadata(), ALL_PROFILE_TABS, CLIENT_SORT_FIELDS, TAB_MODULE_MAP, ASSESSMENT_SORT_FIELDS (+2 more)

### Community 83 - "two-factor.dto.ts"
Cohesion: 0.50
Nodes (3): Disable2faDto, Enable2faDto, Verify2faLoginDto

### Community 84 - "RoleKey"
Cohesion: 0.06
Nodes (12): ClinicalController, ClinicalService, AssessmentQueryDto, CreateAssessmentDto, CreateProgressEntryDto, UpdateAssessmentDto, CachedUserData, RoleKey (+4 more)

### Community 87 - "CreateProgressEntryDto"
Cohesion: 0.15
Nodes (7): UpdateProgressEntryDto, ProgressLevel, ACHIEVED, EMERGING, NO_CHANGE, PROGRESSING, REGRESSED

### Community 88 - "otp.service.ts"
Cohesion: 0.18
Nodes (9): @nestjs/config@^4.0.0, @nestjs/jwt@^11.0.2, AuthModule, ConsoleOtpSender, IOtpSender, OTP_SENDER, generateNumericOtp(), @nestjs/config (+1 more)

### Community 89 - "CreateUserDto"
Cohesion: 0.12
Nodes (3): AssignBranchDto, UpdateUserDto, class-transformer

### Community 90 - "CreateGoalDto"
Cohesion: 0.10
Nodes (10): CreateGoalDto, UpdateGoalDto, GoalStatus, ACHIEVED, DISCONTINUED, IN_PROGRESS, NOT_STARTED, GoalTerm (+2 more)

### Community 91 - "employee.service.ts"
Cohesion: 0.38
Nodes (6): buildCursorMeta(), buildCursorPagination(), buildOffsetMeta(), buildOffsetPagination(), buildOrderBy(), USER_SORT_FIELDS

### Community 94 - "AppointmentStatus"
Cohesion: 0.18
Nodes (6): UpdateAppointmentStatusDto, AppointmentStatus, ATTENDED, CANCELLED, NO_SHOW, SCHEDULED

### Community 95 - ".getHistory"
Cohesion: 0.13
Nodes (4): AuditSensitiveRead(), ClinicalHistoryController, VersionHistoryQueryDto, VersionService

### Community 97 - "common/index.ts"
Cohesion: 0.38
Nodes (5): LockoutResult, RateLimitModule, Throttle(), THROTTLE_KEY, ThrottleOptions

### Community 106 - "pagination/index.ts"
Cohesion: 0.46
Nodes (4): CursorPaginatedResponse, CursorPaginationMeta, OffsetPaginatedResponse, OffsetPaginationMeta

### Community 111 - "LeaveStatus"
Cohesion: 0.40
Nodes (5): LeaveStatus, APPROVED, CANCELLED, PENDING, REJECTED

### Community 112 - "ClientStatus"
Cohesion: 0.50
Nodes (4): ClientStatus, ACTIVE, DISCHARGED, ON_HOLD

## Knowledge Gaps
- **64 isolated node(s):** `DIRECTOR`, `MANAGER`, `THERAPIST`, `PARENT`, `ACTIVE` (+59 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 695 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **58 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `@nestjs/core` to `department.controller.ts`, `auth.service.ts`, `common/index.ts`, `RoleKey`, `app.module.ts`, `app.controller.ts`, `audit.interceptor.ts`, `src/index.ts`, `PermissionAction`, `redis/index.ts`, `dependencies`, `clinical.controller.ts`, `access.e2e-spec.ts`, `clinical.service.ts`, `api/package.json`, `PrismaService`, `otp.service.ts`, `employee.service.ts`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **What connects `DIRECTOR`, `MANAGER`, `THERAPIST` to the rest of the system?**
  _64 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `4.1 Director` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Why does `RoleKey` connect `RoleKey` to `ClientQueryDto`, `CurrentUser`, `auth.service.ts`, `department.controller.ts`, `RoleKey`, `ClientService`, `src/index.ts`, `AppointmentService`, `PermissionAction`, `clinical.controller.ts`, `access.e2e-spec.ts`, `clinical.service.ts`, `employee.service.ts`, `@nestjs/core`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Should `env` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/swagger` connect `@nestjs/swagger` to `department.controller.ts`, `class-transformer`, `RoleKey`, `src/index.ts`, `UpdateRolePermissionsDto`, `app.controller.ts`, `update-role-modules.dto.ts`, `LoginDto`, `create-client.dto.ts`, `pagination/index.ts`, `dependencies`, `clinical.controller.ts`, `update-user-overrides.dto.ts`, `access.e2e-spec.ts`, `RestoreEntityDto`, `two-factor.dto.ts`, `api/package.json`, `PrismaService`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Should `audit.interceptor.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14035087719298245 - nodes in this community are weakly interconnected._