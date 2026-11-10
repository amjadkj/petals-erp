import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule as AppMainModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/common/prisma';
import { QueryCounter } from '../src/common/testing/query-count.helper';
import { hashPassword } from '../src/common/crypto';
import { AppointmentStatus, ClientStatus, RoleKey } from '@petals/types';

describe('Client and Guardian Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let queryCounter: QueryCounter;

  let directorToken: string;
  let managerToken: string;
  let therapistToken: string;
  let parent1Token: string;
  let parent2Token: string;

  let branchAlphaId: string;
  let branchBetaId: string;
  let departmentId: string;
  let therapistEmployeeId: string;

  let child1Id: string;
  let child2Id: string;
  let child3Id: string;
  let parent1UserId: string;
  let parent2UserId: string;

  const defaultPassword = 'Password123!Secure';
  const directorPassword = 'ChangeMe123!';
  const managerEmail = 'manager-p7@petals.com';
  const therapistEmail = 'therapist-p7@petals.com';
  const parent1Email = 'parent1-p7@petals.com';
  const parent2Email = 'parent2-p7@petals.com';

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
    queryCounter = new QueryCounter(app);

    // Clean up test data
    await prisma.unscopedClient.clientGuardian.deleteMany({
      where: {
        client: {
          clientCode: { startsWith: 'P7' },
        },
      },
    });
    await prisma.unscopedClient.appointment.deleteMany({
      where: {
        client: {
          clientCode: { startsWith: 'P7' },
        },
      },
    });
    await prisma.unscopedClient.treatmentPlan.deleteMany({
      where: {
        client: {
          clientCode: { startsWith: 'P7' },
        },
      },
    });
    await prisma.unscopedClient.client.deleteMany({
      where: {
        clientCode: { startsWith: 'P7' },
      },
    });
    await prisma.unscopedClient.guardian.deleteMany({
      where: {
        user: { email: { in: [parent1Email, parent2Email] } },
      },
    });
    await prisma.unscopedClient.employee.deleteMany({
      where: {
        user: { email: { in: [therapistEmail, managerEmail] } },
      },
    });
    await prisma.unscopedClient.user.deleteMany({
      where: {
        email: {
          in: [managerEmail, therapistEmail, parent1Email, parent2Email],
        },
      },
    });

    // 1. Setup Branches
    const branchAlpha = await prisma.unscopedClient.branch.upsert({
      where: { code: 'P7ALPHA' },
      update: {},
      create: {
        name: 'Phase 7 Alpha Branch',
        code: 'P7ALPHA',
        city: 'Bangalore',
        address: '123 Alpha Way',
        phone: '+919876500001',
      },
    });
    branchAlphaId = branchAlpha.id;

    const branchBeta = await prisma.unscopedClient.branch.upsert({
      where: { code: 'P7BETA' },
      update: {},
      create: {
        name: 'Phase 7 Beta Branch',
        code: 'P7BETA',
        city: 'Mysore',
        address: '456 Beta Road',
        phone: '+919876500002',
      },
    });
    branchBetaId = branchBeta.id;

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

    // 3. Create Manager (assigned to Branch Alpha only)
    const managerRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.MANAGER },
    });
    const hashedPassword = await hashPassword(defaultPassword);

    await prisma.unscopedClient.user.create({
      data: {
        name: 'Manager Phase 7',
        email: managerEmail,
        passwordHash: hashedPassword,
        phone: '+919876500011',
        roleId: managerRole.id,
        branches: { create: { branchId: branchAlphaId, isPrimary: true } },
      },
    });

    const mgrRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: managerEmail, password: defaultPassword })
      .expect(200);
    managerToken = mgrRes.body.accessToken;

    // 4. Create Therapist (assigned to Branch Alpha)
    const therapistRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.THERAPIST },
    });

    const therapistUser = await prisma.unscopedClient.user.create({
      data: {
        name: 'Therapist Phase 7',
        email: therapistEmail,
        passwordHash: hashedPassword,
        phone: '+919876500012',
        roleId: therapistRole.id,
        branches: { create: { branchId: branchAlphaId, isPrimary: true } },
      },
    });

    const therapistEmp = await prisma.unscopedClient.employee.create({
      data: {
        userId: therapistUser.id,
        departmentId,
        employeeCode: 'EMP-P7-001',
        designation: 'Senior Occupational Therapist',
        salary: 45000,
        joinedOn: new Date('2025-01-01'),
      },
    });
    therapistEmployeeId = therapistEmp.id;

    const therRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: therapistEmail, password: defaultPassword })
      .expect(200);
    therapistToken = therRes.body.accessToken;

    // 5. Create Parent 1 with 2 Children (Child 1 & Child 2) in Branch Alpha
    const parentRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.PARENT },
    });

    // Ensure Parent has CLIENTS:VIEW permission
    await prisma.unscopedClient.roleModule.upsert({
      where: {
        roleId_module: {
          roleId: parentRole.id,
          module: 'CLIENTS',
        },
      },
      update: { enabled: true },
      create: {
        roleId: parentRole.id,
        module: 'CLIENTS',
        enabled: true,
      },
    });
    await prisma.unscopedClient.rolePermission.upsert({
      where: {
        roleId_module_action: {
          roleId: parentRole.id,
          module: 'CLIENTS',
          action: 'VIEW',
        },
      },
      update: { allowed: true },
      create: {
        roleId: parentRole.id,
        module: 'CLIENTS',
        action: 'VIEW',
        allowed: true,
      },
    });

    const parent1User = await prisma.unscopedClient.user.create({
      data: {
        name: 'Parent One',
        email: parent1Email,
        passwordHash: hashedPassword,
        phone: '+919876500021',
        roleId: parentRole.id,
        branches: { create: { branchId: branchAlphaId, isPrimary: true } },
      },
    });
    parent1UserId = parent1User.id;

    const guardian1 = await prisma.unscopedClient.guardian.create({
      data: {
        userId: parent1UserId,
        name: 'Parent One',
        whatsappNo: '+919876500021',
      },
    });

    const child1 = await prisma.unscopedClient.client.create({
      data: {
        branchId: branchAlphaId,
        clientCode: 'P7-CHI-001',
        name: 'Child One Alpha',
        dob: new Date('2018-04-10'),
        gender: 'MALE',
        caseHistory: 'Child 1 sensitive diagnosis: ADHD and sensory defensiveness.',
        status: ClientStatus.ACTIVE,
      },
    });
    child1Id = child1.id;

    await prisma.unscopedClient.clientGuardian.create({
      data: {
        clientId: child1Id,
        guardianId: guardian1.id,
        relation: 'Mother',
        isPrimary: true,
        canViewOverview: true,
        canViewAssessment: false,
        canViewPaymentPlan: true,
        canViewReports: false,
      },
    });

    // Assign therapist to Child 1 via treatment plan
    await prisma.unscopedClient.treatmentPlan.create({
      data: {
        clientId: child1Id,
        departmentId,
        therapistId: therapistEmployeeId,
        sessionsPerWeek: 2,
        feePerSession: 800,
        startDate: new Date('2026-01-01'),
        status: 'ACTIVE',
      },
    });

    // Child 2 for Parent 1 (multiple children per parent)
    const child2 = await prisma.unscopedClient.client.create({
      data: {
        branchId: branchAlphaId,
        clientCode: 'P7-CHI-002',
        name: 'Child Two Alpha',
        dob: new Date('2020-08-20'),
        gender: 'FEMALE',
        caseHistory: 'Child 2 sensitive diagnosis: Mild speech articulation delay.',
        status: ClientStatus.ACTIVE,
      },
    });
    child2Id = child2.id;

    await prisma.unscopedClient.clientGuardian.create({
      data: {
        clientId: child2Id,
        guardianId: guardian1.id,
        relation: 'Mother',
        isPrimary: true,
        canViewOverview: false, // Overview blocked for this child to test flag
        canViewAssessment: true,
        canViewPaymentPlan: true,
        canViewReports: true,
      },
    });

    // 6. Create Parent 2 with Child 3 in Branch Beta (isolated parent)
    const parent2User = await prisma.unscopedClient.user.create({
      data: {
        name: 'Parent Two',
        email: parent2Email,
        passwordHash: hashedPassword,
        phone: '+919876500022',
        roleId: parentRole.id,
        branches: { create: { branchId: branchBetaId, isPrimary: true } },
      },
    });
    parent2UserId = parent2User.id;

    const guardian2 = await prisma.unscopedClient.guardian.create({
      data: {
        userId: parent2UserId,
        name: 'Parent Two',
        whatsappNo: '+919876500022',
      },
    });

    const child3 = await prisma.unscopedClient.client.create({
      data: {
        branchId: branchBetaId,
        clientCode: 'P7-CHI-003',
        name: 'Child Three Beta',
        dob: new Date('2019-11-12'),
        gender: 'MALE',
        caseHistory: 'Child 3 diagnosis in Branch Beta.',
        status: ClientStatus.ACTIVE,
      },
    });
    child3Id = child3.id;

    await prisma.unscopedClient.clientGuardian.create({
      data: {
        clientId: child3Id,
        guardianId: guardian2.id,
        relation: 'Father',
        isPrimary: true,
        canViewOverview: true,
        canViewAssessment: true,
        canViewPaymentPlan: true,
        canViewReports: true,
      },
    });

    // Log in Parents
    const p1Res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: parent1Email, password: defaultPassword })
      .expect(200);
    parent1Token = p1Res.body.accessToken;

    const p2Res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: parent2Email, password: defaultPassword })
      .expect(200);
    parent2Token = p2Res.body.accessToken;
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.unscopedClient.clientGuardian.deleteMany({
        where: {
          client: {
            clientCode: { startsWith: 'P7' },
          },
        },
      });
      await prisma.unscopedClient.appointment.deleteMany({
        where: {
          client: {
            clientCode: { startsWith: 'P7' },
          },
        },
      });
      await prisma.unscopedClient.treatmentPlan.deleteMany({
        where: {
          client: {
            clientCode: { startsWith: 'P7' },
          },
        },
      });
      await prisma.unscopedClient.client.deleteMany({
        where: {
          clientCode: { startsWith: 'P7' },
        },
      });
      await prisma.unscopedClient.guardian.deleteMany({
        where: {
          user: { email: { in: [parent1Email, parent2Email] } },
        },
      });
      await prisma.unscopedClient.employee.deleteMany({
        where: {
          user: { email: { in: [therapistEmail, managerEmail] } },
        },
      });
      await prisma.unscopedClient.user.deleteMany({
        where: {
          email: {
            in: [managerEmail, therapistEmail, parent1Email, parent2Email],
          },
        },
      });
    }
    if (app) {
      await app.close();
    }
  });

  describe('1. List Scoping for Each Role', () => {
    it('Director sees clients across all branches', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/clients?search=P7-CHI')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      const codes = res.body.data.map((c: any) => c.clientCode);
      expect(codes).toContain('P7-CHI-001');
      expect(codes).toContain('P7-CHI-002');
      expect(codes).toContain('P7-CHI-003');
    });

    it('Manager sees only clients in their assigned branch (Branch Alpha), not Branch Beta', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/clients?search=P7-CHI')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      const codes = res.body.data.map((c: any) => c.clientCode);
      expect(codes).toContain('P7-CHI-001');
      expect(codes).toContain('P7-CHI-002');
      expect(codes).not.toContain('P7-CHI-003'); // Branch Beta client must not be visible
    });

    it('Therapist sees assigned clients in their branch', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/clients?search=P7-CHI')
        .set('Authorization', `Bearer ${therapistToken}`)
        .expect(200);

      const codes = res.body.data.map((c: any) => c.clientCode);
      expect(codes).toContain('P7-CHI-001'); // Therapist is assigned to Child 1
      expect(codes).not.toContain('P7-CHI-003'); // Branch Beta
    });

    it('Parent sees ONLY their own children (Parent isolation)', async () => {
      // Parent 1 sees Child 1 and Child 2, but NOT Child 3
      const res1 = await request(app.getHttpServer())
        .get('/api/v1/clients')
        .set('Authorization', `Bearer ${parent1Token}`)
        .expect(200);

      const p1Codes = res1.body.data.map((c: any) => c.clientCode);
      expect(p1Codes).toContain('P7-CHI-001');
      expect(p1Codes).toContain('P7-CHI-002');
      expect(p1Codes).not.toContain('P7-CHI-003');

      // Parent 2 sees Child 3, but NOT Child 1 or Child 2
      const res2 = await request(app.getHttpServer())
        .get('/api/v1/clients')
        .set('Authorization', `Bearer ${parent2Token}`)
        .expect(200);

      const p2Codes = res2.body.data.map((c: any) => c.clientCode);
      expect(p2Codes).toContain('P7-CHI-003');
      expect(p2Codes).not.toContain('P7-CHI-001');
      expect(p2Codes).not.toContain('P7-CHI-002');
    });
  });

  describe('2. Manager Field Restriction & Patient Data Headers', () => {
    it('Manager receives administrative fields only (caseHistory is stripped)', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/api/v1/clients?search=P7-CHI-001')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      const client = listRes.body.data.find((c: any) => c.clientCode === 'P7-CHI-001');
      expect(client).toBeDefined();
      expect(client.name).toBe('Child One Alpha');
      expect(client.caseHistory).toBeUndefined(); // Field restricted!

      // Overview endpoint also strips caseHistory for Manager
      const overviewRes = await request(app.getHttpServer())
        .get(`/api/v1/clients/${child1Id}/overview`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(overviewRes.body.caseHistory).toBeUndefined();
    });

    it('Clinical staff (Director, Therapist) can view caseHistory', async () => {
      const dirRes = await request(app.getHttpServer())
        .get(`/api/v1/clients/${child1Id}/overview`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(dirRes.body.caseHistory).toContain('sensitive diagnosis');

      const therRes = await request(app.getHttpServer())
        .get(`/api/v1/clients/${child1Id}/overview`)
        .set('Authorization', `Bearer ${therapistToken}`)
        .expect(200);

      expect(therRes.body.caseHistory).toContain('sensitive diagnosis');
    });

    it('Responses for patient data send Cache-Control: no-store', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/api/v1/clients')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(listRes.headers['cache-control']).toContain('no-store');

      const headerRes = await request(app.getHttpServer())
        .get(`/api/v1/clients/${child1Id}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(headerRes.headers['cache-control']).toContain('no-store');

      const overviewRes = await request(app.getHttpServer())
        .get(`/api/v1/clients/${child1Id}/overview`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(overviewRes.headers['cache-control']).toContain('no-store');
    });
  });

  describe('3. Profile Tabs Header & Guardian Permissions', () => {
    it('Parent receives dynamically resolved allowedTabs based on ClientGuardian flags', async () => {
      // Child 1: canViewOverview=true, canViewAssessment=false, canViewPaymentPlan=true, canViewReports=false
      const res1 = await request(app.getHttpServer())
        .get(`/api/v1/clients/${child1Id}`)
        .set('Authorization', `Bearer ${parent1Token}`)
        .expect(200);

      expect(res1.body.allowedTabs).toContain('overview');
      expect(res1.body.allowedTabs).toContain('payment_plan');
      expect(res1.body.allowedTabs).not.toContain('assessment');
      expect(res1.body.allowedTabs).not.toContain('reports');

      // Child 2: canViewOverview=false, canViewAssessment=true, canViewPaymentPlan=true, canViewReports=true
      const res2 = await request(app.getHttpServer())
        .get(`/api/v1/clients/${child2Id}`)
        .set('Authorization', `Bearer ${parent1Token}`)
        .expect(200);

      expect(res2.body.allowedTabs).not.toContain('overview');
      expect(res2.body.allowedTabs).toContain('assessment');
      expect(res2.body.allowedTabs).toContain('payment_plan');
      expect(res2.body.allowedTabs).toContain('reports');
    });

    it('Parent is rejected with 403 on Overview tab if canViewOverview is false', async () => {
      // Parent 1 requesting Overview for Child 2 (where canViewOverview=false)
      await request(app.getHttpServer())
        .get(`/api/v1/clients/${child2Id}/overview`)
        .set('Authorization', `Bearer ${parent1Token}`)
        .expect(403);
    });

    it('Parent 1 is rejected with 403 when attempting to access Parent 2 child', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/clients/${child3Id}`)
        .set('Authorization', `Bearer ${parent1Token}`)
        .expect(403);

      await request(app.getHttpServer())
        .get(`/api/v1/clients/${child3Id}/overview`)
        .set('Authorization', `Bearer ${parent1Token}`)
        .expect(403);
    });
  });

  describe('4. Pagination Caps & Sorting', () => {
    it('enforces maximum pageSize of 100', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/clients?pageSize=150')
        .set('Authorization', `Bearer ${directorToken}`);

      expect(res.status).toBe(400); // ValidationPipe rejects pageSize > 100
    });

    it('supports whitelisted sorts (e.g. name asc, -createdAt desc)', async () => {
      const resAsc = await request(app.getHttpServer())
        .get('/api/v1/clients?search=P7-CHI&sort=name')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      const names = resAsc.body.data.map((c: any) => c.name);
      expect(names).toEqual([...names].sort());

      // Invalid sort rejected with 400
      await request(app.getHttpServer())
        .get('/api/v1/clients?sort=maliciousColumn')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(400);
    });
  });

  describe('5. Client CRUD and Guardian Linking Flow', () => {
    it('creates client with auto-generated client code and links initial guardian', async () => {
      const newParentEmail = `newparent-${Date.now()}@petals.com`;

      const createRes = await request(app.getHttpServer())
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          branchId: branchAlphaId,
          name: 'Freshly Created Client',
          dob: '2019-06-15',
          gender: 'FEMALE',
          caseHistory: 'Initial intake case notes.',
          guardians: [
            {
              name: 'Fresh Parent',
              email: newParentEmail,
              phone: '+919988771122',
              relation: 'Mother',
              isPrimary: true,
              canViewOverview: true,
              canViewAssessment: true,
            },
          ],
        })
        .expect(201);

      const newClient = createRes.body;
      expect(newClient.clientCode).toMatch(/^P7ALPHA-\d{4}-\d{4}$/);
      expect(newClient.guardians).toHaveLength(1);
      expect(newClient.guardians[0].guardian.name).toBe('Fresh Parent');

      // Add a secondary guardian
      const secParentEmail = `secparent-${Date.now()}@petals.com`;
      const addGRes = await request(app.getHttpServer())
        .post(`/api/v1/clients/${newClient.id}/guardians`)
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          name: 'Fresh Father',
          email: secParentEmail,
          relation: 'Father',
          isPrimary: false,
          canViewOverview: true,
        })
        .expect(201);

      expect(addGRes.body.relation).toBe('Father');

      // Soft delete the client
      await request(app.getHttpServer())
        .delete(`/api/v1/clients/${newClient.id}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      // Verify soft-deleted client is excluded from active list
      const afterDel = await request(app.getHttpServer())
        .get(`/api/v1/clients?search=${newClient.clientCode}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(afterDel.body.data).toHaveLength(0);
    });
  });

  describe('6. Query Count Test (50 clients page <= 4 queries)', () => {
    beforeAll(async () => {
      // Seed 50 clients in Branch Alpha
      const clientsData = [];
      for (let i = 1; i <= 50; i++) {
        clientsData.push({
          branchId: branchAlphaId,
          clientCode: `P7-QCOUNT-${String(i).padStart(4, '0')}`,
          name: `Batch Client ${i}`,
          dob: new Date('2019-01-01'),
          gender: 'MALE',
          status: ClientStatus.ACTIVE,
        });
      }
      await prisma.unscopedClient.client.createMany({
        data: clientsData,
      });

      // Fetch created clients to add sample appointments for session counts
      const createdClients = await prisma.unscopedClient.client.findMany({
        where: { clientCode: { startsWith: 'P7-QCOUNT' } },
        select: { id: true },
        take: 20,
      });

      const appointmentsData = [];
      let dayOffset = 1;
      for (const c of createdClients) {
        appointmentsData.push(
          {
            clientId: c.id,
            branchId: branchAlphaId,
            therapistId: therapistEmployeeId,
            startsAt: new Date(Date.UTC(2026, 2, dayOffset, 10, 0, 0)),
            endsAt: new Date(Date.UTC(2026, 2, dayOffset, 10, 45, 0)),
            status: AppointmentStatus.SCHEDULED,
          },
          {
            clientId: c.id,
            branchId: branchAlphaId,
            therapistId: therapistEmployeeId,
            startsAt: new Date(Date.UTC(2026, 1, dayOffset, 10, 0, 0)),
            endsAt: new Date(Date.UTC(2026, 1, dayOffset, 10, 45, 0)),
            status: AppointmentStatus.ATTENDED,
          },
        );
        dayOffset++;
      }
      await prisma.unscopedClient.appointment.createMany({
        data: appointmentsData,
      });
    });

    it('50 clients on a page makes at most 4 queries without N+1', async () => {
      // 1. Warm-up request to cache auth user, roles, and permissions
      await request(app.getHttpServer())
        .get('/api/v1/clients?search=P7-QCOUNT&pageSize=50')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      // 2. Count database queries for the 50-client listing
      queryCounter.start();

      const res = await request(app.getHttpServer())
        .get('/api/v1/clients?search=P7-QCOUNT&pageSize=50')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      const count = queryCounter.stop();

      expect(res.body.data.length).toBe(50);
      // Verify session counts are populated correctly
      const withCounts = res.body.data.filter((c: any) => c.scheduledSessionsCount > 0);
      expect(withCounts.length).toBeGreaterThan(0);

      // Query count assertion: client.findMany + client.count + appointment.groupBy (+ auth/session) <= 4
      expect(count).toBeLessThanOrEqual(4);
    });
  });
});
