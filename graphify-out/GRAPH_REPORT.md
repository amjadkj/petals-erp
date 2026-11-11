# Graph Report - petals-erp  (2026-11-11)

## Corpus Check
- 314 files · ~127,451 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 2, .example 1, .toml 1)

## Summary
- 2396 nodes · 5894 edges · 162 communities (75 shown, 87 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 235 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `be946625`
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
- BranchController
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
- LeaveQueryDto
- communication-queue.service.ts
- tsconfig.build.json
- RequestContextStorage
- department.controller.ts
- AppointmentController
- clinical.service.ts
- @nestjs/common
- Ponytail, lazy senior dev mode
- AuditLogQueryDto
- IRequestContext
- rls-hardening.e2e-spec.ts
- Final Checklist: Petals ERP Backend
- CommunicationService
- app.controller.ts
- Roles
- RoleKey
- environment
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
- common/index.ts
- UpdateLeadDto
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
- BranchQueryDto
- Petals Child Development Centre ERP — Backend
- RecordPaymentDto
- LeaveDecisionDto
- AppointmentQueryDto
- UpdateRolePermissionsDto
- two-factor.dto.ts
- PrismaService
- CreateLeaveRequestDto
- DueReportQueryDto
- services
- healthcheck
- CreateDocumentDto
- LoginDto
- ExpenseQueryDto
- DailyAttendanceQueryDto
- .getEmployeeGoals
- ChangePasswordDto
- CheckInDto
- build
- hr.service.ts
- appointment.module.ts
- CreateAppointmentDto
- MonthlyAttendanceQueryDto
- CreateInvoiceDto
- UpdateAppointmentStatusDto
- UpdateClientDto
- class-transformer
- CancelAppointmentDto
- CreateProgressEntryDto
- .findDailySchedule
- ReportType
- CreateUserDto
- UpdateAssessmentDto
- RecordCallLogDto
- PnlQueryDto
- clinical.service.ts
- prisma.service.ts

## God Nodes (most connected - your core abstractions)
1. `RoleKey` - 224 edges
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
- `A. Project and data model` --references--> `RoleKey`  [INFERRED]
  docs/phases/final-checklist.md → packages/types/src/index.ts
- `How to read the diagrams` --references--> `AppointmentStatus`  [INFERRED]
  docs/er-diagram.md → packages/types/src/index.ts
- `Petals ERP – Build Progress` --references--> `VersionService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/clinical-history/version.service.ts
- `B. Authentication and sessions` --references--> `AuthGuard`  [INFERRED]
  docs/phases/final-checklist.md → apps/api/src/common/guards/auth.guard.ts
- `Decisions Made` --references--> `LockoutService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/rate-limit/lockout.service.ts

## Import Cycles
- None detected.

## Communities (162 total, 87 thin omitted)

### Community 1 - "AuthService"
Cohesion: 0.19
Nodes (6): AuthService, decryptSecret(), encryptSecret(), generateRandomToken(), getEncryptionKey(), verifyPassword()

### Community 2 - "4.1 Director"
Cohesion: 0.04
Nodes (44): 10. Release Phasing, 11. Assumptions, 12. Decisions and Remaining Open Questions, 13.1 Proposed Stack, 13.2 RBAC Implementation, 13.3 Authentication, 13.4 PWA Requirements, 13.5 Suggested Build Order (+36 more)

### Community 3 - "RequirePermission"
Cohesion: 0.12
Nodes (3): RequirePermission(), FinanceController, FinanceService

### Community 4 - "CommunicationChannel"
Cohesion: 0.12
Nodes (7): CommunicationJobData, SendBulkMessagesDto, UpdateTemplateDto, CommunicationChannel, CALL, EMAIL, WHATSAPP

### Community 5 - "env"
Cohesion: 0.05
Nodes (38): COOKIE_SECRET, DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_URL (+30 more)

### Community 6 - "report.service.ts"
Cohesion: 0.10
Nodes (10): ReportQueryDto, UpdateReportDto, DOCUMENT_SORT_FIELDS, DUE_REPORT_SORT_FIELDS, REPORT_SORT_FIELDS, ReportStatus, DRAFT, REVIEWED (+2 more)

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
Cohesion: 0.05
Nodes (43): dependencies, argon2@^0.41.1, bullmq@^5.41.3, class-transformer@^0.5.1, class-validator@^0.14.1, cookie-parser@^1.4.7, dotenv@^16.4.7, helmet@^8.0.0 (+35 more)

### Community 14 - "package.json"
Cohesion: 0.11
Nodes (20): devDependencies, eslint@^9.39.5, prettier@^3.4.2, typescript@^5.7.3, typescript-eslint@^8.72.1, eslint, prettier, typescript (+12 more)

### Community 15 - "config/package.json"
Cohesion: 0.13
Nodes (20): devDependencies, eslint@^9.20.1, eslint-config-prettier@^10.0.1, eslint-plugin-prettier@^5.2.3, prettier@^3.4.2, typescript@^5.7.3, @typescript-eslint/eslint-plugin@^8.24.0, @typescript-eslint/parser@^8.24.0 (+12 more)

### Community 17 - "devDependencies"
Cohesion: 0.05
Nodes (40): devDependencies, autocannon@^9.0.0, jest@^29.7.0, @nestjs/cli@^11.0.2, @nestjs/schematics@^11.0.0, @nestjs/testing@^11.0.9, @petals/config@workspace:*, prisma@^6.3.1 (+32 more)

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

### Community 23 - "branch.controller.ts"
Cohesion: 0.17
Nodes (5): BranchModule, BRANCH_SORT_FIELDS, BranchService, CreateBranchDto, UpdateBranchDto

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

### Community 28 - "LeaveQueryDto"
Cohesion: 0.17
Nodes (6): LeaveQueryDto, LeaveStatus, APPROVED, CANCELLED, PENDING, REJECTED

### Community 29 - "communication-queue.service.ts"
Cohesion: 0.15
Nodes (13): SENSITIVE_CLINICAL_KEYWORDS, CommunicationLogQueryDto, SendWhatsAppParams, SendWhatsAppResult, WHATSAPP_PROVIDER, WhatsAppProvider, FakeWhatsAppProvider, MessageStatus (+5 more)

### Community 30 - "tsconfig.build.json"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

### Community 32 - "department.controller.ts"
Cohesion: 0.15
Nodes (3): DepartmentController, DepartmentModule, DepartmentService

### Community 34 - "clinical.service.ts"
Cohesion: 0.08
Nodes (7): CreateTreatmentPlanDto, UpdateTreatmentPlanDto, PlanStatus, ACTIVE, CANCELLED, COMPLETED, PAUSED

### Community 35 - "@nestjs/common"
Cohesion: 0.09
Nodes (12): ResolvedPermissionsMap, AuditModule, AuditService, RequestContextMiddleware, RequestContext, CurrentBranch, PERMISSION_KEY, ROLES_KEY (+4 more)

### Community 36 - "Ponytail, lazy senior dev mode"
Cohesion: 0.50
Nodes (3): Before you write, Ponytail, lazy senior dev mode, The smallest complete change

### Community 39 - "rls-hardening.e2e-spec.ts"
Cohesion: 0.09
Nodes (8): AccessModule, ClientModule, ClinicalModule, ClinicalHistoryModule, RecordVersionParams, VersionService, scanDir(), @prisma/client

### Community 66 - "Final Checklist: Petals ERP Backend"
Cohesion: 0.12
Nodes (15): A. Project and data model, C. Access control, D. Parents, E. Branch isolation and row-level security, F. Clinical data integrity, Final Checklist: Petals ERP Backend, G. Business rules, H. Pagination and N+1 (+7 more)

### Community 72 - "RoleKey"
Cohesion: 0.10
Nodes (9): AuthTokens, ClientController, ClientService, CachedUserData, RoleKey, DIRECTOR, MANAGER, PARENT (+1 more)

### Community 73 - "environment"
Cohesion: 0.18
Nodes (11): environment, APP_CORS_ORIGIN, COOKIE_SECRET, DOCUMENT_HMAC_SECRET, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, NODE_ENV, PORT (+3 more)

### Community 74 - "VerifyOtpDto"
Cohesion: 0.23
Nodes (3): RequestOtpDto, VerifyOtpDto, generateNumericOtp()

### Community 77 - ".set"
Cohesion: 0.18
Nodes (3): Public(), AuthGuard, B. Authentication and sessions

### Community 78 - "PermissionAction"
Cohesion: 0.19
Nodes (8): NoStoreInterceptor, PermissionRequirement, PermissionAction, CREATE, DELETE, UPDATE, VIEW, VIEW_ALL

### Community 80 - "access.e2e-spec.ts"
Cohesion: 0.22
Nodes (13): AppModule, hashPassword(), GlobalExceptionFilter, QueryCounter, bootstrap(), runLoadTests(), ClientStatus, ACTIVE (+5 more)

### Community 81 - "src/index.ts"
Cohesion: 0.09
Nodes (22): ALL_PROFILE_TABS, CLIENT_SORT_FIELDS, TAB_MODULE_MAP, AppointmentDto, AppointmentStatus, ATTENDED, CANCELLED, NO_SHOW (+14 more)

### Community 82 - "class-transformer"
Cohesion: 0.09
Nodes (8): BoardQueryDto, LeadQueryDto, LeadStage, ASSESSMENT_SCHEDULED, CONTACTED, CONVERTED, LOST, NEW

### Community 83 - "IRequestContext"
Cohesion: 0.11
Nodes (3): AccessController, Roles(), CommunicationController

### Community 88 - "api/package.json"
Cohesion: 0.10
Nodes (19): name, private, version, COOKIE_OPTIONS, AuthModule, TokenPayload, ConsoleOtpSender, IOtpSender (+11 more)

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

### Community 97 - "common/index.ts"
Cohesion: 0.08
Nodes (15): CommonModule, IS_PUBLIC_KEY, LockoutResult, MemoryLockEntry, RateLimitModule, Throttle(), THROTTLE_KEY, ThrottleOptions (+7 more)

### Community 100 - "access.service.ts"
Cohesion: 0.18
Nodes (6): ResolvedModulePermissions, PermissionGuard, PermissionScope, ALL, ASSIGNED, OWN

### Community 106 - "export-finance.dto.ts"
Cohesion: 0.22
Nodes (8): ExportFormat, EXCEL, PDF, ExportType, EXPENSES, INVOICES, PAYMENTS, PNL

### Community 107 - "hr.service.ts"
Cohesion: 0.13
Nodes (7): AssessmentQueryDto, buildOffsetMeta(), buildOffsetPagination(), buildOrderBy(), EmployeeQueryDto, EMPLOYEE_SORT_FIELDS, DocumentQueryDto

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
Cohesion: 0.11
Nodes (9): ClientAppointmentQueryDto, ProgressEntryQueryDto, CursorPaginationDto, OffsetPaginationDto, CursorPaginatedResponse, CursorPaginationMeta, OffsetPaginatedResponse, OffsetPaginationMeta (+1 more)

### Community 115 - ".createSchedule"
Cohesion: 0.22
Nodes (6): DAY_MAP, GeneratedSlot, generateScheduleSlots(), Decisions Made, Open Items, Petals ERP – Build Progress

### Community 116 - "TemplateStatus"
Cohesion: 0.22
Nodes (6): TemplateQueryDto, TemplateStatus, APPROVED, DRAFT, PENDING_APPROVAL, REJECTED

### Community 117 - "employee.controller.ts"
Cohesion: 0.07
Nodes (4): CreateEmployeeDto, UpdateEmployeeDto, EmployeeController, EmployeeService

### Community 119 - "InvoiceQueryDto"
Cohesion: 0.18
Nodes (4): InvoiceQueryDto, RevenueCategory, ASSESSMENT_FEE, CLINICAL_THERAPY

### Community 122 - "email-provider.interface.ts"
Cohesion: 0.27
Nodes (6): CommunicationModule, EMAIL_PROVIDER, EmailProvider, SendEmailParams, SendEmailResult, FakeEmailProvider

### Community 124 - "Petals Child Development Centre ERP — Backend"
Cohesion: 0.07
Nodes (28): 1. Objectives & SLA Targets, 2. Automated PostgreSQL Backup Procedure, 3. Redis Persistence & Backup, 4. Step-by-Step Restoration Checklist, Database Backup & Disaster Recovery Guide, Phase A: Pre-Restoration Sanity Checks, Phase B: Database Restore Execution, Phase C: Post-Restoration Verification Queries (+20 more)

### Community 125 - "RecordPaymentDto"
Cohesion: 0.17
Nodes (6): PaymentQueryDto, PaymentMethod, BANK_TRANSFER, CARD, CASH, UPI

### Community 129 - "two-factor.dto.ts"
Cohesion: 0.50
Nodes (3): Disable2faDto, Enable2faDto, Verify2faLoginDto

### Community 130 - "PrismaService"
Cohesion: 0.07
Nodes (8): PrismaService, CacheService, UserModule, USER_SORT_FIELDS, InvoiceStatus, ADVANCE, PAID, PENDING

### Community 131 - "CreateLeaveRequestDto"
Cohesion: 0.13
Nodes (7): CreateLeaveRequestDto, LeaveType, CASUAL, OTHER, PAID, SICK, UNPAID

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
Cohesion: 0.08
Nodes (5): CheckOutDto, CreateHolidayDto, DirectorAvailabilityDto, HolidayQueryDto, HrModule

### Community 151 - "class-transformer"
Cohesion: 0.09
Nodes (4): RoleModuleItemDto, UpdateRoleModulesDto, UserQueryDto, class-transformer

### Community 156 - "CreateProgressEntryDto"
Cohesion: 0.10
Nodes (8): CreateProgressEntryDto, UpdateProgressEntryDto, ProgressLevel, ACHIEVED, EMERGING, NO_CHANGE, PROGRESSING, REGRESSED

### Community 161 - "ReportType"
Cohesion: 0.12
Nodes (6): CreateReportDto, ReportType, ASSESSMENT, DISCHARGE, OTHER, PROGRESS

### Community 162 - "CreateUserDto"
Cohesion: 0.07
Nodes (4): AssignBranchDto, CreateUserDto, UpdateUserDto, UserService

### Community 186 - "clinical.service.ts"
Cohesion: 0.36
Nodes (3): ASSESSMENT_SORT_FIELDS, buildCursorMeta(), buildCursorPagination()

### Community 187 - "prisma.service.ts"
Cohesion: 0.12
Nodes (7): PrismaModule, BRANCH_SCOPED_MODELS, FILTERABLE_READ_OPS, inTxStorage, SCOPED_WRITE_OPS, LeadModule, LEAD_SORT_FIELDS

## Knowledge Gaps
- **109 isolated node(s):** `INVOICES`, `PAYMENTS`, `EXPENSES`, `PNL`, `EXCEL` (+104 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1126 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **87 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RoleKey` connect `RoleKey` to `RequirePermission`, `PrismaService`, `RequirePermission`, `report.service.ts`, `.findDailySchedule`, `hr.service.ts`, `LeadService`, `branch.controller.ts`, `CancelAppointmentDto`, `communication-queue.service.ts`, `.findDailySchedule`, `department.controller.ts`, `AppointmentController`, `@nestjs/common`, `IRequestContext`, `rls-hardening.e2e-spec.ts`, `clinical.service.ts`, `prisma.service.ts`, `Final Checklist: Petals ERP Backend`, `CommunicationService`, `PermissionAction`, `access.e2e-spec.ts`, `src/index.ts`, `IRequestContext`, `RoleKey`, `ReportController`, `api/package.json`, `clinical-history.controller.ts`, `access.service.ts`, `DocumentUploadUrlDto`, `AccessService`, `hr.service.ts`, `finance.service.ts`, `.createSchedule`, `employee.controller.ts`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **What connects `INVOICES`, `PAYMENTS`, `EXPENSES` to the rest of the system?**
  _109 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `4.1 Director` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/common` connect `@nestjs/common` to `PrismaService`, `report.service.ts`, `dependencies`, `hr.service.ts`, `appointment.module.ts`, `branch.controller.ts`, `communication-queue.service.ts`, `department.controller.ts`, `rls-hardening.e2e-spec.ts`, `clinical.service.ts`, `prisma.service.ts`, `app.controller.ts`, `PermissionAction`, `access.e2e-spec.ts`, `src/index.ts`, `api/package.json`, `clinical-history.controller.ts`, `common/index.ts`, `hr.service.ts`, `finance.service.ts`, `email-provider.interface.ts`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Should `RequirePermission` be split into smaller, more focused modules?**
  _Cohesion score 0.11627906976744186 - nodes in this community are weakly interconnected._
- **Why does `CurrentUser` connect `RequirePermission` to `AuthService`, `RequirePermission`, `.getEmployeeGoals`, `BranchController`, `hr.service.ts`, `MonthlyAttendanceQueryDto`, `LeadService`, `branch.controller.ts`, `AppointmentController`, `@nestjs/common`, `Roles`, `RoleKey`, `PermissionAction`, `IRequestContext`, `ReportController`, `api/package.json`, `Roles`, `clinical-history.controller.ts`, `common/index.ts`, `UserController`, `DashboardService`, `employee.controller.ts`, `BranchQueryDto`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Should `CommunicationChannel` be split into smaller, more focused modules?**
  _Cohesion score 0.11695906432748537 - nodes in this community are weakly interconnected._