# Graph Report - petals-erp  (2026-11-12)

## Corpus Check
- 593 files · ~230,041 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: .example 2, (none) 2, .toml 1)

## Summary
- 3437 nodes · 9849 edges · 166 communities (109 shown, 57 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 243 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `84135926`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CurrentUser
- ExpensesTab.tsx
- 4.1 Director
- RequirePermission
- finance.service.ts
- env
- ui/index.ts
- devDependencies
- redis
- HrController
- compilerOptions
- LeaveType
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
- LeadService
- 2. Checklist Evaluation & Verification Evidence
- allowBuilds
- api/tsconfig.json
- types/tsconfig.json
- nest-cli.json
- RequirePermission
- web/package.json
- tsconfig.build.json
- RequestContextStorage
- department.controller.ts
- AppointmentService
- clinical.controller.ts
- @nestjs/common
- Ponytail, lazy senior dev mode
- LeaveDecisionDto
- AccessService
- store.ts
- CreateTreatmentPlanDto
- CommunicationService
- audit.service.ts
- AuthService
- CreateClientDto
- environment
- communication.service.ts
- common/index.ts
- src/index.ts
- MonthlyAttendanceQueryDto
- UserOverridesPanel.tsx
- CreateProgressEntryDto
- access.e2e-spec.ts
- seed.ts
- LeadStage
- AccessController
- RoleKey
- DocumentUploadUrlDto
- ReportController
- EmployeesView.tsx
- api/package.json
- IRequestContext
- CreateGoalDto
- api
- class-validator
- postgres
- lucide-react
- client.service.ts
- AuditLogFilterBar.tsx
- EmployeeDetailView.tsx
- AppointmentsView.tsx
- HolidayQueryDto
- SchedulePlanningView.tsx
- vitest
- ExpenseQueryDto
- RecordCallLogDto
- FinancialView.tsx
- ClientProfileView.tsx
- export-finance.dto.ts
- clinical.service.ts
- .set
- role-access/page.tsx
- migrator
- redis
- pagination/index.ts
- communication.controller.ts
- dependencies
- CreateTemplateDto
- CommunicationChannel
- CreateEmployeeDto
- 4. Components
- CreateExpenseDto
- StatCard
- App Shell: Sidebar and Header
- CheckOutDto
- Petals Child Development Centre ERP — Backend
- InvoiceQueryDto
- sw.ts
- CreateLeadDto
- 2. Deliverables Checklist
- PrismaService
- CreateLeaveRequestDto
- class-transformer
- services
- healthcheck
- BoardQueryDto
- manifest.json
- usePageTitle
- build
- hr.service.ts
- scripts
- Page: Appointments
- Page: Dashboard
- Page: Financial (Payments)
- Petals ERP Frontend Progress Log
- clinical/dto/index.ts
- @playwright/test
- Page: Client profile
- Page: Communication
- ReportType
- CreateUserDto
- Page: HRMS (Attendance · Leave · Holiday calendar)
- Page: Leads
- Page: Login and auth screens
- Page: Reports
- Page: Schedule planning
- tailwind.config.ts
- Petals ERP Frontend — Build Plan & Specification
- Page: Employees (list and detail)
- Page: Role access (Permission Manager and Branches)
- Page: Audit log
- @testing-library/jest-dom
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `RoleKey` - 290 edges
2. `react` - 184 edges
3. `Button` - 151 edges
4. `CurrentUser` - 130 edges
5. `@nestjs/common` - 124 edges
6. `lucide-react` - 112 edges
7. `RequirePermission()` - 109 edges
8. `PrismaService` - 87 edges
9. `class-validator` - 83 edges
10. `AppModule` - 82 edges

## Surprising Connections (you probably didn't know these)
- `How to read the diagrams` --references--> `AppointmentStatus`  [INFERRED]
  docs/er-diagram.md → packages/types/src/index.ts
- `A. Project and Data Model` --references--> `RoleKey`  [INFERRED]
  docs/FINAL_REPORT.md → packages/types/src/index.ts
- `A. Project and data model` --references--> `RoleKey`  [INFERRED]
  docs/phases/final-checklist.md → packages/types/src/index.ts
- `4. Architectural Rules Enforced` --references--> `usePermissions()`  [INFERRED]
  docs/frontend/BUILD_PLAN.md → apps/web/src/lib/permissions/usePermissions.ts
- `C. Access Control` --references--> `AuthGuard`  [INFERRED]
  docs/FINAL_REPORT.md → apps/api/src/common/guards/auth.guard.ts

## Import Cycles
- 3-file cycle: `apps/web/src/lib/api/access.ts -> apps/web/src/lib/api/fetcher.ts -> apps/web/src/lib/permissions/store.ts -> apps/web/src/lib/api/access.ts`

## Communities (166 total, 57 thin omitted)

### Community 0 - "CurrentUser"
Cohesion: 0.19
Nodes (3): ClinicalController, CurrentUser, RequirePermission()

### Community 1 - "ExpensesTab.tsx"
Cohesion: 0.11
Nodes (20): Column, DataTable(), DataTableProps, StatusChipProps, StatusType, mockReports, ReportsSubmittedTabProps, mockSessions (+12 more)

### Community 2 - "4.1 Director"
Cohesion: 0.04
Nodes (44): 10. Release Phasing, 11. Assumptions, 12. Decisions and Remaining Open Questions, 13.1 Proposed Stack, 13.2 RBAC Implementation, 13.3 Authentication, 13.4 PWA Requirements, 13.5 Suggested Build Order (+36 more)

### Community 3 - "RequirePermission"
Cohesion: 0.05
Nodes (5): CreateInvoiceDto, ExportFinanceDto, PnlQueryDto, FinanceController, FinanceService

### Community 4 - "finance.service.ts"
Cohesion: 0.15
Nodes (10): argon2@^0.41.1, hashPassword(), prisma, runDemoSeed(), FinanceModule, EXPENSE_SORT_FIELDS, INVOICE_SORT_FIELDS, PAYMENT_SORT_FIELDS (+2 more)

### Community 5 - "env"
Cohesion: 0.05
Nodes (38): COOKIE_SECRET, DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_URL (+30 more)

### Community 6 - "ui/index.ts"
Cohesion: 0.11
Nodes (23): ClientsPage(), AddProgressEntryModalProps, AssessmentsTabProps, OverviewTabProps, ProgressTabProps, TreatmentPlansTabProps, AddClientModalProps, ClientsFilterBar() (+15 more)

### Community 7 - "devDependencies"
Cohesion: 0.10
Nodes (19): devDependencies, jsdom@^25.0.1, @petals/config@workspace:*, @testing-library/react@^16.1.0, @testing-library/user-event@^14.5.2, @types/node@^22.13.4, @types/react@^19.0.8, @types/react-dom@^19.0.3 (+11 more)

### Community 8 - "redis"
Cohesion: 0.08
Nodes (29): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, REDIS_PASSWORD, interval, retries, test, timeout (+21 more)

### Community 10 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, alwaysStrict, declaration, declarationMap, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+16 more)

### Community 11 - "LeaveType"
Cohesion: 0.12
Nodes (8): CreateLeaveRequestDto, ApplyLeaveModalProps, LeaveType, CASUAL, OTHER, PAID, SICK, UNPAID

### Community 12 - "AppModule"
Cohesion: 0.06
Nodes (25): RolePermissionItemDto, UserOverrideItemDto, CanProps, NavItem, AppModule, APPOINTMENTS, CLIENTS, COMMUNICATION (+17 more)

### Community 13 - "Button"
Cohesion: 0.08
Nodes (80): OtpLoginPage(), LoginPage(), NotFound(), Button, ButtonProps, ButtonVariant, ConfirmDialog(), ConfirmDialogProps (+72 more)

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
Cohesion: 0.04
Nodes (76): dependencies, bullmq@^5.41.3, class-transformer@^0.5.1, class-validator@^0.14.1, cookie-parser@^1.4.7, dotenv@^16.4.7, helmet@^8.0.0, ioredis@^5.5.0 (+68 more)

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

### Community 22 - "LeadService"
Cohesion: 0.07
Nodes (4): ConvertLeadDto, UpdateLeadDto, LeadController, LeadService

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

### Community 29 - "web/package.json"
Cohesion: 0.12
Nodes (15): autoprefixer@^10.4.20, date-fns-tz@^3.2.0, postcss@^8.4.49, recharts@^2.14.1, @tanstack/react-query-devtools@^5.62.3, zustand@^5.0.2, name, private (+7 more)

### Community 30 - "tsconfig.build.json"
Cohesion: 0.29
Nodes (6): compilerOptions, declarationMap, sourceMap, exclude, extends, ./tsconfig.json

### Community 33 - "AppointmentService"
Cohesion: 0.04
Nodes (10): AppointmentController, AppointmentService, AppointmentQueryDto, CancelAppointmentDto, ClientAppointmentQueryDto, CreateAppointmentDto, CreateScheduleDto, DailyScheduleQueryDto (+2 more)

### Community 34 - "clinical.controller.ts"
Cohesion: 0.04
Nodes (6): NoStoreInterceptor, CreateAssessmentDto, UpdateAssessmentDto, UpdateProgressEntryDto, UpdateTreatmentPlanDto, RecordPaymentDto

### Community 35 - "@nestjs/common"
Cohesion: 0.05
Nodes (31): AccessModule, ResolvedModulePermissions, ResolvedPermissionsMap, AuditModule, COOKIE_OPTIONS, AuthModule, RequestContext, CurrentBranch (+23 more)

### Community 36 - "Ponytail, lazy senior dev mode"
Cohesion: 0.50
Nodes (3): Before you write, Ponytail, lazy senior dev mode, The smallest complete change

### Community 41 - "store.ts"
Cohesion: 0.07
Nodes (53): AppLayout(), TwoFactorPage(), BranchSwitcher(), GlobalSearch(), Header(), InactivityLock(), BeforeInstallPromptEvent, InstallBanner() (+45 more)

### Community 70 - "audit.service.ts"
Cohesion: 0.10
Nodes (8): AuditController, AUDIT_ACTION_KEY, AUDIT_ENTITY_KEY, AUDIT_IGNORE_KEY, AUDIT_SENSITIVE_READ_KEY, AuditInterceptor, sanitizeAuditMetadata(), AuditService

### Community 71 - "AuthService"
Cohesion: 0.05
Nodes (12): AuthController, AuthService, ChangePasswordDto, LoginDto, RequestOtpDto, VerifyOtpDto, Disable2faDto, Enable2faDto (+4 more)

### Community 72 - "CreateClientDto"
Cohesion: 0.04
Nodes (12): ClientController, ClientService, ClientQueryDto, CreateClientDto, CreateGuardianDto, UpdateClientDto, 1. Layout (desktop), 2. Add client (modal) (mockup) (+4 more)

### Community 73 - "environment"
Cohesion: 0.18
Nodes (11): environment, APP_CORS_ORIGIN, COOKIE_SECRET, DOCUMENT_HMAC_SECRET, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, NODE_ENV, PORT (+3 more)

### Community 74 - "communication.service.ts"
Cohesion: 0.09
Nodes (20): CommunicationModule, CommunicationJobData, CommunicationQueueService, SENSITIVE_CLINICAL_KEYWORDS, EMAIL_PROVIDER, EmailProvider, SendEmailParams, SendEmailResult (+12 more)

### Community 75 - "common/index.ts"
Cohesion: 0.06
Nodes (17): CommonModule, EnvironmentVariables, validate(), RequestContextMiddleware, PrismaModule, LockoutResult, MemoryLockEntry, RateLimitModule (+9 more)

### Community 76 - "src/index.ts"
Cohesion: 0.25
Nodes (7): SearchResultItem, usePermissions(), AppointmentDto, DepartmentDto, LoginResponse, PaginationMetaCursor, PaginationMetaOffset

### Community 78 - "UserOverridesPanel.tsx"
Cohesion: 0.17
Nodes (25): PermissionMatrixAccordions(), PermissionMatrixAccordionsProps, PermissionMatrixTable(), PermissionMatrixTableProps, PermissionsTab(), PermissionsTabProps, RoleCardsPanel(), RoleCardsPanelProps (+17 more)

### Community 80 - "access.e2e-spec.ts"
Cohesion: 0.17
Nodes (15): AppModule, hashPassword(), GlobalExceptionFilter, QueryCounter, bootstrap(), runLoadTests(), scanDir(), ClientStatus (+7 more)

### Community 81 - "seed.ts"
Cohesion: 0.29
Nodes (7): ALL_ACTIONS, ALL_MODULES, hashPassword(), main(), prisma, ROLE_PERMISSIONS_CONFIG, RoleSeedConfig

### Community 82 - "LeadStage"
Cohesion: 0.15
Nodes (21): ConvertToClientModalProps, LeadCard(), LeadCardProps, LeadDetailDrawerProps, columnsConfig, LeadsBoard(), LeadsBoardProps, LeadsList() (+13 more)

### Community 83 - "AccessController"
Cohesion: 0.10
Nodes (3): AccessController, UpdateRolePermissionsDto, UpdateUserOverridesDto

### Community 84 - "RoleKey"
Cohesion: 0.12
Nodes (12): AuthTokens, ClinicalService, CachedUserData, DocumentsTabProps, DashboardStatsProps, ReportsHeroProps, ReportsStatCardsProps, RoleKey (+4 more)

### Community 86 - "ReportController"
Cohesion: 0.06
Nodes (5): CreateDocumentDto, CreateReportDto, UpdateReportDto, ReportController, ReportService

### Community 87 - "EmployeesView.tsx"
Cohesion: 0.09
Nodes (33): EmployeeDetailPage(), Avatar(), AvatarProps, ProgressBar(), ProgressBarProps, ActivityLogTab(), ActivityLogTabProps, mockFullActivityLog (+25 more)

### Community 88 - "api/package.json"
Cohesion: 0.09
Nodes (18): @nestjs/config@^4.0.0, @nestjs/jwt@^11.0.2, TokenPayload, ConsoleOtpSender, IOtpSender, OTP_SENDER, OtpService, decryptSecret() (+10 more)

### Community 90 - "CreateGoalDto"
Cohesion: 0.06
Nodes (16): CreateGoalDto, CreateSubgoalDto, UpdateGoalDto, UpdateSubgoalDto, GoalStatus, ACHIEVED, DISCONTINUED, IN_PROGRESS (+8 more)

### Community 91 - "api"
Cohesion: 0.20
Nodes (10): container_name, depends_on, networks, ports, restart, migrator, redis, condition (+2 more)

### Community 93 - "postgres"
Cohesion: 0.20
Nodes (10): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, container_name, environment, image, networks, restart (+2 more)

### Community 94 - "lucide-react"
Cohesion: 0.06
Nodes (40): DashboardPage(), TreatmentPlansTab(), ConfigureWidgetsModal(), ConfigureWidgetsModalProps, DashboardHero(), DashboardHeroProps, DashboardStats(), DashboardView() (+32 more)

### Community 95 - "client.service.ts"
Cohesion: 0.06
Nodes (12): AuditSensitiveRead(), ClientModule, ALL_PROFILE_TABS, CLIENT_SORT_FIELDS, TAB_MODULE_MAP, ClinicalModule, ClinicalHistoryController, ClinicalHistoryModule (+4 more)

### Community 96 - "AuditLogFilterBar.tsx"
Cohesion: 0.26
Nodes (11): AuditLogPage(), AuditLogDetailDrawer(), AuditLogDetailDrawerProps, AuditLogFilterBar(), AuditLogFilterBarProps, AuditLogHero(), AuditLogHeroProps, AuditLogTable() (+3 more)

### Community 97 - "EmployeeDetailView.tsx"
Cohesion: 0.06
Nodes (54): ReportDetailPage(), ReportsPage(), Checkbox, StatusChip(), TabContentProps, TabList(), TabListProps, Tabs() (+46 more)

### Community 98 - "AppointmentsView.tsx"
Cohesion: 0.12
Nodes (29): AppointmentsPage(), SegmentedControl(), AppointmentsHero(), AppointmentsHeroProps, AppointmentsToolbar(), AppointmentsToolbarProps, AppointmentsView(), CalendarSurface() (+21 more)

### Community 100 - "SchedulePlanningView.tsx"
Cohesion: 0.11
Nodes (23): SchedulePlanningPage(), DAYS, NewScheduleModalProps, TIME_SLOTS, SchedulePlanningHero(), SchedulePlanningHeroProps, SchedulePlanningStats(), SchedulePlanningStatsProps (+15 more)

### Community 101 - "vitest"
Cohesion: 0.32
Nodes (5): mockColumns, mockData, TestRow, @testing-library/react, vitest

### Community 104 - "FinancialView.tsx"
Cohesion: 0.14
Nodes (21): FinancialPage(), FinancialView(), mockTrackingData, MonthlyTrackingTab(), MonthlyTrackingTabProps, OverdueReminders(), OverdueRemindersProps, PaymentHero() (+13 more)

### Community 105 - "ClientProfileView.tsx"
Cohesion: 0.08
Nodes (26): ClientProfilePage(), Switch(), ClientProfileView(), DEFAULT_DOCS, DocumentItem, DocumentsTab(), ProgressTab(), DEFAULT_SESSIONS (+18 more)

### Community 106 - "export-finance.dto.ts"
Cohesion: 0.22
Nodes (8): ExportFormat, EXCEL, PDF, ExportType, EXPENSES, INVOICES, PAYMENTS, PNL

### Community 107 - "clinical.service.ts"
Cohesion: 0.12
Nodes (12): ASSESSMENT_SORT_FIELDS, AssessmentQueryDto, buildCursorMeta(), buildCursorPagination(), buildOffsetMeta(), buildOffsetPagination(), buildOrderBy(), DocumentQueryDto (+4 more)

### Community 108 - ".set"
Cohesion: 0.06
Nodes (20): AuthGuard, DashboardController, DashboardService, DashboardQueryDto, A. Project and data model, B. Authentication and sessions, C. Access control, D. Parents (+12 more)

### Community 109 - "role-access/page.tsx"
Cohesion: 0.12
Nodes (20): RoleAccessPage(), EmptyState(), AssignUsersModal(), AssignUsersModalProps, BranchCard(), BranchCardProps, BranchesTab(), BranchesTabProps (+12 more)

### Community 110 - "migrator"
Cohesion: 0.22
Nodes (9): postgres, DATABASE_URL, command, container_name, depends_on, environment, networks, condition (+1 more)

### Community 111 - "redis"
Cohesion: 0.22
Nodes (9): REDIS_PASSWORD, command, container_name, environment, image, networks, restart, volumes (+1 more)

### Community 112 - "pagination/index.ts"
Cohesion: 0.07
Nodes (11): AuditLogQueryDto, ProgressEntryQueryDto, CursorPaginationDto, OffsetPaginationDto, CursorPaginatedResponse, CursorPaginationMeta, OffsetPaginatedResponse, OffsetPaginationMeta (+3 more)

### Community 113 - "communication.controller.ts"
Cohesion: 0.06
Nodes (6): CommunicationLogQueryDto, SendBulkMessagesDto, SendMessageDto, TemplateQueryDto, UpdateTemplateDto, WebhookPayloadDto

### Community 114 - "dependencies"
Cohesion: 0.10
Nodes (20): dependencies, clsx@^2.1.1, date-fns@^4.1.0, @hookform/resolvers@^3.9.1, lucide-react@^0.469.0, next@^15.1.7, @petals/types@workspace:*, react@^19.0.0 (+12 more)

### Community 116 - "CommunicationChannel"
Cohesion: 0.12
Nodes (30): CommunicationPage(), BulkSendTabProps, CommunicationHero(), CommunicationHeroProps, CommunicationStatCards(), CommunicationStatCardsProps, MessageDetailDrawer(), MessageDetailDrawerProps (+22 more)

### Community 117 - "CreateEmployeeDto"
Cohesion: 0.07
Nodes (4): CreateEmployeeDto, UpdateEmployeeDto, EmployeeController, EmployeeService

### Community 118 - "4. Components"
Cohesion: 0.10
Nodes (19): 1. Principles, 2. Colour tokens, 3. Typography, 4. Components, 5. Layout and breakpoints, 6. Mobile patterns (apply to every page), 7. PWA rules, 8. Accessibility (+11 more)

### Community 120 - "StatCard"
Cohesion: 0.13
Nodes (19): StatCard(), StatCardProps, EmployeesStatCards(), EmployeesStatCardsProps, PaymentStatCards(), PaymentStatCardsProps, mockMonths, PnlTab() (+11 more)

### Community 121 - "App Shell: Sidebar and Header"
Cohesion: 0.17
Nodes (11): 1. Structure, 2. Sidebar (sticky, collapsible), 3. Header (on every page), 4. Mobile shell (< 768 px), 5. Page content wrapper, 6. Global behaviours, App Shell: Sidebar and Header, Collapsed (icon rail, 72 px) (+3 more)

### Community 124 - "Petals Child Development Centre ERP — Backend"
Cohesion: 0.07
Nodes (28): 1. Objectives & SLA Targets, 2. Automated PostgreSQL Backup Procedure, 3. Redis Persistence & Backup, 4. Step-by-Step Restoration Checklist, Database Backup & Disaster Recovery Guide, Phase A: Pre-Restoration Sanity Checks, Phase B: Database Restore Execution, Phase C: Post-Restoration Verification Queries (+20 more)

### Community 125 - "InvoiceQueryDto"
Cohesion: 0.09
Nodes (5): InvoiceQueryDto, PaymentQueryDto, RevenueCategory, ASSESSMENT_FEE, CLINICAL_THERAPY

### Community 126 - "sw.ts"
Cohesion: 0.18
Nodes (9): nextConfig, withSerwist, serwist@^9.0.9, @serwist/next@^9.0.9, customRuntimeCaching, serwist, WorkerGlobalScope, serwist (+1 more)

### Community 128 - "2. Deliverables Checklist"
Cohesion: 0.20
Nodes (9): 1. Executive Summary, 2. Deliverables Checklist, 3. Route Output Matrix, 4. Known Limitations & Recommendations, Petals ERP Frontend — Final Verification Report, Phase A: Foundations, App Shell, Auth & PWA ✅, Phase B: Core Pages Implementation ✅, Phase C: PWA Hardening & Security ✅ (+1 more)

### Community 130 - "PrismaService"
Cohesion: 0.04
Nodes (19): AppController, AppService, AppointmentModule, DAY_MAP, GeneratedSlot, generateScheduleSlots(), PrismaService, CacheService (+11 more)

### Community 131 - "CreateLeaveRequestDto"
Cohesion: 0.17
Nodes (6): LeaveQueryDto, LeaveStatus, APPROVED, CANCELLED, PENDING, REJECTED

### Community 132 - "class-transformer"
Cohesion: 0.12
Nodes (3): RoleModuleItemDto, UpdateRoleModulesDto, class-transformer

### Community 133 - "services"
Cohesion: 0.25
Nodes (7): networks, petals-internal, driver, services, volumes, postgres_prod_data, redis_prod_data

### Community 134 - "healthcheck"
Cohesion: 0.46
Nodes (8): healthcheck, interval, retries, start_period, test, timeout, healthcheck, healthcheck

### Community 138 - "manifest.json"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 139 - "usePageTitle"
Cohesion: 0.09
Nodes (22): ForbiddenPage(), EmployeesPage(), HrmsPage(), LeadsPage(), inter, metadata, quicksand, RootLayout() (+14 more)

### Community 142 - "build"
Cohesion: 0.50
Nodes (5): build, context, dockerfile, target, build

### Community 144 - "hr.service.ts"
Cohesion: 0.08
Nodes (6): CheckInDto, CreateHolidayDto, DailyAttendanceQueryDto, DirectorAvailabilityDto, EmployeeActivityQueryDto, EmployeeGoalsQueryDto

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

### Community 156 - "clinical/dto/index.ts"
Cohesion: 0.12
Nodes (11): PlanStatus, ACTIVE, CANCELLED, COMPLETED, PAUSED, ProgressLevel, ACHIEVED, EMERGING (+3 more)

### Community 158 - "Page: Client profile"
Cohesion: 0.29
Nodes (6): 1. Header card, 2. Tabs (permission driven), 3. Shared cases, 4. Parent view, 5. Mobile, Page: Client profile

### Community 160 - "Page: Communication"
Cohesion: 0.29
Nodes (6): 1. Layout, 2. Tabs, 3. New message (modal), 4. Rules to reflect in UI, 5. Mobile, Page: Communication

### Community 161 - "ReportType"
Cohesion: 0.10
Nodes (9): DueReportQueryDto, ReportQueryDto, NewReportFormValues, CreateReportPayload, ReportType, ASSESSMENT, DISCHARGE, OTHER (+1 more)

### Community 162 - "CreateUserDto"
Cohesion: 0.06
Nodes (4): AssignBranchDto, CreateUserDto, UpdateUserDto, UserController

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
- **109 isolated node(s):** `ADVANCE`, `PAID`, `PENDING`, `EXPENSES`, `INVOICES` (+104 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1447 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **57 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RoleKey` connect `RoleKey` to `CurrentUser`, `PrismaService`, `RequirePermission`, `finance.service.ts`, `ui/index.ts`, `usePageTitle`, `Button`, `branch.controller.ts`, `hr.service.ts`, `LeadService`, `2. Checklist Evaluation & Verification Evidence`, `RequirePermission`, `AppointmentService`, `clinical.controller.ts`, `@nestjs/common`, `AccessService`, `store.ts`, `CommunicationService`, `CreateClientDto`, `communication.service.ts`, `src/index.ts`, `UserOverridesPanel.tsx`, `access.e2e-spec.ts`, `AccessController`, `ReportController`, `EmployeesView.tsx`, `api/package.json`, `IRequestContext`, `lucide-react`, `client.service.ts`, `AuditLogFilterBar.tsx`, `EmployeeDetailView.tsx`, `AppointmentsView.tsx`, `RecordCallLogDto`, `ClientProfileView.tsx`, `clinical.service.ts`, `.set`, `role-access/page.tsx`, `communication.controller.ts`, `CommunicationChannel`, `CreateEmployeeDto`?**
  _High betweenness centrality (0.193) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `RoleKey` (e.g. with `A. Project and Data Model` and `A. Project and data model`) actually correct?**
  _`RoleKey` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADVANCE`, `PAID`, `PENDING` to the rest of the system?**
  _109 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ExpensesTab.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11396011396011396 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/common` connect `@nestjs/common` to `PrismaService`, `clinical.controller.ts`, `finance.service.ts`, `audit.service.ts`, `communication.service.ts`, `clinical.service.ts`, `common/index.ts`, `access.e2e-spec.ts`, `devDependencies`, `branch.controller.ts`, `communication.controller.ts`, `hr.service.ts`, `api/package.json`, `client.service.ts`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `4.1 Director` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Why does `react` connect `store.ts` to `ExpensesTab.tsx`, `ui/index.ts`, `usePageTitle`, `Button`, `web/package.json`, `src/index.ts`, `UserOverridesPanel.tsx`, `LeadStage`, `EmployeesView.tsx`, `lucide-react`, `AuditLogFilterBar.tsx`, `EmployeeDetailView.tsx`, `AppointmentsView.tsx`, `SchedulePlanningView.tsx`, `FinancialView.tsx`, `ClientProfileView.tsx`, `role-access/page.tsx`, `dependencies`, `CommunicationChannel`, `StatCard`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._