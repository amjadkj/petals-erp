# Graph Report - petals-erp  (2026-11-12)

## Corpus Check
- 593 files · ~229,672 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: .example 2, (none) 2, .toml 1)

## Summary
- 3419 nodes · 9870 edges · 177 communities (111 shown, 66 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 243 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5f8df19b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RequirePermission
- AuthService
- 4.1 Director
- RequirePermission
- CommunicationChannel
- env
- report.service.spec.ts
- devDependencies
- redis
- ui/index.ts
- compilerOptions
- ClientService
- AppModule
- Button
- package.json
- config/package.json
- branch.controller.ts
- devDependencies
- compilerOptions
- scripts
- types/package.json
- Diagrams by area
- lead.controller.ts
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
- appointment.controller.ts
- clinical.service.ts
- src/index.ts
- Ponytail, lazy senior dev mode
- AuditLogQueryDto
- IRequestContext
- @nestjs/common
- store.ts
- Final Checklist: Petals ERP Backend
- CommunicationService
- audit.service.ts
- Roles
- RoleKey
- environment
- VerifyOtpDto
- common/index.ts
- LockoutService
- AuthGuard
- PermissionAction
- UpdateUserOverridesDto
- access.e2e-spec.ts
- seed.ts
- LeadsView.tsx
- AccessService
- RoleKey
- RecordPaymentDto
- ReportController
- react
- api/package.json
- Roles
- CreateGoalDto
- api
- class-validator
- postgres
- lucide-react
- clinical-history.controller.ts
- MessageStatus
- reports/page.tsx
- AppointmentsView.tsx
- CreateAssessmentDto
- usePageTitle
- CreateExpenseDto
- DocumentUploadUrlDto
- CommunicationQueueService
- FinancialView.tsx
- fetcher.ts
- export-finance.dto.ts
- clinical.service.ts
- DashboardService
- role-access/page.tsx
- migrator
- redis
- pagination/index.ts
- SendMessageDto
- dependencies
- .createSchedule
- communication/page.tsx
- employee.controller.ts
- 4. Components
- InvoiceQueryDto
- web/package.json
- App Shell: Sidebar and Header
- email-provider.interface.ts
- clinical.controller.ts
- Petals Child Development Centre ERP — Backend
- PaymentQueryDto
- sw.ts
- HolidayQueryDto
- 2. Deliverables Checklist
- two-factor.dto.ts
- PrismaService
- CreateLeaveRequestDto
- CreateEmployeeDto
- services
- healthcheck
- app.service.ts
- LoginDto
- CreateLeaveRequestDto
- manifest.json
- app/layout.tsx
- ChangePasswordDto
- build
- UpdateEmployeeDto
- hr.controller.ts
- CreateHolidayDto
- scripts
- MonthlyAttendanceQueryDto
- CreateInvoiceDto
- Page: Appointments
- Page: Dashboard
- Page: Financial (Payments)
- Petals ERP Frontend Progress Log
- SendBulkMessagesDto
- UserQueryDto
- DailyAttendanceQueryDto
- CreateProgressEntryDto
- @playwright/test
- Page: Client profile
- Page: Clients (list) and Add client modal
- Page: Communication
- ReportType
- CreateUserDto
- Page: HRMS (Attendance · Leave · Holiday calendar)
- Page: Leads
- Page: Login and auth screens
- Page: Reports
- communication.controller.ts
- Page: Schedule planning
- tailwind.config.ts
- Petals ERP Frontend — Build Plan & Specification
- Page: Employees (list and detail)
- Page: Role access (Permission Manager and Branches)
- Page: Audit log
- EmployeeQueryDto
- @testing-library/jest-dom
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `RoleKey` - 290 edges
2. `react` - 184 edges
3. `Button` - 157 edges
4. `CurrentUser` - 130 edges
5. `@nestjs/common` - 124 edges
6. `lucide-react` - 112 edges
7. `RequirePermission()` - 109 edges
8. `PrismaService` - 87 edges
9. `class-validator` - 83 edges
10. `AppModule` - 82 edges

## Surprising Connections (you probably didn't know these)
- `2. Add client (modal) (mockup)` --references--> `CreateClientDto`  [INFERRED]
  docs/frontend/design-clients.md → apps/api/src/client/dto/create-client.dto.ts
- `4. Architectural Rules Enforced` --references--> `usePermissions()`  [INFERRED]
  docs/frontend/BUILD_PLAN.md → apps/web/src/lib/permissions/usePermissions.ts
- `A. Project and Data Model` --references--> `RoleKey`  [INFERRED]
  docs/FINAL_REPORT.md → packages/types/src/index.ts
- `A. Project and data model` --references--> `RoleKey`  [INFERRED]
  docs/phases/final-checklist.md → packages/types/src/index.ts
- `How to read the diagrams` --references--> `AppointmentStatus`  [INFERRED]
  docs/er-diagram.md → packages/types/src/index.ts

## Import Cycles
- 3-file cycle: `apps/web/src/lib/api/access.ts -> apps/web/src/lib/api/fetcher.ts -> apps/web/src/lib/permissions/store.ts -> apps/web/src/lib/api/access.ts`

## Communities (177 total, 66 thin omitted)

### Community 2 - "4.1 Director"
Cohesion: 0.04
Nodes (44): 10. Release Phasing, 11. Assumptions, 12. Decisions and Remaining Open Questions, 13.1 Proposed Stack, 13.2 RBAC Implementation, 13.3 Authentication, 13.4 PWA Requirements, 13.5 Suggested Build Order (+36 more)

### Community 3 - "RequirePermission"
Cohesion: 0.08
Nodes (5): RequirePermission(), ExportFinanceDto, PnlQueryDto, FinanceController, FinanceService

### Community 4 - "CommunicationChannel"
Cohesion: 0.25
Nodes (6): CommunicationJobData, CommunicationLogQueryDto, CommunicationChannel, CALL, EMAIL, WHATSAPP

### Community 5 - "env"
Cohesion: 0.05
Nodes (38): COOKIE_SECRET, DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_URL (+30 more)

### Community 6 - "report.service.spec.ts"
Cohesion: 0.21
Nodes (5): @nestjs/config@^4.0.0, ReportModule, ALLOWED_MIME_TYPES, StorageService, @nestjs/config

### Community 7 - "devDependencies"
Cohesion: 0.10
Nodes (19): devDependencies, jsdom@^25.0.1, @petals/config@workspace:*, @testing-library/react@^16.1.0, @testing-library/user-event@^14.5.2, @types/node@^22.13.4, @types/react@^19.0.8, @types/react-dom@^19.0.3 (+11 more)

### Community 8 - "redis"
Cohesion: 0.07
Nodes (30): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_PASSWORD, interval, retries, test, timeout (+22 more)

### Community 9 - "ui/index.ts"
Cohesion: 0.04
Nodes (78): ClientProfilePage(), ClientsPage(), BadgeProps, BottomSheet(), BottomSheetProps, Checkbox, CheckboxProps, Drawer() (+70 more)

### Community 10 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, alwaysStrict, declaration, declarationMap, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+16 more)

### Community 11 - "ClientService"
Cohesion: 0.07
Nodes (7): ALL_PROFILE_TABS, CLIENT_SORT_FIELDS, TAB_MODULE_MAP, ClientQueryDto, CreateClientDto, CreateGuardianDto, UpdateClientDto

### Community 12 - "AppModule"
Cohesion: 0.08
Nodes (22): RolePermissionItemDto, AppModule, APPOINTMENTS, CLIENTS, COMMUNICATION, DASHBOARD, EMPLOYEE_SALARY, EMPLOYEES (+14 more)

### Community 13 - "Button"
Cohesion: 0.08
Nodes (70): HrmsPage(), OtpLoginPage(), LoginPage(), Button, ButtonProps, ButtonVariant, ConfirmDialog(), ConfirmDialogProps (+62 more)

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
Cohesion: 0.03
Nodes (81): dependencies, argon2@^0.41.1, bullmq@^5.41.3, class-transformer@^0.5.1, class-validator@^0.14.1, cookie-parser@^1.4.7, dotenv@^16.4.7, helmet@^8.0.0 (+73 more)

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

### Community 22 - "lead.controller.ts"
Cohesion: 0.06
Nodes (5): ConvertLeadDto, CreateLeadDto, UpdateLeadDto, LeadController, LeadService

### Community 23 - "2. Checklist Evaluation & Verification Evidence"
Cohesion: 0.10
Nodes (20): 1. Executive Summary, 1. Running the Full Test Suite, 2. Checklist Evaluation & Verification Evidence, 2. Database Migrations & Seeding, 3. Open Decisions & Assumptions, 3. Starting the API Application, 4. Known Limitations, 5. Operations & Execution Guide (+12 more)

### Community 24 - "allowBuilds"
Cohesion: 0.20
Nodes (9): allowBuilds, argon2, esbuild, msgpackr-extract, prisma, @prisma/client, @prisma/engines, @scarf/scarf (+1 more)

### Community 25 - "api/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, baseUrl, outDir, paths, extends, include, @petals/config/tsconfig.base.json

### Community 26 - "types/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, outDir, rootDir, extends, include, @petals/config/tsconfig.base.json

### Community 27 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 28 - "CommunicationController"
Cohesion: 0.11
Nodes (3): Roles(), CommunicationController, BoardQueryDto

### Community 29 - "communication-queue.service.ts"
Cohesion: 0.15
Nodes (14): CommunicationModule, SENSITIVE_CLINICAL_KEYWORDS, EMAIL_PROVIDER, SendWhatsAppParams, SendWhatsAppResult, WHATSAPP_PROVIDER, WhatsAppProvider, FakeWhatsAppProvider (+6 more)

### Community 30 - "tsconfig.build.json"
Cohesion: 0.29
Nodes (6): compilerOptions, declarationMap, sourceMap, exclude, extends, ./tsconfig.json

### Community 32 - "department.controller.ts"
Cohesion: 0.15
Nodes (3): DepartmentController, DepartmentModule, DepartmentService

### Community 33 - "appointment.controller.ts"
Cohesion: 0.05
Nodes (10): AppointmentController, AppointmentService, AppointmentQueryDto, CancelAppointmentDto, ClientAppointmentQueryDto, CreateAppointmentDto, CreateScheduleDto, DailyScheduleQueryDto (+2 more)

### Community 34 - "clinical.service.ts"
Cohesion: 0.08
Nodes (7): CreateTreatmentPlanDto, UpdateTreatmentPlanDto, PlanStatus, ACTIVE, CANCELLED, COMPLETED, PAUSED

### Community 35 - "src/index.ts"
Cohesion: 0.09
Nodes (19): ResolvedModulePermissions, ResolvedPermissionsMap, RequestContext, CurrentBranch, IS_PUBLIC_KEY, PERMISSION_KEY, PermissionRequirement, ROLES_KEY (+11 more)

### Community 36 - "Ponytail, lazy senior dev mode"
Cohesion: 0.50
Nodes (3): Before you write, Ponytail, lazy senior dev mode, The smallest complete change

### Community 39 - "@nestjs/common"
Cohesion: 0.08
Nodes (15): @prisma/client@^6.3.1, BRANCH_SCOPED_MODELS, FILTERABLE_READ_OPS, inTxStorage, SCOPED_WRITE_OPS, DashboardModule, EmployeeModule, EMPLOYEE_SORT_FIELDS (+7 more)

### Community 41 - "store.ts"
Cohesion: 0.09
Nodes (31): AppLayout(), BranchSwitcher(), GlobalSearch(), SearchResultItem, Header(), InactivityLock(), InstallBanner(), MobileDrawer() (+23 more)

### Community 66 - "Final Checklist: Petals ERP Backend"
Cohesion: 0.12
Nodes (15): A. Project and data model, C. Access control, D. Parents, E. Branch isolation and row-level security, F. Clinical data integrity, Final Checklist: Petals ERP Backend, G. Business rules, H. Pagination and N+1 (+7 more)

### Community 70 - "audit.service.ts"
Cohesion: 0.07
Nodes (12): AccessModule, AuditController, AUDIT_ACTION_KEY, AUDIT_ENTITY_KEY, AUDIT_IGNORE_KEY, AUDIT_SENSITIVE_READ_KEY, AuditModule, AuditService (+4 more)

### Community 71 - "Roles"
Cohesion: 0.14
Nodes (3): AuthController, verifyPassword(), Public()

### Community 73 - "environment"
Cohesion: 0.18
Nodes (11): environment, APP_CORS_ORIGIN, COOKIE_SECRET, DOCUMENT_HMAC_SECRET, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, NODE_ENV, PORT (+3 more)

### Community 75 - "common/index.ts"
Cohesion: 0.06
Nodes (17): CommonModule, EnvironmentVariables, validate(), RequestContextMiddleware, PrismaModule, LockoutResult, MemoryLockEntry, RateLimitModule (+9 more)

### Community 78 - "PermissionAction"
Cohesion: 0.17
Nodes (23): PermissionMatrixAccordions(), PermissionMatrixAccordionsProps, PermissionMatrixTable(), PermissionMatrixTableProps, PermissionsTab(), RoleAccessHeroProps, RoleCardsPanel(), RoleCardsPanelProps (+15 more)

### Community 80 - "access.e2e-spec.ts"
Cohesion: 0.19
Nodes (13): AppModule, hashPassword(), GlobalExceptionFilter, QueryCounter, bootstrap(), runLoadTests(), ClientStatus, ACTIVE (+5 more)

### Community 81 - "seed.ts"
Cohesion: 0.29
Nodes (7): ALL_ACTIONS, ALL_MODULES, hashPassword(), main(), prisma, ROLE_PERMISSIONS_CONFIG, RoleSeedConfig

### Community 82 - "LeadsView.tsx"
Cohesion: 0.07
Nodes (38): LeadsPage(), SegmentedControl(), SegmentedControlOption, SegmentedControlProps, mockColumns, mockData, TestRow, ConvertToClientModalProps (+30 more)

### Community 83 - "AccessService"
Cohesion: 0.07
Nodes (7): AccessController, AccessService, RoleModuleItemDto, UpdateRoleModulesDto, UpdateRolePermissionsDto, AuditInterceptor, sanitizeAuditMetadata()

### Community 84 - "RoleKey"
Cohesion: 0.12
Nodes (10): AuthTokens, ClinicalService, CachedUserData, DocumentsTabProps, DashboardStatsProps, RoleKey, DIRECTOR, MANAGER (+2 more)

### Community 86 - "ReportController"
Cohesion: 0.09
Nodes (3): CreateDocumentDto, ReportController, ReportService

### Community 87 - "react"
Cohesion: 0.06
Nodes (58): EmployeeDetailPage(), EmployeesPage(), Avatar(), AvatarProps, Column, DataTable(), DataTableProps, ProgressBar() (+50 more)

### Community 88 - "api/package.json"
Cohesion: 0.12
Nodes (14): @nestjs/jwt@^11.0.2, COOKIE_OPTIONS, TokenPayload, ConsoleOtpSender, IOtpSender, OTP_SENDER, OtpService, decryptSecret() (+6 more)

### Community 90 - "CreateGoalDto"
Cohesion: 0.06
Nodes (16): CreateGoalDto, CreateSubgoalDto, UpdateGoalDto, UpdateSubgoalDto, GoalStatus, ACHIEVED, DISCONTINUED, IN_PROGRESS (+8 more)

### Community 91 - "api"
Cohesion: 0.20
Nodes (10): container_name, depends_on, networks, ports, restart, migrator, redis, condition (+2 more)

### Community 92 - "class-validator"
Cohesion: 0.08
Nodes (11): ExportFormat, EXCEL, PDF, PaymentMethod, BANK_TRANSFER, CARD, CASH, UPI (+3 more)

### Community 93 - "postgres"
Cohesion: 0.20
Nodes (10): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, container_name, environment, image, networks, restart (+2 more)

### Community 94 - "lucide-react"
Cohesion: 0.05
Nodes (58): DashboardPage(), AuditLogPage(), TwoFactorPage(), NotFound(), BeforeInstallPromptEvent, Switch(), AuditLogDetailDrawer(), AuditLogDetailDrawerProps (+50 more)

### Community 95 - "clinical-history.controller.ts"
Cohesion: 0.08
Nodes (4): AuditSensitiveRead(), ClinicalHistoryController, RestoreEntityDto, VersionService

### Community 97 - "reports/page.tsx"
Cohesion: 0.09
Nodes (34): ReportDetailPage(), ReportsPage(), ReportsTab(), ReportsTabProps, defaultFallbackReport, ReportEditor(), ReportEditorProps, ReportsFilterBar() (+26 more)

### Community 98 - "AppointmentsView.tsx"
Cohesion: 0.11
Nodes (31): AppointmentsPage(), AppointmentsHero(), AppointmentsHeroProps, AppointmentsToolbar(), AppointmentsToolbarProps, AppointmentsView(), CalendarSurface(), CalendarSurfaceProps (+23 more)

### Community 100 - "usePageTitle"
Cohesion: 0.08
Nodes (30): ForbiddenPage(), FinancialPage(), SchedulePlanningPage(), ToastProvider(), DAYS, NewScheduleModalProps, TIME_SLOTS, SchedulePlanningHero() (+22 more)

### Community 104 - "FinancialView.tsx"
Cohesion: 0.11
Nodes (32): ExpensesTabProps, FinancialView(), mockTrackingData, MonthlyTrackingTab(), MonthlyTrackingTabProps, OverdueReminders(), OverdueRemindersProps, PaymentHero() (+24 more)

### Community 105 - "fetcher.ts"
Cohesion: 0.12
Nodes (19): AuditLogFilterBarProps, AuditLogFilterState, RecordPaymentModalProps, PermissionsTabProps, UserOverridesPanelProps, LoginResult, EmployeeDto, ApiError (+11 more)

### Community 106 - "export-finance.dto.ts"
Cohesion: 0.40
Nodes (5): ExportType, EXPENSES, INVOICES, PAYMENTS, PNL

### Community 107 - "clinical.service.ts"
Cohesion: 0.14
Nodes (12): ASSESSMENT_SORT_FIELDS, VersionHistoryQueryDto, RecordVersionParams, buildCursorMeta(), buildCursorPagination(), buildOffsetMeta(), buildOffsetPagination(), buildOrderBy() (+4 more)

### Community 108 - "DashboardService"
Cohesion: 0.14
Nodes (3): DashboardController, DashboardService, DashboardQueryDto

### Community 109 - "role-access/page.tsx"
Cohesion: 0.22
Nodes (16): RoleAccessPage(), AssignUsersModal(), AssignUsersModalProps, BranchCard(), BranchCardProps, BranchesTab(), BranchesTabProps, CreateEditBranchModalProps (+8 more)

### Community 110 - "migrator"
Cohesion: 0.22
Nodes (9): postgres, DATABASE_URL, command, container_name, depends_on, environment, networks, condition (+1 more)

### Community 111 - "redis"
Cohesion: 0.22
Nodes (9): REDIS_PASSWORD, command, container_name, environment, image, networks, restart, volumes (+1 more)

### Community 112 - "pagination/index.ts"
Cohesion: 0.07
Nodes (12): AssessmentQueryDto, ProgressEntryQueryDto, CursorPaginationDto, OffsetPaginationDto, CursorPaginatedResponse, CursorPaginationMeta, OffsetPaginatedResponse, OffsetPaginationMeta (+4 more)

### Community 114 - "dependencies"
Cohesion: 0.10
Nodes (20): dependencies, clsx@^2.1.1, date-fns@^4.1.0, @hookform/resolvers@^3.9.1, lucide-react@^0.469.0, next@^15.1.7, @petals/types@workspace:*, react@^19.0.0 (+12 more)

### Community 115 - ".createSchedule"
Cohesion: 0.25
Nodes (6): DAY_MAP, GeneratedSlot, generateScheduleSlots(), Decisions Made, Open Items, Petals ERP – Build Progress

### Community 116 - "communication/page.tsx"
Cohesion: 0.13
Nodes (29): CommunicationPage(), EmptyState(), BulkSendTab(), BulkSendTabProps, CommunicationHero(), CommunicationStatCards(), MessageDetailDrawer(), MessageDetailDrawerProps (+21 more)

### Community 118 - "4. Components"
Cohesion: 0.10
Nodes (19): 1. Principles, 2. Colour tokens, 3. Typography, 4. Components, 5. Layout and breakpoints, 6. Mobile patterns (apply to every page), 7. PWA rules, 8. Accessibility (+11 more)

### Community 119 - "InvoiceQueryDto"
Cohesion: 0.20
Nodes (4): InvoiceQueryDto, RevenueCategory, ASSESSMENT_FEE, CLINICAL_THERAPY

### Community 120 - "web/package.json"
Cohesion: 0.12
Nodes (15): autoprefixer@^10.4.20, date-fns-tz@^3.2.0, postcss@^8.4.49, recharts@^2.14.1, @tanstack/react-query-devtools@^5.62.3, zustand@^5.0.2, name, private (+7 more)

### Community 121 - "App Shell: Sidebar and Header"
Cohesion: 0.17
Nodes (11): 1. Structure, 2. Sidebar (sticky, collapsible), 3. Header (on every page), 4. Mobile shell (< 768 px), 5. Page content wrapper, 6. Global behaviours, App Shell: Sidebar and Header, Collapsed (icon rail, 72 px) (+3 more)

### Community 122 - "email-provider.interface.ts"
Cohesion: 0.39
Nodes (4): EmailProvider, SendEmailParams, SendEmailResult, FakeEmailProvider

### Community 123 - "clinical.controller.ts"
Cohesion: 0.11
Nodes (5): ClientModule, NoStoreInterceptor, ClinicalModule, UpdateAssessmentDto, ClinicalHistoryModule

### Community 124 - "Petals Child Development Centre ERP — Backend"
Cohesion: 0.07
Nodes (28): 1. Objectives & SLA Targets, 2. Automated PostgreSQL Backup Procedure, 3. Redis Persistence & Backup, 4. Step-by-Step Restoration Checklist, Database Backup & Disaster Recovery Guide, Phase A: Pre-Restoration Sanity Checks, Phase B: Database Restore Execution, Phase C: Post-Restoration Verification Queries (+20 more)

### Community 126 - "sw.ts"
Cohesion: 0.18
Nodes (9): nextConfig, withSerwist, serwist@^9.0.9, @serwist/next@^9.0.9, customRuntimeCaching, serwist, WorkerGlobalScope, serwist (+1 more)

### Community 128 - "2. Deliverables Checklist"
Cohesion: 0.20
Nodes (9): 1. Executive Summary, 2. Deliverables Checklist, 3. Route Output Matrix, 4. Known Limitations & Recommendations, Petals ERP Frontend — Final Verification Report, Phase A: Foundations, App Shell, Auth & PWA ✅, Phase B: Core Pages Implementation ✅, Phase C: PWA Hardening & Security ✅ (+1 more)

### Community 129 - "two-factor.dto.ts"
Cohesion: 0.50
Nodes (3): Disable2faDto, Enable2faDto, Verify2faLoginDto

### Community 130 - "PrismaService"
Cohesion: 0.05
Nodes (17): AppointmentModule, PrismaService, CacheService, FinanceModule, EXPENSE_SORT_FIELDS, INVOICE_SORT_FIELDS, PAYMENT_SORT_FIELDS, AppointmentStatus (+9 more)

### Community 131 - "CreateLeaveRequestDto"
Cohesion: 0.14
Nodes (8): LeaveQueryDto, ApplyLeaveModalProps, LeaveType, CASUAL, OTHER, PAID, SICK, UNPAID

### Community 133 - "services"
Cohesion: 0.25
Nodes (7): networks, petals-internal, driver, services, volumes, postgres_prod_data, redis_prod_data

### Community 134 - "healthcheck"
Cohesion: 0.46
Nodes (8): healthcheck, interval, retries, start_period, test, timeout, healthcheck, healthcheck

### Community 138 - "manifest.json"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 139 - "app/layout.tsx"
Cohesion: 0.25
Nodes (7): inter, metadata, quicksand, RootLayout(), viewport, Providers(), PageTitleProvider()

### Community 142 - "build"
Cohesion: 0.50
Nodes (5): build, context, dockerfile, target, build

### Community 144 - "hr.controller.ts"
Cohesion: 0.11
Nodes (4): CheckInDto, CheckOutDto, DirectorAvailabilityDto, LeaveDecisionDto

### Community 146 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, start, test, test:e2e, test:watch

### Community 149 - "Page: Appointments"
Cohesion: 0.25
Nodes (7): 1. Layout (desktop), 2. Session interactions, 3. New appointment (modal), 4. Views, 5. Mobile, 6. States, Page: Appointments

### Community 150 - "Page: Dashboard"
Cohesion: 0.25
Nodes (7): 1. Director (mockup), 2. Manager variant (derived), 3. Therapist variant (derived), 4. Parent variant (derived), 5. Responsive, 6. States, Page: Dashboard

### Community 151 - "Page: Financial (Payments)"
Cohesion: 0.25
Nodes (7): 1. Payments view (mockup), 2. Record payment (modal), 3. Additional tabs (derived), 4. Role behaviour, 5. Mobile, 6. Notes, Page: Financial (Payments)

### Community 152 - "Petals ERP Frontend Progress Log"
Cohesion: 0.25
Nodes (7): 1. What was built:, 1. What was built:, 2. Test & Verification Status:, 2. Test & Verification Status:, Petals ERP Frontend Progress Log, Phase A: Foundation, Shell, Auth, Shared UI & PWA Setup, Phase B: Core Pages Implementation (13 ERP Modules)

### Community 156 - "CreateProgressEntryDto"
Cohesion: 0.09
Nodes (8): CreateProgressEntryDto, UpdateProgressEntryDto, ProgressLevel, ACHIEVED, EMERGING, NO_CHANGE, PROGRESSING, REGRESSED

### Community 158 - "Page: Client profile"
Cohesion: 0.29
Nodes (6): 1. Header card, 2. Tabs (permission driven), 3. Shared cases, 4. Parent view, 5. Mobile, Page: Client profile

### Community 159 - "Page: Clients (list) and Add client modal"
Cohesion: 0.29
Nodes (6): 1. Layout (desktop), 2. Add client (modal) (mockup), 3. Role behaviour, 4. Mobile, 5. States, Page: Clients (list) and Add client modal

### Community 160 - "Page: Communication"
Cohesion: 0.29
Nodes (6): 1. Layout, 2. Tabs, 3. New message (modal), 4. Rules to reflect in UI, 5. Mobile, Page: Communication

### Community 161 - "ReportType"
Cohesion: 0.06
Nodes (9): CreateReportDto, DueReportQueryDto, ReportQueryDto, UpdateReportDto, ReportType, ASSESSMENT, DISCHARGE, OTHER (+1 more)

### Community 162 - "CreateUserDto"
Cohesion: 0.06
Nodes (5): AssignBranchDto, CreateUserDto, UpdateUserDto, UserController, UserService

### Community 163 - "Page: HRMS (Attendance · Leave · Holiday calendar)"
Cohesion: 0.29
Nodes (6): 1. Common header, 2. Attendance tab (mockup), 3. Leave tab (mockup), 4. Holiday calendar tab, 5. Mobile, Page: HRMS (Attendance · Leave · Holiday calendar)

### Community 164 - "Page: Leads"
Cohesion: 0.29
Nodes (6): 1. Layout (desktop), 2. Board view, 3. Modals, 4. List view, 5. Mobile, Page: Leads

### Community 165 - "Page: Login and auth screens"
Cohesion: 0.29
Nodes (6): 1. Staff login (`/login`), 2. 2FA (`/login/2fa`), 3. Parent OTP (`/login/otp`), 4. Session behaviour, 5. Mobile, Page: Login and auth screens

### Community 166 - "Page: Reports"
Cohesion: 0.29
Nodes (6): 1. Layout (Director / Manager), 2. Therapist view, 3. Report page, 4. Parent view, 5. Mobile, Page: Reports

### Community 167 - "communication.controller.ts"
Cohesion: 0.09
Nodes (4): CreateTemplateDto, RecordCallLogDto, TemplateQueryDto, UpdateTemplateDto

### Community 168 - "Page: Schedule planning"
Cohesion: 0.29
Nodes (6): 1. Layout, 2. Main surfaces (tabs), 3. New schedule (modal, 2 steps on phones), 4. Rules, 5. Mobile, Page: Schedule planning

### Community 169 - "tailwind.config.ts"
Cohesion: 0.33
Nodes (5): tailwindcss@^3.4.17, @tailwindcss/forms@^0.5.9, config, tailwindcss, @tailwindcss/forms

### Community 170 - "Petals ERP Frontend — Build Plan & Specification"
Cohesion: 0.33
Nodes (5): 1. Route Map, 2. Shared Component Registry (`apps/web/src/components/ui/`), 3. API-to-Page Mapping, 4. Architectural Rules Enforced, Petals ERP Frontend — Build Plan & Specification

### Community 171 - "Page: Employees (list and detail)"
Cohesion: 0.33
Nodes (5): 1. List (mockup), 2. Add employee (modal), 3. Detail page (mockup), 4. Mobile, Page: Employees (list and detail)

### Community 172 - "Page: Role access (Permission Manager and Branches)"
Cohesion: 0.33
Nodes (5): 1. Shared header, 2. Permissions tab (mockup), 3. Branches tab (mockup), 4. Mobile, Page: Role access (Permission Manager and Branches)

### Community 173 - "Page: Audit log"
Cohesion: 0.40
Nodes (4): 1. Layout, 2. Version history (inside clinical pages), 3. Mobile, Page: Audit log

## Knowledge Gaps
- **109 isolated node(s):** `INVOICES`, `PAYMENTS`, `EXPENSES`, `PNL`, `EXCEL` (+104 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1437 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **66 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RoleKey` connect `RoleKey` to `RequirePermission`, `PrismaService`, `RequirePermission`, `report.service.spec.ts`, `ui/index.ts`, `ClientService`, `Button`, `branch.controller.ts`, `hr.controller.ts`, `lead.controller.ts`, `2. Checklist Evaluation & Verification Evidence`, `CommunicationController`, `communication-queue.service.ts`, `department.controller.ts`, `appointment.controller.ts`, `ReportType`, `src/index.ts`, `IRequestContext`, `@nestjs/common`, `communication.controller.ts`, `store.ts`, `Final Checklist: Petals ERP Backend`, `CommunicationService`, `audit.service.ts`, `RoleKey`, `PermissionAction`, `access.e2e-spec.ts`, `AccessService`, `ReportController`, `react`, `api/package.json`, `lucide-react`, `clinical-history.controller.ts`, `reports/page.tsx`, `AppointmentsView.tsx`, `clinical.service.ts`, `role-access/page.tsx`, `communication/page.tsx`, `employee.controller.ts`, `clinical.controller.ts`?**
  _High betweenness centrality (0.166) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `RoleKey` (e.g. with `A. Project and Data Model` and `A. Project and data model`) actually correct?**
  _`RoleKey` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `INVOICES`, `PAYMENTS`, `EXPENSES` to the rest of the system?**
  _109 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `4.1 Director` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/common` connect `@nestjs/common` to `PrismaService`, `RequirePermission`, `report.service.spec.ts`, `app.service.ts`, `ClientService`, `branch.controller.ts`, `devDependencies`, `hr.controller.ts`, `lead.controller.ts`, `communication-queue.service.ts`, `department.controller.ts`, `appointment.controller.ts`, `src/index.ts`, `communication.controller.ts`, `audit.service.ts`, `common/index.ts`, `access.e2e-spec.ts`, `api/package.json`, `clinical-history.controller.ts`, `clinical.service.ts`, `email-provider.interface.ts`, `clinical.controller.ts`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Should `RequirePermission` be split into smaller, more focused modules?**
  _Cohesion score 0.07656341320864991 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `reports/page.tsx`, `AppointmentsView.tsx`, `usePageTitle`, `FinancialView.tsx`, `store.ts`, `ui/index.ts`, `app/layout.tsx`, `fetcher.ts`, `role-access/page.tsx`, `Button`, `PermissionAction`, `dependencies`, `LeadsView.tsx`, `communication/page.tsx`, `web/package.json`, `lucide-react`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._