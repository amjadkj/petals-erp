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
import { AppointmentStatus, ClientStatus, RoleKey } from '@petals/types';

describe('Appointments & Schedule Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cacheService: CacheService;
  let queryCounter: QueryCounter;

  let directorToken: string;
  let therapist1Token: string;
  let therapist2Token: string;
  let parent1Token: string;

  let branchId: string;
  let departmentId: string;
  let therapist1EmployeeId: string;
  let therapist2EmployeeId: string;
  let child1Id: string;
  let child2Id: string;
  let plan1Id: string;

  const defaultPassword = 'Password123!Secure';
  const directorPassword = 'ChangeMe123!';
  const therapist1Email = 'therapist1-p9@petals.com';
  const therapist2Email = 'therapist2-p9@petals.com';
  const parent1Email = 'parent1-p9@petals.com';

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

    // Clean up test data
    await prisma.unscopedClient.appointment.deleteMany({
      where: {
        client: { clientCode: { startsWith: 'P9' } },
      },
    });
    await prisma.unscopedClient.schedule.deleteMany({
      where: {
        plan: { client: { clientCode: { startsWith: 'P9' } } },
      },
    });
    await prisma.unscopedClient.treatmentPlan.deleteMany({
      where: {
        client: { clientCode: { startsWith: 'P9' } },
      },
    });
    await prisma.unscopedClient.clientGuardian.deleteMany({
      where: {
        client: { clientCode: { startsWith: 'P9' } },
      },
    });
    await prisma.unscopedClient.client.deleteMany({
      where: { clientCode: { startsWith: 'P9' } },
    });
    await prisma.unscopedClient.guardian.deleteMany({
      where: { user: { email: parent1Email } },
    });
    await prisma.unscopedClient.employee.deleteMany({
      where: { user: { email: { in: [therapist1Email, therapist2Email] } } },
    });
    await prisma.unscopedClient.user.deleteMany({
      where: { email: { in: [therapist1Email, therapist2Email, parent1Email] } },
    });
    await prisma.unscopedClient.holiday.deleteMany({
      where: { name: { startsWith: 'P9 Holiday' } },
    });

    // 1. Setup Branch & Department
    const branch = await prisma.unscopedClient.branch.upsert({
      where: { code: 'P9BRANCH' },
      update: {},
      create: {
        name: 'Phase 9 Branch',
        code: 'P9BRANCH',
        city: 'Calicut',
      },
    });
    branchId = branch.id;

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
    const therapistRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.THERAPIST },
    });

    // Ensure Therapist role permissions for appointments and schedules
    for (const mod of ['APPOINTMENTS', 'PROFILE_SESSIONS', 'SCHEDULE_PLANNING']) {
      await prisma.unscopedClient.roleModule.upsert({
        where: { roleId_module: { roleId: therapistRole.id, module: mod as any } },
        update: { enabled: true },
        create: { roleId: therapistRole.id, module: mod as any, enabled: true },
      });
      for (const act of ['CREATE', 'UPDATE', 'VIEW', 'DELETE']) {
        await prisma.unscopedClient.rolePermission.upsert({
          where: { roleId_module_action: { roleId: therapistRole.id, module: mod as any, action: act as any } },
          update: { allowed: true },
          create: { roleId: therapistRole.id, module: mod as any, action: act as any, allowed: true },
        });
      }
    }

    // 3. Create Therapist 1
    const t1User = await prisma.unscopedClient.user.create({
      data: {
        name: 'Therapist One P9',
        email: therapist1Email,
        passwordHash: hashedPassword,
        phone: '+919876509001',
        roleId: therapistRole.id,
        branches: { create: { branchId, isPrimary: true } },
      },
    });
    const t1Emp = await prisma.unscopedClient.employee.create({
      data: {
        userId: t1User.id,
        departmentId,
        employeeCode: 'EMP-P9-001',
        designation: 'Senior Occupational Therapist',
        salary: 45000,
        joinedOn: new Date('2025-01-01'),
      },
    });
    therapist1EmployeeId = t1Emp.id;

    // 4. Create Therapist 2
    const t2User = await prisma.unscopedClient.user.create({
      data: {
        name: 'Therapist Two P9',
        email: therapist2Email,
        passwordHash: hashedPassword,
        phone: '+919876509002',
        roleId: therapistRole.id,
        branches: { create: { branchId, isPrimary: true } },
      },
    });
    const t2Emp = await prisma.unscopedClient.employee.create({
      data: {
        userId: t2User.id,
        departmentId,
        employeeCode: 'EMP-P9-002',
        designation: 'Staff Occupational Therapist',
        salary: 40000,
        joinedOn: new Date('2025-02-01'),
      },
    });
    therapist2EmployeeId = t2Emp.id;

    // 5. Create Parent and Children
    const parentRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.PARENT },
    });

    for (const mod of ['APPOINTMENTS', 'PROFILE_SESSIONS']) {
      await prisma.unscopedClient.roleModule.upsert({
        where: { roleId_module: { roleId: parentRole.id, module: mod as any } },
        update: { enabled: true },
        create: { roleId: parentRole.id, module: mod as any, enabled: true },
      });
      await prisma.unscopedClient.rolePermission.upsert({
        where: { roleId_module_action: { roleId: parentRole.id, module: mod as any, action: 'VIEW' as any } },
        update: { allowed: true },
        create: { roleId: parentRole.id, module: mod as any, action: 'VIEW' as any, allowed: true },
      });
    }

    const pUser = await prisma.unscopedClient.user.create({
      data: {
        name: 'Parent P9',
        email: parent1Email,
        passwordHash: hashedPassword,
        phone: '+919876509003',
        roleId: parentRole.id,
        branches: { create: { branchId, isPrimary: true } },
      },
    });

    const guardian = await prisma.unscopedClient.guardian.create({
      data: {
        userId: pUser.id,
        name: 'Parent P9',
        whatsappNo: '+919876509003',
      },
    });

    const child1 = await prisma.unscopedClient.client.create({
      data: {
        branchId,
        clientCode: 'P9-CHI-001',
        name: 'Child One P9',
        dob: new Date('2019-01-01'),
        gender: 'MALE',
        status: ClientStatus.ACTIVE,
      },
    });
    child1Id = child1.id;

    await prisma.unscopedClient.clientGuardian.create({
      data: {
        clientId: child1Id,
        guardianId: guardian.id,
        relation: 'Mother',
        isPrimary: true,
      },
    });

    const child2 = await prisma.unscopedClient.client.create({
      data: {
        branchId,
        clientCode: 'P9-CHI-002',
        name: 'Child Two P9 (Unrelated)',
        dob: new Date('2020-02-02'),
        gender: 'FEMALE',
        status: ClientStatus.ACTIVE,
      },
    });
    child2Id = child2.id;

    // Treatment plan for Child 1
    const plan1 = await prisma.unscopedClient.treatmentPlan.create({
      data: {
        clientId: child1Id,
        departmentId,
        therapistId: therapist1EmployeeId,
        sessionsPerWeek: 2,
        feePerSession: 800,
        startDate: new Date('2026-03-01'),
      },
    });
    plan1Id = plan1.id;

    // Log in therapists and parent
    const t1Res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: therapist1Email, password: defaultPassword })
      .expect(200);
    therapist1Token = t1Res.body.accessToken;

    const t2Res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: therapist2Email, password: defaultPassword })
      .expect(200);
    therapist2Token = t2Res.body.accessToken;

    const pRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: parent1Email, password: defaultPassword })
      .expect(200);
    parent1Token = pRes.body.accessToken;
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.unscopedClient.appointment.deleteMany({
        where: {
          client: { clientCode: { startsWith: 'P9' } },
        },
      });
      await prisma.unscopedClient.schedule.deleteMany({
        where: {
          plan: { client: { clientCode: { startsWith: 'P9' } } },
        },
      });
      await prisma.unscopedClient.treatmentPlan.deleteMany({
        where: {
          client: { clientCode: { startsWith: 'P9' } },
        },
      });
      await prisma.unscopedClient.clientGuardian.deleteMany({
        where: {
          client: { clientCode: { startsWith: 'P9' } },
        },
      });
      await prisma.unscopedClient.client.deleteMany({
        where: { clientCode: { startsWith: 'P9' } },
      });
      await prisma.unscopedClient.guardian.deleteMany({
        where: { user: { email: parent1Email } },
      });
      await prisma.unscopedClient.employee.deleteMany({
        where: { user: { email: { in: [therapist1Email, therapist2Email] } } },
      });
      await prisma.unscopedClient.user.deleteMany({
        where: { email: { in: [therapist1Email, therapist2Email, parent1Email] } },
      });
      await prisma.unscopedClient.holiday.deleteMany({
        where: { name: { startsWith: 'P9 Holiday' } },
      });
    }
    await app.close();
  });

  describe('1. Conflict Detection (Therapist & Client Overlaps)', () => {
    let bookedApptId: string;

    it('creates initial appointment for Therapist 1 and Child 1', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          branchId,
          clientId: child1Id,
          therapistId: therapist1EmployeeId,
          startsAt: '2026-03-20T10:00:00.000Z',
          endsAt: '2026-03-20T10:45:00.000Z',
        })
        .expect(201);

      bookedApptId = res.body.id;
      expect(bookedApptId).toBeDefined();
    });

    it('rejects booking Therapist 1 for another client on overlapping time with 409 Conflict', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          branchId,
          clientId: child2Id,
          therapistId: therapist1EmployeeId,
          startsAt: '2026-03-20T10:30:00.000Z',
          endsAt: '2026-03-20T11:15:00.000Z',
        })
        .expect(409);

      expect(res.body.message).toContain('Therapist is already booked');
    });

    it('rejects booking Child 1 with another therapist on overlapping time with 409 Conflict', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          branchId,
          clientId: child1Id,
          therapistId: therapist2EmployeeId,
          startsAt: '2026-03-20T10:15:00.000Z',
          endsAt: '2026-03-20T11:00:00.000Z',
        })
        .expect(409);

      expect(res.body.message).toContain('Client already has an appointment booked');
    });

    it('allows booking non-overlapping adjacent appointment', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          branchId,
          clientId: child2Id,
          therapistId: therapist1EmployeeId,
          startsAt: '2026-03-20T10:45:00.000Z',
          endsAt: '2026-03-20T11:30:00.000Z',
        })
        .expect(201);
    });
  });

  describe('2. Recurrence Generation (Rolling Window Appointments)', () => {
    it('creates schedule and generates rolling window appointments', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/schedules')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          planId: plan1Id,
          recurrenceRule: 'FREQ=WEEKLY;BYDAY=TU,TH',
          startTime: '14:00',
          durationMinutes: 45,
          startsOn: '2026-04-01',
        })
        .expect(201);

      expect(res.body.schedule).toBeDefined();
      expect(res.body.generatedAppointmentsCount).toBeGreaterThan(0);
      expect(res.body.appointments.length).toBe(res.body.generatedAppointmentsCount);
    });
  });

  describe('3. Cancelled-Slot Visibility & Calendar Date Range', () => {
    let cancelApptId: string;

    beforeAll(async () => {
      const appt = await prisma.unscopedClient.appointment.create({
        data: {
          branchId,
          clientId: child1Id,
          therapistId: therapist1EmployeeId,
          startsAt: new Date('2026-03-22T09:00:00.000Z'),
          endsAt: new Date('2026-03-22T09:45:00.000Z'),
          status: AppointmentStatus.SCHEDULED,
        },
      });
      cancelApptId = appt.id;
    });

    it('cancels appointment with required reason and sends notifications', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/v1/appointments/${cancelApptId}/cancel`)
        .set('Authorization', `Bearer ${therapist1Token}`)
        .send({ reason: 'Child has viral fever' })
        .expect(200);

      expect(res.body.status).toBe(AppointmentStatus.CANCELLED);
      expect(res.body.cancelReason).toBe('Child has viral fever');
    });

    it('cancelled appointments remain visible in calendar queries', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/appointments?from=2026-03-20&to=2026-03-25')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      const found = res.body.find((a: any) => a.id === cancelApptId);
      expect(found).toBeDefined();
      expect(found.status).toBe(AppointmentStatus.CANCELLED);
      expect(found.cancelReason).toBe('Child has viral fever');
    });

    it('rejects calendar range exceeding 31 days with 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/appointments?from=2026-03-01&to=2026-04-15')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(400);
    });
  });

  describe('4. Daily Schedule Cache & Role Scoping', () => {
    const testDate = '2026-03-20';

    it('caches branch-day schedule and Director gets all rows', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/appointments/daily?date=${testDate}&branchId=${branchId}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(res.headers['cache-control']).toContain('no-store');
      expect(res.body.length).toBeGreaterThanOrEqual(2);

      // Verify fields in cached item
      const item = res.body[0];
      expect(item.clientDisplayName).toBeDefined();
      expect(item.therapistFirstName).toBeDefined();
      expect(item.startsAt).toBeDefined();
      expect(item.status).toBeDefined();
    });

    it('Therapist receives only their own appointments from the shared cached key', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/appointments/daily?date=${testDate}&branchId=${branchId}`)
        .set('Authorization', `Bearer ${therapist2Token}`)
        .expect(200);

      // Therapist 2 should see 0 appointments because only Therapist 1 was booked on this date
      expect(res.body.length).toBe(0);

      const resT1 = await request(app.getHttpServer())
        .get(`/api/v1/appointments/daily?date=${testDate}&branchId=${branchId}`)
        .set('Authorization', `Bearer ${therapist1Token}`)
        .expect(200);

      expect(resT1.body.length).toBeGreaterThan(0);
      for (const item of resT1.body) {
        expect(item.therapistId).toBe(therapist1EmployeeId);
      }
    });

    it('Parent receives only their own children appointments from the shared cached key', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/appointments/daily?date=${testDate}&branchId=${branchId}`)
        .set('Authorization', `Bearer ${parent1Token}`)
        .expect(200);

      for (const item of res.body) {
        expect(item.clientId).toBe(child1Id);
      }
    });
  });

  describe('5. Invalidation on Each Mutation & Redis Fallback', () => {
    let mutationApptId: string;
    const mutDate = '2026-03-25';

    beforeAll(async () => {
      const appt = await prisma.unscopedClient.appointment.create({
        data: {
          branchId,
          clientId: child1Id,
          therapistId: therapist1EmployeeId,
          startsAt: new Date(`${mutDate}T10:00:00.000Z`),
          endsAt: new Date(`${mutDate}T10:45:00.000Z`),
          status: AppointmentStatus.SCHEDULED,
        },
      });
      mutationApptId = appt.id;
    });

    it('invalidates cache on status change (e.g. mark ATTENDED)', async () => {
      // 1. Prime cache
      await request(app.getHttpServer())
        .get(`/api/v1/appointments/daily?date=${mutDate}&branchId=${branchId}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      // 2. Mark attended
      await request(app.getHttpServer())
        .put(`/api/v1/appointments/${mutationApptId}/status`)
        .set('Authorization', `Bearer ${therapist1Token}`)
        .send({ status: AppointmentStatus.ATTENDED })
        .expect(200);

      // 3. Daily schedule query reflects newly updated status
      const res = await request(app.getHttpServer())
        .get(`/api/v1/appointments/daily?date=${mutDate}&branchId=${branchId}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      const found = res.body.find((a: any) => a.id === mutationApptId);
      expect(found.status).toBe(AppointmentStatus.ATTENDED);
    });

    it('invalidates cache for both old and new date on reschedule', async () => {
      const newDate = '2026-03-26';

      await request(app.getHttpServer())
        .put(`/api/v1/appointments/${mutationApptId}/reschedule`)
        .set('Authorization', `Bearer ${therapist1Token}`)
        .send({
          startsAt: `${newDate}T11:00:00.000Z`,
          endsAt: `${newDate}T11:45:00.000Z`,
        })
        .expect(200);

      // Old date should not have this appointment anymore
      const oldRes = await request(app.getHttpServer())
        .get(`/api/v1/appointments/daily?date=${mutDate}&branchId=${branchId}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(oldRes.body.find((a: any) => a.id === mutationApptId)).toBeUndefined();

      // New date has the appointment
      const newRes = await request(app.getHttpServer())
        .get(`/api/v1/appointments/daily?date=${newDate}&branchId=${branchId}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(newRes.body.find((a: any) => a.id === mutationApptId)).toBeDefined();
    });

    it('falls back to database seamlessly if Redis is offline', async () => {
      jest.spyOn(cacheService, 'isReady').mockReturnValue(false);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/appointments/daily?date=2026-03-26&branchId=${branchId}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      jest.restoreAllMocks();
    });
  });

  describe('6. Query-Count Test for Weekly Calendar', () => {
    it('executes weekly calendar in constant low queries (<= 4 queries)', async () => {
      // 1. Warm-up request
      await request(app.getHttpServer())
        .get('/api/v1/appointments?from=2026-04-01&to=2026-04-20')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      // 2. Count queries
      queryCounter.start();
      const res = await request(app.getHttpServer())
        .get('/api/v1/appointments?from=2026-04-01&to=2026-04-20')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);
      const count = queryCounter.stop();

      expect(res.body.length).toBeGreaterThan(0);
      // Lean select for appointments + holidays + leave requests <= 4
      expect(count).toBeLessThanOrEqual(4);
    });
  });
});
