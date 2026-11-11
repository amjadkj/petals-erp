# Graph Report - petals-erp  (2026-11-11)

## Corpus Check
- 280 files · ~94,063 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .example 1, (none) 1, .toml 1)

## Summary
- 2022 nodes · 4976 edges · 169 communities (67 shown, 102 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 177 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7e7a28b0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RequirePermission
- auth.service.ts
- 4.1 Director
- api/package.json
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
- employee.service.ts
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
- communication.service.ts
- tsconfig.build.json
- IRequestContext
- department.controller.ts
- CurrentUser
- CreateTreatmentPlanDto
- @nestjs/core
- Ponytail, lazy senior dev mode
- audit.interceptor.ts
- PermissionScope
- app.module.ts
- CommunicationService
- ReportService
- Roles
- CreateSubgoalDto
- @nestjs/common
- VerifyOtpDto
- LockoutService
- AuthGuard
- @nestjs/common
- update-user-overrides.dto.ts
- access.e2e-spec.ts
- clinical.service.ts
- src/index.ts
- IRequestContext
- RoleKey
- FinanceService
- MessageStatus
- CreateProgressEntryDto
- otp.service.ts
- Get
- CreateGoalDto
- CreateTreatmentPlanDto
- @nestjs/swagger
- audit.service.ts
- CreateScheduleDto
- clinical.service.ts
- AssignBranchDto
- common/index.ts
- CreateAssessmentDto
- CreateInvoiceDto
- auth.controller.ts
- CommunicationQueueService
- UserController
- AccessService
- export-finance.dto.ts
- employee.service.ts
- UpdateAssessmentDto
- CreateUserDto
- CreateExpenseDto
- AppointmentService
- CreateScheduleDto
- UpdateRoleModulesDto
- DueReportQueryDto
- RequestContextStorage
- TemplateStatus
- RecordPaymentDto
- pagination/index.ts
- InvoiceQueryDto
- CreateLeadDto
- ClientQueryDto
- email-provider.interface.ts
- BoardQueryDto
- UpdateLeadDto
- RecordPaymentDto
- StorageService
- AppointmentQueryDto
- UpdateRolePermissionsDto
- two-factor.dto.ts
- CacheService
- UpdateUserDto
- ConvertLeadDto
- UserService
- CreateAppointmentDto
- SendMessageDto
- CreateDocumentDto
- UpdateAppointmentStatusDto
- .findClientDocuments
- UserQueryDto
- CancelAppointmentDto
- CreateTemplateDto
- AuditInterceptor
- LeaveStatus
- DailyScheduleQueryDto
- UpdateTemplateDto
- RescheduleAppointmentDto
- ExportFormat
- @types/cookie-parser@^1.4.8
- @types/qrcode@^1.5.5

## God Nodes (most connected - your core abstractions)
1. `RoleKey` - 216 edges
2. `@nestjs/common` - 112 edges
3. `CurrentUser` - 101 edges
4. `RequirePermission()` - 97 edges
5. `class-validator` - 71 edges
6. `@nestjs/swagger` - 66 edges
7. `AppModule` - 56 edges
8. `Roles()` - 48 edges
9. `PrismaService` - 43 edges
10. `PermissionAction` - 40 edges

## Surprising Connections (you probably didn't know these)
- `Decisions Made` --references--> `CacheService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/redis/cache.service.ts
- `Decisions Made` --references--> `LockoutService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/rate-limit/lockout.service.ts
- `Petals ERP – Build Progress` --references--> `generateScheduleSlots()`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/appointment/schedule-generator.helper.ts
- `Petals ERP – Build Progress` --references--> `VersionService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/clinical-history/version.service.ts
- `AuthTokens` --references--> `RoleKey`  [EXTRACTED]
  apps/api/src/auth/auth.service.ts → packages/types/src/index.ts

## Import Cycles
- None detected.

## Communities (169 total, 102 thin omitted)

### Community 1 - "auth.service.ts"
Cohesion: 0.18
Nodes (8): AuthTokens, TokenPayload, ChangePasswordDto, decryptSecret(), encryptSecret(), getEncryptionKey(), hashPassword(), verifyPassword()

### Community 2 - "4.1 Director"
Cohesion: 0.04
Nodes (44): 10. Release Phasing, 11. Assumptions, 12. Decisions and Remaining Open Questions, 13.1 Proposed Stack, 13.2 RBAC Implementation, 13.3 Authentication, 13.4 PWA Requirements, 13.5 Suggested Build Order (+36 more)

### Community 3 - "api/package.json"
Cohesion: 0.11
Nodes (17): @nestjs/platform-express@^11.0.9, qrcode@^1.5.4, rxjs@^7.8.1, swagger-ui-express@^5.0.1, @types/express@^5.0.0, @types/jest@^29.5.14, @types/node@^22.13.4, @types/node (+9 more)

### Community 4 - "CommunicationChannel"
Cohesion: 0.10
Nodes (8): CommunicationJobData, CommunicationLogQueryDto, RecordCallLogDto, SendBulkMessagesDto, CommunicationChannel, CALL, EMAIL, WHATSAPP

### Community 5 - "env"
Cohesion: 0.05
Nodes (36): COOKIE_SECRET, DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_URL (+28 more)

### Community 6 - "ReportType"
Cohesion: 0.08
Nodes (13): CreateReportDto, ReportQueryDto, UpdateReportDto, ReportStatus, DRAFT, REVIEWED, SHARED, SUBMITTED (+5 more)

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
Cohesion: 0.09
Nodes (21): AppModule, APPOINTMENTS, CLIENTS, COMMUNICATION, DASHBOARD, EMPLOYEE_SALARY, EMPLOYEES, FINANCIAL (+13 more)

### Community 13 - "dependencies"
Cohesion: 0.07
Nodes (28): dependencies, bullmq@^5.41.3, class-transformer@^0.5.1, class-validator@^0.14.1, cookie-parser@^1.4.7, dotenv@^16.4.7, helmet@^8.0.0, ioredis@^5.5.0 (+20 more)

### Community 14 - "package.json"
Cohesion: 0.11
Nodes (20): devDependencies, eslint@^9.39.5, prettier@^3.4.2, typescript@^5.7.3, typescript-eslint@^8.72.1, eslint, prettier, typescript (+12 more)

### Community 15 - "config/package.json"
Cohesion: 0.13
Nodes (20): devDependencies, eslint@^9.20.1, eslint-config-prettier@^10.0.1, eslint-plugin-prettier@^5.2.3, prettier@^3.4.2, typescript@^5.7.3, @typescript-eslint/eslint-plugin@^8.24.0, @typescript-eslint/parser@^8.24.0 (+12 more)

### Community 16 - "employee.service.ts"
Cohesion: 0.07
Nodes (6): CreateEmployeeDto, EmployeeQueryDto, UpdateEmployeeDto, EmployeeController, EMPLOYEE_SORT_FIELDS, EmployeeService

### Community 17 - "devDependencies"
Cohesion: 0.07
Nodes (27): devDependencies, jest@^29.7.0, @nestjs/cli@^11.0.2, @nestjs/schematics@^11.0.0, @nestjs/testing@^11.0.9, @petals/config@workspace:*, prisma@^6.3.1, supertest@^7.0.0 (+19 more)

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

### Community 29 - "communication.service.ts"
Cohesion: 0.21
Nodes (8): CommunicationModule, SENSITIVE_CLINICAL_KEYWORDS, EMAIL_PROVIDER, SendWhatsAppParams, SendWhatsAppResult, WHATSAPP_PROVIDER, WhatsAppProvider, FakeWhatsAppProvider

### Community 30 - "tsconfig.build.json"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

### Community 31 - "IRequestContext"
Cohesion: 0.15
Nodes (9): IRequestContext, RequestContextMiddleware, RequestContext, CurrentBranch, IS_PUBLIC_KEY, PERMISSION_KEY, PermissionRequirement, ROLES_KEY (+1 more)

### Community 33 - "CurrentUser"
Cohesion: 0.15
Nodes (3): CurrentUser, RequirePermission(), CommunicationController

### Community 34 - "CreateTreatmentPlanDto"
Cohesion: 0.10
Nodes (8): ASSESSMENT_SORT_FIELDS, ProgressEntryQueryDto, UpdateTreatmentPlanDto, PlanStatus, ACTIVE, CANCELLED, COMPLETED, PAUSED

### Community 35 - "@nestjs/core"
Cohesion: 0.18
Nodes (4): AccessModule, AuditModule, RolesGuard, @nestjs/core

### Community 36 - "Ponytail, lazy senior dev mode"
Cohesion: 0.50
Nodes (3): Before you write, Ponytail, lazy senior dev mode, The smallest complete change

### Community 37 - "audit.interceptor.ts"
Cohesion: 0.33
Nodes (4): AUDIT_ACTION_KEY, AUDIT_ENTITY_KEY, AUDIT_IGNORE_KEY, AUDIT_SENSITIVE_READ_KEY

### Community 38 - "PermissionScope"
Cohesion: 0.32
Nodes (6): ResolvedModulePermissions, ResolvedPermissionsMap, PermissionScope, ALL, ASSIGNED, OWN

### Community 39 - "app.module.ts"
Cohesion: 0.08
Nodes (13): AppController, AppService, AppointmentModule, BranchModule, ClientModule, ClinicalModule, CommonModule, DepartmentModule (+5 more)

### Community 71 - "Roles"
Cohesion: 0.15
Nodes (3): AuthController, Public(), ApiResponse

### Community 72 - "CreateSubgoalDto"
Cohesion: 0.10
Nodes (11): CreateSubgoalDto, UpdateSubgoalDto, GoalStatus, ACHIEVED, DISCONTINUED, IN_PROGRESS, NOT_STARTED, SubgoalFrequency (+3 more)

### Community 73 - "@nestjs/common"
Cohesion: 0.11
Nodes (8): RecordVersionParams, BRANCH_SCOPED_MODELS, FILTERABLE_READ_OPS, PrismaService, SCOPED_WRITE_OPS, LEAD_SORT_FIELDS, @nestjs/common, @prisma/client

### Community 76 - "LockoutService"
Cohesion: 0.19
Nodes (3): AuthService, generateRandomToken(), LockoutService

### Community 78 - "@nestjs/common"
Cohesion: 0.18
Nodes (8): NoStoreInterceptor, ClinicalHistoryModule, PermissionAction, CREATE, DELETE, UPDATE, VIEW, VIEW_ALL

### Community 80 - "access.e2e-spec.ts"
Cohesion: 0.25
Nodes (7): AppModule, GlobalExceptionFilter, QueryCounter, bootstrap(), cookie-parser, @nestjs/testing, supertest

### Community 81 - "clinical.service.ts"
Cohesion: 0.11
Nodes (17): DAY_MAP, GeneratedSlot, generateScheduleSlots(), ALL_PROFILE_TABS, CLIENT_SORT_FIELDS, TAB_MODULE_MAP, EXPENSE_SORT_FIELDS, INVOICE_SORT_FIELDS (+9 more)

### Community 82 - "src/index.ts"
Cohesion: 0.10
Nodes (12): LeadQueryDto, LeadStage, ASSESSMENT_SCHEDULED, CONTACTED, CONVERTED, LOST, NEW, PaginationMetaCursor (+4 more)

### Community 84 - "RoleKey"
Cohesion: 0.09
Nodes (8): UpdateClientDto, ClinicalService, LeadService, RoleKey, DIRECTOR, MANAGER, PARENT, THERAPIST

### Community 86 - "MessageStatus"
Cohesion: 0.17
Nodes (7): WebhookPayloadDto, MessageStatus, DELIVERED, FAILED, QUEUED, READ, SENT

### Community 87 - "CreateProgressEntryDto"
Cohesion: 0.09
Nodes (8): CreateProgressEntryDto, UpdateProgressEntryDto, ProgressLevel, ACHIEVED, EMERGING, NO_CHANGE, PROGRESSING, REGRESSED

### Community 88 - "otp.service.ts"
Cohesion: 0.16
Nodes (7): AuthModule, ConsoleOtpSender, IOtpSender, OTP_SENDER, OtpService, generateNumericOtp(), sha256()

### Community 89 - "Get"
Cohesion: 0.16
Nodes (5): AppointmentController, ClientController, FinanceController, LeadController, ReportController

### Community 90 - "CreateGoalDto"
Cohesion: 0.12
Nodes (5): CreateGoalDto, UpdateGoalDto, GoalTerm, LONG, SHORT

### Community 92 - "@nestjs/swagger"
Cohesion: 0.14
Nodes (3): class-transformer, class-validator, @nestjs/swagger

### Community 93 - "audit.service.ts"
Cohesion: 0.10
Nodes (4): AuditController, sanitizeAuditMetadata(), AuditService, AuditLogQueryDto

### Community 95 - "clinical.service.ts"
Cohesion: 0.10
Nodes (7): AuditSensitiveRead(), ClinicalHistoryController, VersionHistoryQueryDto, VersionService, Decisions Made, Open Items, Petals ERP – Build Progress

### Community 97 - "common/index.ts"
Cohesion: 0.07
Nodes (18): EnvironmentVariables, validate(), CursorPaginatedResponse, CursorPaginationMeta, OffsetPaginatedResponse, OffsetPaginationMeta, PrismaModule, LockoutResult (+10 more)

### Community 101 - "CreateInvoiceDto"
Cohesion: 0.08
Nodes (3): CreateInvoiceDto, ExpenseQueryDto, PnlQueryDto

### Community 106 - "export-finance.dto.ts"
Cohesion: 0.40
Nodes (5): ExportType, EXPENSES, INVOICES, PAYMENTS, PNL

### Community 107 - "employee.service.ts"
Cohesion: 0.21
Nodes (8): BRANCH_SORT_FIELDS, BranchQueryDto, buildCursorMeta(), buildCursorPagination(), buildOffsetMeta(), buildOffsetPagination(), buildOrderBy(), USER_SORT_FIELDS

### Community 112 - "CreateScheduleDto"
Cohesion: 0.15
Nodes (4): RestoreEntityDto, CursorPaginationDto, OffsetPaginationDto, DocumentUploadUrlDto

### Community 116 - "TemplateStatus"
Cohesion: 0.20
Nodes (6): TemplateQueryDto, TemplateStatus, APPROVED, DRAFT, PENDING_APPROVAL, REJECTED

### Community 119 - "InvoiceQueryDto"
Cohesion: 0.18
Nodes (5): InvoiceQueryDto, InvoiceStatus, ADVANCE, PAID, PENDING

### Community 121 - "ClientQueryDto"
Cohesion: 0.20
Nodes (5): ClientQueryDto, ClientStatus, ACTIVE, DISCHARGED, ON_HOLD

### Community 122 - "email-provider.interface.ts"
Cohesion: 0.39
Nodes (4): EmailProvider, SendEmailParams, SendEmailResult, FakeEmailProvider

### Community 125 - "RecordPaymentDto"
Cohesion: 0.17
Nodes (6): PaymentQueryDto, PaymentMethod, BANK_TRANSFER, CARD, CASH, UPI

### Community 126 - "StorageService"
Cohesion: 0.22
Nodes (3): ALLOWED_MIME_TYPES, StorageService, @nestjs/config

### Community 129 - "two-factor.dto.ts"
Cohesion: 0.50
Nodes (3): Disable2faDto, Enable2faDto, Verify2faLoginDto

### Community 132 - "ConvertLeadDto"
Cohesion: 0.12
Nodes (3): LoginDto, CreateGuardianDto, ConvertLeadDto

### Community 157 - "LeaveStatus"
Cohesion: 0.40
Nodes (5): LeaveStatus, APPROVED, CANCELLED, PENDING, REJECTED

### Community 162 - "ExportFormat"
Cohesion: 0.67
Nodes (3): ExportFormat, EXCEL, PDF

## Knowledge Gaps
- **104 isolated node(s):** `DIRECTOR`, `MANAGER`, `THERAPIST`, `PARENT`, `ACTIVE` (+99 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 916 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **102 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RoleKey` connect `RoleKey` to `RequirePermission`, `auth.service.ts`, `.findDailySchedule`, `ClientService`, `AppModule`, `employee.service.ts`, `PrismaService`, `communication.service.ts`, `IRequestContext`, `CurrentUser`, `CreateTreatmentPlanDto`, `@nestjs/core`, `PermissionScope`, `CommunicationService`, `ReportService`, `@nestjs/common`, `AuthGuard`, `@nestjs/common`, `access.e2e-spec.ts`, `clinical.service.ts`, `src/index.ts`, `IRequestContext`, `FinanceService`, `Get`, `audit.service.ts`, `auth.controller.ts`, `AccessService`, `employee.service.ts`, `AppointmentService`?**
  _High betweenness centrality (0.162) - this node is a cross-community bridge._
- **What connects `DIRECTOR`, `MANAGER`, `THERAPIST` to the rest of the system?**
  _104 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `4.1 Director` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/common` connect `@nestjs/common` to `auth.service.ts`, `api/package.json`, `AppModule`, `dependencies`, `employee.service.ts`, `PrismaService`, `communication.service.ts`, `IRequestContext`, `CreateTreatmentPlanDto`, `@nestjs/core`, `audit.interceptor.ts`, `PermissionScope`, `app.module.ts`, `AuthGuard`, `@nestjs/common`, `access.e2e-spec.ts`, `clinical.service.ts`, `otp.service.ts`, `audit.service.ts`, `common/index.ts`, `auth.controller.ts`, `employee.service.ts`, `email-provider.interface.ts`, `StorageService`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Should `api/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/swagger` connect `@nestjs/swagger` to `two-factor.dto.ts`, `api/package.json`, `ReportType`, `dependencies`, `employee.service.ts`, `PrismaService`, `IRequestContext`, `CreateTreatmentPlanDto`, `app.module.ts`, `CreateSubgoalDto`, `@nestjs/common`, `@nestjs/common`, `access.e2e-spec.ts`, `src/index.ts`, `CreateProgressEntryDto`, `CreateGoalDto`, `audit.service.ts`, `common/index.ts`, `auth.controller.ts`, `CreateScheduleDto`, `pagination/index.ts`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Should `CommunicationChannel` be split into smaller, more focused modules?**
  _Cohesion score 0.09782608695652174 - nodes in this community are weakly interconnected._