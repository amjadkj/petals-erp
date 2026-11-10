# Graph Report - petals-erp  (2026-11-11)

## Corpus Check
- 235 files · ~75,401 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .example 1, (none) 1, .toml 1)

## Summary
- 1697 nodes · 3923 edges · 150 communities (60 shown, 90 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 136 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d629b92b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ClientStatus
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
- AppointmentStatus
- Ponytail, lazy senior dev mode
- auth.controller.ts
- IRequestContext
- app.controller.ts
- ClientService
- EmployeeModule
- Roles
- CreateSubgoalDto
- update-role-modules.dto.ts
- VerifyOtpDto
- redis/index.ts
- LockoutService
- AuthGuard
- @nestjs/common
- update-user-overrides.dto.ts
- access.e2e-spec.ts
- clinical.service.ts
- finance.service.ts
- IRequestContext
- ClinicalController
- FinanceService
- CreateProgressEntryDto
- otp.service.ts
- OffsetPaginationDto
- CreateGoalDto
- pagination/index.ts
- @nestjs/swagger
- AuditLogQueryDto
- PrismaService
- .getHistory
- EnvironmentVariables
- token-bucket.guard.ts
- decorators/index.ts
- CreateExpenseDto
- CreateInvoiceDto
- AuthService
- CreateUserDto
- RoleKey
- export-finance.dto.ts
- UpdateRolePermissionsDto
- LoginDto
- AuditService
- Petals ERP – Build Progress
- LeaveStatus
- two-factor.dto.ts
- CreateScheduleDto
- CreateBranchDto
- CreateGuardianDto
- CreateAssessmentDto
- ExportFinanceDto
- CreateAppointmentDto
- UpdateAssessmentDto
- ExpenseQueryDto
- PnlQueryDto
- ClientAppointmentQueryDto
- ChangePasswordDto
- RecordPaymentDto
- AssessmentQueryDto
- appointment.module.ts
- src/index.ts
- CancelAppointmentDto
- DailyScheduleQueryDto
- RescheduleAppointmentDto
- @types/jsonwebtoken@^9.0.10
- @types/node@^22.13.4
- UserModule

## God Nodes (most connected - your core abstractions)
1. `RoleKey` - 158 edges
2. `@nestjs/common` - 93 edges
3. `CurrentUser` - 75 edges
4. `RequirePermission()` - 67 edges
5. `@nestjs/swagger` - 58 edges
6. `AppModule` - 52 edges
7. `class-validator` - 51 edges
8. `PermissionAction` - 36 edges
9. `PrismaService` - 35 edges
10. `Roles()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `Decisions Made` --references--> `CacheService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/redis/cache.service.ts
- `Decisions Made` --references--> `LockoutService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/rate-limit/lockout.service.ts
- `Petals ERP – Build Progress` --references--> `VersionService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/clinical-history/version.service.ts
- `Petals ERP – Build Progress` --references--> `generateScheduleSlots()`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/appointment/schedule-generator.helper.ts
- `AuthTokens` --references--> `RoleKey`  [EXTRACTED]
  apps/api/src/auth/auth.service.ts → packages/types/src/index.ts

## Import Cycles
- None detected.

## Communities (150 total, 90 thin omitted)

### Community 0 - "ClientStatus"
Cohesion: 0.14
Nodes (8): ALL_PROFILE_TABS, CLIENT_SORT_FIELDS, TAB_MODULE_MAP, ClientQueryDto, ClientStatus, ACTIVE, DISCHARGED, ON_HOLD

### Community 1 - "auth.service.ts"
Cohesion: 0.20
Nodes (10): @nestjs/jwt@^11.0.2, AuthTokens, TokenPayload, decryptSecret(), encryptSecret(), generateRandomToken(), getEncryptionKey(), hashPassword() (+2 more)

### Community 2 - "4.1 Director"
Cohesion: 0.04
Nodes (44): 10. Release Phasing, 11. Assumptions, 12. Decisions and Remaining Open Questions, 13.1 Proposed Stack, 13.2 RBAC Implementation, 13.3 Authentication, 13.4 PWA Requirements, 13.5 Suggested Build Order (+36 more)

### Community 5 - "env"
Cohesion: 0.05
Nodes (36): COOKIE_SECRET, DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_URL (+28 more)

### Community 6 - "audit.interceptor.ts"
Cohesion: 0.33
Nodes (4): AUDIT_ACTION_KEY, AUDIT_ENTITY_KEY, AUDIT_IGNORE_KEY, AUDIT_SENSITIVE_READ_KEY

### Community 7 - "web/package.json"
Cohesion: 0.08
Nodes (29): dependencies, next@^15.1.7, @petals/types@workspace:*, react@^19.0.0, react-dom@^19.0.0, devDependencies, @petals/config@workspace:*, @types/node@^22.13.4 (+21 more)

### Community 8 - "redis"
Cohesion: 0.07
Nodes (30): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_PASSWORD, interval, retries, test, timeout (+22 more)

### Community 10 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, alwaysStrict, declaration, declarationMap, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+16 more)

### Community 11 - "PermissionAction"
Cohesion: 0.12
Nodes (13): ResolvedModulePermissions, ResolvedPermissionsMap, PermissionGuard, PermissionAction, CREATE, DELETE, UPDATE, VIEW (+5 more)

### Community 12 - "AppModule"
Cohesion: 0.08
Nodes (22): AccessService, AppModule, APPOINTMENTS, CLIENTS, COMMUNICATION, DASHBOARD, EMPLOYEE_SALARY, EMPLOYEES (+14 more)

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

### Community 23 - "PrismaService"
Cohesion: 0.09
Nodes (5): BranchController, BranchModule, BranchService, BranchQueryDto, UpdateBranchDto

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
Cohesion: 0.17
Nodes (4): AuditModule, ROLES_KEY, RolesGuard, @nestjs/core

### Community 32 - "department.controller.ts"
Cohesion: 0.14
Nodes (3): DepartmentController, DepartmentModule, DepartmentService

### Community 33 - "CurrentUser"
Cohesion: 0.15
Nodes (4): AppointmentController, ClientController, RequirePermission(), FinanceController

### Community 34 - "CreateTreatmentPlanDto"
Cohesion: 0.08
Nodes (7): CreateTreatmentPlanDto, UpdateTreatmentPlanDto, PlanStatus, ACTIVE, CANCELLED, COMPLETED, PAUSED

### Community 35 - "AppointmentStatus"
Cohesion: 0.11
Nodes (7): AppointmentQueryDto, UpdateAppointmentStatusDto, AppointmentStatus, ATTENDED, CANCELLED, NO_SHOW, SCHEDULED

### Community 36 - "Ponytail, lazy senior dev mode"
Cohesion: 0.50
Nodes (3): Before you write, Ponytail, lazy senior dev mode, The smallest complete change

### Community 38 - "IRequestContext"
Cohesion: 0.22
Nodes (4): IRequestContext, RequestContextMiddleware, RequestContext, CachedUserData

### Community 72 - "CreateSubgoalDto"
Cohesion: 0.11
Nodes (6): CreateSubgoalDto, UpdateSubgoalDto, SubgoalFrequency, DAILY, MONTHLY, WEEKLY

### Community 75 - "redis/index.ts"
Cohesion: 0.16
Nodes (7): @nestjs/config@^4.0.0, MemoryLockEntry, MemoryCacheEntry, REDIS_CLIENT, RedisModule, ioredis, @nestjs/config

### Community 78 - "@nestjs/common"
Cohesion: 0.29
Nodes (3): AccessModule, NoStoreInterceptor, @nestjs/common

### Community 80 - "access.e2e-spec.ts"
Cohesion: 0.26
Nodes (7): AppModule, GlobalExceptionFilter, QueryCounter, bootstrap(), cookie-parser, @nestjs/testing, supertest

### Community 81 - "clinical.service.ts"
Cohesion: 0.13
Nodes (7): sanitizeAuditMetadata(), ClinicalModule, ASSESSMENT_SORT_FIELDS, ClinicalHistoryModule, RecordVersionParams, VersionService, @prisma/client

### Community 82 - "finance.service.ts"
Cohesion: 0.21
Nodes (4): FinanceModule, EXPENSE_SORT_FIELDS, INVOICE_SORT_FIELDS, PAYMENT_SORT_FIELDS

### Community 83 - "IRequestContext"
Cohesion: 0.19
Nodes (3): AccessController, Roles(), ApiResponse

### Community 87 - "CreateProgressEntryDto"
Cohesion: 0.09
Nodes (8): CreateProgressEntryDto, UpdateProgressEntryDto, ProgressLevel, ACHIEVED, EMERGING, NO_CHANGE, PROGRESSING, REGRESSED

### Community 88 - "otp.service.ts"
Cohesion: 0.17
Nodes (6): AuthModule, ConsoleOtpSender, IOtpSender, OTP_SENDER, OtpService, generateNumericOtp()

### Community 89 - "OffsetPaginationDto"
Cohesion: 0.15
Nodes (4): CursorPaginationDto, OffsetPaginationDto, EmployeeQueryDto, UserQueryDto

### Community 90 - "CreateGoalDto"
Cohesion: 0.10
Nodes (10): CreateGoalDto, UpdateGoalDto, GoalStatus, ACHIEVED, DISCONTINUED, IN_PROGRESS, NOT_STARTED, GoalTerm (+2 more)

### Community 91 - "pagination/index.ts"
Cohesion: 0.21
Nodes (11): buildCursorMeta(), buildCursorPagination(), buildOffsetMeta(), buildOffsetPagination(), buildOrderBy(), CursorPaginatedResponse, CursorPaginationMeta, OffsetPaginatedResponse (+3 more)

### Community 92 - "@nestjs/swagger"
Cohesion: 0.13
Nodes (4): ProgressEntryQueryDto, class-transformer, class-validator, @nestjs/swagger

### Community 94 - "PrismaService"
Cohesion: 0.10
Nodes (5): BRANCH_SORT_FIELDS, BRANCH_SCOPED_MODELS, FILTERABLE_READ_OPS, PrismaService, SCOPED_WRITE_OPS

### Community 95 - ".getHistory"
Cohesion: 0.18
Nodes (3): AuditSensitiveRead(), ClinicalHistoryController, VersionHistoryQueryDto

### Community 97 - "token-bucket.guard.ts"
Cohesion: 0.13
Nodes (8): CommonModule, PrismaModule, LockoutResult, RateLimitModule, Throttle(), THROTTLE_KEY, ThrottleOptions, TokenBucketGuard

### Community 99 - "decorators/index.ts"
Cohesion: 0.36
Nodes (5): CurrentBranch, IS_PUBLIC_KEY, Public(), PERMISSION_KEY, PermissionRequirement

### Community 104 - "CreateUserDto"
Cohesion: 0.06
Nodes (5): AssignBranchDto, CreateUserDto, UpdateUserDto, UserController, UserService

### Community 105 - "RoleKey"
Cohesion: 0.14
Nodes (6): ClinicalService, RoleKey, DIRECTOR, MANAGER, PARENT, THERAPIST

### Community 106 - "export-finance.dto.ts"
Cohesion: 0.22
Nodes (8): ExportFormat, EXCEL, PDF, ExportType, EXPENSES, INVOICES, PAYMENTS, PNL

### Community 109 - "AuditService"
Cohesion: 0.14
Nodes (3): AuditController, AuditInterceptor, AuditService

### Community 110 - "Petals ERP – Build Progress"
Cohesion: 0.25
Nodes (6): DAY_MAP, GeneratedSlot, generateScheduleSlots(), Decisions Made, Open Items, Petals ERP – Build Progress

### Community 111 - "LeaveStatus"
Cohesion: 0.40
Nodes (5): LeaveStatus, APPROVED, CANCELLED, PENDING, REJECTED

### Community 112 - "two-factor.dto.ts"
Cohesion: 0.50
Nodes (3): Disable2faDto, Enable2faDto, Verify2faLoginDto

### Community 125 - "RecordPaymentDto"
Cohesion: 0.09
Nodes (7): PaymentQueryDto, RecordPaymentDto, PaymentMethod, BANK_TRANSFER, CARD, CASH, UPI

### Community 128 - "src/index.ts"
Cohesion: 0.12
Nodes (10): InvoiceQueryDto, InvoiceStatus, ADVANCE, PAID, PENDING, PaginationMetaCursor, PaginationMetaOffset, RevenueCategory (+2 more)

## Knowledge Gaps
- **79 isolated node(s):** `INVOICES`, `PAYMENTS`, `EXPENSES`, `PNL`, `EXCEL` (+74 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 776 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **90 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RoleKey` connect `RoleKey` to `ClientStatus`, `auth.service.ts`, `src/index.ts`, `AppointmentService`, `PermissionAction`, `AppModule`, `PrismaService`, `@nestjs/core`, `department.controller.ts`, `CurrentUser`, `AppointmentStatus`, `auth.controller.ts`, `IRequestContext`, `ClientService`, `@nestjs/common`, `access.e2e-spec.ts`, `clinical.service.ts`, `finance.service.ts`, `IRequestContext`, `ClinicalController`, `FinanceService`, `pagination/index.ts`, `@nestjs/swagger`, `PrismaService`, `decorators/index.ts`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **What connects `INVOICES`, `PAYMENTS`, `EXPENSES` to the rest of the system?**
  _79 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ClientStatus` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/common` connect `@nestjs/common` to `ClientStatus`, `auth.service.ts`, `audit.interceptor.ts`, `PermissionAction`, `dependencies`, `api/package.json`, `PrismaService`, `@nestjs/core`, `department.controller.ts`, `AppointmentStatus`, `auth.controller.ts`, `IRequestContext`, `app.controller.ts`, `redis/index.ts`, `access.e2e-spec.ts`, `clinical.service.ts`, `finance.service.ts`, `otp.service.ts`, `pagination/index.ts`, `@nestjs/swagger`, `PrismaService`, `token-bucket.guard.ts`, `decorators/index.ts`, `appointment.module.ts`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Should `4.1 Director` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/swagger` connect `@nestjs/swagger` to `src/index.ts`, `dependencies`, `api/package.json`, `PrismaService`, `department.controller.ts`, `auth.controller.ts`, `IRequestContext`, `CreateSubgoalDto`, `@nestjs/common`, `access.e2e-spec.ts`, `CreateProgressEntryDto`, `OffsetPaginationDto`, `CreateGoalDto`, `pagination/index.ts`, `decorators/index.ts`, `export-finance.dto.ts`, `two-factor.dto.ts`, `CreateBranchDto`, `create-client.dto.ts`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Should `env` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._