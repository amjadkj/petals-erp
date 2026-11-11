# Graph Report - petals-erp  (2026-11-11)

## Corpus Check
- 305 files · ~104,603 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .example 1, (none) 1, .toml 1)

## Summary
- 2180 nodes · 5543 edges · 188 communities (59 shown, 129 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 193 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8b36b649`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RequirePermission
- AuthService
- 4.1 Director
- api/package.json
- CommunicationChannel
- env
- pagination/index.ts
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
- PrismaService
- allowBuilds
- api/tsconfig.json
- types/tsconfig.json
- nest-cli.json
- seed.ts
- communication.service.ts
- tsconfig.build.json
- RequestContextStorage
- department.controller.ts
- Param
- CreateTreatmentPlanDto
- request-context.ts
- Ponytail, lazy senior dev mode
- audit.interceptor.ts
- IRequestContext
- client.module.ts
- CommunicationService
- app.controller.ts
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
- class-transformer
- IRequestContext
- RoleKey
- UpdateUserDto
- ReportService
- CreateTemplateDto
- otp.service.ts
- CurrentUser
- CreateGoalDto
- LeaveQueryDto
- class-validator
- AuditService
- CreateScheduleDto
- clinical.service.ts
- auth.service.ts
- common/index.ts
- CreateAssessmentDto
- CreateExpenseDto
- auth.controller.ts
- CommunicationQueueService
- UserController
- AccessService
- export-finance.dto.ts
- employee.service.ts
- DashboardService
- common.module.ts
- employee.service.ts
- RescheduleAppointmentDto
- OffsetPaginationDto
- UpdateRoleModulesDto
- DueReportQueryDto
- .createSchedule
- TemplateStatus
- EmployeeController
- AssessmentQueryDto
- InvoiceQueryDto
- CreateLeadDto
- ClientQueryDto
- email-provider.interface.ts
- BoardQueryDto
- AuditLogQueryDto
- RecordPaymentDto
- StorageService
- AppointmentQueryDto
- UpdateRolePermissionsDto
- two-factor.dto.ts
- CacheService
- CreateLeaveRequestDto
- UpdateEmployeeDto
- HolidayQueryDto
- CreateAppointmentDto
- MonthlyAttendanceQueryDto
- CreateInvoiceDto
- UpdateAppointmentStatusDto
- pagination/index.ts
- UserQueryDto
- CancelAppointmentDto
- CreateBranchDto
- CreateProgressEntryDto
- UpdateTreatmentPlanDto
- DailyScheduleQueryDto
- CreateHolidayDto
- CreateReportDto
- CreateUserDto
- OtpService
- @types/qrcode@^1.5.5
- UpdateAssessmentDto
- DueReportQueryDto
- RecordCallLogDto
- PnlQueryDto
- DailyAttendanceQueryDto
- LeaveType
- AuditInterceptor
- CheckInDto
- CheckOutDto
- DirectorAvailabilityDto
- EmployeeGoalsQueryDto
- ChangePasswordDto
- crypto.util.ts
- BranchQueryDto
- ts-node@^10.9.2
- PlanStatus
- CommunicationLogQueryDto
- UpdateTemplateDto
- appointment.module.ts
- finance.module.ts
- sanitizeAuditMetadata
- UserModule

## God Nodes (most connected - your core abstractions)
1. `RoleKey` - 223 edges
2. `@nestjs/common` - 122 edges
3. `CurrentUser` - 117 edges
4. `RequirePermission()` - 98 edges
5. `class-validator` - 83 edges
6. `@nestjs/swagger` - 80 edges
7. `IRequestContext` - 71 edges
8. `Roles()` - 63 edges
9. `AppModule` - 57 edges
10. `PrismaService` - 43 edges

## Surprising Connections (you probably didn't know these)
- `Petals ERP – Build Progress` --references--> `VersionService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/clinical-history/version.service.ts
- `Decisions Made` --references--> `LockoutService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/rate-limit/lockout.service.ts
- `Decisions Made` --references--> `CacheService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/redis/cache.service.ts
- `Petals ERP – Build Progress` --references--> `generateScheduleSlots()`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/appointment/schedule-generator.helper.ts
- `RolePermissionItemDto` --references--> `AppModule`  [EXTRACTED]
  apps/api/src/access/dto/update-role-permissions.dto.ts → packages/types/src/index.ts

## Import Cycles
- None detected.

## Communities (188 total, 129 thin omitted)

### Community 2 - "4.1 Director"
Cohesion: 0.04
Nodes (44): 10. Release Phasing, 11. Assumptions, 12. Decisions and Remaining Open Questions, 13.1 Proposed Stack, 13.2 RBAC Implementation, 13.3 Authentication, 13.4 PWA Requirements, 13.5 Suggested Build Order (+36 more)

### Community 3 - "api/package.json"
Cohesion: 0.11
Nodes (17): bullmq@^5.41.3, jsonwebtoken@^9.0.3, rxjs@^7.8.1, swagger-ui-express@^5.0.1, jest@^29.7.0, ts-jest@^29.2.5, @types/jsonwebtoken@^9.0.10, name (+9 more)

### Community 4 - "CommunicationChannel"
Cohesion: 0.10
Nodes (7): CommunicationJobData, SendBulkMessagesDto, SendMessageDto, CommunicationChannel, CALL, EMAIL, WHATSAPP

### Community 5 - "env"
Cohesion: 0.05
Nodes (36): COOKIE_SECRET, DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_URL (+28 more)

### Community 6 - "pagination/index.ts"
Cohesion: 0.16
Nodes (6): ReportQueryDto, ReportType, ASSESSMENT, DISCHARGE, OTHER, PROGRESS

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
Cohesion: 0.05
Nodes (6): LoginDto, ClientService, CreateClientDto, CreateGuardianDto, ConvertLeadDto, UpdateReportDto

### Community 12 - "AppModule"
Cohesion: 0.10
Nodes (21): AppModule, APPOINTMENTS, CLIENTS, COMMUNICATION, DASHBOARD, EMPLOYEE_SALARY, EMPLOYEES, FINANCIAL (+13 more)

### Community 13 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, class-transformer@^0.5.1, class-validator@^0.14.1, cookie-parser@^1.4.7, dotenv@^16.4.7, helmet@^8.0.0, ioredis@^5.5.0, @nestjs/common@^11.0.9 (+19 more)

### Community 14 - "package.json"
Cohesion: 0.11
Nodes (20): devDependencies, eslint@^9.39.5, prettier@^3.4.2, typescript@^5.7.3, typescript-eslint@^8.72.1, eslint, prettier, typescript (+12 more)

### Community 15 - "config/package.json"
Cohesion: 0.13
Nodes (20): devDependencies, eslint@^9.20.1, eslint-config-prettier@^10.0.1, eslint-plugin-prettier@^5.2.3, prettier@^3.4.2, typescript@^5.7.3, @typescript-eslint/eslint-plugin@^8.24.0, @typescript-eslint/parser@^8.24.0 (+12 more)

### Community 17 - "devDependencies"
Cohesion: 0.07
Nodes (27): devDependencies, @nestjs/cli@^11.0.2, @nestjs/schematics@^11.0.0, @nestjs/testing@^11.0.9, @petals/config@workspace:*, prisma@^6.3.1, supertest@^7.0.0, ts-loader@^9.5.2 (+19 more)

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
Cohesion: 0.13
Nodes (4): BranchController, BranchModule, BranchService, UpdateBranchDto

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
Cohesion: 0.12
Nodes (13): SENSITIVE_CLINICAL_KEYWORDS, WebhookPayloadDto, SendWhatsAppParams, SendWhatsAppResult, WHATSAPP_PROVIDER, WhatsAppProvider, FakeWhatsAppProvider, MessageStatus (+5 more)

### Community 30 - "tsconfig.build.json"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

### Community 32 - "department.controller.ts"
Cohesion: 0.15
Nodes (3): DepartmentController, DepartmentModule, DepartmentService

### Community 33 - "Param"
Cohesion: 0.13
Nodes (6): AppointmentController, ClientAppointmentQueryDto, ClientController, UpdateClientDto, DashboardController, ReportController

### Community 35 - "request-context.ts"
Cohesion: 0.09
Nodes (13): ResolvedModulePermissions, ResolvedPermissionsMap, AuditModule, RequestContextMiddleware, RequestContext, CurrentBranch, IS_PUBLIC_KEY, RolesGuard (+5 more)

### Community 36 - "Ponytail, lazy senior dev mode"
Cohesion: 0.50
Nodes (3): Before you write, Ponytail, lazy senior dev mode, The smallest complete change

### Community 37 - "audit.interceptor.ts"
Cohesion: 0.33
Nodes (4): AUDIT_ACTION_KEY, AUDIT_ENTITY_KEY, AUDIT_IGNORE_KEY, AUDIT_SENSITIVE_READ_KEY

### Community 39 - "client.module.ts"
Cohesion: 0.16
Nodes (6): AccessModule, ClientModule, ClinicalModule, ClinicalHistoryModule, LeadModule, ReportModule

### Community 71 - "Roles"
Cohesion: 0.16
Nodes (4): AuthController, Public(), Roles(), CommunicationController

### Community 72 - "CreateSubgoalDto"
Cohesion: 0.11
Nodes (6): CreateSubgoalDto, UpdateSubgoalDto, SubgoalFrequency, DAILY, MONTHLY, WEEKLY

### Community 78 - "@nestjs/common"
Cohesion: 0.13
Nodes (17): NoStoreInterceptor, PERMISSION_KEY, PermissionRequirement, ROLES_KEY, BRANCH_SCOPED_MODELS, FILTERABLE_READ_OPS, SCOPED_WRITE_OPS, LEAD_SORT_FIELDS (+9 more)

### Community 80 - "access.e2e-spec.ts"
Cohesion: 0.23
Nodes (11): AppModule, GlobalExceptionFilter, QueryCounter, bootstrap(), ClientStatus, ACTIVE, DISCHARGED, ON_HOLD (+3 more)

### Community 81 - "clinical.service.ts"
Cohesion: 0.07
Nodes (33): ALL_PROFILE_TABS, CLIENT_SORT_FIELDS, TAB_MODULE_MAP, ASSESSMENT_SORT_FIELDS, VersionHistoryQueryDto, RecordVersionParams, VersionService, EXPENSE_SORT_FIELDS (+25 more)

### Community 82 - "class-transformer"
Cohesion: 0.08
Nodes (9): LeadQueryDto, UpdateLeadDto, LeadStage, ASSESSMENT_SCHEDULED, CONTACTED, CONVERTED, LOST, NEW (+1 more)

### Community 84 - "RoleKey"
Cohesion: 0.07
Nodes (10): AuthTokens, ClinicalService, ProgressEntryQueryDto, CachedUserData, FinanceService, RoleKey, DIRECTOR, MANAGER (+2 more)

### Community 88 - "otp.service.ts"
Cohesion: 0.26
Nodes (5): AuthModule, ConsoleOtpSender, IOtpSender, OTP_SENDER, generateNumericOtp()

### Community 89 - "CurrentUser"
Cohesion: 0.11
Nodes (6): IRequestContext, CurrentUser, FinanceController, EmployeeActivityQueryDto, LeaveDecisionDto, HrController

### Community 90 - "CreateGoalDto"
Cohesion: 0.10
Nodes (10): CreateGoalDto, UpdateGoalDto, GoalStatus, ACHIEVED, DISCONTINUED, IN_PROGRESS, NOT_STARTED, GoalTerm (+2 more)

### Community 96 - "auth.service.ts"
Cohesion: 0.24
Nodes (6): TokenPayload, hashPassword(), sha256(), ALLOWED_MIME_TYPES, @nestjs/config, otplib

### Community 97 - "common/index.ts"
Cohesion: 0.07
Nodes (17): EnvironmentVariables, validate(), CursorPaginatedResponse, CursorPaginationMeta, OffsetPaginatedResponse, OffsetPaginationMeta, LockoutResult, MemoryLockEntry (+9 more)

### Community 106 - "export-finance.dto.ts"
Cohesion: 0.22
Nodes (8): ExportFormat, EXCEL, PDF, ExportType, EXPENSES, INVOICES, PAYMENTS, PNL

### Community 107 - "employee.service.ts"
Cohesion: 0.33
Nodes (7): BRANCH_SORT_FIELDS, buildCursorMeta(), buildCursorPagination(), buildOffsetMeta(), buildOffsetPagination(), buildOrderBy(), USER_SORT_FIELDS

### Community 109 - "common.module.ts"
Cohesion: 0.18
Nodes (4): CommonModule, PrismaModule, DashboardModule, HrModule

### Community 110 - "employee.service.ts"
Cohesion: 0.23
Nodes (4): EmployeeQueryDto, EmployeeModule, EMPLOYEE_SORT_FIELDS, EmployeeService

### Community 112 - "OffsetPaginationDto"
Cohesion: 0.12
Nodes (4): RestoreEntityDto, CursorPaginationDto, OffsetPaginationDto, DocumentUploadUrlDto

### Community 115 - ".createSchedule"
Cohesion: 0.25
Nodes (6): DAY_MAP, GeneratedSlot, generateScheduleSlots(), Decisions Made, Open Items, Petals ERP – Build Progress

### Community 116 - "TemplateStatus"
Cohesion: 0.20
Nodes (6): TemplateQueryDto, TemplateStatus, APPROVED, DRAFT, PENDING_APPROVAL, REJECTED

### Community 119 - "InvoiceQueryDto"
Cohesion: 0.14
Nodes (4): InvoiceQueryDto, RevenueCategory, ASSESSMENT_FEE, CLINICAL_THERAPY

### Community 122 - "email-provider.interface.ts"
Cohesion: 0.27
Nodes (6): CommunicationModule, EMAIL_PROVIDER, EmailProvider, SendEmailParams, SendEmailResult, FakeEmailProvider

### Community 125 - "RecordPaymentDto"
Cohesion: 0.09
Nodes (7): PaymentQueryDto, RecordPaymentDto, PaymentMethod, BANK_TRANSFER, CARD, CASH, UPI

### Community 129 - "two-factor.dto.ts"
Cohesion: 0.50
Nodes (3): Disable2faDto, Enable2faDto, Verify2faLoginDto

### Community 156 - "CreateProgressEntryDto"
Cohesion: 0.10
Nodes (8): CreateProgressEntryDto, UpdateProgressEntryDto, ProgressLevel, ACHIEVED, EMERGING, NO_CHANGE, PROGRESSING, REGRESSED

### Community 170 - "LeaveType"
Cohesion: 0.33
Nodes (6): LeaveType, CASUAL, OTHER, PAID, SICK, UNPAID

### Community 178 - "crypto.util.ts"
Cohesion: 0.43
Nodes (4): decryptSecret(), encryptSecret(), generateRandomToken(), getEncryptionKey()

### Community 181 - "PlanStatus"
Cohesion: 0.40
Nodes (5): PlanStatus, ACTIVE, CANCELLED, COMPLETED, PAUSED

## Knowledge Gaps
- **109 isolated node(s):** `EXCEL`, `PDF`, `EXPENSES`, `INVOICES`, `PAYMENTS` (+104 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 986 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **129 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RoleKey` connect `RoleKey` to `RequirePermission`, `.findDailySchedule`, `ClientService`, `LeadService`, `PrismaService`, `communication.service.ts`, `department.controller.ts`, `Param`, `CreateReportDto`, `request-context.ts`, `RecordCallLogDto`, `CommunicationLogQueryDto`, `CommunicationService`, `Roles`, `@nestjs/common`, `access.e2e-spec.ts`, `clinical.service.ts`, `IRequestContext`, `ReportService`, `CurrentUser`, `auth.service.ts`, `auth.controller.ts`, `AccessService`, `employee.service.ts`, `employee.service.ts`, `StorageService`?**
  _High betweenness centrality (0.136) - this node is a cross-community bridge._
- **What connects `EXCEL`, `PDF`, `EXPENSES` to the rest of the system?**
  _109 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `4.1 Director` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/common` connect `@nestjs/common` to `api/package.json`, `dependencies`, `PrismaService`, `communication.service.ts`, `department.controller.ts`, `request-context.ts`, `audit.interceptor.ts`, `client.module.ts`, `appointment.module.ts`, `finance.module.ts`, `app.controller.ts`, `access.e2e-spec.ts`, `clinical.service.ts`, `otp.service.ts`, `auth.service.ts`, `common/index.ts`, `auth.controller.ts`, `employee.service.ts`, `common.module.ts`, `employee.service.ts`, `email-provider.interface.ts`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Should `api/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/swagger` connect `class-validator` to `two-factor.dto.ts`, `api/package.json`, `pagination/index.ts`, `dependencies`, `pagination/index.ts`, `PrismaService`, `CreateBranchDto`, `department.controller.ts`, `request-context.ts`, `app.controller.ts`, `@nestjs/common`, `access.e2e-spec.ts`, `class-transformer`, `common/index.ts`, `auth.controller.ts`, `export-finance.dto.ts`, `employee.service.ts`, `OffsetPaginationDto`, `InvoiceQueryDto`, `ClientQueryDto`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Should `CommunicationChannel` be split into smaller, more focused modules?**
  _Cohesion score 0.09881422924901186 - nodes in this community are weakly interconnected._