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
  LeaveType,
  LeaveStatus,
  AppointmentStatus,
  ReportType,
  ReportStatus,
} from '@petals/types';

describe('HR Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cacheService: CacheService;
  let queryCounter: QueryCounter;

  let directorToken: string;
  let managerToken: string;
  let therapistToken: string;

  let directorUserId: string;
  let managerUserId: string;
  let therapistUserId: string;
  let therapistEmployeeId: string;

  let branchId: string;
  let branch2Id: string;

  const defaultPassword = 'Password123!Secure';
  const directorPassword = 'ChangeMe123!';
  const managerEmail = 'manager1-p14@petals.com';
  const therapistEmail = 'therapist1-p14@petals.com';

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
    await prisma.unscopedClient.attendanceRecord.deleteMany({
      where: {
        employee: { employeeCode: { startsWith: 'P14' } },
      },
    });
    await prisma.unscopedClient.leaveRequest.deleteMany({
      where: {
        employee: { employeeCode: { startsWith: 'P14' } },
      },
    });
    await prisma.unscopedClient.holiday.deleteMany({
      where: {
        name: { startsWith: 'P14' },
      },
    });
    await prisma.unscopedClient.appointment.deleteMany({
      where: {
        therapist: { employeeCode: { startsWith: 'P14' } },
      },
    });
    await prisma.unscopedClient.progressEntry.deleteMany({
      where: {
        author: { employeeCode: { startsWith: 'P14' } },
      },
    });
    await prisma.unscopedClient.report.deleteMany({
      where: {
        author: { employeeCode: { startsWith: 'P14' } },
      },
    });
    await prisma.unscopedClient.employee.deleteMany({
      where: { employeeCode: { startsWith: 'P14' } },
    });
    await prisma.unscopedClient.user.deleteMany({
      where: { email: { in: [managerEmail, therapistEmail] } },
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
    directorUserId = directorUser.id;

    // Reset director away status
    await prisma.unscopedClient.user.update({
      where: { id: directorUserId },
      data: { awayUntil: null },
    });

    const directorLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: directorUser.email, password: directorPassword });
    directorToken = directorLogin.body.accessToken;

    // 3. Create Manager User
    const managerRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.MANAGER },
    });
    const pwdHash = await hashPassword(defaultPassword);

    const managerUser = await prisma.unscopedClient.user.create({
      data: {
        email: managerEmail,
        passwordHash: pwdHash,
        roleId: managerRole.id,
        name: 'P14 Manager',
        branches: {
          create: [{ branchId, isPrimary: true }],
        },
      },
    });
    managerUserId = managerUser.id;

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
        name: 'P14 Therapist',
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
        employeeCode: 'P14-EMP-01',
        designation: 'Staff Therapist',
        joinedOn: new Date('2026-01-01'),
      },
    });
    therapistEmployeeId = therapistEmp.id;

    const therapistLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: therapistEmail, password: defaultPassword });
    therapistToken = therapistLogin.body.accessToken;

    // 5. Seed clinical data & report for Director detail tests
    const client = await prisma.unscopedClient.client.findFirstOrThrow({
      where: { branchId },
    });

    const goal = await prisma.unscopedClient.goal.findFirst({
      include: { subgoals: true },
    });

    if (goal && goal.subgoals.length > 0) {
      await prisma.unscopedClient.progressEntry.create({
        data: {
          subgoalId: goal.subgoals[0].id,
          authorId: therapistEmployeeId,
          entryDate: new Date('2026-11-10T00:00:00.000Z'),
          description: 'P14 Fine motor practice',
          response: 'Positive response',
          remarks: 'Maintain current exercises',
        },
      });
    }

    await prisma.unscopedClient.report.create({
      data: {
        clientId: client.id,
        authorId: therapistEmployeeId,
        type: ReportType.PROGRESS,
        title: 'P14 Monthly Evaluation',
        status: ReportStatus.SUBMITTED,
        dueOn: new Date('2026-11-15T00:00:00.000Z'),
        submittedAt: new Date('2026-11-14T00:00:00.000Z'),
      },
    });

    // Audit log entry for therapist
    await prisma.unscopedClient.auditLog.create({
      data: {
        userId: therapistUserId,
        action: 'CREATE_PROGRESS_ENTRY',
        entity: 'ProgressEntry',
        metadata: { note: 'Initial test entry' },
      },
    });
  });

  afterAll(async () => {
    // Teardown
    await prisma.unscopedClient.attendanceRecord.deleteMany({
      where: {
        employee: { employeeCode: { startsWith: 'P14' } },
      },
    });
    await prisma.unscopedClient.leaveRequest.deleteMany({
      where: {
        employee: { employeeCode: { startsWith: 'P14' } },
      },
    });
    await prisma.unscopedClient.holiday.deleteMany({
      where: {
        name: { startsWith: 'P14' },
      },
    });
    await prisma.unscopedClient.appointment.deleteMany({
      where: {
        therapist: { employeeCode: { startsWith: 'P14' } },
      },
    });
    await prisma.unscopedClient.progressEntry.deleteMany({
      where: {
        author: { employeeCode: { startsWith: 'P14' } },
      },
    });
    await prisma.unscopedClient.report.deleteMany({
      where: {
        author: { employeeCode: { startsWith: 'P14' } },
      },
    });
    await prisma.unscopedClient.employee.deleteMany({
      where: { employeeCode: { startsWith: 'P14' } },
    });
    await prisma.unscopedClient.user.deleteMany({
      where: { email: { in: [managerEmail, therapistEmail] } },
    });

    await app.close();
  });

  // ─────────────────────────────────────────────────────────────
  // 1. ATTENDANCE (CHECK-IN / OUT / DAILY & MONTHLY VIEWS)
  // ─────────────────────────────────────────────────────────────

  describe('Attendance Endpoints', () => {
    it('POST /hr/attendance/check-in allows therapist to check in for today', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/hr/attendance/check-in')
        .set('Authorization', `Bearer ${therapistToken}`)
        .send({
          branchId,
          workDate: '2026-11-11',
          checkIn: '2026-11-11T09:00:00.000Z',
        });

      expect(res.status).toBe(201);
      expect(res.body.employeeId).toBe(therapistEmployeeId);
      expect(res.body.checkIn).toBeDefined();
    });

    it('POST /hr/attendance/check-out allows therapist to check out', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/hr/attendance/check-out')
        .set('Authorization', `Bearer ${therapistToken}`)
        .send({
          workDate: '2026-11-11',
          checkOut: '2026-11-11T17:00:00.000Z',
        });

      expect(res.status).toBe(201);
      expect(res.body.checkOut).toBeDefined();
    });

    it('GET /hr/attendance/daily enforces role-based visibility and no-store header', async () => {
      // 1. Therapist sees their own record
      const therRes = await request(app.getHttpServer())
        .get(`/api/v1/hr/attendance/daily?branchId=${branchId}&date=2026-11-11`)
        .set('Authorization', `Bearer ${therapistToken}`);

      expect(therRes.status).toBe(200);
      expect(therRes.headers['cache-control']).toContain('no-store');
      expect(Array.isArray(therRes.body)).toBe(true);
      expect(therRes.body.length).toBe(1);
      expect(therRes.body[0].employeeId).toBe(therapistEmployeeId);

      // 2. Manager sees staff in assigned branch
      const mgrRes = await request(app.getHttpServer())
        .get(`/api/v1/hr/attendance/daily?branchId=${branchId}&date=2026-11-11`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(mgrRes.status).toBe(200);
      expect(mgrRes.body.some((r: any) => r.employeeId === therapistEmployeeId)).toBe(true);
    });

    it('GET /hr/attendance/monthly retrieves grid in ONE aggregate query (query counts verified)', async () => {
      // Create a 2nd attendance record for therapist
      await prisma.unscopedClient.attendanceRecord.create({
        data: {
          employeeId: therapistEmployeeId,
          branchId,
          workDate: new Date('2026-11-12T00:00:00.000Z'),
          checkIn: new Date('2026-11-12T09:15:00.000Z'),
          checkOut: new Date('2026-11-12T17:30:00.000Z'),
        },
      });

      queryCounter.start();
      const result = await request(app.getHttpServer())
        .get(`/api/v1/hr/attendance/monthly?branchId=${branchId}&year=2026&month=11`)
        .set('Authorization', `Bearer ${directorToken}`);
      const queryCount = queryCounter.stop();

      expect(result.status).toBe(200);
      expect(result.body.totalEmployees).toBeGreaterThanOrEqual(1);

      const empEntry = result.body.employees.find(
        (e: any) => e.employeeId === therapistEmployeeId,
      );
      expect(empEntry).toBeDefined();
      expect(empEntry.daysPresent).toBeGreaterThanOrEqual(2);
      expect(empEntry.days['2026-11-11'].present).toBe(true);

      // Verify strict aggregate query efficiency (single aggregate query for records + auth session <= 4)
      expect(queryCount).toBeLessThanOrEqual(4);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. HOLIDAYS
  // ─────────────────────────────────────────────────────────────

  describe('Holiday Management', () => {
    let holidayId: string;

    it('POST /hr/holidays creates holiday for branch', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/hr/holidays')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          branchId,
          date: '2026-12-25',
          name: 'P14 Christmas Day',
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('P14 Christmas Day');
      holidayId = res.body.id;
    });

    it('POST /hr/holidays forbids manager from creating holiday in unassigned branch', async () => {
      if (branch2Id !== branchId) {
        const res = await request(app.getHttpServer())
          .post('/api/v1/hr/holidays')
          .set('Authorization', `Bearer ${managerToken}`)
          .send({
            branchId: branch2Id,
            date: '2026-12-26',
            name: 'P14 Boxing Day',
          });

        expect(res.status).toBe(403);
      }
    });

    it('GET /hr/holidays lists holidays', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/hr/holidays?branchId=${branchId}&year=2026`)
        .set('Authorization', `Bearer ${therapistToken}`);

      expect(res.status).toBe(200);
      expect(res.body.some((h: any) => h.id === holidayId)).toBe(true);
    });

    it('DELETE /hr/holidays/:id deletes holiday', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/hr/holidays/${holidayId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. LEAVE APPLICATION & BACKUP APPROVAL WORKFLOW
  // ─────────────────────────────────────────────────────────────

  describe('Leave Flow & Backup Approval Rules', () => {
    let leaveId: string;

    it('POST /hr/leaves allows therapist to apply for leave (validates fromDate <= toDate)', async () => {
      // Invalid dates test
      const badRes = await request(app.getHttpServer())
        .post('/api/v1/hr/leaves')
        .set('Authorization', `Bearer ${therapistToken}`)
        .send({
          leaveType: LeaveType.CASUAL,
          fromDate: '2026-11-25',
          toDate: '2026-11-20',
          reason: 'Typo in dates',
        });
      expect(badRes.status).toBe(400);

      // Valid application
      const res = await request(app.getHttpServer())
        .post('/api/v1/hr/leaves')
        .set('Authorization', `Bearer ${therapistToken}`)
        .send({
          leaveType: LeaveType.CASUAL,
          fromDate: '2026-11-20',
          toDate: '2026-11-22',
          reason: 'Personal leave',
        });

      expect(res.status).toBe(201);
      expect(res.body.employeeId).toBe(therapistEmployeeId);
      expect(res.body.status).toBe(LeaveStatus.PENDING);
      leaveId = res.body.id;
    });

    it('GET /hr/leaves lists leaves scoped by role (therapist sees own, manager sees branch)', async () => {
      const therRes = await request(app.getHttpServer())
        .get('/api/v1/hr/leaves')
        .set('Authorization', `Bearer ${therapistToken}`);

      expect(therRes.status).toBe(200);
      expect(therRes.body.data.every((l: any) => l.employeeId === therapistEmployeeId)).toBe(true);
    });

    it('POST /hr/leaves/:id/approve by Manager is FORBIDDEN when Director is available', async () => {
      // Ensure director is marked available
      await prisma.unscopedClient.user.update({
        where: { id: directorUserId },
        data: { awayUntil: null },
      });

      const res = await request(app.getHttpServer())
        .post(`/api/v1/hr/leaves/${leaveId}/approve`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ decisionNote: 'Manager trying to approve' });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Director is currently available; backup approval not permitted');
    });

    it('POST /hr/leaves/:id/approve by Manager SUCCEEDS as backupApproval when Director is marked away', async () => {
      // Set director as away until next week
      const futureAway = new Date();
      futureAway.setDate(futureAway.getDate() + 7);

      const availRes = await request(app.getHttpServer())
        .post('/api/v1/hr/director/availability')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({ awayUntil: futureAway.toISOString() });

      expect(availRes.status).toBe(201);
      expect(availRes.body.awayUntil).toBeDefined();

      // Seed appointment on 2026-11-21 to test conflict flagging
      const client = await prisma.unscopedClient.client.findFirstOrThrow({
        where: { branchId },
      });

      await prisma.unscopedClient.appointment.create({
        data: {
          branchId,
          clientId: client.id,
          therapistId: therapistEmployeeId,
          startsAt: new Date('2026-11-21T10:00:00.000Z'),
          endsAt: new Date('2026-11-21T10:45:00.000Z'),
          status: AppointmentStatus.SCHEDULED,
        },
      });

      // Warm cache key for 2026-11-21 to test invalidation
      const cacheKey = `schedule:${branchId}:2026-11-21`;
      await cacheService.set(cacheKey, [{ dummy: true }], 3600);
      expect(await cacheService.get(cacheKey)).not.toBeNull();

      // Manager approves as backup
      const approveRes = await request(app.getHttpServer())
        .post(`/api/v1/hr/leaves/${leaveId}/approve`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ decisionNote: 'Approved as backup while Director is away' });

      expect(approveRes.status).toBe(201);
      expect(approveRes.body.backupApproval).toBe(true);
      expect(approveRes.body.leave.status).toBe(LeaveStatus.APPROVED);
      expect(approveRes.body.leave.decidedById).toBe(managerUserId);

      // Verify conflicting appointment was flagged
      expect(approveRes.body.conflictingAppointmentsCount).toBeGreaterThanOrEqual(1);

      // Verify daily schedule cache key was invalidated
      const cacheAfter = await cacheService.get(cacheKey);
      expect(cacheAfter).toBeNull();
    });

    it('Director direct approval and rejection workflows', async () => {
      // Apply 2nd leave
      const leave2Res = await request(app.getHttpServer())
        .post('/api/v1/hr/leaves')
        .set('Authorization', `Bearer ${therapistToken}`)
        .send({
          leaveType: LeaveType.SICK,
          fromDate: '2026-11-28',
          toDate: '2026-11-28',
          reason: 'Fever',
        });
      const leave2Id = leave2Res.body.id;

      // Director approves directly
      const approveRes = await request(app.getHttpServer())
        .post(`/api/v1/hr/leaves/${leave2Id}/approve`)
        .set('Authorization', `Bearer ${directorToken}`)
        .send({ decisionNote: 'Approved directly by Director' });

      expect(approveRes.status).toBe(201);
      expect(approveRes.body.backupApproval).toBe(false);
      expect(approveRes.body.leave.status).toBe(LeaveStatus.APPROVED);

      // Apply 3rd leave and reject
      const leave3Res = await request(app.getHttpServer())
        .post('/api/v1/hr/leaves')
        .set('Authorization', `Bearer ${therapistToken}`)
        .send({
          leaveType: LeaveType.CASUAL,
          fromDate: '2026-11-29',
          toDate: '2026-11-29',
          reason: 'Personal',
        });
      const leave3Id = leave3Res.body.id;

      const rejectRes = await request(app.getHttpServer())
        .post(`/api/v1/hr/leaves/${leave3Id}/reject`)
        .set('Authorization', `Bearer ${directorToken}`)
        .send({ decisionNote: 'Critical therapy session scheduled' });

      expect(rejectRes.status).toBe(201);
      expect(rejectRes.body.status).toBe(LeaveStatus.REJECTED);
      expect(rejectRes.body.decisionNote).toBe('Critical therapy session scheduled');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. EMPLOYEE DETAIL ENDPOINTS FOR DIRECTOR
  // ─────────────────────────────────────────────────────────────

  describe('Employee Detail Endpoints (Director)', () => {
    it('GET /hr/employees/:id/summary returns metrics for Director and rejects Manager with 403', async () => {
      // 1. Manager is forbidden
      const mgrRes = await request(app.getHttpServer())
        .get(`/api/v1/hr/employees/${therapistEmployeeId}/summary`)
        .set('Authorization', `Bearer ${managerToken}`);
      expect(mgrRes.status).toBe(403);

      // 2. Director retrieves summary
      const dirRes = await request(app.getHttpServer())
        .get(`/api/v1/hr/employees/${therapistEmployeeId}/summary`)
        .set('Authorization', `Bearer ${directorToken}`);

      expect(dirRes.status).toBe(200);
      expect(dirRes.body.employee.employeeCode).toBe('P14-EMP-01');
      expect(dirRes.body.reportsSubmitted).toBeGreaterThanOrEqual(1);
      expect(dirRes.body.onTimeReportRate).toBeGreaterThanOrEqual(0);
    });

    it('GET /hr/employees/:id/goals returns paginated goals/sub-goals entries', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/hr/employees/${therapistEmployeeId}/goals?page=1&pageSize=10`)
        .set('Authorization', `Bearer ${directorToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['cache-control']).toContain('no-store');
      expect(res.body.data).toBeDefined();
      expect(res.body.meta).toBeDefined();
    });

    it('GET /hr/employees/:id/activity-log returns cursor-paginated activity log', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/hr/employees/${therapistEmployeeId}/activity-log?limit=10`)
        .set('Authorization', `Bearer ${directorToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['cache-control']).toContain('no-store');
      expect(res.body.data).toBeDefined();
      expect(res.body.meta).toBeDefined();
    });
  });
});

