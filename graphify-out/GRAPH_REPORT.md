# Graph Report - petals-erp  (2026-11-11)

## Corpus Check
- 261 files · ~88,332 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .example 1, (none) 1, .toml 1)

## Summary
- 1887 nodes · 4554 edges · 160 communities (60 shown, 100 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 161 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `394ed86f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RequirePermission
- auth.service.ts
- 4.1 Director
- api/package.json
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
- AuthService
- Ponytail, lazy senior dev mode
- audit.interceptor.ts
- PermissionScope
- app.module.ts
- CreateGuardianDto
- ReportService
- Roles
- CreateSubgoalDto
- PrismaService
- VerifyOtpDto
- LockoutService
- AuthGuard
- @nestjs/common
- update-user-overrides.dto.ts
- access.e2e-spec.ts
- clinical.service.ts
- LeadStage
- IRequestContext
- RoleKey
- FinanceService
- src/index.ts
- otp.service.ts
- LeadController
- CreateGoalDto
- decorators/index.ts
- @nestjs/swagger
- AuditService
- CreateScheduleDto
- clinical.service.ts
- AssignBranchDto
- token-bucket.guard.ts
- CreateAssessmentDto
- CreateInvoiceDto
- auth.controller.ts
- CreateProgressEntryDto
- UserController
- AccessService
- export-finance.dto.ts
- employee.service.ts
- UpdateAssessmentDto
- CreateUserDto
- client.service.ts
- .invalidateDailyCache
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
- CreateBranchDto
- CreateEmployeeDto
- RecordPaymentDto
- TokenBucketGuard
- AppointmentQueryDto
- UpdateRolePermissionsDto
- two-factor.dto.ts
- CacheService
- UpdateProgressEntryDto
- ConvertLeadDto
- RedisModule
- CreateAppointmentDto
- PrismaModule
- ChangePasswordDto
- UpdateAppointmentStatusDto
- .findClientDocuments
- UserQueryDto
- CancelAppointmentDto
- .createSchedule
- AuditInterceptor
- AssessmentQueryDto
- ts-loader@^9.5.2

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
- `Petals ERP – Build Progress` --references--> `generateScheduleSlots()`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/appointment/schedule-generator.helper.ts
- `Petals ERP – Build Progress` --references--> `VersionService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/clinical-history/version.service.ts
- `Decisions Made` --references--> `CacheService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/redis/cache.service.ts
- `Decisions Made` --references--> `LockoutService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/rate-limit/lockout.service.ts
- `CachedUserData` --references--> `RoleKey`  [EXTRACTED]
  apps/api/src/common/guards/auth.guard.ts → packages/types/src/index.ts

## Import Cycles
- None detected.

## Communities (160 total, 100 thin omitted)

### Community 1 - "auth.service.ts"
Cohesion: 0.21
Nodes (10): @nestjs/config@^4.0.0, AuthTokens, TokenPayload, decryptSecret(), encryptSecret(), getEncryptionKey(), hashPassword(), verifyPassword() (+2 more)

### Community 2 - "4.1 Director"
Cohesion: 0.04
Nodes (44): 10. Release Phasing, 11. Assumptions, 12. Decisions and Remaining Open Questions, 13.1 Proposed Stack, 13.2 RBAC Implementation, 13.3 Authentication, 13.4 PWA Requirements, 13.5 Suggested Build Order (+36 more)

### Community 3 - "api/package.json"
Cohesion: 0.11
Nodes (17): helmet@^8.0.0, rate-limiter-flexible@^5.0.5, @nestjs/cli@^11.0.2, tsconfig-paths@^4.2.0, @types/express@^5.0.0, @types/jsonwebtoken@^9.0.10, @types/qrcode@^1.5.5, name (+9 more)

### Community 5 - "env"
Cohesion: 0.05
Nodes (36): COOKIE_SECRET, DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_URL (+28 more)

### Community 6 - "ReportType"
Cohesion: 0.10
Nodes (12): ReportQueryDto, UpdateReportDto, ReportStatus, DRAFT, REVIEWED, SHARED, SUBMITTED, ReportType (+4 more)

### Community 7 - "web/package.json"
Cohesion: 0.08
Nodes (29): dependencies, next@^15.1.7, @petals/types@workspace:*, react@^19.0.0, react-dom@^19.0.0, devDependencies, @petals/config@workspace:*, @types/node@^22.13.4 (+21 more)

### Community 8 - "redis"
Cohesion: 0.07
Nodes (30): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_PASSWORD, interval, retries, test, timeout (+22 more)

### Community 10 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, alwaysStrict, declaration, declarationMap, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+16 more)

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

### Community 23 - "PrismaService"
Cohesion: 0.11
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

### Community 31 - "IRequestContext"
Cohesion: 0.17
Nodes (7): IRequestContext, RequestContextMiddleware, RequestContext, CachedUserData, BRANCH_SCOPED_MODELS, FILTERABLE_READ_OPS, SCOPED_WRITE_OPS

### Community 32 - "department.controller.ts"
Cohesion: 0.15
Nodes (3): DepartmentController, DepartmentModule, DepartmentService

### Community 33 - "CurrentUser"
Cohesion: 0.15
Nodes (6): AppointmentController, ClientController, CurrentUser, RequirePermission(), FinanceController, ReportController

### Community 34 - "CreateTreatmentPlanDto"
Cohesion: 0.08
Nodes (7): CreateTreatmentPlanDto, UpdateTreatmentPlanDto, PlanStatus, ACTIVE, CANCELLED, COMPLETED, PAUSED

### Community 35 - "AuthService"
Cohesion: 0.23
Nodes (4): AuthService, OtpService, generateRandomToken(), sha256()

### Community 36 - "Ponytail, lazy senior dev mode"
Cohesion: 0.50
Nodes (3): Before you write, Ponytail, lazy senior dev mode, The smallest complete change

### Community 37 - "audit.interceptor.ts"
Cohesion: 0.25
Nodes (6): rxjs@^7.8.1, AUDIT_ACTION_KEY, AUDIT_ENTITY_KEY, AUDIT_IGNORE_KEY, AUDIT_SENSITIVE_READ_KEY, rxjs

### Community 38 - "PermissionScope"
Cohesion: 0.40
Nodes (4): PermissionScope, ALL, ASSIGNED, OWN

### Community 39 - "app.module.ts"
Cohesion: 0.07
Nodes (15): AccessModule, AppointmentModule, AuditModule, AuthModule, BranchModule, ClientModule, ClinicalModule, CommonModule (+7 more)

### Community 70 - "ReportService"
Cohesion: 0.09
Nodes (3): CreateDocumentDto, ReportService, StorageService

### Community 72 - "CreateSubgoalDto"
Cohesion: 0.11
Nodes (6): CreateSubgoalDto, UpdateSubgoalDto, SubgoalFrequency, DAILY, MONTHLY, WEEKLY

### Community 76 - "LockoutService"
Cohesion: 0.17
Nodes (4): LockoutService, Decisions Made, Open Items, Petals ERP – Build Progress

### Community 78 - "@nestjs/common"
Cohesion: 0.12
Nodes (13): ResolvedModulePermissions, ClientAppointmentQueryDto, NoStoreInterceptor, ClinicalHistoryModule, LEAD_SORT_FIELDS, ReportActivityQueryDto, PermissionAction, CREATE (+5 more)

### Community 80 - "access.e2e-spec.ts"
Cohesion: 0.22
Nodes (11): AppModule, GlobalExceptionFilter, QueryCounter, bootstrap(), ClientStatus, ACTIVE, DISCHARGED, ON_HOLD (+3 more)

### Community 81 - "clinical.service.ts"
Cohesion: 0.14
Nodes (11): ResolvedPermissionsMap, sanitizeAuditMetadata(), ASSESSMENT_SORT_FIELDS, RecordVersionParams, EXPENSE_SORT_FIELDS, INVOICE_SORT_FIELDS, PAYMENT_SORT_FIELDS, DOCUMENT_SORT_FIELDS (+3 more)

### Community 82 - "LeadStage"
Cohesion: 0.04
Nodes (11): BoardQueryDto, CreateLeadDto, LeadQueryDto, UpdateLeadDto, LeadService, LeadStage, ASSESSMENT_SCHEDULED, CONTACTED (+3 more)

### Community 84 - "RoleKey"
Cohesion: 0.13
Nodes (7): ClinicalService, ProgressEntryQueryDto, RoleKey, DIRECTOR, MANAGER, PARENT, THERAPIST

### Community 85 - "FinanceService"
Cohesion: 0.08
Nodes (3): ExpenseQueryDto, PnlQueryDto, FinanceService

### Community 87 - "src/index.ts"
Cohesion: 0.13
Nodes (13): LeaveStatus, APPROVED, CANCELLED, PENDING, REJECTED, PaginationMetaCursor, PaginationMetaOffset, ProgressLevel (+5 more)

### Community 88 - "otp.service.ts"
Cohesion: 0.26
Nodes (6): @nestjs/jwt@^11.0.2, ConsoleOtpSender, IOtpSender, OTP_SENDER, generateNumericOtp(), @nestjs/jwt

### Community 90 - "CreateGoalDto"
Cohesion: 0.10
Nodes (10): CreateGoalDto, UpdateGoalDto, GoalStatus, ACHIEVED, DISCONTINUED, IN_PROGRESS, NOT_STARTED, GoalTerm (+2 more)

### Community 91 - "decorators/index.ts"
Cohesion: 0.32
Nodes (5): CurrentBranch, IS_PUBLIC_KEY, PERMISSION_KEY, PermissionRequirement, ROLES_KEY

### Community 92 - "@nestjs/swagger"
Cohesion: 0.11
Nodes (6): ExportFormat, EXCEL, PDF, class-transformer, class-validator, @nestjs/swagger

### Community 95 - "clinical.service.ts"
Cohesion: 0.15
Nodes (4): AuditSensitiveRead(), ClinicalHistoryController, VersionHistoryQueryDto, VersionService

### Community 97 - "token-bucket.guard.ts"
Cohesion: 0.20
Nodes (9): LockoutResult, MemoryLockEntry, RateLimitModule, Throttle(), THROTTLE_KEY, ThrottleOptions, MemoryCacheEntry, REDIS_CLIENT (+1 more)

### Community 104 - "UserController"
Cohesion: 0.09
Nodes (3): UpdateUserDto, UserController, UserService

### Community 106 - "export-finance.dto.ts"
Cohesion: 0.40
Nodes (5): ExportType, EXPENSES, INVOICES, PAYMENTS, PNL

### Community 107 - "employee.service.ts"
Cohesion: 0.15
Nodes (10): BRANCH_SORT_FIELDS, BranchQueryDto, buildCursorMeta(), buildCursorPagination(), buildOffsetMeta(), buildOffsetPagination(), buildOrderBy(), EmployeeQueryDto (+2 more)

### Community 110 - "client.service.ts"
Cohesion: 0.18
Nodes (9): ALL_PROFILE_TABS, CLIENT_SORT_FIELDS, TAB_MODULE_MAP, UpdateClientDto, AppointmentStatus, ATTENDED, CANCELLED, NO_SHOW (+1 more)

### Community 112 - "CreateScheduleDto"
Cohesion: 0.13
Nodes (4): RestoreEntityDto, CursorPaginationDto, OffsetPaginationDto, DocumentUploadUrlDto

### Community 118 - "pagination/index.ts"
Cohesion: 0.14
Nodes (4): CursorPaginatedResponse, CursorPaginationMeta, OffsetPaginatedResponse, OffsetPaginationMeta

### Community 119 - "InvoiceQueryDto"
Cohesion: 0.12
Nodes (8): InvoiceQueryDto, InvoiceStatus, ADVANCE, PAID, PENDING, RevenueCategory, ASSESSMENT_FEE, CLINICAL_THERAPY

### Community 122 - "app.controller.ts"
Cohesion: 0.19
Nodes (3): AppController, AppService, ApiResponse

### Community 125 - "RecordPaymentDto"
Cohesion: 0.09
Nodes (7): PaymentQueryDto, RecordPaymentDto, PaymentMethod, BANK_TRANSFER, CARD, CASH, UPI

### Community 129 - "two-factor.dto.ts"
Cohesion: 0.50
Nodes (3): Disable2faDto, Enable2faDto, Verify2faLoginDto

### Community 155 - ".createSchedule"
Cohesion: 0.40
Nodes (3): DAY_MAP, GeneratedSlot, generateScheduleSlots()

## Knowledge Gaps
- **92 isolated node(s):** `ACHIEVED`, `EMERGING`, `NO_CHANGE`, `PROGRESSING`, `REGRESSED` (+87 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 862 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **100 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RoleKey` connect `RoleKey` to `RequirePermission`, `auth.service.ts`, `CreateReportDto`, `ReportType`, `AppointmentService`, `ClientService`, `EmployeeService`, `.findClientDocuments`, `CancelAppointmentDto`, `.createSchedule`, `IRequestContext`, `department.controller.ts`, `CurrentUser`, `PermissionScope`, `app.module.ts`, `ReportService`, `@nestjs/common`, `access.e2e-spec.ts`, `clinical.service.ts`, `LeadStage`, `IRequestContext`, `FinanceService`, `src/index.ts`, `LeadController`, `decorators/index.ts`, `AuditService`, `CreateInvoiceDto`, `auth.controller.ts`, `UserController`, `AccessService`, `employee.service.ts`, `client.service.ts`, `.invalidateDailyCache`, `ExportFinanceDto`, `DueReportQueryDto`, `InvoiceQueryDto`, `ClientQueryDto`, `RecordPaymentDto`?**
  _High betweenness centrality (0.160) - this node is a cross-community bridge._
- **What connects `ACHIEVED`, `EMERGING`, `NO_CHANGE` to the rest of the system?**
  _92 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `4.1 Director` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/common` connect `@nestjs/common` to `auth.service.ts`, `api/package.json`, `dependencies`, `PrismaModule`, `PrismaService`, `IRequestContext`, `department.controller.ts`, `audit.interceptor.ts`, `app.module.ts`, `access.e2e-spec.ts`, `clinical.service.ts`, `otp.service.ts`, `decorators/index.ts`, `AuditService`, `token-bucket.guard.ts`, `auth.controller.ts`, `UserController`, `employee.service.ts`, `client.service.ts`, `app.controller.ts`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Should `api/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/swagger` connect `@nestjs/swagger` to `two-factor.dto.ts`, `api/package.json`, `ReportType`, `dependencies`, `IRequestContext`, `department.controller.ts`, `CreateSubgoalDto`, `@nestjs/common`, `access.e2e-spec.ts`, `src/index.ts`, `CreateGoalDto`, `AuditService`, `CreateAssessmentDto`, `auth.controller.ts`, `CreateScheduleDto`, `pagination/index.ts`, `InvoiceQueryDto`, `app.controller.ts`, `CreateBranchDto`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `env` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._