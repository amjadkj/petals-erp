import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule as AppMainModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/common/prisma';
import { CacheService } from '../src/common/redis';
import { hashPassword } from '../src/common/crypto';
import {
  RoleKey,
  AppointmentStatus,
  ClientStatus,
  LeadStage,
  PlanStatus,
} from '@petals/types';

describe('Dashboard Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cacheService: CacheService;

  let directorToken: string;
  let managerToken: string;
  let therapistToken: string;
  let parentToken: string;

  let therapistUserId: string;
  let therapistEmployeeId: string;
  let parentUserId: string;
  let clientId: string;

  let branchId: string;
  let branch2Id: string;

  const defaultPassword = 'Password123!Secure';
  const directorPassword = 'ChangeMe123!';
  const managerEmail = 'manager1-p15@petals.com';
  const therapistEmail = 'therapist1-p15@petals.com';
  const parentEmail = 'parent1-p15@petals.com';

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

    // Teardown previous test data
    await prisma.unscopedClient.appointment.deleteMany({
      where: {
        therapist: { employeeCode: { startsWith: 'P15' } },
      },
    });
    await prisma.unscopedClient.treatmentPlan.deleteMany({
      where: {
        therapist: { employeeCode: { startsWith: 'P15' } },
      },
    });
    await prisma.unscopedClient.clientGuardian.deleteMany({
      where: {
        guardian: { user: { email: parentEmail } },
      },
    });
    await prisma.unscopedClient.guardian.deleteMany({
      where: {
        user: { email: parentEmail },
      },
    });
    await prisma.unscopedClient.employee.deleteMany({
      where: { employeeCode: { startsWith: 'P15' } },
    });
    await prisma.unscopedClient.lead.deleteMany({
      where: { name: { startsWith: 'P15' } },
    });
    await prisma.unscopedClient.client.deleteMany({
      where: { clientCode: { startsWith: 'P15' } },
    });
    await prisma.unscopedClient.user.deleteMany({
      where: { email: { in: [managerEmail, therapistEmail, parentEmail] } },
    });

    // 1. Get Branches
    const branches = await prisma.unscopedClient.branch.findMany({
      where: { isActive: true },
      take: 2,
    });
    branchId = branches[0].id;
    branch2Id = branches[1]?.id || branches[0].id;

    // 2. Fetch Director
    const directorUser = await prisma.unscopedClient.user.findFirst({
      where: { role: { key: RoleKey.DIRECTOR }, isActive: true },
    });
    if (!directorUser) throw new Error('Director user not seeded');

    const directorLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: directorUser.email, password: directorPassword });
    directorToken = directorLogin.body.accessToken;

    const pwdHash = await hashPassword(defaultPassword);

    // 3. Create Manager User
    const managerRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.MANAGER },
    });
    await prisma.unscopedClient.user.create({
      data: {
        email: managerEmail,
        passwordHash: pwdHash,
        roleId: managerRole.id,
        name: 'P15 Manager',
        branches: {
          create: [{ branchId, isPrimary: true }],
        },
      },
    });

    const managerLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: managerEmail, password: defaultPassword });
    managerToken = managerLogin.body.accessToken;

    // 4. Create Therapist User & Employee Profile
    const therapistRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.THERAPIST },
    });
    const dept = await prisma.unscopedClient.department.findFirstOrThrow();

    const therapistUser = await prisma.unscopedClient.user.create({
      data: {
        email: therapistEmail,
        passwordHash: pwdHash,
        roleId: therapistRole.id,
        name: 'P15 Therapist',
        branches: {
          create: [{ branchId, isPrimary: true }],
        },
      },
    });
    therapistUserId = therapistUser.id;

    const therapistEmp = await prisma.unscopedClient.employee.create({
      data: {
        userId: therapistUserId,
        departmentId: dept.id,
        employeeCode: 'P15-EMP-01',
        designation: 'Clinical Specialist',
        joinedOn: new Date('2026-01-01'),
      },
    });
    therapistEmployeeId = therapistEmp.id;

    const therapistLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: therapistEmail, password: defaultPassword });
    therapistToken = therapistLogin.body.accessToken;

    // 5. Create Parent User & Linked Child Client
    const parentRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.PARENT },
    });
    const parentUser = await prisma.unscopedClient.user.create({
      data: {
        email: parentEmail,
        passwordHash: pwdHash,
        roleId: parentRole.id,
        name: 'P15 Parent',
        branches: {
          create: [{ branchId, isPrimary: true }],
        },
      },
    });
    parentUserId = parentUser.id;

    const parentGuardian = await prisma.unscopedClient.guardian.create({
      data: {
        userId: parentUserId,
        name: 'P15 Parent Guardian',
      },
    });

    const client = await prisma.unscopedClient.client.create({
      data: {
        branchId,
        clientCode: 'P15-CLI-01',
        name: 'P15 Junior Client',
        dob: new Date('2020-05-15'),
        status: ClientStatus.ACTIVE,
      },
    });
    clientId = client.id;

    await prisma.unscopedClient.clientGuardian.create({
      data: {
        clientId,
        guardianId: parentGuardian.id,
        relation: 'Mother',
        isPrimary: true,
      },
    });

    const parentLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: parentEmail, password: defaultPassword });
    parentToken = parentLogin.body.accessToken;

    // 6. Seed Operational Data
    // Active treatment plan
    await prisma.unscopedClient.treatmentPlan.create({
      data: {
        clientId,
        departmentId: dept.id,
        therapistId: therapistEmployeeId,
        sessionsPerWeek: 2,
        sessionMinutes: 45,
        feePerSession: 800,
        startDate: new Date('2026-01-01'),
        status: PlanStatus.ACTIVE,
      },
    });

    // Today's appointments (one attended, one scheduled)
    const today = new Date();
    const todayStartsAt1 = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 10, 0, 0));
    const todayEndsAt1 = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 10, 45, 0));

    await prisma.unscopedClient.appointment.create({
      data: {
        branchId,
        clientId,
        therapistId: therapistEmployeeId,
        startsAt: todayStartsAt1,
        endsAt: todayEndsAt1,
        status: AppointmentStatus.ATTENDED,
      },
    });

    const todayStartsAt2 = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 14, 0, 0));
    const todayEndsAt2 = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 14, 45, 0));

    await prisma.unscopedClient.appointment.create({
      data: {
        branchId,
        clientId,
        therapistId: therapistEmployeeId,
        startsAt: todayStartsAt2,
        endsAt: todayEndsAt2,
        status: AppointmentStatus.SCHEDULED,
      },
    });

    // Lead
    await prisma.unscopedClient.lead.create({
      data: {
        branchId,
        name: 'P15 New Lead Child',
        contact: '+919999900015',
        stage: LeadStage.NEW,
      },
    });
  });

  afterAll(async () => {
    // Teardown
    await prisma.unscopedClient.appointment.deleteMany({
      where: {
        therapist: { employeeCode: { startsWith: 'P15' } },
      },
    });
    await prisma.unscopedClient.treatmentPlan.deleteMany({
      where: {
        therapist: { employeeCode: { startsWith: 'P15' } },
      },
    });
    await prisma.unscopedClient.clientGuardian.deleteMany({
      where: {
        guardian: { user: { email: parentEmail } },
      },
    });
    await prisma.unscopedClient.guardian.deleteMany({
      where: {
        user: { email: parentEmail },
      },
    });
    await prisma.unscopedClient.employee.deleteMany({
      where: { employeeCode: { startsWith: 'P15' } },
    });
    await prisma.unscopedClient.lead.deleteMany({
      where: { name: { startsWith: 'P15' } },
    });
    await prisma.unscopedClient.client.deleteMany({
      where: { clientCode: { startsWith: 'P15' } },
    });
    await prisma.unscopedClient.user.deleteMany({
      where: { email: { in: [managerEmail, therapistEmail, parentEmail] } },
    });

    await app.close();
  });

  // ─────────────────────────────────────────────────────────────
  // 1. DIRECTOR DASHBOARD
  // ─────────────────────────────────────────────────────────────

  describe('Director Dashboard', () => {
    it('GET /dashboard returns operational and financial widgets, no-store header, and caches result', async () => {
      // Invalidate existing cache
      await cacheService.del('dashboard:branch:all:director');

      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${directorToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['cache-control']).toContain('no-store');

      expect(res.body.role).toBe(RoleKey.DIRECTOR);
      expect(res.body.todaySessions).toBeDefined();
      expect(res.body.todaySessions.attended).toBeGreaterThanOrEqual(1);
      expect(res.body.todaySessions.scheduled).toBeGreaterThanOrEqual(1);
      expect(res.body.revenue).toBeDefined();
      expect(typeof res.body.revenue.today).toBe('number');
      expect(res.body.pendingPayments).toBeDefined();
      expect(typeof res.body.pendingPayments.count).toBe('number');
      expect(res.body.leads.recent.length).toBeLessThanOrEqual(10);
      expect(res.body.leads.link).toBe('/api/v1/leads');

      // Verify cached key exists in Redis / cacheService
      const inCache = await cacheService.get<any>('dashboard:branch:all:director');
      expect(inCache).not.toBeNull();
      expect(inCache.role).toBe(RoleKey.DIRECTOR);
      expect(inCache.todaySessions).toBeDefined();

      // Verify second call hits cache
      const cachedRes = await request(app.getHttpServer())
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${directorToken}`);

      expect(cachedRes.status).toBe(200);
      expect(cachedRes.body.role).toBe(RoleKey.DIRECTOR);
      expect(cachedRes.body.branchId).toBe('all');
    });

    it('GET /dashboard?branchId=... filters Director dashboard by branch', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/dashboard?branchId=${branchId}`)
        .set('Authorization', `Bearer ${directorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.branchId).toBe(branchId);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. MANAGER DASHBOARD (OPERATIONAL VIEW WITHOUT P&L)
  // ─────────────────────────────────────────────────────────────

  describe('Manager Dashboard', () => {
    it('GET /dashboard returns operational widgets WITHOUT revenue or P&L details', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['cache-control']).toContain('no-store');
      expect(res.body.role).toBe(RoleKey.MANAGER);
      expect(res.body.branchId).toBe(branchId);
      expect(res.body.todaySessions).toBeDefined();
      expect(res.body.activeClients).toBeGreaterThanOrEqual(1);
      expect(res.body.pendingPaymentsCount).toBeDefined();

      // STRICT CHECK: Revenue and P&L must be absent
      expect(res.body.revenue).toBeUndefined();
      expect(res.body.pendingPayments).toBeUndefined();
      expect(res.body.pnl).toBeUndefined();
    });

    it('GET /dashboard?branchId=... rejects unassigned branch with 403 Forbidden', async () => {
      if (branch2Id !== branchId) {
        const res = await request(app.getHttpServer())
          .get(`/api/v1/dashboard?branchId=${branch2Id}`)
          .set('Authorization', `Bearer ${managerToken}`);

        expect(res.status).toBe(403);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. THERAPIST DASHBOARD
  // ─────────────────────────────────────────────────────────────

  describe('Therapist Dashboard', () => {
    it('GET /dashboard returns assigned clients, today schedule and pending reports', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${therapistToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['cache-control']).toContain('no-store');
      expect(res.body.role).toBe(RoleKey.THERAPIST);
      expect(res.body.totalClients).toBeGreaterThanOrEqual(1);
      expect(res.body.todayScheduleCount).toBeGreaterThanOrEqual(2);
      expect(res.body.todaySessions.length).toBeLessThanOrEqual(10);
      expect(res.body.pendingReports.link).toBe('/api/v1/reports');

      // STRICT: Therapist has no revenue or global branch metrics
      expect(res.body.revenue).toBeUndefined();
      expect(res.body.staffPresent).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. PARENT DASHBOARD
  // ─────────────────────────────────────────────────────────────

  describe('Parent Dashboard', () => {
    it('GET /dashboard returns children sessions only and no clinical management metrics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['cache-control']).toContain('no-store');
      expect(res.body.role).toBe(RoleKey.PARENT);
      expect(res.body.children.length).toBe(1);
      expect(res.body.children[0].id).toBe(clientId);
      expect(res.body.totalSessions).toBeGreaterThanOrEqual(1);
      expect(res.body.todaySessions.length).toBeGreaterThanOrEqual(1);

      // STRICT: Parent has no staff present, leads, revenue, or other children data
      expect(res.body.revenue).toBeUndefined();
      expect(res.body.staffPresent).toBeUndefined();
      expect(res.body.leads).toBeUndefined();
    });
  });
});

