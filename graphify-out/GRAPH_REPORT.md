# Graph Report - petals-erp  (2026-11-11)

## Corpus Check
- 298 files · ~101,076 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .example 1, (none) 1, .toml 1)

## Summary
- 2156 nodes · 5420 edges · 181 communities (69 shown, 112 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 192 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6358556a`
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
- ReportController
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
- auth.guard.ts
- Ponytail, lazy senior dev mode
- audit.interceptor.ts
- IRequestContext
- app.module.ts
- CommunicationService
- Public
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
- WebhookPayloadDto
- src/index.ts
- otp.service.ts
- CurrentUser
- CreateGoalDto
- LeaveQueryDto
- class-validator
- audit.service.ts
- CreateScheduleDto
- clinical.service.ts
- auth.service.ts
- common/index.ts
- CreateAssessmentDto
- CreateInvoiceDto
- auth.controller.ts
- CommunicationQueueService
- user.service.ts
- AccessService
- export-finance.dto.ts
- employee.service.ts
- VersionService
- class-transformer
- EnvironmentVariables
- .invalidateDailyCache
- CreateScheduleDto
- UpdateRoleModulesDto
- DueReportQueryDto
- .createSchedule
- TemplateStatus
- RecordPaymentDto
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
- CreateGuardianDto
- HolidayQueryDto
- CreateAppointmentDto
- MonthlyAttendanceQueryDto
- CreateDocumentDto
- UpdateAppointmentStatusDto
- .findClientDocuments
- OffsetPaginationDto
- CancelAppointmentDto
- CreateBranchDto
- CreateProgressEntryDto
- TokenBucketGuard
- DailyScheduleQueryDto
- CreateHolidayDto
- CreateReportDto
- UpdateProgressEntryDto
- pagination-response.dto.ts
- @types/qrcode@^1.5.5
- SendBulkMessagesDto
- DueReportQueryDto
- LoginDto
- RedisModule
- DailyAttendanceQueryDto
- LeaveDecisionDto
- UpdateReportDto
- CheckInDto
- CheckOutDto
- DirectorAvailabilityDto
- EmployeeGoalsQueryDto
- ConvertLeadDto
- ReportStatus
- crypto.util.ts
- InvoiceStatus
- ts-node@^10.9.2

## God Nodes (most connected - your core abstractions)
1. `RoleKey` - 220 edges
2. `@nestjs/common` - 117 edges
3. `CurrentUser` - 116 edges
4. `RequirePermission()` - 97 edges
5. `class-validator` - 82 edges
6. `@nestjs/swagger` - 78 edges
7. `IRequestContext` - 63 edges
8. `Roles()` - 63 edges
9. `AppModule` - 56 edges
10. `PrismaService` - 43 edges

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

## Communities (181 total, 112 thin omitted)

### Community 1 - "AuthService"
Cohesion: 0.16
Nodes (4): AuthService, ChangePasswordDto, generateRandomToken(), verifyPassword()

### Community 2 - "4.1 Director"
Cohesion: 0.04
Nodes (44): 10. Release Phasing, 11. Assumptions, 12. Decisions and Remaining Open Questions, 13.1 Proposed Stack, 13.2 RBAC Implementation, 13.3 Authentication, 13.4 PWA Requirements, 13.5 Suggested Build Order (+36 more)

### Community 3 - "api/package.json"
Cohesion: 0.11
Nodes (17): bullmq@^5.41.3, jsonwebtoken@^9.0.3, rxjs@^7.8.1, swagger-ui-express@^5.0.1, jest@^29.7.0, ts-jest@^29.2.5, @types/jsonwebtoken@^9.0.10, name (+9 more)

### Community 4 - "CommunicationChannel"
Cohesion: 0.13
Nodes (7): CommunicationJobData, CommunicationLogQueryDto, SendMessageDto, CommunicationChannel, CALL, EMAIL, WHATSAPP

### Community 5 - "env"
Cohesion: 0.05
Nodes (36): COOKIE_SECRET, DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_URL (+28 more)

### Community 6 - "pagination/index.ts"
Cohesion: 0.11
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

### Community 11 - "ReportController"
Cohesion: 0.11
Nodes (5): AppointmentController, ClientController, ClientService, UpdateClientDto, ReportController

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

### Community 16 - "employee.service.ts"
Cohesion: 0.07
Nodes (4): CreateEmployeeDto, UpdateEmployeeDto, EmployeeController, EmployeeService

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
Cohesion: 0.12
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

### Community 29 - "communication.service.ts"
Cohesion: 0.15
Nodes (14): CommunicationModule, SENSITIVE_CLINICAL_KEYWORDS, EMAIL_PROVIDER, SendWhatsAppParams, SendWhatsAppResult, WHATSAPP_PROVIDER, WhatsAppProvider, FakeWhatsAppProvider (+6 more)

### Community 30 - "tsconfig.build.json"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

### Community 31 - "IRequestContext"
Cohesion: 0.15
Nodes (3): RequestContextMiddleware, RequestContext, RequestContextStorage

### Community 32 - "department.controller.ts"
Cohesion: 0.15
Nodes (3): DepartmentController, DepartmentModule, DepartmentService

### Community 33 - "CurrentUser"
Cohesion: 0.15
Nodes (4): RequirePermission(), Roles(), CommunicationController, LeadController

### Community 34 - "CreateTreatmentPlanDto"
Cohesion: 0.08
Nodes (7): CreateTreatmentPlanDto, UpdateTreatmentPlanDto, PlanStatus, ACTIVE, CANCELLED, COMPLETED, PAUSED

### Community 35 - "auth.guard.ts"
Cohesion: 0.10
Nodes (9): AccessModule, AuditModule, IS_PUBLIC_KEY, ROLES_KEY, CachedUserData, PermissionGuard, RolesGuard, EmployeeModule (+1 more)

### Community 36 - "Ponytail, lazy senior dev mode"
Cohesion: 0.50
Nodes (3): Before you write, Ponytail, lazy senior dev mode, The smallest complete change

### Community 37 - "audit.interceptor.ts"
Cohesion: 0.20
Nodes (5): AUDIT_ACTION_KEY, AUDIT_ENTITY_KEY, AUDIT_IGNORE_KEY, AUDIT_SENSITIVE_READ_KEY, AuditInterceptor

### Community 39 - "app.module.ts"
Cohesion: 0.08
Nodes (13): AppController, AppService, AppointmentModule, BranchModule, ClientModule, ClinicalModule, ClinicalHistoryModule, CommonModule (+5 more)

### Community 69 - "CommunicationService"
Cohesion: 0.15
Nodes (3): CommunicationService, CreateTemplateDto, UpdateTemplateDto

### Community 72 - "CreateSubgoalDto"
Cohesion: 0.10
Nodes (11): CreateSubgoalDto, UpdateSubgoalDto, GoalStatus, ACHIEVED, DISCONTINUED, IN_PROGRESS, NOT_STARTED, SubgoalFrequency (+3 more)

### Community 73 - "@nestjs/common"
Cohesion: 0.10
Nodes (6): BRANCH_SCOPED_MODELS, FILTERABLE_READ_OPS, PrismaService, SCOPED_WRITE_OPS, LEAD_SORT_FIELDS, @nestjs/common

### Community 78 - "@nestjs/common"
Cohesion: 0.19
Nodes (9): NoStoreInterceptor, PERMISSION_KEY, PermissionRequirement, PermissionAction, CREATE, DELETE, UPDATE, VIEW (+1 more)

### Community 80 - "access.e2e-spec.ts"
Cohesion: 0.22
Nodes (11): AppModule, GlobalExceptionFilter, QueryCounter, bootstrap(), ClientStatus, ACTIVE, DISCHARGED, ON_HOLD (+3 more)

### Community 81 - "clinical.service.ts"
Cohesion: 0.11
Nodes (22): ALL_PROFILE_TABS, CLIENT_SORT_FIELDS, TAB_MODULE_MAP, ASSESSMENT_SORT_FIELDS, RecordVersionParams, EXPENSE_SORT_FIELDS, INVOICE_SORT_FIELDS, PAYMENT_SORT_FIELDS (+14 more)

### Community 82 - "src/index.ts"
Cohesion: 0.15
Nodes (7): LeadQueryDto, LeadStage, ASSESSMENT_SCHEDULED, CONTACTED, CONVERTED, LOST, NEW

### Community 84 - "RoleKey"
Cohesion: 0.08
Nodes (9): ClinicalService, LeadService, ReportActivityQueryDto, ReportService, RoleKey, DIRECTOR, MANAGER, PARENT (+1 more)

### Community 87 - "src/index.ts"
Cohesion: 0.11
Nodes (8): PaginationMetaCursor, PaginationMetaOffset, ProgressLevel, ACHIEVED, EMERGING, NO_CHANGE, PROGRESSING, REGRESSED

### Community 88 - "otp.service.ts"
Cohesion: 0.16
Nodes (6): AuthModule, ConsoleOtpSender, IOtpSender, OTP_SENDER, OtpService, generateNumericOtp()

### Community 89 - "CurrentUser"
Cohesion: 0.18
Nodes (3): CurrentUser, FinanceController, HrController

### Community 90 - "CreateGoalDto"
Cohesion: 0.12
Nodes (5): CreateGoalDto, UpdateGoalDto, GoalTerm, LONG, SHORT

### Community 91 - "LeaveQueryDto"
Cohesion: 0.15
Nodes (7): LeaveQueryDto, LeaveType, CASUAL, OTHER, PAID, SICK, UNPAID

### Community 93 - "audit.service.ts"
Cohesion: 0.12
Nodes (9): ResolvedModulePermissions, ResolvedPermissionsMap, AuditController, sanitizeAuditMetadata(), AuditService, PermissionScope, ALL, ASSIGNED (+1 more)

### Community 95 - "clinical.service.ts"
Cohesion: 0.18
Nodes (3): AuditSensitiveRead(), ClinicalHistoryController, VersionHistoryQueryDto

### Community 96 - "auth.service.ts"
Cohesion: 0.24
Nodes (7): AuthTokens, TokenPayload, hashPassword(), sha256(), ALLOWED_MIME_TYPES, @nestjs/config, otplib

### Community 97 - "common/index.ts"
Cohesion: 0.20
Nodes (10): CurrentBranch, LockoutResult, MemoryLockEntry, RateLimitModule, Throttle(), THROTTLE_KEY, ThrottleOptions, MemoryCacheEntry (+2 more)

### Community 101 - "CreateInvoiceDto"
Cohesion: 0.04
Nodes (5): UpdateAssessmentDto, CreateExpenseDto, CreateInvoiceDto, ExpenseQueryDto, PnlQueryDto

### Community 104 - "user.service.ts"
Cohesion: 0.06
Nodes (7): AssignBranchDto, CreateUserDto, UpdateUserDto, UserController, UserModule, USER_SORT_FIELDS, UserService

### Community 106 - "export-finance.dto.ts"
Cohesion: 0.22
Nodes (8): ExportFormat, EXCEL, PDF, ExportType, EXPENSES, INVOICES, PAYMENTS, PNL

### Community 107 - "employee.service.ts"
Cohesion: 0.33
Nodes (7): BRANCH_SORT_FIELDS, buildCursorMeta(), buildCursorPagination(), buildOffsetMeta(), buildOffsetPagination(), buildOrderBy(), EMPLOYEE_SORT_FIELDS

### Community 112 - "CreateScheduleDto"
Cohesion: 0.15
Nodes (3): RestoreEntityDto, RecordCallLogDto, DocumentUploadUrlDto

### Community 115 - ".createSchedule"
Cohesion: 0.22
Nodes (6): DAY_MAP, GeneratedSlot, generateScheduleSlots(), Decisions Made, Open Items, Petals ERP – Build Progress

### Community 116 - "TemplateStatus"
Cohesion: 0.20
Nodes (6): TemplateQueryDto, TemplateStatus, APPROVED, DRAFT, PENDING_APPROVAL, REJECTED

### Community 119 - "InvoiceQueryDto"
Cohesion: 0.18
Nodes (4): InvoiceQueryDto, RevenueCategory, ASSESSMENT_FEE, CLINICAL_THERAPY

### Community 122 - "email-provider.interface.ts"
Cohesion: 0.39
Nodes (4): EmailProvider, SendEmailParams, SendEmailResult, FakeEmailProvider

### Community 125 - "RecordPaymentDto"
Cohesion: 0.12
Nodes (6): PaymentQueryDto, PaymentMethod, BANK_TRANSFER, CARD, CASH, UPI

### Community 129 - "two-factor.dto.ts"
Cohesion: 0.50
Nodes (3): Disable2faDto, Enable2faDto, Verify2faLoginDto

### Community 151 - "OffsetPaginationDto"
Cohesion: 0.11
Nodes (5): BranchQueryDto, CursorPaginationDto, OffsetPaginationDto, EmployeeQueryDto, UserQueryDto

### Community 163 - "pagination-response.dto.ts"
Cohesion: 0.38
Nodes (4): CursorPaginatedResponse, CursorPaginationMeta, OffsetPaginatedResponse, OffsetPaginationMeta

### Community 177 - "ReportStatus"
Cohesion: 0.40
Nodes (5): ReportStatus, DRAFT, REVIEWED, SHARED, SUBMITTED

### Community 178 - "crypto.util.ts"
Cohesion: 0.83
Nodes (3): decryptSecret(), encryptSecret(), getEncryptionKey()

### Community 179 - "InvoiceStatus"
Cohesion: 0.50
Nodes (4): InvoiceStatus, ADVANCE, PAID, PENDING

## Knowledge Gaps
- **109 isolated node(s):** `DIRECTOR`, `MANAGER`, `THERAPIST`, `PARENT`, `ACTIVE` (+104 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 981 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **112 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RoleKey` connect `RoleKey` to `RequirePermission`, `.findDailySchedule`, `ReportController`, `CancelAppointmentDto`, `communication.service.ts`, `IRequestContext`, `department.controller.ts`, `CurrentUser`, `auth.guard.ts`, `IRequestContext`, `CommunicationService`, `@nestjs/common`, `@nestjs/common`, `access.e2e-spec.ts`, `clinical.service.ts`, `IRequestContext`, `FinanceService`, `src/index.ts`, `CurrentUser`, `audit.service.ts`, `auth.service.ts`, `auth.controller.ts`, `user.service.ts`, `AccessService`, `employee.service.ts`, `.invalidateDailyCache`, `.createSchedule`, `StorageService`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **What connects `DIRECTOR`, `MANAGER`, `THERAPIST` to the rest of the system?**
  _109 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `4.1 Director` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/common` connect `@nestjs/common` to `api/package.json`, `dependencies`, `communication.service.ts`, `IRequestContext`, `department.controller.ts`, `auth.guard.ts`, `audit.interceptor.ts`, `app.module.ts`, `@nestjs/common`, `access.e2e-spec.ts`, `clinical.service.ts`, `otp.service.ts`, `audit.service.ts`, `auth.service.ts`, `common/index.ts`, `auth.controller.ts`, `user.service.ts`, `employee.service.ts`, `VersionService`, `email-provider.interface.ts`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Should `api/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/swagger` connect `class-validator` to `two-factor.dto.ts`, `api/package.json`, `pagination/index.ts`, `dependencies`, `OffsetPaginationDto`, `CreateBranchDto`, `IRequestContext`, `department.controller.ts`, `pagination-response.dto.ts`, `app.module.ts`, `CreateSubgoalDto`, `@nestjs/common`, `access.e2e-spec.ts`, `src/index.ts`, `CreateGoalDto`, `audit.service.ts`, `auth.controller.ts`, `export-finance.dto.ts`, `class-transformer`, `InvoiceQueryDto`, `RecordPaymentDto`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Should `CommunicationChannel` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._