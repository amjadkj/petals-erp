# Graph Report - petals-erp  (2026-11-11)

## Corpus Check
- 250 files · ~82,811 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .example 1, (none) 1, .toml 1)

## Summary
- 1809 nodes · 4305 edges · 139 communities (56 shown, 83 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 152 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `78209094`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RequirePermission
- auth.service.ts
- 4.1 Director
- CacheService
- ExportFormat
- env
- ReportType
- web/package.json
- redis
- AppointmentService
- compilerOptions
- @nestjs/common
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
- UpdateAppointmentStatusDto
- tsconfig.build.json
- src/index.ts
- department.controller.ts
- CurrentUser
- CreateTreatmentPlanDto
- AppointmentQueryDto
- Ponytail, lazy senior dev mode
- auth.controller.ts
- PermissionAction
- app.module.ts
- CreateClientDto
- ReportService
- Roles
- CreateSubgoalDto
- common.module.ts
- VerifyOtpDto
- LockoutService
- AuthGuard
- PermissionAction
- update-user-overrides.dto.ts
- access.e2e-spec.ts
- report.service.ts
- ClientService
- IRequestContext
- RoleKey
- Get
- CreateProgressEntryDto
- otp.service.ts
- OffsetPaginationDto
- CreateGoalDto
- access.module.ts
- @nestjs/swagger
- audit.service.ts
- CreateGoalDto
- clinical/dto/index.ts
- AssignBranchDto
- request-context.ts
- CreateAssessmentDto
- CreateExpenseDto
- CreateInvoiceDto
- CreateProgressEntryDto
- CreateUserDto
- AccessService
- export-finance.dto.ts
- CreateReportDto
- UpdateAssessmentDto
- CreateDocumentDto
- ClientQueryDto
- LeaveStatus
- UpdateSubgoalDto
- ExpenseQueryDto
- PnlQueryDto
- RequestContextStorage
- AssessmentQueryDto
- ExportFinanceDto
- DocumentQueryDto
- ClientStatus
- @petals/config@workspace:*
- @types/express@^5.0.0
- ClientAppointmentQueryDto
- @types/supertest@^6.0.2
- RecordPaymentDto
- CancelAppointmentDto
- DailyScheduleQueryDto

## God Nodes (most connected - your core abstractions)
1. `RoleKey` - 186 edges
2. `@nestjs/common` - 99 edges
3. `CurrentUser` - 87 edges
4. `RequirePermission()` - 79 edges
5. `@nestjs/swagger` - 66 edges
6. `class-validator` - 58 edges
7. `AppModule` - 54 edges
8. `PermissionAction` - 38 edges
9. `PrismaService` - 35 edges
10. `Roles()` - 30 edges

## Surprising Connections (you probably didn't know these)
- `Decisions Made` --references--> `CacheService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/redis/cache.service.ts
- `Petals ERP – Build Progress` --references--> `VersionService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/clinical-history/version.service.ts
- `Petals ERP – Build Progress` --references--> `generateScheduleSlots()`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/appointment/schedule-generator.helper.ts
- `Decisions Made` --references--> `LockoutService`  [INFERRED]
  docs/PROGRESS.md → apps/api/src/common/rate-limit/lockout.service.ts
- `AuthTokens` --references--> `RoleKey`  [EXTRACTED]
  apps/api/src/auth/auth.service.ts → packages/types/src/index.ts

## Import Cycles
- None detected.

## Communities (139 total, 83 thin omitted)

### Community 1 - "auth.service.ts"
Cohesion: 0.14
Nodes (11): AuthService, AuthTokens, TokenPayload, ChangePasswordDto, decryptSecret(), encryptSecret(), generateRandomToken(), getEncryptionKey() (+3 more)

### Community 2 - "4.1 Director"
Cohesion: 0.04
Nodes (44): 10. Release Phasing, 11. Assumptions, 12. Decisions and Remaining Open Questions, 13.1 Proposed Stack, 13.2 RBAC Implementation, 13.3 Authentication, 13.4 PWA Requirements, 13.5 Suggested Build Order (+36 more)

### Community 4 - "ExportFormat"
Cohesion: 0.67
Nodes (3): ExportFormat, EXCEL, PDF

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

### Community 9 - "AppointmentService"
Cohesion: 0.08
Nodes (6): AppointmentService, CreateAppointmentDto, CreateScheduleDto, DAY_MAP, GeneratedSlot, generateScheduleSlots()

### Community 10 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, alwaysStrict, declaration, declarationMap, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+16 more)

### Community 11 - "@nestjs/common"
Cohesion: 0.19
Nodes (6): ASSESSMENT_SORT_FIELDS, ClinicalHistoryModule, RecordVersionParams, VersionService, @nestjs/common, @prisma/client

### Community 12 - "AppModule"
Cohesion: 0.06
Nodes (25): RoleModuleItemDto, UpdateRoleModulesDto, RolePermissionItemDto, UpdateRolePermissionsDto, AppModule, APPOINTMENTS, CLIENTS, COMMUNICATION (+17 more)

### Community 13 - "dependencies"
Cohesion: 0.08
Nodes (26): dependencies, bullmq@^5.41.3, class-transformer@^0.5.1, class-validator@^0.14.1, cookie-parser@^1.4.7, dotenv@^16.4.7, helmet@^8.0.0, ioredis@^5.5.0 (+18 more)

### Community 14 - "package.json"
Cohesion: 0.11
Nodes (20): devDependencies, eslint@^9.39.5, prettier@^3.4.2, typescript@^5.7.3, typescript-eslint@^8.72.1, eslint, prettier, typescript (+12 more)

### Community 15 - "config/package.json"
Cohesion: 0.13
Nodes (20): devDependencies, eslint@^9.20.1, eslint-config-prettier@^10.0.1, eslint-plugin-prettier@^5.2.3, prettier@^3.4.2, typescript@^5.7.3, @typescript-eslint/eslint-plugin@^8.24.0, @typescript-eslint/parser@^8.24.0 (+12 more)

### Community 16 - "CreateEmployeeDto"
Cohesion: 0.06
Nodes (7): CreateEmployeeDto, EmployeeQueryDto, UpdateEmployeeDto, EmployeeController, EmployeeModule, EMPLOYEE_SORT_FIELDS, EmployeeService

### Community 17 - "devDependencies"
Cohesion: 0.08
Nodes (25): devDependencies, jest@^29.7.0, @nestjs/cli@^11.0.2, @nestjs/schematics@^11.0.0, @nestjs/testing@^11.0.9, prisma@^6.3.1, supertest@^7.0.0, ts-loader@^9.5.2 (+17 more)

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
Nodes (17): @nestjs/platform-express@^11.0.9, qrcode@^1.5.4, rate-limiter-flexible@^5.0.5, swagger-ui-express@^5.0.1, ts-jest@^29.2.5, ts-node@^10.9.2, @types/node@^22.13.4, @types/node (+9 more)

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

### Community 30 - "tsconfig.build.json"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

### Community 31 - "src/index.ts"
Cohesion: 0.13
Nodes (12): IRequestContext, RequestContextMiddleware, RequestContext, CurrentBranch, IS_PUBLIC_KEY, PERMISSION_KEY, PermissionRequirement, ROLES_KEY (+4 more)

### Community 32 - "department.controller.ts"
Cohesion: 0.15
Nodes (3): DepartmentController, DepartmentModule, DepartmentService

### Community 33 - "CurrentUser"
Cohesion: 0.17
Nodes (4): AppointmentController, ClientController, CurrentUser, ReportController

### Community 34 - "CreateTreatmentPlanDto"
Cohesion: 0.08
Nodes (7): CreateTreatmentPlanDto, UpdateTreatmentPlanDto, PlanStatus, ACTIVE, CANCELLED, COMPLETED, PAUSED

### Community 36 - "Ponytail, lazy senior dev mode"
Cohesion: 0.50
Nodes (3): Before you write, Ponytail, lazy senior dev mode, The smallest complete change

### Community 38 - "PermissionAction"
Cohesion: 0.17
Nodes (12): ResolvedModulePermissions, ResolvedPermissionsMap, PermissionAction, CREATE, DELETE, UPDATE, VIEW, VIEW_ALL (+4 more)

### Community 39 - "app.module.ts"
Cohesion: 0.09
Nodes (9): AppController, AppService, AppointmentModule, BranchModule, ClientModule, ClinicalModule, FinanceModule, UserModule (+1 more)

### Community 73 - "common.module.ts"
Cohesion: 0.11
Nodes (6): CommonModule, PrismaModule, ReportModule, ALLOWED_MIME_TYPES, StorageService, @nestjs/config

### Community 74 - "VerifyOtpDto"
Cohesion: 0.18
Nodes (5): RequestOtpDto, VerifyOtpDto, Disable2faDto, Enable2faDto, Verify2faLoginDto

### Community 76 - "LockoutService"
Cohesion: 0.13
Nodes (5): LoginDto, LockoutService, Decisions Made, Open Items, Petals ERP – Build Progress

### Community 80 - "access.e2e-spec.ts"
Cohesion: 0.11
Nodes (11): AppModule, GlobalExceptionFilter, BRANCH_SCOPED_MODELS, FILTERABLE_READ_OPS, PrismaService, SCOPED_WRITE_OPS, QueryCounter, bootstrap() (+3 more)

### Community 81 - "report.service.ts"
Cohesion: 0.13
Nodes (14): ALL_PROFILE_TABS, CLIENT_SORT_FIELDS, TAB_MODULE_MAP, EXPENSE_SORT_FIELDS, INVOICE_SORT_FIELDS, PAYMENT_SORT_FIELDS, DOCUMENT_SORT_FIELDS, DUE_REPORT_SORT_FIELDS (+6 more)

### Community 84 - "RoleKey"
Cohesion: 0.13
Nodes (7): UpdateClientDto, ClinicalService, RoleKey, DIRECTOR, MANAGER, PARENT, THERAPIST

### Community 87 - "CreateProgressEntryDto"
Cohesion: 0.15
Nodes (7): UpdateProgressEntryDto, ProgressLevel, ACHIEVED, EMERGING, NO_CHANGE, PROGRESSING, REGRESSED

### Community 88 - "otp.service.ts"
Cohesion: 0.15
Nodes (8): @nestjs/jwt@^11.0.2, AuthModule, ConsoleOtpSender, IOtpSender, OTP_SENDER, OtpService, generateNumericOtp(), @nestjs/jwt

### Community 89 - "OffsetPaginationDto"
Cohesion: 0.08
Nodes (6): BranchQueryDto, RestoreEntityDto, CursorPaginationDto, OffsetPaginationDto, DocumentUploadUrlDto, UserQueryDto

### Community 90 - "CreateGoalDto"
Cohesion: 0.15
Nodes (9): UpdateGoalDto, GoalStatus, ACHIEVED, DISCONTINUED, IN_PROGRESS, NOT_STARTED, GoalTerm, LONG (+1 more)

### Community 91 - "access.module.ts"
Cohesion: 0.20
Nodes (3): AccessModule, AuditModule, RolesGuard

### Community 92 - "@nestjs/swagger"
Cohesion: 0.15
Nodes (3): class-transformer, class-validator, @nestjs/swagger

### Community 93 - "audit.service.ts"
Cohesion: 0.05
Nodes (12): AuditController, AUDIT_ACTION_KEY, AUDIT_ENTITY_KEY, AUDIT_IGNORE_KEY, AUDIT_SENSITIVE_READ_KEY, AuditSensitiveRead(), AuditInterceptor, sanitizeAuditMetadata() (+4 more)

### Community 95 - "clinical/dto/index.ts"
Cohesion: 0.25
Nodes (4): SubgoalFrequency, DAILY, MONTHLY, WEEKLY

### Community 97 - "request-context.ts"
Cohesion: 0.06
Nodes (24): BRANCH_SORT_FIELDS, EnvironmentVariables, validate(), buildCursorMeta(), buildCursorPagination(), buildOffsetMeta(), buildOffsetPagination(), buildOrderBy() (+16 more)

### Community 102 - "CreateInvoiceDto"
Cohesion: 0.08
Nodes (9): CreateInvoiceDto, InvoiceQueryDto, InvoiceStatus, ADVANCE, PAID, PENDING, RevenueCategory, ASSESSMENT_FEE (+1 more)

### Community 104 - "CreateUserDto"
Cohesion: 0.07
Nodes (4): CreateUserDto, UpdateUserDto, UserController, UserService

### Community 106 - "export-finance.dto.ts"
Cohesion: 0.40
Nodes (5): ExportType, EXPENSES, INVOICES, PAYMENTS, PNL

### Community 111 - "LeaveStatus"
Cohesion: 0.40
Nodes (5): LeaveStatus, APPROVED, CANCELLED, PENDING, REJECTED

### Community 119 - "ClientStatus"
Cohesion: 0.50
Nodes (4): ClientStatus, ACTIVE, DISCHARGED, ON_HOLD

### Community 125 - "RecordPaymentDto"
Cohesion: 0.09
Nodes (7): PaymentQueryDto, RecordPaymentDto, PaymentMethod, BANK_TRANSFER, CARD, CASH, UPI

## Knowledge Gaps
- **87 isolated node(s):** `DIRECTOR`, `MANAGER`, `THERAPIST`, `PARENT`, `ACTIVE` (+82 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 827 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **83 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RoleKey` connect `RoleKey` to `RequirePermission`, `auth.service.ts`, `AppointmentService`, `@nestjs/common`, `CreateEmployeeDto`, `src/index.ts`, `department.controller.ts`, `CurrentUser`, `auth.controller.ts`, `PermissionAction`, `ReportService`, `CreateSubgoalDto`, `PermissionAction`, `access.e2e-spec.ts`, `report.service.ts`, `ClientService`, `IRequestContext`, `Get`, `audit.service.ts`, `CreateGoalDto`, `request-context.ts`, `AccessService`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **What connects `DIRECTOR`, `MANAGER`, `THERAPIST` to the rest of the system?**
  _87 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `auth.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13538461538461538 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/common` connect `@nestjs/common` to `department.controller.ts`, `auth.service.ts`, `request-context.ts`, `auth.controller.ts`, `PermissionAction`, `app.module.ts`, `common.module.ts`, `dependencies`, `PermissionAction`, `access.e2e-spec.ts`, `report.service.ts`, `CreateEmployeeDto`, `api/package.json`, `otp.service.ts`, `access.module.ts`, `audit.service.ts`, `src/index.ts`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Should `4.1 Director` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/swagger` connect `@nestjs/swagger` to `auth.service.ts`, `AppModule`, `dependencies`, `CreateEmployeeDto`, `api/package.json`, `PrismaService`, `src/index.ts`, `department.controller.ts`, `CreateTreatmentPlanDto`, `auth.controller.ts`, `app.module.ts`, `CreateClientDto`, `VerifyOtpDto`, `PermissionAction`, `update-user-overrides.dto.ts`, `access.e2e-spec.ts`, `CreateProgressEntryDto`, `OffsetPaginationDto`, `CreateGoalDto`, `audit.service.ts`, `clinical/dto/index.ts`, `request-context.ts`, `CreateInvoiceDto`, `RecordPaymentDto`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `env` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._