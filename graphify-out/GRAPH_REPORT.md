# Graph Report - petals-erp  (2026-11-11)

## Corpus Check
- 261 files · ~88,180 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .example 1, (none) 1, .toml 1)

## Summary
- 1887 nodes · 4554 edges · 151 communities (57 shown, 94 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 161 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6a106015`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RequirePermission
- AuthService
- 4.1 Director
- CacheService
- CreateReportDto
- env
- ReportType
- web/package.json
- redis
- AppointmentService
- compilerOptions
- ClientService
- AppModule
- dependencies
- package.json
- config/package.json
- EmployeeService
- devDependencies
- compilerOptions
- scripts
- types/package.json
- Diagrams by area
- CreateClientDto
- PrismaService
- allowBuilds
- api/tsconfig.json
- types/tsconfig.json
- nest-cli.json
- seed.ts
- UpdateEmployeeDto
- tsconfig.build.json
- IRequestContext
- department.controller.ts
- CurrentUser
- CreateTreatmentPlanDto
- UpdateTreatmentPlanDto
- Ponytail, lazy senior dev mode
- audit.interceptor.ts
- PermissionAction
- app.module.ts
- CreateGuardianDto
- ReportService
- Roles
- CreateSubgoalDto
- PrismaService
- VerifyOtpDto
- LockoutService
- AuthGuard
- PermissionAction
- update-user-overrides.dto.ts
- access.e2e-spec.ts
- auth.service.ts
- CreateLeadDto
- IRequestContext
- RoleKey
- FinanceService
- src/index.ts
- otp.service.ts
- LeadService
- CreateGoalDto
- decorators/index.ts
- @nestjs/swagger
- AuditService
- BoardQueryDto
- clinical.service.ts
- CreateUserDto
- token-bucket.guard.ts
- CreateAssessmentDto
- CreateInvoiceDto
- UpdateLeadDto
- CreateProgressEntryDto
- UserController
- AccessService
- export-finance.dto.ts
- user.service.ts
- UpdateAssessmentDto
- CreateDocumentDto
- client.service.ts
- LeaveStatus
- CreateScheduleDto
- UpdateRoleModulesDto
- ExportFinanceDto
- RequestContextStorage
- DueReportQueryDto
- AuditLogQueryDto
- pagination/index.ts
- InvoiceQueryDto
- EnvironmentVariables
- ClientQueryDto
- app.controller.ts
- LeadQueryDto
- employee.service.ts
- RecordPaymentDto
- LeadStage
- UpdateUserDto
- UpdateRolePermissionsDto
- two-factor.dto.ts
- CacheService
- UserService
- ConvertLeadDto
- RedisModule
- AuditController
- PrismaModule
- ChangePasswordDto

## God Nodes (most connected - your core abstractions)
1. `RoleKey` - 204 edges
2. `@nestjs/common` - 104 edges
3. `CurrentUser` - 94 edges
4. `RequirePermission()` - 87 edges
5. `@nestjs/swagger` - 66 edges
6. `class-validator` - 63 edges
7. `AppModule` - 55 edges
8. `PermissionAction` - 39 edges
9. `PrismaService` - 38 edges
10. `Roles()` - 38 edges

## Surprising Connections (you probably didn't know these)
- `Decisions Made` --references--> `CacheService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/redis/cache.service.ts
- `Petals ERP – Build Progress` --references--> `VersionService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/clinical-history/version.service.ts
- `Petals ERP – Build Progress` --references--> `generateScheduleSlots()`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/appointment/schedule-generator.helper.ts
- `Decisions Made` --references--> `LockoutService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/rate-limit/lockout.service.ts
- `CachedUserData` --references--> `RoleKey`  [EXTRACTED]
  apps/api/src/common/guards/auth.guard.ts → packages/types/src/index.ts

## Import Cycles
- None detected.

## Communities (151 total, 94 thin omitted)

### Community 1 - "AuthService"
Cohesion: 0.22
Nodes (6): AuthService, decryptSecret(), encryptSecret(), generateRandomToken(), getEncryptionKey(), verifyPassword()

### Community 2 - "4.1 Director"
Cohesion: 0.04
Nodes (44): 10. Release Phasing, 11. Assumptions, 12. Decisions and Remaining Open Questions, 13.1 Proposed Stack, 13.2 RBAC Implementation, 13.3 Authentication, 13.4 PWA Requirements, 13.5 Suggested Build Order (+36 more)

### Community 3 - "CacheService"
Cohesion: 0.33
Nodes (4): MemoryLockEntry, MemoryCacheEntry, REDIS_CLIENT, ioredis

### Community 5 - "env"
Cohesion: 0.05
Nodes (36): COOKIE_SECRET, DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_URL (+28 more)

### Community 6 - "ReportType"
Cohesion: 0.09
Nodes (12): ReportQueryDto, UpdateReportDto, ReportStatus, DRAFT, REVIEWED, SHARED, SUBMITTED, ReportType (+4 more)

### Community 7 - "web/package.json"
Cohesion: 0.08
Nodes (29): dependencies, next@^15.1.7, @petals/types@workspace:*, react@^19.0.0, react-dom@^19.0.0, devDependencies, @petals/config@workspace:*, @types/node@^22.13.4 (+21 more)

### Community 8 - "redis"
Cohesion: 0.07
Nodes (30): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_PASSWORD, interval, retries, test, timeout (+22 more)

### Community 9 - "AppointmentService"
Cohesion: 0.05
Nodes (10): AppointmentService, AppointmentQueryDto, CancelAppointmentDto, CreateAppointmentDto, DailyScheduleQueryDto, RescheduleAppointmentDto, UpdateAppointmentStatusDto, DAY_MAP (+2 more)

### Community 10 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, alwaysStrict, declaration, declarationMap, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+16 more)

### Community 12 - "AppModule"
Cohesion: 0.10
Nodes (21): AppModule, APPOINTMENTS, CLIENTS, COMMUNICATION, DASHBOARD, EMPLOYEE_SALARY, EMPLOYEES, FINANCIAL (+13 more)

### Community 13 - "dependencies"
Cohesion: 0.06
Nodes (33): dependencies, bullmq@^5.41.3, class-transformer@^0.5.1, class-validator@^0.14.1, cookie-parser@^1.4.7, dotenv@^16.4.7, helmet@^8.0.0, ioredis@^5.5.0 (+25 more)

### Community 14 - "package.json"
Cohesion: 0.11
Nodes (20): devDependencies, eslint@^9.39.5, prettier@^3.4.2, typescript@^5.7.3, typescript-eslint@^8.72.1, eslint, prettier, typescript (+12 more)

### Community 15 - "config/package.json"
Cohesion: 0.13
Nodes (20): devDependencies, eslint@^9.20.1, eslint-config-prettier@^10.0.1, eslint-plugin-prettier@^5.2.3, prettier@^3.4.2, typescript@^5.7.3, @typescript-eslint/eslint-plugin@^8.24.0, @typescript-eslint/parser@^8.24.0 (+12 more)

### Community 17 - "devDependencies"
Cohesion: 0.07
Nodes (40): devDependencies, jest@^29.7.0, @nestjs/cli@^11.0.2, @nestjs/schematics@^11.0.0, @nestjs/testing@^11.0.9, @petals/config@workspace:*, prisma@^6.3.1, supertest@^7.0.0 (+32 more)

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

### Community 23 - "PrismaService"
Cohesion: 0.08
Nodes (7): BranchController, BranchModule, BRANCH_SORT_FIELDS, BranchService, BranchQueryDto, CreateBranchDto, UpdateBranchDto

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

### Community 31 - "IRequestContext"
Cohesion: 0.18
Nodes (7): IRequestContext, RequestContextMiddleware, RequestContext, CachedUserData, BRANCH_SCOPED_MODELS, FILTERABLE_READ_OPS, SCOPED_WRITE_OPS

### Community 32 - "department.controller.ts"
Cohesion: 0.15
Nodes (3): DepartmentController, DepartmentModule, DepartmentService

### Community 33 - "CurrentUser"
Cohesion: 0.13
Nodes (7): AppointmentController, ClientController, CurrentUser, RequirePermission(), FinanceController, LeadController, ReportController

### Community 36 - "Ponytail, lazy senior dev mode"
Cohesion: 0.50
Nodes (3): Before you write, Ponytail, lazy senior dev mode, The smallest complete change

### Community 37 - "audit.interceptor.ts"
Cohesion: 0.25
Nodes (6): rxjs@^7.8.1, AUDIT_ACTION_KEY, AUDIT_ENTITY_KEY, AUDIT_IGNORE_KEY, AUDIT_SENSITIVE_READ_KEY, rxjs

### Community 38 - "PermissionAction"
Cohesion: 0.13
Nodes (13): ResolvedModulePermissions, ResolvedPermissionsMap, PermissionGuard, PermissionAction, CREATE, DELETE, UPDATE, VIEW (+5 more)

### Community 39 - "app.module.ts"
Cohesion: 0.08
Nodes (14): AccessModule, AppointmentModule, AuditModule, AuthModule, ClientModule, ClinicalModule, ClinicalHistoryModule, CommonModule (+6 more)

### Community 71 - "Roles"
Cohesion: 0.17
Nodes (3): AuthController, Public(), ApiResponse

### Community 72 - "CreateSubgoalDto"
Cohesion: 0.11
Nodes (6): CreateSubgoalDto, UpdateSubgoalDto, SubgoalFrequency, DAILY, MONTHLY, WEEKLY

### Community 76 - "LockoutService"
Cohesion: 0.21
Nodes (4): LockoutService, Decisions Made, Open Items, Petals ERP – Build Progress

### Community 80 - "access.e2e-spec.ts"
Cohesion: 0.27
Nodes (7): AppModule, GlobalExceptionFilter, QueryCounter, bootstrap(), cookie-parser, @nestjs/testing, supertest

### Community 81 - "auth.service.ts"
Cohesion: 0.11
Nodes (12): ClientAppointmentQueryDto, sanitizeAuditMetadata(), TokenPayload, hashPassword(), sha256(), ReportActivityQueryDto, DOCUMENT_SORT_FIELDS, DUE_REPORT_SORT_FIELDS (+4 more)

### Community 84 - "RoleKey"
Cohesion: 0.13
Nodes (8): AuthTokens, ClinicalService, ProgressEntryQueryDto, RoleKey, DIRECTOR, MANAGER, PARENT, THERAPIST

### Community 85 - "FinanceService"
Cohesion: 0.08
Nodes (3): ExpenseQueryDto, PnlQueryDto, FinanceService

### Community 87 - "src/index.ts"
Cohesion: 0.13
Nodes (8): PaginationMetaCursor, PaginationMetaOffset, PlanStatus, ACTIVE, CANCELLED, COMPLETED, PAUSED, class-transformer

### Community 88 - "otp.service.ts"
Cohesion: 0.11
Nodes (6): COOKIE_OPTIONS, ConsoleOtpSender, IOtpSender, OTP_SENDER, OtpService, generateNumericOtp()

### Community 90 - "CreateGoalDto"
Cohesion: 0.10
Nodes (10): CreateGoalDto, UpdateGoalDto, GoalStatus, ACHIEVED, DISCONTINUED, IN_PROGRESS, NOT_STARTED, GoalTerm (+2 more)

### Community 91 - "decorators/index.ts"
Cohesion: 0.19
Nodes (6): CurrentBranch, IS_PUBLIC_KEY, PERMISSION_KEY, PermissionRequirement, ROLES_KEY, RolesGuard

### Community 95 - "clinical.service.ts"
Cohesion: 0.10
Nodes (8): AuditSensitiveRead(), ASSESSMENT_SORT_FIELDS, AssessmentQueryDto, ClinicalHistoryController, VersionHistoryQueryDto, RecordVersionParams, VersionService, @prisma/client

### Community 97 - "token-bucket.guard.ts"
Cohesion: 0.21
Nodes (6): LockoutResult, RateLimitModule, Throttle(), THROTTLE_KEY, ThrottleOptions, TokenBucketGuard

### Community 103 - "CreateProgressEntryDto"
Cohesion: 0.10
Nodes (8): CreateProgressEntryDto, UpdateProgressEntryDto, ProgressLevel, ACHIEVED, EMERGING, NO_CHANGE, PROGRESSING, REGRESSED

### Community 106 - "export-finance.dto.ts"
Cohesion: 0.22
Nodes (8): ExportFormat, EXCEL, PDF, ExportType, EXPENSES, INVOICES, PAYMENTS, PNL

### Community 107 - "user.service.ts"
Cohesion: 0.19
Nodes (7): buildCursorMeta(), buildCursorPagination(), buildOffsetMeta(), buildOffsetPagination(), buildOrderBy(), UserQueryDto, USER_SORT_FIELDS

### Community 110 - "client.service.ts"
Cohesion: 0.10
Nodes (17): ALL_PROFILE_TABS, CLIENT_SORT_FIELDS, TAB_MODULE_MAP, UpdateClientDto, EXPENSE_SORT_FIELDS, INVOICE_SORT_FIELDS, PAYMENT_SORT_FIELDS, LEAD_SORT_FIELDS (+9 more)

### Community 111 - "LeaveStatus"
Cohesion: 0.40
Nodes (5): LeaveStatus, APPROVED, CANCELLED, PENDING, REJECTED

### Community 112 - "CreateScheduleDto"
Cohesion: 0.07
Nodes (6): CreateScheduleDto, RestoreEntityDto, CursorPaginationDto, OffsetPaginationDto, DocumentUploadUrlDto, StorageService

### Community 118 - "pagination/index.ts"
Cohesion: 0.21
Nodes (4): CursorPaginatedResponse, CursorPaginationMeta, OffsetPaginatedResponse, OffsetPaginationMeta

### Community 119 - "InvoiceQueryDto"
Cohesion: 0.13
Nodes (8): InvoiceQueryDto, InvoiceStatus, ADVANCE, PAID, PENDING, RevenueCategory, ASSESSMENT_FEE, CLINICAL_THERAPY

### Community 124 - "employee.service.ts"
Cohesion: 0.14
Nodes (3): CreateEmployeeDto, EmployeeQueryDto, EMPLOYEE_SORT_FIELDS

### Community 125 - "RecordPaymentDto"
Cohesion: 0.09
Nodes (7): PaymentQueryDto, RecordPaymentDto, PaymentMethod, BANK_TRANSFER, CARD, CASH, UPI

### Community 126 - "LeadStage"
Cohesion: 0.33
Nodes (6): LeadStage, ASSESSMENT_SCHEDULED, CONTACTED, CONVERTED, LOST, NEW

### Community 129 - "two-factor.dto.ts"
Cohesion: 0.50
Nodes (3): Disable2faDto, Enable2faDto, Verify2faLoginDto

## Knowledge Gaps
- **92 isolated node(s):** `DIRECTOR`, `MANAGER`, `THERAPIST`, `PARENT`, `ACTIVE` (+87 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 862 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **94 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RoleKey` connect `RoleKey` to `RequirePermission`, `ConvertLeadDto`, `CreateReportDto`, `ReportType`, `AppointmentService`, `ClientService`, `PrismaService`, `IRequestContext`, `department.controller.ts`, `CurrentUser`, `PermissionAction`, `app.module.ts`, `ReportService`, `PermissionAction`, `access.e2e-spec.ts`, `auth.service.ts`, `IRequestContext`, `FinanceService`, `src/index.ts`, `otp.service.ts`, `LeadService`, `decorators/index.ts`, `clinical.service.ts`, `CreateInvoiceDto`, `AccessService`, `user.service.ts`, `CreateDocumentDto`, `client.service.ts`, `CreateScheduleDto`, `ExportFinanceDto`, `DueReportQueryDto`, `InvoiceQueryDto`, `ClientQueryDto`, `LeadQueryDto`, `employee.service.ts`, `RecordPaymentDto`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **What connects `DIRECTOR`, `MANAGER`, `THERAPIST` to the rest of the system?**
  _92 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `4.1 Director` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/common` connect `PermissionAction` to `CacheService`, `dependencies`, `devDependencies`, `PrismaModule`, `PrismaService`, `IRequestContext`, `department.controller.ts`, `audit.interceptor.ts`, `PermissionAction`, `app.module.ts`, `access.e2e-spec.ts`, `auth.service.ts`, `otp.service.ts`, `decorators/index.ts`, `clinical.service.ts`, `token-bucket.guard.ts`, `user.service.ts`, `client.service.ts`, `app.controller.ts`, `employee.service.ts`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Should `env` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/swagger` connect `@nestjs/swagger` to `department.controller.ts`, `two-factor.dto.ts`, `ReportType`, `export-finance.dto.ts`, `dependencies`, `PermissionAction`, `access.e2e-spec.ts`, `devDependencies`, `auth.service.ts`, `PrismaService`, `InvoiceQueryDto`, `pagination/index.ts`, `src/index.ts`, `otp.service.ts`, `app.controller.ts`, `employee.service.ts`, `IRequestContext`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Should `ReportType` be split into smaller, more focused modules?**
  _Cohesion score 0.09259259259259259 - nodes in this community are weakly interconnected._