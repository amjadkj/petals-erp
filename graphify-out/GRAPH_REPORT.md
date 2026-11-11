# Graph Report - petals-erp  (2026-11-11)

## Corpus Check
- 315 files · ~132,573 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 2, .example 1, .toml 1)

## Summary
- 2421 nodes · 5924 edges · 165 communities (82 shown, 83 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 241 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ff478295`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RequirePermission
- AuthService
- 4.1 Director
- RequirePermission
- CommunicationChannel
- env
- report.service.ts
- web/package.json
- redis
- .findDailySchedule
- compilerOptions
- ClientService
- AppModule
- dependencies
- package.json
- config/package.json
- branch.controller.ts
- devDependencies
- compilerOptions
- scripts
- types/package.json
- Diagrams by area
- LeadService
- 2. Checklist Evaluation & Verification Evidence
- allowBuilds
- api/tsconfig.json
- types/tsconfig.json
- nest-cli.json
- CommunicationController
- communication-queue.service.ts
- tsconfig.build.json
- RequestContextStorage
- department.controller.ts
- AppointmentController
- clinical.service.ts
- src/index.ts
- Ponytail, lazy senior dev mode
- AuditLogQueryDto
- IRequestContext
- client.service.ts
- Final Checklist: Petals ERP Backend
- CommunicationService
- app.module.ts
- Roles
- RoleKey
- environment
- VerifyOtpDto
- common/index.ts
- LockoutService
- .set
- PermissionAction
- UserOverrideItemDto
- access.e2e-spec.ts
- seed.ts
- class-transformer
- AccessService
- RoleKey
- RecordPaymentDto
- ReportController
- CreateTemplateDto
- api/package.json
- Roles
- CreateGoalDto
- api
- class-validator
- postgres
- CreateScheduleDto
- clinical-history.controller.ts
- MessageStatus
- cache.service.ts
- UpdateLeadDto
- CreateAssessmentDto
- access.service.ts
- CreateExpenseDto
- DocumentUploadUrlDto
- CommunicationQueueService
- CreateTreatmentPlanDto
- token-bucket.guard.ts
- export-finance.dto.ts
- hr.service.ts
- DashboardService
- finance.service.ts
- migrator
- redis
- pagination/index.ts
- SendMessageDto
- DueReportQueryDto
- .createSchedule
- TemplateStatus
- employee.controller.ts
- ConvertLeadDto
- InvoiceQueryDto
- CreateLeadDto
- ClientQueryDto
- email-provider.interface.ts
- client.module.ts
- Petals Child Development Centre ERP — Backend
- RecordPaymentDto
- common/index.ts
- AppointmentQueryDto
- RolePermissionItemDto
- two-factor.dto.ts
- PrismaService
- CreateLeaveRequestDto
- CreateEmployeeDto
- services
- healthcheck
- CreateDocumentDto
- LoginDto
- ExpenseQueryDto
- CreateProgressEntryDto
- TokenBucketGuard
- ChangePasswordDto
- CheckInDto
- build
- UpdateEmployeeDto
- hr.service.ts
- CreateHolidayDto
- CreateAppointmentDto
- MonthlyAttendanceQueryDto
- CreateInvoiceDto
- UpdateAppointmentStatusDto
- crypto.util.ts
- class-transformer
- CancelAppointmentDto
- RedisModule
- UserQueryDto
- AuditController
- CreateProgressEntryDto
- DailyScheduleQueryDto
- .findDailySchedule
- UpdateTemplateDto
- ReportType
- CreateUserDto
- UpdateAssessmentDto
- RecordCallLogDto
- PnlQueryDto

## God Nodes (most connected - your core abstractions)
1. `RoleKey` - 225 edges
2. `CurrentUser` - 130 edges
3. `@nestjs/common` - 124 edges
4. `RequirePermission()` - 109 edges
5. `PrismaService` - 87 edges
6. `class-validator` - 83 edges
7. `@nestjs/swagger` - 81 edges
8. `IRequestContext` - 71 edges
9. `Roles()` - 71 edges
10. `AppModule` - 57 edges

## Surprising Connections (you probably didn't know these)
- `A. Project and Data Model` --references--> `RoleKey`  [INFERRED]
  docs/FINAL_REPORT.md → packages/types/src/index.ts
- `A. Project and data model` --references--> `RoleKey`  [INFERRED]
  docs/phases/final-checklist.md → packages/types/src/index.ts
- `How to read the diagrams` --references--> `AppointmentStatus`  [INFERRED]
  docs/er-diagram.md → packages/types/src/index.ts
- `Petals ERP – Build Progress` --references--> `VersionService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/clinical-history/version.service.ts
- `C. Access Control` --references--> `AuthGuard`  [INFERRED]
  docs/FINAL_REPORT.md → apps/api/src/common/guards/auth.guard.ts

## Import Cycles
- None detected.

## Communities (165 total, 83 thin omitted)

### Community 0 - "RequirePermission"
Cohesion: 0.17
Nodes (3): ClinicalController, ProgressEntryQueryDto, CurrentUser

### Community 1 - "AuthService"
Cohesion: 0.18
Nodes (3): AuthService, generateRandomToken(), verifyPassword()

### Community 2 - "4.1 Director"
Cohesion: 0.04
Nodes (44): 10. Release Phasing, 11. Assumptions, 12. Decisions and Remaining Open Questions, 13.1 Proposed Stack, 13.2 RBAC Implementation, 13.3 Authentication, 13.4 PWA Requirements, 13.5 Suggested Build Order (+36 more)

### Community 3 - "RequirePermission"
Cohesion: 0.12
Nodes (3): RequirePermission(), FinanceController, FinanceService

### Community 4 - "CommunicationChannel"
Cohesion: 0.12
Nodes (7): CommunicationJobData, CommunicationLogQueryDto, SendBulkMessagesDto, CommunicationChannel, CALL, EMAIL, WHATSAPP

### Community 5 - "env"
Cohesion: 0.05
Nodes (38): COOKIE_SECRET, DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_URL (+30 more)

### Community 6 - "report.service.ts"
Cohesion: 0.14
Nodes (11): DOCUMENT_SORT_FIELDS, DUE_REPORT_SORT_FIELDS, REPORT_SORT_FIELDS, ALLOWED_MIME_TYPES, StorageService, ReportStatus, DRAFT, REVIEWED (+3 more)

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
Cohesion: 0.06
Nodes (31): dependencies, bullmq@^5.41.3, class-transformer@^0.5.1, class-validator@^0.14.1, cookie-parser@^1.4.7, dotenv@^16.4.7, helmet@^8.0.0, ioredis@^5.5.0 (+23 more)

### Community 14 - "package.json"
Cohesion: 0.11
Nodes (20): devDependencies, eslint@^9.39.5, prettier@^3.4.2, typescript@^5.7.3, typescript-eslint@^8.72.1, eslint, prettier, typescript (+12 more)

### Community 15 - "config/package.json"
Cohesion: 0.13
Nodes (20): devDependencies, eslint@^9.20.1, eslint-config-prettier@^10.0.1, eslint-plugin-prettier@^5.2.3, prettier@^3.4.2, typescript@^5.7.3, @typescript-eslint/eslint-plugin@^8.24.0, @typescript-eslint/parser@^8.24.0 (+12 more)

### Community 16 - "branch.controller.ts"
Cohesion: 0.07
Nodes (7): BranchController, BranchModule, BRANCH_SORT_FIELDS, BranchService, BranchQueryDto, CreateBranchDto, UpdateBranchDto

### Community 17 - "devDependencies"
Cohesion: 0.06
Nodes (46): qrcode@^1.5.4, devDependencies, autocannon@^9.0.0, jest@^29.7.0, @nestjs/cli@^11.0.2, @nestjs/schematics@^11.0.0, @nestjs/testing@^11.0.9, @petals/config@workspace:* (+38 more)

### Community 18 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 19 - "scripts"
Cohesion: 0.10
Nodes (20): scripts, build, db:generate, db:migrate, db:migrate:deploy, db:seed, db:seed:demo, dev (+12 more)

### Community 20 - "types/package.json"
Cohesion: 0.14
Nodes (16): devDependencies, @petals/config@workspace:*, rimraf@^6.0.1, typescript@^5.7.3, @petals/config, typescript, main, name (+8 more)

### Community 21 - "Diagrams by area"
Cohesion: 0.13
Nodes (14): Access control and identity, Branches, people and leads, Clinical records, Communication and system, Diagrams by area, Entity Relationship Diagram, Finance, Full diagram (+6 more)

### Community 23 - "2. Checklist Evaluation & Verification Evidence"
Cohesion: 0.10
Nodes (20): 1. Executive Summary, 1. Running the Full Test Suite, 2. Checklist Evaluation & Verification Evidence, 2. Database Migrations & Seeding, 3. Open Decisions & Assumptions, 3. Starting the API Application, 4. Known Limitations, 5. Operations & Execution Guide (+12 more)

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

### Community 29 - "communication-queue.service.ts"
Cohesion: 0.24
Nodes (6): SENSITIVE_CLINICAL_KEYWORDS, SendWhatsAppParams, SendWhatsAppResult, WHATSAPP_PROVIDER, WhatsAppProvider, FakeWhatsAppProvider

### Community 30 - "tsconfig.build.json"
Cohesion: 0.29
Nodes (6): compilerOptions, declarationMap, sourceMap, exclude, extends, ./tsconfig.json

### Community 32 - "department.controller.ts"
Cohesion: 0.15
Nodes (3): DepartmentController, DepartmentModule, DepartmentService

### Community 34 - "clinical.service.ts"
Cohesion: 0.13
Nodes (6): UpdateTreatmentPlanDto, PlanStatus, ACTIVE, CANCELLED, COMPLETED, PAUSED

### Community 35 - "src/index.ts"
Cohesion: 0.07
Nodes (27): COOKIE_OPTIONS, RequestContext, IS_PUBLIC_KEY, PERMISSION_KEY, ROLES_KEY, BRANCH_SCOPED_MODELS, FILTERABLE_READ_OPS, inTxStorage (+19 more)

### Community 36 - "Ponytail, lazy senior dev mode"
Cohesion: 0.50
Nodes (3): Before you write, Ponytail, lazy senior dev mode, The smallest complete change

### Community 37 - "AuditLogQueryDto"
Cohesion: 0.16
Nodes (3): AuditLogQueryDto, buildCursorMeta(), buildCursorPagination()

### Community 39 - "client.service.ts"
Cohesion: 0.17
Nodes (6): ALL_PROFILE_TABS, CLIENT_SORT_FIELDS, TAB_MODULE_MAP, RecordVersionParams, VersionService, @prisma/client

### Community 66 - "Final Checklist: Petals ERP Backend"
Cohesion: 0.12
Nodes (15): A. Project and data model, C. Access control, D. Parents, E. Branch isolation and row-level security, F. Clinical data integrity, Final Checklist: Petals ERP Backend, G. Business rules, H. Pagination and N+1 (+7 more)

### Community 70 - "app.module.ts"
Cohesion: 0.06
Nodes (16): AccessModule, AppController, AppService, AppointmentModule, AuditModule, AuthModule, CommonModule, RequestContextMiddleware (+8 more)

### Community 71 - "Roles"
Cohesion: 0.21
Nodes (3): AuthController, Public(), ApiResponse

### Community 72 - "RoleKey"
Cohesion: 0.11
Nodes (3): ClientController, ClientService, UpdateClientDto

### Community 73 - "environment"
Cohesion: 0.18
Nodes (11): environment, APP_CORS_ORIGIN, COOKIE_SECRET, DOCUMENT_HMAC_SECRET, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, NODE_ENV, PORT (+3 more)

### Community 78 - "PermissionAction"
Cohesion: 0.19
Nodes (8): NoStoreInterceptor, PermissionRequirement, PermissionAction, CREATE, DELETE, UPDATE, VIEW, VIEW_ALL

### Community 80 - "access.e2e-spec.ts"
Cohesion: 0.18
Nodes (14): AppModule, hashPassword(), GlobalExceptionFilter, QueryCounter, bootstrap(), runLoadTests(), ClientStatus, ACTIVE (+6 more)

### Community 81 - "seed.ts"
Cohesion: 0.16
Nodes (12): argon2@^0.41.1, hashPassword(), prisma, runDemoSeed(), ALL_ACTIONS, ALL_MODULES, hashPassword(), main() (+4 more)

### Community 82 - "class-transformer"
Cohesion: 0.09
Nodes (8): BoardQueryDto, LeadQueryDto, LeadStage, ASSESSMENT_SCHEDULED, CONTACTED, CONVERTED, LOST, NEW

### Community 83 - "AccessService"
Cohesion: 0.06
Nodes (8): AccessController, AccessService, RoleModuleItemDto, UpdateRoleModulesDto, UpdateRolePermissionsDto, UpdateUserOverridesDto, sanitizeAuditMetadata(), PermissionGuard

### Community 84 - "RoleKey"
Cohesion: 0.16
Nodes (8): AuthTokens, ClinicalService, CachedUserData, RoleKey, DIRECTOR, MANAGER, PARENT, THERAPIST

### Community 86 - "ReportController"
Cohesion: 0.11
Nodes (3): ReportActivityQueryDto, ReportController, ReportService

### Community 88 - "api/package.json"
Cohesion: 0.19
Nodes (8): TokenPayload, ConsoleOtpSender, IOtpSender, OTP_SENDER, OtpService, sha256(), @nestjs/jwt, otplib

### Community 90 - "CreateGoalDto"
Cohesion: 0.06
Nodes (16): CreateGoalDto, CreateSubgoalDto, UpdateGoalDto, UpdateSubgoalDto, GoalStatus, ACHIEVED, DISCONTINUED, IN_PROGRESS (+8 more)

### Community 91 - "api"
Cohesion: 0.20
Nodes (10): container_name, depends_on, networks, ports, restart, migrator, redis, condition (+2 more)

### Community 93 - "postgres"
Cohesion: 0.20
Nodes (10): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, container_name, environment, image, networks, restart (+2 more)

### Community 95 - "clinical-history.controller.ts"
Cohesion: 0.07
Nodes (9): AUDIT_ACTION_KEY, AUDIT_ENTITY_KEY, AUDIT_IGNORE_KEY, AUDIT_SENSITIVE_READ_KEY, AuditSensitiveRead(), AuditInterceptor, ClinicalHistoryController, RestoreEntityDto (+1 more)

### Community 96 - "MessageStatus"
Cohesion: 0.13
Nodes (7): WebhookPayloadDto, MessageStatus, DELIVERED, FAILED, QUEUED, READ, SENT

### Community 97 - "cache.service.ts"
Cohesion: 0.29
Nodes (5): LockoutResult, MemoryLockEntry, MemoryCacheEntry, REDIS_CLIENT, ioredis

### Community 100 - "access.service.ts"
Cohesion: 0.19
Nodes (7): ResolvedModulePermissions, ResolvedPermissionsMap, AuditService, PermissionScope, ALL, ASSIGNED, OWN

### Community 105 - "token-bucket.guard.ts"
Cohesion: 0.38
Nodes (4): RateLimitModule, Throttle(), THROTTLE_KEY, ThrottleOptions

### Community 106 - "export-finance.dto.ts"
Cohesion: 0.22
Nodes (8): ExportFormat, EXCEL, PDF, ExportType, EXPENSES, INVOICES, PAYMENTS, PNL

### Community 107 - "hr.service.ts"
Cohesion: 0.25
Nodes (5): buildOffsetMeta(), buildOffsetPagination(), buildOrderBy(), EMPLOYEE_SORT_FIELDS, USER_SORT_FIELDS

### Community 108 - "DashboardService"
Cohesion: 0.14
Nodes (3): DashboardController, DashboardService, DashboardQueryDto

### Community 109 - "finance.service.ts"
Cohesion: 0.29
Nodes (4): FinanceModule, EXPENSE_SORT_FIELDS, INVOICE_SORT_FIELDS, PAYMENT_SORT_FIELDS

### Community 110 - "migrator"
Cohesion: 0.22
Nodes (9): postgres, DATABASE_URL, command, container_name, depends_on, environment, networks, condition (+1 more)

### Community 111 - "redis"
Cohesion: 0.22
Nodes (9): REDIS_PASSWORD, command, container_name, environment, image, networks, restart, volumes (+1 more)

### Community 112 - "pagination/index.ts"
Cohesion: 0.13
Nodes (4): ClientAppointmentQueryDto, CursorPaginationDto, OffsetPaginationDto, DocumentQueryDto

### Community 115 - ".createSchedule"
Cohesion: 0.25
Nodes (6): DAY_MAP, GeneratedSlot, generateScheduleSlots(), Decisions Made, Open Items, Petals ERP – Build Progress

### Community 116 - "TemplateStatus"
Cohesion: 0.22
Nodes (6): TemplateQueryDto, TemplateStatus, APPROVED, DRAFT, PENDING_APPROVAL, REJECTED

### Community 117 - "employee.controller.ts"
Cohesion: 0.11
Nodes (3): EmployeeQueryDto, EmployeeController, EmployeeService

### Community 119 - "InvoiceQueryDto"
Cohesion: 0.18
Nodes (4): InvoiceQueryDto, RevenueCategory, ASSESSMENT_FEE, CLINICAL_THERAPY

### Community 122 - "email-provider.interface.ts"
Cohesion: 0.27
Nodes (6): CommunicationModule, EMAIL_PROVIDER, EmailProvider, SendEmailParams, SendEmailResult, FakeEmailProvider

### Community 123 - "client.module.ts"
Cohesion: 0.28
Nodes (3): ClientModule, ClinicalModule, ClinicalHistoryModule

### Community 124 - "Petals Child Development Centre ERP — Backend"
Cohesion: 0.07
Nodes (28): 1. Objectives & SLA Targets, 2. Automated PostgreSQL Backup Procedure, 3. Redis Persistence & Backup, 4. Step-by-Step Restoration Checklist, Database Backup & Disaster Recovery Guide, Phase A: Pre-Restoration Sanity Checks, Phase B: Database Restore Execution, Phase C: Post-Restoration Verification Queries (+20 more)

### Community 125 - "RecordPaymentDto"
Cohesion: 0.13
Nodes (6): PaymentQueryDto, PaymentMethod, BANK_TRANSFER, CARD, CASH, UPI

### Community 126 - "common/index.ts"
Cohesion: 0.36
Nodes (5): CurrentBranch, CursorPaginatedResponse, CursorPaginationMeta, OffsetPaginatedResponse, OffsetPaginationMeta

### Community 129 - "two-factor.dto.ts"
Cohesion: 0.50
Nodes (3): Disable2faDto, Enable2faDto, Verify2faLoginDto

### Community 130 - "PrismaService"
Cohesion: 0.06
Nodes (16): PrismaService, CacheService, AppointmentStatus, ATTENDED, CANCELLED, NO_SHOW, SCHEDULED, InvoiceStatus (+8 more)

### Community 131 - "CreateLeaveRequestDto"
Cohesion: 0.09
Nodes (8): CreateLeaveRequestDto, LeaveQueryDto, LeaveType, CASUAL, OTHER, PAID, SICK, UNPAID

### Community 133 - "services"
Cohesion: 0.25
Nodes (7): networks, petals-internal, driver, services, volumes, postgres_prod_data, redis_prod_data

### Community 134 - "healthcheck"
Cohesion: 0.46
Nodes (8): healthcheck, interval, retries, start_period, test, timeout, healthcheck, healthcheck

### Community 142 - "build"
Cohesion: 0.50
Nodes (5): build, context, dockerfile, target, build

### Community 144 - "hr.service.ts"
Cohesion: 0.06
Nodes (7): CheckOutDto, DailyAttendanceQueryDto, DirectorAvailabilityDto, EmployeeActivityQueryDto, EmployeeGoalsQueryDto, HolidayQueryDto, LeaveDecisionDto

### Community 150 - "crypto.util.ts"
Cohesion: 0.38
Nodes (4): decryptSecret(), encryptSecret(), generateNumericOtp(), getEncryptionKey()

### Community 156 - "CreateProgressEntryDto"
Cohesion: 0.15
Nodes (7): UpdateProgressEntryDto, ProgressLevel, ACHIEVED, EMERGING, NO_CHANGE, PROGRESSING, REGRESSED

### Community 161 - "ReportType"
Cohesion: 0.06
Nodes (9): CreateReportDto, DueReportQueryDto, ReportQueryDto, UpdateReportDto, ReportType, ASSESSMENT, DISCHARGE, OTHER (+1 more)

### Community 162 - "CreateUserDto"
Cohesion: 0.05
Nodes (6): AssignBranchDto, CreateUserDto, UpdateUserDto, UserController, UserModule, UserService

### Community 165 - "UpdateAssessmentDto"
Cohesion: 0.15
Nodes (3): ASSESSMENT_SORT_FIELDS, AssessmentQueryDto, UpdateAssessmentDto

## Knowledge Gaps
- **109 isolated node(s):** `INVOICES`, `PAYMENTS`, `EXPENSES`, `PNL`, `EXCEL` (+104 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1145 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **83 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RoleKey` connect `RoleKey` to `RequirePermission`, `PrismaService`, `RequirePermission`, `report.service.ts`, `.findDailySchedule`, `branch.controller.ts`, `hr.service.ts`, `LeadService`, `2. Checklist Evaluation & Verification Evidence`, `CommunicationController`, `communication-queue.service.ts`, `.findDailySchedule`, `department.controller.ts`, `AppointmentController`, `src/index.ts`, `UpdateAssessmentDto`, `IRequestContext`, `client.service.ts`, `AuditLogQueryDto`, `Final Checklist: Petals ERP Backend`, `CommunicationService`, `RoleKey`, `PermissionAction`, `access.e2e-spec.ts`, `AccessService`, `ReportController`, `api/package.json`, `clinical-history.controller.ts`, `access.service.ts`, `hr.service.ts`, `finance.service.ts`, `employee.controller.ts`?**
  _High betweenness centrality (0.158) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `RoleKey` (e.g. with `A. Project and Data Model` and `A. Project and data model`) actually correct?**
  _`RoleKey` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `INVOICES`, `PAYMENTS`, `EXPENSES` to the rest of the system?**
  _109 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `4.1 Director` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/common` connect `src/index.ts` to `PrismaService`, `report.service.ts`, `dependencies`, `branch.controller.ts`, `devDependencies`, `hr.service.ts`, `communication-queue.service.ts`, `department.controller.ts`, `CreateUserDto`, `UpdateAssessmentDto`, `client.service.ts`, `app.module.ts`, `PermissionAction`, `access.e2e-spec.ts`, `api/package.json`, `clinical-history.controller.ts`, `cache.service.ts`, `access.service.ts`, `token-bucket.guard.ts`, `hr.service.ts`, `finance.service.ts`, `email-provider.interface.ts`, `client.module.ts`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Should `RequirePermission` be split into smaller, more focused modules?**
  _Cohesion score 0.11627906976744186 - nodes in this community are weakly interconnected._
- **Why does `CurrentUser` connect `RequirePermission` to `AppointmentController`, `CreateUserDto`, `src/index.ts`, `RequirePermission`, `Roles`, `RoleKey`, `DashboardService`, `PermissionAction`, `branch.controller.ts`, `hr.service.ts`, `AccessService`, `employee.controller.ts`, `LeadService`, `ReportController`, `Roles`, `CommunicationController`, `common/index.ts`, `clinical-history.controller.ts`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._