# Graph Report - petals-erp  (2026-11-11)

## Corpus Check
- 309 files · ~108,137 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .example 1, (none) 1, .toml 1)

## Summary
- 2265 nodes · 5736 edges · 154 communities (72 shown, 82 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 231 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8428c6ca`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RequirePermission
- AuthService
- 4.1 Director
- RequirePermission
- CommunicationChannel
- env
- ReportType
- web/package.json
- redis
- .findDailySchedule
- compilerOptions
- ClientService
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
- LeadService
- branch.controller.ts
- allowBuilds
- api/tsconfig.json
- types/tsconfig.json
- nest-cli.json
- seed.ts
- communication-queue.service.ts
- tsconfig.build.json
- RequestContextStorage
- department.controller.ts
- AppointmentController
- clinical.service.ts
- request-context.ts
- Ponytail, lazy senior dev mode
- audit.interceptor.ts
- IRequestContext
- access.module.ts
- CommunicationService
- app.controller.ts
- Roles
- ClientController
- QueryCounter
- VerifyOtpDto
- common/index.ts
- LockoutService
- .set
- PermissionAction
- update-user-overrides.dto.ts
- access.e2e-spec.ts
- src/index.ts
- class-transformer
- IRequestContext
- RoleKey
- AssignBranchDto
- ReportController
- CreateTemplateDto
- auth.service.ts
- Roles
- CreateGoalDto
- CommunicationController
- class-validator
- communication.service.spec.ts
- CreateScheduleDto
- clinical-history.controller.ts
- MessageStatus
- token-bucket.guard.ts
- UpdateUserDto
- CreateAssessmentDto
- access.service.ts
- CreateExpenseDto
- DocumentUploadUrlDto
- CommunicationQueueService
- UserController
- AccessService
- export-finance.dto.ts
- hr.service.ts
- DashboardService
- app.module.ts
- SendBulkMessagesDto
- RescheduleAppointmentDto
- OffsetPaginationDto
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
- BoardQueryDto
- Petals Child Development Centre ERP — Backend
- RecordPaymentDto
- LeaveDecisionDto
- AppointmentQueryDto
- UpdateRolePermissionsDto
- two-factor.dto.ts
- PrismaService
- CreateLeaveRequestDto
- tsconfig-paths@^4.2.0
- hr.controller.ts
- CreateAppointmentDto
- MonthlyAttendanceQueryDto
- CreateInvoiceDto
- UpdateAppointmentStatusDto
- report.service.ts
- UserQueryDto
- CancelAppointmentDto
- CreateProgressEntryDto
- .findDailySchedule
- CreateHolidayDto
- CreateReportDto
- CreateUserDto
- UpdateAssessmentDto
- RecordCallLogDto
- PnlQueryDto
- CheckOutDto
- DirectorAvailabilityDto
- communication.service.ts
- @nestjs/common

## God Nodes (most connected - your core abstractions)
1. `RoleKey` - 223 edges
2. `CurrentUser` - 130 edges
3. `@nestjs/common` - 124 edges
4. `RequirePermission()` - 109 edges
5. `PrismaService` - 85 edges
6. `class-validator` - 83 edges
7. `@nestjs/swagger` - 80 edges
8. `IRequestContext` - 71 edges
9. `Roles()` - 71 edges
10. `AppModule` - 57 edges

## Surprising Connections (you probably didn't know these)
- `How to read the diagrams` --references--> `AppointmentStatus`  [INFERRED]
  docs/er-diagram.md → packages/types/src/index.ts
- `Petals ERP – Build Progress` --references--> `VersionService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/clinical-history/version.service.ts
- `Decisions Made` --references--> `LockoutService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/rate-limit/lockout.service.ts
- `Decisions Made` --references--> `CacheService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/redis/cache.service.ts
- `Petals ERP – Build Progress` --references--> `generateScheduleSlots()`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/appointment/schedule-generator.helper.ts

## Import Cycles
- None detected.

## Communities (154 total, 82 thin omitted)

### Community 1 - "AuthService"
Cohesion: 0.19
Nodes (7): AuthService, decryptSecret(), encryptSecret(), generateRandomToken(), getEncryptionKey(), sha256(), verifyPassword()

### Community 2 - "4.1 Director"
Cohesion: 0.04
Nodes (44): 10. Release Phasing, 11. Assumptions, 12. Decisions and Remaining Open Questions, 13.1 Proposed Stack, 13.2 RBAC Implementation, 13.3 Authentication, 13.4 PWA Requirements, 13.5 Suggested Build Order (+36 more)

### Community 3 - "RequirePermission"
Cohesion: 0.12
Nodes (3): RequirePermission(), FinanceController, FinanceService

### Community 4 - "CommunicationChannel"
Cohesion: 0.14
Nodes (7): CommunicationJobData, CommunicationLogQueryDto, UpdateTemplateDto, CommunicationChannel, CALL, EMAIL, WHATSAPP

### Community 5 - "env"
Cohesion: 0.05
Nodes (38): COOKIE_SECRET, DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_URL (+30 more)

### Community 6 - "ReportType"
Cohesion: 0.07
Nodes (13): DueReportQueryDto, ReportQueryDto, UpdateReportDto, ReportStatus, DRAFT, REVIEWED, SHARED, SUBMITTED (+5 more)

### Community 7 - "web/package.json"
Cohesion: 0.08
Nodes (29): dependencies, next@^15.1.7, @petals/types@workspace:*, react@^19.0.0, react-dom@^19.0.0, devDependencies, @petals/config@workspace:*, @types/node@^22.13.4 (+21 more)

### Community 8 - "redis"
Cohesion: 0.07
Nodes (30): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_PASSWORD, interval, retries, test, timeout (+22 more)

### Community 10 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, alwaysStrict, declaration, declarationMap, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+16 more)

### Community 11 - "ClientService"
Cohesion: 0.08
Nodes (3): ClientService, CreateClientDto, CreateGuardianDto

### Community 12 - "AppModule"
Cohesion: 0.07
Nodes (23): RoleModuleItemDto, UpdateRoleModulesDto, AppModule, APPOINTMENTS, CLIENTS, COMMUNICATION, DASHBOARD, EMPLOYEE_SALARY (+15 more)

### Community 13 - "dependencies"
Cohesion: 0.07
Nodes (29): dependencies, bullmq@^5.41.3, class-transformer@^0.5.1, class-validator@^0.14.1, cookie-parser@^1.4.7, dotenv@^16.4.7, helmet@^8.0.0, ioredis@^5.5.0 (+21 more)

### Community 14 - "package.json"
Cohesion: 0.11
Nodes (20): devDependencies, eslint@^9.39.5, prettier@^3.4.2, typescript@^5.7.3, typescript-eslint@^8.72.1, eslint, prettier, typescript (+12 more)

### Community 15 - "config/package.json"
Cohesion: 0.13
Nodes (20): devDependencies, eslint@^9.20.1, eslint-config-prettier@^10.0.1, eslint-plugin-prettier@^5.2.3, prettier@^3.4.2, typescript@^5.7.3, @typescript-eslint/eslint-plugin@^8.24.0, @typescript-eslint/parser@^8.24.0 (+12 more)

### Community 17 - "devDependencies"
Cohesion: 0.06
Nodes (44): reflect-metadata@^0.2.2, devDependencies, autocannon@^9.0.0, jest@^29.7.0, @nestjs/cli@^11.0.2, @nestjs/schematics@^11.0.0, @nestjs/testing@^11.0.9, @petals/config@workspace:* (+36 more)

### Community 18 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 19 - "scripts"
Cohesion: 0.11
Nodes (18): scripts, build, db:generate, db:migrate, db:migrate:deploy, db:seed, dev, format (+10 more)

### Community 20 - "types/package.json"
Cohesion: 0.14
Nodes (16): devDependencies, @petals/config@workspace:*, rimraf@^6.0.1, typescript@^5.7.3, @petals/config, typescript, main, name (+8 more)

### Community 21 - "Diagrams by area"
Cohesion: 0.13
Nodes (14): Access control and identity, Branches, people and leads, Clinical records, Communication and system, Diagrams by area, Entity Relationship Diagram, Finance, Full diagram (+6 more)

### Community 23 - "branch.controller.ts"
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

### Community 29 - "communication-queue.service.ts"
Cohesion: 0.21
Nodes (7): CommunicationModule, EMAIL_PROVIDER, SendWhatsAppParams, SendWhatsAppResult, WHATSAPP_PROVIDER, WhatsAppProvider, FakeWhatsAppProvider

### Community 30 - "tsconfig.build.json"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

### Community 34 - "clinical.service.ts"
Cohesion: 0.08
Nodes (8): ASSESSMENT_SORT_FIELDS, CreateTreatmentPlanDto, UpdateTreatmentPlanDto, PlanStatus, ACTIVE, CANCELLED, COMPLETED, PAUSED

### Community 35 - "request-context.ts"
Cohesion: 0.14
Nodes (8): COOKIE_OPTIONS, RequestContextMiddleware, RequestContext, CurrentBranch, IS_PUBLIC_KEY, PERMISSION_KEY, PermissionRequirement, ROLES_KEY

### Community 36 - "Ponytail, lazy senior dev mode"
Cohesion: 0.50
Nodes (3): Before you write, Ponytail, lazy senior dev mode, The smallest complete change

### Community 37 - "audit.interceptor.ts"
Cohesion: 0.07
Nodes (10): rxjs@^7.8.1, AuditController, AUDIT_ACTION_KEY, AUDIT_ENTITY_KEY, AUDIT_IGNORE_KEY, AUDIT_SENSITIVE_READ_KEY, AuditInterceptor, AuditService (+2 more)

### Community 39 - "access.module.ts"
Cohesion: 0.20
Nodes (3): AccessModule, AuditModule, RolesGuard

### Community 70 - "app.controller.ts"
Cohesion: 0.19
Nodes (3): AppController, AppService, ApiResponse

### Community 71 - "Roles"
Cohesion: 0.15
Nodes (3): AuthController, ChangePasswordDto, Public()

### Community 73 - "QueryCounter"
Cohesion: 0.15
Nodes (4): QueryCounter, bootstrap(), runLoadTests(), helmet

### Community 74 - "VerifyOtpDto"
Cohesion: 0.23
Nodes (3): RequestOtpDto, VerifyOtpDto, generateNumericOtp()

### Community 75 - "common/index.ts"
Cohesion: 0.19
Nodes (6): EnvironmentVariables, validate(), CursorPaginatedResponse, CursorPaginationMeta, OffsetPaginatedResponse, OffsetPaginationMeta

### Community 78 - "PermissionAction"
Cohesion: 0.18
Nodes (8): ClientModule, NoStoreInterceptor, PermissionAction, CREATE, DELETE, UPDATE, VIEW, VIEW_ALL

### Community 80 - "access.e2e-spec.ts"
Cohesion: 0.24
Nodes (11): AppModule, hashPassword(), GlobalExceptionFilter, scanDir(), ClientStatus, ACTIVE, DISCHARGED, ON_HOLD (+3 more)

### Community 81 - "src/index.ts"
Cohesion: 0.12
Nodes (19): EXPENSE_SORT_FIELDS, INVOICE_SORT_FIELDS, PAYMENT_SORT_FIELDS, AppointmentStatus, ATTENDED, CANCELLED, NO_SHOW, SCHEDULED (+11 more)

### Community 82 - "class-transformer"
Cohesion: 0.09
Nodes (8): LeadQueryDto, UpdateLeadDto, LeadStage, ASSESSMENT_SCHEDULED, CONTACTED, CONVERTED, LOST, NEW

### Community 84 - "RoleKey"
Cohesion: 0.13
Nodes (8): AuthTokens, ClinicalService, CachedUserData, RoleKey, DIRECTOR, MANAGER, PARENT, THERAPIST

### Community 86 - "ReportController"
Cohesion: 0.09
Nodes (3): CreateDocumentDto, ReportController, ReportService

### Community 88 - "auth.service.ts"
Cohesion: 0.12
Nodes (8): TokenPayload, ConsoleOtpSender, IOtpSender, OTP_SENDER, OtpService, @nestjs/core, @nestjs/jwt, otplib

### Community 90 - "CreateGoalDto"
Cohesion: 0.06
Nodes (16): CreateGoalDto, CreateSubgoalDto, UpdateGoalDto, UpdateSubgoalDto, GoalStatus, ACHIEVED, DISCONTINUED, IN_PROGRESS (+8 more)

### Community 92 - "class-validator"
Cohesion: 0.12
Nodes (3): class-transformer, class-validator, @nestjs/swagger

### Community 93 - "communication.service.spec.ts"
Cohesion: 0.16
Nodes (5): MemoryLockEntry, MemoryCacheEntry, REDIS_CLIENT, RedisModule, ioredis

### Community 95 - "clinical-history.controller.ts"
Cohesion: 0.07
Nodes (8): AuditSensitiveRead(), ClinicalModule, ClinicalHistoryController, ClinicalHistoryModule, RestoreEntityDto, VersionHistoryQueryDto, RecordVersionParams, VersionService

### Community 96 - "MessageStatus"
Cohesion: 0.13
Nodes (7): WebhookPayloadDto, MessageStatus, DELIVERED, FAILED, QUEUED, READ, SENT

### Community 97 - "token-bucket.guard.ts"
Cohesion: 0.19
Nodes (6): LockoutResult, RateLimitModule, Throttle(), THROTTLE_KEY, ThrottleOptions, TokenBucketGuard

### Community 100 - "access.service.ts"
Cohesion: 0.32
Nodes (6): ResolvedModulePermissions, ResolvedPermissionsMap, PermissionScope, ALL, ASSIGNED, OWN

### Community 106 - "export-finance.dto.ts"
Cohesion: 0.22
Nodes (8): ExportFormat, EXCEL, PDF, ExportType, EXPENSES, INVOICES, PAYMENTS, PNL

### Community 107 - "hr.service.ts"
Cohesion: 0.19
Nodes (5): buildOffsetMeta(), buildOffsetPagination(), buildOrderBy(), EmployeeQueryDto, EMPLOYEE_SORT_FIELDS

### Community 108 - "DashboardService"
Cohesion: 0.14
Nodes (3): DashboardController, DashboardService, DashboardQueryDto

### Community 109 - "app.module.ts"
Cohesion: 0.11
Nodes (9): AppointmentModule, AuthModule, CommonModule, DashboardModule, DepartmentModule, FinanceModule, HrModule, LeadModule (+1 more)

### Community 112 - "OffsetPaginationDto"
Cohesion: 0.11
Nodes (5): ClientAppointmentQueryDto, AssessmentQueryDto, ProgressEntryQueryDto, CursorPaginationDto, OffsetPaginationDto

### Community 115 - ".createSchedule"
Cohesion: 0.25
Nodes (6): DAY_MAP, GeneratedSlot, generateScheduleSlots(), Decisions Made, Open Items, Petals ERP – Build Progress

### Community 116 - "TemplateStatus"
Cohesion: 0.22
Nodes (6): TemplateQueryDto, TemplateStatus, APPROVED, DRAFT, PENDING_APPROVAL, REJECTED

### Community 117 - "employee.controller.ts"
Cohesion: 0.09
Nodes (4): UpdateEmployeeDto, EmployeeController, EmployeeModule, EmployeeService

### Community 119 - "InvoiceQueryDto"
Cohesion: 0.10
Nodes (5): ExpenseQueryDto, InvoiceQueryDto, RevenueCategory, ASSESSMENT_FEE, CLINICAL_THERAPY

### Community 121 - "ClientQueryDto"
Cohesion: 0.20
Nodes (4): ALL_PROFILE_TABS, CLIENT_SORT_FIELDS, TAB_MODULE_MAP, ClientQueryDto

### Community 122 - "email-provider.interface.ts"
Cohesion: 0.39
Nodes (4): EmailProvider, SendEmailParams, SendEmailResult, FakeEmailProvider

### Community 124 - "Petals Child Development Centre ERP — Backend"
Cohesion: 0.29
Nodes (6): Isolation Model, Performance & Load Test Results (Autocannon), Petals Child Development Centre ERP — Backend, Row-Level Security (RLS) & Hardening, Security Hardening Verification, Tech Stack

### Community 125 - "RecordPaymentDto"
Cohesion: 0.15
Nodes (6): PaymentQueryDto, PaymentMethod, BANK_TRANSFER, CARD, CASH, UPI

### Community 129 - "two-factor.dto.ts"
Cohesion: 0.50
Nodes (3): Disable2faDto, Enable2faDto, Verify2faLoginDto

### Community 130 - "PrismaService"
Cohesion: 0.09
Nodes (5): PrismaService, CacheService, ALLOWED_MIME_TYPES, StorageService, @nestjs/config

### Community 131 - "CreateLeaveRequestDto"
Cohesion: 0.09
Nodes (8): CreateLeaveRequestDto, LeaveQueryDto, LeaveType, CASUAL, OTHER, PAID, SICK, UNPAID

### Community 144 - "hr.controller.ts"
Cohesion: 0.08
Nodes (5): CheckInDto, DailyAttendanceQueryDto, EmployeeActivityQueryDto, EmployeeGoalsQueryDto, HolidayQueryDto

### Community 150 - "report.service.ts"
Cohesion: 0.20
Nodes (5): DocumentQueryDto, ReportActivityQueryDto, DOCUMENT_SORT_FIELDS, DUE_REPORT_SORT_FIELDS, REPORT_SORT_FIELDS

### Community 156 - "CreateProgressEntryDto"
Cohesion: 0.10
Nodes (8): CreateProgressEntryDto, UpdateProgressEntryDto, ProgressLevel, ACHIEVED, EMERGING, NO_CHANGE, PROGRESSING, REGRESSED

### Community 186 - "communication.service.ts"
Cohesion: 0.29
Nodes (4): sanitizeAuditMetadata(), buildCursorMeta(), buildCursorPagination(), SENSITIVE_CLINICAL_KEYWORDS

### Community 187 - "@nestjs/common"
Cohesion: 0.10
Nodes (11): PrismaModule, BRANCH_SCOPED_MODELS, FILTERABLE_READ_OPS, inTxStorage, SCOPED_WRITE_OPS, LEAD_SORT_FIELDS, UserModule, USER_SORT_FIELDS (+3 more)

## Knowledge Gaps
- **109 isolated node(s):** `INVOICES`, `PAYMENTS`, `EXPENSES`, `PNL`, `EXCEL` (+104 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1043 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **82 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RoleKey` connect `RoleKey` to `RequirePermission`, `PrismaService`, `RequirePermission`, `.findDailySchedule`, `ClientService`, `hr.controller.ts`, `CreateInvoiceDto`, `LeadService`, `branch.controller.ts`, `report.service.ts`, `.findDailySchedule`, `AppointmentController`, `clinical.service.ts`, `request-context.ts`, `CreateReportDto`, `audit.interceptor.ts`, `IRequestContext`, `RecordCallLogDto`, `communication.service.ts`, `@nestjs/common`, `CommunicationService`, `ClientController`, `PermissionAction`, `access.e2e-spec.ts`, `src/index.ts`, `IRequestContext`, `ReportController`, `auth.service.ts`, `CommunicationController`, `communication.service.spec.ts`, `clinical-history.controller.ts`, `access.service.ts`, `AccessService`, `hr.service.ts`, `employee.controller.ts`, `CreateLeadDto`, `ClientQueryDto`, `BoardQueryDto`?**
  _High betweenness centrality (0.171) - this node is a cross-community bridge._
- **What connects `INVOICES`, `PAYMENTS`, `EXPENSES` to the rest of the system?**
  _109 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `4.1 Director` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/common` connect `@nestjs/common` to `PrismaService`, `dependencies`, `hr.controller.ts`, `devDependencies`, `report.service.ts`, `branch.controller.ts`, `communication-queue.service.ts`, `clinical.service.ts`, `request-context.ts`, `audit.interceptor.ts`, `access.module.ts`, `communication.service.ts`, `app.controller.ts`, `QueryCounter`, `PermissionAction`, `access.e2e-spec.ts`, `src/index.ts`, `auth.service.ts`, `communication.service.spec.ts`, `clinical-history.controller.ts`, `token-bucket.guard.ts`, `access.service.ts`, `hr.service.ts`, `app.module.ts`, `employee.controller.ts`, `ClientQueryDto`, `email-provider.interface.ts`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Should `RequirePermission` be split into smaller, more focused modules?**
  _Cohesion score 0.11846689895470383 - nodes in this community are weakly interconnected._
- **Why does `CurrentUser` connect `RequirePermission` to `RequirePermission`, `hr.controller.ts`, `LeadService`, `branch.controller.ts`, `AppointmentController`, `request-context.ts`, `IRequestContext`, `DirectorAvailabilityDto`, `@nestjs/common`, `Roles`, `ClientController`, `common/index.ts`, `PermissionAction`, `IRequestContext`, `ReportController`, `Roles`, `CommunicationController`, `clinical-history.controller.ts`, `UserController`, `DashboardService`, `employee.controller.ts`, `LeaveDecisionDto`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `CommunicationChannel` be split into smaller, more focused modules?**
  _Cohesion score 0.13970588235294118 - nodes in this community are weakly interconnected._