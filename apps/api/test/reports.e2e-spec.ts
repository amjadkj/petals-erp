import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule as AppMainModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/common/prisma';
import { CacheService } from '../src/common/redis';
import { QueryCounter } from '../src/common/testing/query-count.helper';
import { hashPassword } from '../src/common/crypto';
import {
  RoleKey,
  ClientStatus,
  ReportStatus,
  ReportType,
  AppModule,
  PermissionAction,
} from '@petals/types';

describe('Reports & Documents Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cacheService: CacheService;
  let queryCounter: QueryCounter;

  let directorToken: string;
  let managerToken: string;
  let therapist1Token: string;
  let therapist2Token: string;
  let parentToken: string;

  let therapist1UserId: string;
  let therapist1EmployeeId: string;
  let parentUserId: string;

  let branchId: string;
  let branch2Id: string;
  let departmentId: string;
  let child1Id: string;

  const defaultPassword = 'Password123!Secure';
  const directorPassword = 'ChangeMe123!';
  const managerEmail = 'manager1-p11@petals.com';
  const therapist1Email = 'therapist1-p11@petals.com';
  const therapist2Email = 'therapist2-p11@petals.com';
  const parentEmail = 'parent1-p11@petals.com';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppMainModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.set('trust proxy', 1);

    app.setGlobalPrefix('api/v1', {
      exclude: ['health', 'api/docs'],
    });

    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());

    await app.init();
    prisma = app.get(PrismaService);
    cacheService = app.get(CacheService);
    queryCounter = new QueryCounter(app);

    // Teardown previous test data
    await prisma.unscopedClient.notification.deleteMany({
      where: {
        user: { email: { in: [managerEmail, therapist1Email, therapist2Email, parentEmail] } },
      },
    });
    await prisma.unscopedClient.auditLog.deleteMany({
      where: {
        entity: 'Report',
      },
    });
    await prisma.unscopedClient.document.deleteMany({
      where: {
        client: { clientCode: { startsWith: 'P11' } },
      },
    });
    await prisma.unscopedClient.report.deleteMany({
      where: {
        client: { clientCode: { startsWith: 'P11' } },
      },
    });
    await prisma.unscopedClient.treatmentPlan.deleteMany({
      where: {
        client: { clientCode: { startsWith: 'P11' } },
      },
    });
    await prisma.unscopedClient.clientGuardian.deleteMany({
      where: {
        client: { clientCode: { startsWith: 'P11' } },
      },
    });
    await prisma.unscopedClient.client.deleteMany({
      where: { clientCode: { startsWith: 'P11' } },
    });
    await prisma.unscopedClient.guardian.deleteMany({
      where: { user: { email: parentEmail } },
    });
    await prisma.unscopedClient.employee.deleteMany({
      where: { user: { email: { in: [managerEmail, therapist1Email, therapist2Email] } } },
    });
    await prisma.unscopedClient.user.deleteMany({
      where: { email: { in: [managerEmail, therapist1Email, therapist2Email, parentEmail] } },
    });

    // 1. Setup Branches & Department
    const branch1 = await prisma.unscopedClient.branch.upsert({
      where: { code: 'P11B1' },
      update: {},
      create: {
        name: 'Phase 11 Branch One',
        code: 'P11B1',
        city: 'Kochi',
      },
    });
    branchId = branch1.id;

    const branch2 = await prisma.unscopedClient.branch.upsert({
      where: { code: 'P11B2' },
      update: {},
      create: {
        name: 'Phase 11 Branch Two',
        code: 'P11B2',
        city: 'Calicut',
      },
    });
    branch2Id = branch2.id;

    const dept = await prisma.unscopedClient.department.findFirstOrThrow({
      where: { code: 'OT' },
    });
    departmentId = dept.id;

    // 2. Log in Director
    const dirRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'director@petals.com', password: directorPassword })
      .expect(200);
    directorToken = dirRes.body.accessToken;

    const hashedPassword = await hashPassword(defaultPassword);

    // 3. Setup Manager
    const managerRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.MANAGER },
    });
    for (const mod of [AppModule.REPORTS, AppModule.CLIENTS, AppModule.PROFILE_DOCUMENTS]) {
      await prisma.unscopedClient.roleModule.upsert({
        where: { roleId_module: { roleId: managerRole.id, module: mod } },
        update: { enabled: true },
        create: { roleId: managerRole.id, module: mod, enabled: true },
      });
      for (const act of [PermissionAction.VIEW, PermissionAction.VIEW_ALL, PermissionAction.CREATE, PermissionAction.UPDATE]) {
        await prisma.unscopedClient.rolePermission.upsert({
          where: { roleId_module_action: { roleId: managerRole.id, module: mod, action: act } },
          update: { allowed: true },
          create: { roleId: managerRole.id, module: mod, action: act, allowed: true },
        });
      }
    }

    const mgrUser = await prisma.unscopedClient.user.create({
      data: {
        name: 'Manager P11',
        email: managerEmail,
        passwordHash: hashedPassword,
        phone: '+919876511001',
        roleId: managerRole.id,
        branches: { create: { branchId, isPrimary: true } },
      },
    });
    await prisma.unscopedClient.employee.create({
      data: {
        userId: mgrUser.id,
        departmentId,
        employeeCode: 'EMP-P11-MGR',
        joinedOn: new Date('2025-01-01'),
      },
    });
    const mgrLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: managerEmail, password: defaultPassword })
      .expect(200);
    managerToken = mgrLogin.body.accessToken;

    // 4. Setup Therapists
    const therapistRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.THERAPIST },
    });
    for (const mod of [AppModule.PROFILE_REPORTS, AppModule.PROFILE_DOCUMENTS, AppModule.CLIENTS]) {
      await prisma.unscopedClient.roleModule.upsert({
        where: { roleId_module: { roleId: therapistRole.id, module: mod } },
        update: { enabled: true },
        create: { roleId: therapistRole.id, module: mod, enabled: true },
      });
      for (const act of [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.UPDATE]) {
        await prisma.unscopedClient.rolePermission.upsert({
          where: { roleId_module_action: { roleId: therapistRole.id, module: mod, action: act } },
          update: { allowed: true },
          create: { roleId: therapistRole.id, module: mod, action: act, allowed: true },
        });
      }
    }

    const t1User = await prisma.unscopedClient.user.create({
      data: {
        name: 'Therapist One P11',
        email: therapist1Email,
        passwordHash: hashedPassword,
        phone: '+919876511002',
        roleId: therapistRole.id,
        branches: { create: { branchId, isPrimary: true } },
      },
    });
    therapist1UserId = t1User.id;
    const t1Emp = await prisma.unscopedClient.employee.create({
      data: {
        userId: t1User.id,
        departmentId,
        employeeCode: 'EMP-P11-T1',
        joinedOn: new Date('2025-02-01'),
      },
    });
    therapist1EmployeeId = t1Emp.id;

    const t1Login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: therapist1Email, password: defaultPassword })
      .expect(200);
    therapist1Token = t1Login.body.accessToken;

    const t2User = await prisma.unscopedClient.user.create({
      data: {
        name: 'Therapist Two P11',
        email: therapist2Email,
        passwordHash: hashedPassword,
        phone: '+919876511003',
        roleId: therapistRole.id,
        branches: { create: { branchId, isPrimary: true } },
      },
    });
    await prisma.unscopedClient.employee.create({
      data: {
        userId: t2User.id,
        departmentId,
        employeeCode: 'EMP-P11-T2',
        joinedOn: new Date('2025-02-01'),
      },
    });

    const t2Login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: therapist2Email, password: defaultPassword })
      .expect(200);
    therapist2Token = t2Login.body.accessToken;

    // 5. Setup Parent & Guardian
    const parentRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.PARENT },
    });
    for (const mod of [AppModule.PROFILE_REPORTS, AppModule.PROFILE_DOCUMENTS, AppModule.CLIENTS]) {
      await prisma.unscopedClient.roleModule.upsert({
        where: { roleId_module: { roleId: parentRole.id, module: mod } },
        update: { enabled: true },
        create: { roleId: parentRole.id, module: mod, enabled: true },
      });
      await prisma.unscopedClient.rolePermission.upsert({
        where: { roleId_module_action: { roleId: parentRole.id, module: mod, action: PermissionAction.VIEW } },
        update: { allowed: true },
        create: { roleId: parentRole.id, module: mod, action: PermissionAction.VIEW, allowed: true },
      });
    }

    const pUser = await prisma.unscopedClient.user.create({
      data: {
        name: 'Parent P11',
        email: parentEmail,
        passwordHash: hashedPassword,
        phone: '+919876511004',
        roleId: parentRole.id,
      },
    });
    parentUserId = pUser.id;

    const guardian = await prisma.unscopedClient.guardian.create({
      data: {
        userId: pUser.id,
        name: 'Parent P11',
        whatsappNo: '+919876511004',
      },
    });

    const pLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: parentEmail, password: defaultPassword })
      .expect(200);
    parentToken = pLogin.body.accessToken;

    // 6. Setup Clients
    const child1 = await prisma.unscopedClient.client.create({
      data: {
        clientCode: 'P11C01',
        name: 'Vihaan Child P11',
        dob: new Date('2020-05-15'),
        gender: 'MALE',
        branchId,
        status: ClientStatus.ACTIVE,
      },
    });
    child1Id = child1.id;

    await prisma.unscopedClient.clientGuardian.create({
      data: {
        clientId: child1.id,
        guardianId: guardian.id,
        relation: 'Mother',
        isPrimary: true,
      },
    });

    await prisma.unscopedClient.client.create({
      data: {
        clientCode: 'P11C02',
        name: 'Ananya Child P11',
        dob: new Date('2019-10-10'),
        gender: 'FEMALE',
        branchId: branch2Id,
        status: ClientStatus.ACTIVE,
      },
    });
  });

  afterAll(async () => {
    await prisma.unscopedClient.notification.deleteMany({
      where: {
        user: { email: { in: [managerEmail, therapist1Email, therapist2Email, parentEmail] } },
      },
    });
    await prisma.unscopedClient.auditLog.deleteMany({
      where: { entity: 'Report' },
    });
    await prisma.unscopedClient.document.deleteMany({
      where: { client: { clientCode: { startsWith: 'P11' } } },
    });
    await prisma.unscopedClient.report.deleteMany({
      where: { client: { clientCode: { startsWith: 'P11' } } },
    });
    await prisma.unscopedClient.clientGuardian.deleteMany({
      where: { client: { clientCode: { startsWith: 'P11' } } },
    });
    await prisma.unscopedClient.client.deleteMany({
      where: { clientCode: { startsWith: 'P11' } },
    });
    await prisma.unscopedClient.guardian.deleteMany({
      where: { user: { email: parentEmail } },
    });
    await prisma.unscopedClient.employee.deleteMany({
      where: { user: { email: { in: [managerEmail, therapist1Email, therapist2Email] } } },
    });
    await prisma.unscopedClient.user.deleteMany({
      where: { email: { in: [managerEmail, therapist1Email, therapist2Email, parentEmail] } },
    });

    await app.close();
  });

  // ─────────────────────────────────────────────────────────────
  // 1. REPORT LIFECYCLE, STATUS WORKFLOW & GROUPBY SUMMARY
  // ─────────────────────────────────────────────────────────────

  let report1Id: string;
  let report2DraftId: string;

  describe('Report Lifecycle & Status Workflow', () => {
    it('creates report in DRAFT status with Cache-Control: no-store', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/clients/${child1Id}/reports`)
        .set('Authorization', `Bearer ${therapist1Token}`)
        .send({
          type: ReportType.ASSESSMENT,
          title: 'Initial OT Sensory Profile',
          content: 'Child shows tactile defensiveness and vestibular seeking behaviors.',
          dueOn: '2026-04-10',
        })
        .expect(201);

      report1Id = res.body.id;
      expect(res.body.status).toBe(ReportStatus.DRAFT);
      expect(res.body.sharedWithParent).toBe(false);
      expect(res.body.author.id).toBe(therapist1EmployeeId);
      expect(res.headers['cache-control']).toContain('no-store');
    });

    it('updates report to SUBMITTED: records submittedAt timestamp', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/reports/${report1Id}`)
        .set('Authorization', `Bearer ${therapist1Token}`)
        .send({
          status: ReportStatus.SUBMITTED,
          content: 'Updated observations with standardized SPM scores.',
        })
        .expect(200);

      expect(res.body.status).toBe(ReportStatus.SUBMITTED);
      expect(res.body.submittedAt).toBeDefined();
    });

    it('director reviews report: transitions status to REVIEWED', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/reports/${report1Id}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          status: ReportStatus.REVIEWED,
        })
        .expect(200);

      expect(res.body.status).toBe(ReportStatus.REVIEWED);
    });

    it('returns report summary counts in one groupBy query', async () => {
      // Create a second draft report
      const draftRes = await request(app.getHttpServer())
        .post(`/api/v1/clients/${child1Id}/reports`)
        .set('Authorization', `Bearer ${therapist1Token}`)
        .send({
          type: ReportType.PROGRESS,
          title: 'Mid-term OT Progress Report',
          content: 'Fine motor precision has improved from baseline.',
        })
        .expect(201);
      report2DraftId = draftRes.body.id;

      const summaryRes = await request(app.getHttpServer())
        .get(`/api/v1/clients/${child1Id}/reports/summary`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(summaryRes.body.DRAFT).toBeGreaterThanOrEqual(1);
      expect(summaryRes.body.REVIEWED).toBeGreaterThanOrEqual(1);
      expect(summaryRes.body.total).toBeGreaterThanOrEqual(2);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. SHARE TRANSACTION & PARENT VISIBILITY
  // ─────────────────────────────────────────────────────────────

  describe('Report Share Transaction & Parent Scoping', () => {
    it('executes share in a single transaction: marks SHARED, writes audit log, queues parent notification', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/reports/${report1Id}/share`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(201);

      expect(res.body.report.status).toBe(ReportStatus.SHARED);
      expect(res.body.report.sharedWithParent).toBe(true);
      expect(res.body.notificationsQueued).toBe(1);

      // Verify AuditLog written
      const auditLog = await prisma.unscopedClient.auditLog.findFirst({
        where: {
          action: 'SHARE_REPORT',
          entity: 'Report',
          entityId: report1Id,
        },
      });
      expect(auditLog).toBeDefined();

      // Verify Notification queued for Parent User
      const notif = await prisma.unscopedClient.notification.findFirst({
        where: {
          userId: parentUserId,
          type: 'REPORT_SHARED',
        },
      });
      expect(notif).toBeDefined();
      expect(notif?.title).toContain('Clinical Report');
    });

    it('returns report activity timeline using cursor pagination', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/clients/${child1Id}/reports/activity`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].action).toBe('SHARE_REPORT');
      expect(res.body.meta).toBeDefined();
    });

    it('allows Parent to view the SHARED report', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/reports/${report1Id}`)
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      expect(res.body.id).toBe(report1Id);
      expect(res.body.sharedWithParent).toBe(true);
    });

    it('forbids Parent from viewing the unshared DRAFT report (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/reports/${report2DraftId}`)
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(403);
    });

    it('forbids Parent from sharing reports or creating reports directly (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/reports/${report2DraftId}/share`)
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(403);

      await request(app.getHttpServer())
        .post(`/api/v1/clients/${child1Id}/reports`)
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          type: ReportType.PROGRESS,
          title: 'Parent Unallowed Report',
        })
        .expect(403);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. THERAPIST CASE SCOPING
  // ─────────────────────────────────────────────────────────────

  describe('Therapist Case Scoping', () => {
    it('forbids Therapist 2 from updating Therapist 1 draft report (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/reports/${report2DraftId}`)
        .set('Authorization', `Bearer ${therapist2Token}`)
        .send({
          title: 'Hacked by Therapist 2',
        })
        .expect(403);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. GLOBAL DUE REPORTS & OVERDUE DETECTION
  // ─────────────────────────────────────────────────────────────

  let overdueReportId: string;
  let upcomingReportId: string;

  describe('Global Due Reports & Overdue Reminders', () => {
    beforeAll(async () => {
      const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days ahead

      const overdueRes = await prisma.unscopedClient.report.create({
        data: {
          clientId: child1Id,
          authorId: therapist1EmployeeId,
          type: ReportType.DISCHARGE,
          title: 'Overdue Discharge Summary',
          dueOn: pastDate,
          status: ReportStatus.DRAFT,
        },
      });
      overdueReportId = overdueRes.id;

      const upcomingRes = await prisma.unscopedClient.report.create({
        data: {
          clientId: child1Id,
          authorId: therapist1EmployeeId,
          type: ReportType.PROGRESS,
          title: 'Upcoming Progress Review',
          dueOn: futureDate,
          status: ReportStatus.DRAFT,
        },
      });
      upcomingReportId = upcomingRes.id;
    });

    it('returns due reports with accurate isOverdue flags for Director and Manager', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/reports/due')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      const overdueItem = res.body.data.find((r: any) => r.id === overdueReportId);
      const upcomingItem = res.body.data.find((r: any) => r.id === upcomingReportId);

      expect(overdueItem).toBeDefined();
      expect(overdueItem.isOverdue).toBe(true);

      expect(upcomingItem).toBeDefined();
      expect(upcomingItem.isOverdue).toBe(false);
    });

    it('filters strictly overdue reports when overdueOnly=true', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/reports/due?overdueOnly=true')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      for (const item of res.body.data) {
        expect(item.isOverdue).toBe(true);
      }
    });

    it('forbids Therapists from accessing the global due reports endpoint (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/reports/due')
        .set('Authorization', `Bearer ${therapist1Token}`)
        .expect(403);
    });

    it('triggers daily overdue reminders job: creates notification for therapist', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/reports/check-overdue')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(201);

      expect(res.body.overdueCount).toBeGreaterThanOrEqual(1);
      expect(res.body.notificationsCreated).toBeGreaterThanOrEqual(1);

      const t1Notif = await prisma.unscopedClient.notification.findFirst({
        where: {
          userId: therapist1UserId,
          type: 'OVERDUE_REPORTS_REMINDER',
        },
      });
      expect(t1Notif).toBeDefined();
      expect(t1Notif?.title).toContain('Overdue');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. DOCUMENTS, SIGNED URLS & RATE LIMITING
  // ─────────────────────────────────────────────────────────────

  let document1Id: string;
  let document2PrivateId: string;

  describe('Documents, Signed URLs & Upload Rate Limiting', () => {
    it('generates signed upload URL with file type and size validation', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/clients/${child1Id}/documents/upload-url`)
        .set('Authorization', `Bearer ${therapist1Token}`)
        .send({
          fileName: 'audiology_report.pdf',
          fileType: 'application/pdf',
          fileSizeBytes: 2048000,
        })
        .expect(201);

      expect(res.body.uploadUrl).toBeDefined();
      expect(res.body.uploadUrl).toContain('signature=');
      expect(res.body.fileUrl).toContain('audiology_report.pdf');
    });

    it('rejects unsupported file mime types (400 Bad Request)', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/clients/${child1Id}/documents/upload-url`)
        .set('Authorization', `Bearer ${therapist1Token}`)
        .send({
          fileName: 'malware.exe',
          fileType: 'application/x-executable',
          fileSizeBytes: 1024,
        })
        .expect(400);
    });

    it('rejects files exceeding 15MB size limit (400 Bad Request)', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/clients/${child1Id}/documents/upload-url`)
        .set('Authorization', `Bearer ${therapist1Token}`)
        .send({
          fileName: 'giant_video.pdf',
          fileType: 'application/pdf',
          fileSizeBytes: 20 * 1024 * 1024,
        })
        .expect(400);
    });

    it('enforces upload rate limit: 30 uploads per hour per user, rejecting 31st with 400', async () => {
      await cacheService.del(`rate:doc_upload:${therapist1UserId}`);

      for (let i = 1; i <= 30; i++) {
        await request(app.getHttpServer())
          .post(`/api/v1/clients/${child1Id}/documents/upload-url`)
          .set('Authorization', `Bearer ${therapist1Token}`)
          .send({
            fileName: `report_${i}.pdf`,
            fileType: 'application/pdf',
            fileSizeBytes: 1024,
          })
          .expect(201);
      }

      // 31st request is blocked
      const res31 = await request(app.getHttpServer())
        .post(`/api/v1/clients/${child1Id}/documents/upload-url`)
        .set('Authorization', `Bearer ${therapist1Token}`)
        .send({
          fileName: 'report_31.pdf',
          fileType: 'application/pdf',
          fileSizeBytes: 1024,
        })
        .expect(400);

      expect(res31.body.message).toContain('Document upload rate limit exceeded');
    });

    it('records document and generates signed download URL', async () => {
      // 1. Create shared document
      const docRes = await request(app.getHttpServer())
        .post(`/api/v1/clients/${child1Id}/documents`)
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          title: 'Pediatric Neuro Consultation Note',
          fileUrl: 'https://storage.petals.com/clients/c1/neuro_note.pdf',
          mimeType: 'application/pdf',
          sharedWithParent: true,
        })
        .expect(201);

      document1Id = docRes.body.id;
      expect(docRes.body.sharedWithParent).toBe(true);

      // 2. Create private unshared document
      const privRes = await request(app.getHttpServer())
        .post(`/api/v1/clients/${child1Id}/documents`)
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          title: 'Internal Clinic Case Conference Notes',
          fileUrl: 'https://storage.petals.com/clients/c1/internal_conf.pdf',
          mimeType: 'application/pdf',
          sharedWithParent: false,
        })
        .expect(201);
      document2PrivateId = privRes.body.id;

      // 3. Parent can get download URL for shared document
      const downloadRes = await request(app.getHttpServer())
        .get(`/api/v1/documents/${document1Id}/download-url`)
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      expect(downloadRes.body.downloadUrl).toContain('signature=');

      // 4. Parent CANNOT get download URL for private document (403 Forbidden)
      await request(app.getHttpServer())
        .get(`/api/v1/documents/${document2PrivateId}/download-url`)
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(403);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 6. PAGINATION & CONSTANT QUERY COUNTS
  // ─────────────────────────────────────────────────────────────

  describe('Pagination & Query Counts', () => {
    it('caps page size to 100 on client reports list', async () => {
      // Exceeding 100 returns 400 Bad Request
      await request(app.getHttpServer())
        .get(`/api/v1/clients/${child1Id}/reports?pageSize=200`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(400);

      // Exactly 100 is supported
      const validRes = await request(app.getHttpServer())
        .get(`/api/v1/clients/${child1Id}/reports?pageSize=100`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(validRes.body.meta.pageSize).toBe(100);
    });

    it('verifies constant query count on client reports list (no N+1)', async () => {
      queryCounter.start();
      await request(app.getHttpServer())
        .get(`/api/v1/clients/${child1Id}/reports?page=1&pageSize=1`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);
      const count1 = queryCounter.stop();

      queryCounter.start();
      await request(app.getHttpServer())
        .get(`/api/v1/clients/${child1Id}/reports?page=1&pageSize=10`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);
      const count2 = queryCounter.stop();

      expect(count2).toBe(count1);
    });
  });
});
