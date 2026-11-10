import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule as AppMainModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/common/prisma';
import { QueryCounter } from '../src/common/testing/query-count.helper';
import { hashPassword } from '../src/common/crypto';
import {
  ClientStatus,
  GoalStatus,
  GoalTerm,
  PlanStatus,
  ProgressLevel,
  RoleKey,
  SubgoalFrequency,
} from '@petals/types';

describe('Clinical Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let queryCounter: QueryCounter;

  let directorToken: string;
  let therapist1Token: string;
  let therapist2Token: string;
  let parentToken: string;

  let branchId: string;
  let departmentId: string;
  let therapist1EmployeeId: string;
  let therapist2EmployeeId: string;
  let clientId: string;
  let guardianId: string;

  const defaultPassword = 'Password123!Secure';
  const directorPassword = 'ChangeMe123!';
  const therapist1Email = 'therapist1-p8@petals.com';
  const therapist2Email = 'therapist2-p8@petals.com';
  const parentEmail = 'parent-p8@petals.com';

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
    await prisma.unscopedClient.clinicalEntryVersion.deleteMany({
      where: {
        OR: [
          { changedBy: { email: { in: [therapist1Email, therapist2Email, parentEmail] } } },
          { reason: { contains: 'P8' } },
        ],
      },
    });
    await prisma.unscopedClient.progressEntry.deleteMany({
      where: {
        subgoal: { goal: { plan: { client: { clientCode: { startsWith: 'P8' } } } } },
      },
    });
    await prisma.unscopedClient.subgoal.deleteMany({
      where: {
        goal: { plan: { client: { clientCode: { startsWith: 'P8' } } } },
      },
    });
    await prisma.unscopedClient.goal.deleteMany({
      where: {
        plan: { client: { clientCode: { startsWith: 'P8' } } },
      },
    });
    await prisma.unscopedClient.treatmentPlan.deleteMany({
      where: {
        client: { clientCode: { startsWith: 'P8' } },
      },
    });
    await prisma.unscopedClient.assessment.deleteMany({
      where: {
        client: { clientCode: { startsWith: 'P8' } },
      },
    });
    await prisma.unscopedClient.clientGuardian.deleteMany({
      where: {
        client: { clientCode: { startsWith: 'P8' } },
      },
    });
    await prisma.unscopedClient.client.deleteMany({
      where: { clientCode: { startsWith: 'P8' } },
    });
    await prisma.unscopedClient.guardian.deleteMany({
      where: { user: { email: parentEmail } },
    });
    await prisma.unscopedClient.employee.deleteMany({
      where: { user: { email: { in: [therapist1Email, therapist2Email] } } },
    });
    await prisma.unscopedClient.user.deleteMany({
      where: { email: { in: [therapist1Email, therapist2Email, parentEmail] } },
    });

    // 1. Setup Branch & Department
    const branch = await prisma.unscopedClient.branch.upsert({
      where: { code: 'P8BRANCH' },
      update: {},
      create: {
        name: 'Phase 8 Branch',
        code: 'P8BRANCH',
        city: 'Kochi',
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

    for (const mod of ['PROFILE_PAYMENT_PLAN', 'PROFILE_ASSESSMENT', 'PROFILE_PROGRESS']) {
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

    // 3. Create Therapist 1 in Branch
    const t1User = await prisma.unscopedClient.user.create({
      data: {
        name: 'Therapist One P8',
        email: therapist1Email,
        passwordHash: hashedPassword,
        phone: '+919876508001',
        roleId: therapistRole.id,
        branches: { create: { branchId, isPrimary: true } },
      },
    });
    const t1Emp = await prisma.unscopedClient.employee.create({
      data: {
        userId: t1User.id,
        departmentId,
        employeeCode: 'EMP-P8-001',
        designation: 'Senior Occupational Therapist',
        salary: 45000,
        joinedOn: new Date('2025-01-01'),
      },
    });
    therapist1EmployeeId = t1Emp.id;

    // 4. Create Therapist 2 in same Branch (shared clients!)
    const t2User = await prisma.unscopedClient.user.create({
      data: {
        name: 'Therapist Two P8',
        email: therapist2Email,
        passwordHash: hashedPassword,
        phone: '+919876508002',
        roleId: therapistRole.id,
        branches: { create: { branchId, isPrimary: true } },
      },
    });
    const t2Emp = await prisma.unscopedClient.employee.create({
      data: {
        userId: t2User.id,
        departmentId,
        employeeCode: 'EMP-P8-002',
        designation: 'Staff Occupational Therapist',
        salary: 40000,
        joinedOn: new Date('2025-02-01'),
      },
    });
    therapist2EmployeeId = t2Emp.id;
    expect(therapist2EmployeeId).toBeDefined();

    // 5. Create Parent and Client
    const parentRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.PARENT },
    });

    for (const mod of ['PROFILE_PAYMENT_PLAN', 'PROFILE_ASSESSMENT', 'PROFILE_PROGRESS']) {
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

    const parentUser = await prisma.unscopedClient.user.create({
      data: {
        name: 'Parent P8',
        email: parentEmail,
        passwordHash: hashedPassword,
        phone: '+919876508003',
        roleId: parentRole.id,
        branches: { create: { branchId, isPrimary: true } },
      },
    });

    const guardian = await prisma.unscopedClient.guardian.create({
      data: {
        userId: parentUser.id,
        name: 'Parent P8',
        whatsappNo: '+919876508003',
      },
    });

    const client = await prisma.unscopedClient.client.create({
      data: {
        branchId,
        clientCode: 'P8-CHI-001',
        name: 'Child Clinical P8',
        dob: new Date('2019-05-10'),
        gender: 'MALE',
        status: ClientStatus.ACTIVE,
      },
    });
    clientId = client.id;

    guardianId = guardian.id;
    await prisma.unscopedClient.clientGuardian.create({
      data: {
        clientId,
        guardianId,
        relation: 'Mother',
        isPrimary: true,
        canViewOverview: true,
        canViewAssessment: false, // Initially false to test permission flag
        canViewPaymentPlan: true,
        canViewReports: true,
      },
    });

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
      .send({ email: parentEmail, password: defaultPassword })
      .expect(200);
    parentToken = pRes.body.accessToken;
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.unscopedClient.clinicalEntryVersion.deleteMany({
        where: {
          OR: [
            { changedBy: { email: { in: [therapist1Email, therapist2Email, parentEmail] } } },
            { reason: { contains: 'P8' } },
          ],
        },
      });
      await prisma.unscopedClient.progressEntry.deleteMany({
        where: {
          subgoal: { goal: { plan: { client: { clientCode: { startsWith: 'P8' } } } } },
        },
      });
      await prisma.unscopedClient.subgoal.deleteMany({
        where: {
          goal: { plan: { client: { clientCode: { startsWith: 'P8' } } } },
        },
      });
      await prisma.unscopedClient.goal.deleteMany({
        where: {
          plan: { client: { clientCode: { startsWith: 'P8' } } },
        },
      });
      await prisma.unscopedClient.treatmentPlan.deleteMany({
        where: {
          client: { clientCode: { startsWith: 'P8' } },
        },
      });
      await prisma.unscopedClient.assessment.deleteMany({
        where: {
          client: { clientCode: { startsWith: 'P8' } },
        },
      });
      await prisma.unscopedClient.clientGuardian.deleteMany({
        where: {
          client: { clientCode: { startsWith: 'P8' } },
        },
      });
      await prisma.unscopedClient.client.deleteMany({
        where: { clientCode: { startsWith: 'P8' } },
      });
      await prisma.unscopedClient.guardian.deleteMany({
        where: { user: { email: parentEmail } },
      });
      await prisma.unscopedClient.employee.deleteMany({
        where: { user: { email: { in: [therapist1Email, therapist2Email] } } },
      });
      await prisma.unscopedClient.user.deleteMany({
        where: { email: { in: [therapist1Email, therapist2Email, parentEmail] } },
      });
    }
    await app.close();
  });

  describe('1. Shared-Client Visibility & Assessment Permissions', () => {
    let assessmentId: string;

    it('Therapist 1 creates assessment for Child Alpha', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/clients/${clientId}/assessments`)
        .set('Authorization', `Bearer ${therapist1Token}`)
        .send({
          assessedOn: '2026-03-10',
          tool: 'Peabody Developmental Motor Scales',
          observation: 'Initial observation by Therapist 1',
          scores: { fineMotor: 42, grossMotor: 38 },
          summary: 'Recommend occupational therapy 2x/week',
        })
        .expect(201);

      assessmentId = res.body.id;
      expect(res.body.tool).toBe('Peabody Developmental Motor Scales');
      expect(res.body.assessor.id).toBe(therapist1EmployeeId);
      expect(res.headers['cache-control']).toContain('no-store');
    });

    it('Therapist 2 (shared client) CAN VIEW Therapist 1 assessment', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/clients/${clientId}/assessments`)
        .set('Authorization', `Bearer ${therapist2Token}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      const found = res.body.data.find((a: any) => a.id === assessmentId);
      expect(found).toBeDefined();
      expect(found.observation).toBe('Initial observation by Therapist 1');
      expect(res.headers['cache-control']).toContain('no-store');
    });

    it('Parent cannot view assessments if canViewAssessment is false', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/clients/${clientId}/assessments`)
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(403);
    });

    it('Parent can view assessments once canViewAssessment is updated to true', async () => {
      await prisma.unscopedClient.clientGuardian.update({
        where: {
          clientId_guardianId: {
            clientId,
            guardianId,
          },
        },
        data: { canViewAssessment: true },
      });

      const res = await request(app.getHttpServer())
        .get(`/api/v1/clients/${clientId}/assessments`)
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('Therapist 2 CANNOT edit Therapist 1 assessment (Author-only editing)', async () => {
      await request(app.getHttpServer())
        .put(`/api/v1/assessments/${assessmentId}`)
        .set('Authorization', `Bearer ${therapist2Token}`)
        .send({ observation: 'Unauthorized edit attempt by Therapist 2' })
        .expect(403);
    });

    it('Therapist 2 CANNOT delete Therapist 1 assessment', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/assessments/${assessmentId}`)
        .set('Authorization', `Bearer ${therapist2Token}`)
        .expect(403);
    });

    it('Therapist 1 CAN edit their own assessment and generates Version row', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/v1/assessments/${assessmentId}`)
        .set('Authorization', `Bearer ${therapist1Token}`)
        .send({ observation: 'Authorized edit by Therapist 1 (P8 Reason)' })
        .expect(200);

      expect(res.body.observation).toBe('Authorized edit by Therapist 1 (P8 Reason)');

      // Verify version record was created
      const version = await prisma.unscopedClient.clinicalEntryVersion.findFirst({
        where: {
          entityType: 'Assessment',
          entityId: assessmentId,
          changeType: 'EDIT',
        },
      });
      expect(version).toBeDefined();
    });

    it('Director CAN override, edit, and soft-delete Therapist 1 assessment', async () => {
      // Director edit
      await request(app.getHttpServer())
        .put(`/api/v1/assessments/${assessmentId}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .send({ observation: 'Director authorized clinical note review' })
        .expect(200);

      // Director delete
      await request(app.getHttpServer())
        .delete(`/api/v1/assessments/${assessmentId}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      // Verify soft delete
      const deleted = await prisma.unscopedClient.assessment.findUnique({
        where: { id: assessmentId },
      });
      expect(deleted?.deletedAt).not.toBeNull();

      // Verify version DELETE record was created
      const delVersion = await prisma.unscopedClient.clinicalEntryVersion.findFirst({
        where: {
          entityType: 'Assessment',
          entityId: assessmentId,
          changeType: 'DELETE',
        },
      });
      expect(delVersion).toBeDefined();
    });
  });

  describe('2. Treatment Plans, Goals & Subgoals', () => {
    let planId: string;
    let goalId: string;
    let subgoalId: string;

    it('creates a treatment plan and retrieves it', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/clients/${clientId}/treatment-plans`)
        .set('Authorization', `Bearer ${therapist1Token}`)
        .send({
          departmentId,
          therapistId: therapist1EmployeeId,
          sessionsPerWeek: 2,
          sessionMinutes: 45,
          feePerSession: 850.0,
          startDate: '2026-03-01',
          status: PlanStatus.ACTIVE,
        })
        .expect(201);

      planId = res.body.id;
      expect(res.body.feePerSession).toBe('850');

      const listRes = await request(app.getHttpServer())
        .get(`/api/v1/clients/${clientId}/treatment-plans`)
        .set('Authorization', `Bearer ${therapist2Token}`)
        .expect(200);

      expect(listRes.body.length).toBeGreaterThanOrEqual(1);
    });

    it('creates goals and sub-goals under treatment plan', async () => {
      const goalRes = await request(app.getHttpServer())
        .post(`/api/v1/treatment-plans/${planId}/goals`)
        .set('Authorization', `Bearer ${therapist1Token}`)
        .send({
          term: GoalTerm.LONG,
          title: 'Master fine motor scissor skills',
          baseline: 'Child cannot cut along line',
          description: 'Improve bilateral hand coordination',
          status: GoalStatus.IN_PROGRESS,
        })
        .expect(201);

      goalId = goalRes.body.id;

      const subRes = await request(app.getHttpServer())
        .post(`/api/v1/goals/${goalId}/subgoals`)
        .set('Authorization', `Bearer ${therapist1Token}`)
        .send({
          frequency: SubgoalFrequency.WEEKLY,
          description: 'Cut paper strips within 1/4 inch of line',
          status: GoalStatus.NOT_STARTED,
        })
        .expect(201);

      subgoalId = subRes.body.id;
      expect(subRes.body.frequency).toBe(SubgoalFrequency.WEEKLY);
    });

    it('GET /clients/:id/goals returns goals with nested subgoals', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/clients/${clientId}/goals`)
        .set('Authorization', `Bearer ${therapist2Token}`)
        .expect(200);

      expect(res.body.length).toBeGreaterThanOrEqual(1);
      const goal = res.body.find((g: any) => g.id === goalId);
      expect(goal).toBeDefined();
      expect(goal.subgoals.length).toBeGreaterThanOrEqual(1);
      expect(goal.subgoals[0].id).toBe(subgoalId);
    });
  });

  describe('3. Progress Entries: Author-Only Editing & Cursor Pagination', () => {
    let subgoalId: string;
    let entryId1: string;

    beforeAll(async () => {
      // Find the subgoal created in prior block
      const sg = await prisma.unscopedClient.subgoal.findFirstOrThrow({
        where: { goal: { plan: { clientId } } },
      });
      subgoalId = sg.id;
    });

    it('Therapist 1 creates progress entry', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/subgoals/${subgoalId}/progress-entries`)
        .set('Authorization', `Bearer ${therapist1Token}`)
        .send({
          entryDate: '2026-03-12',
          description: 'Scissors task performed with minimal assistance',
          response: 'Child cut 3 strips accurately',
          remarks: 'Good progress',
          level: ProgressLevel.PROGRESSING,
        })
        .expect(201);

      entryId1 = res.body.id;
      expect(res.body.author.id).toBe(therapist1EmployeeId);
      expect(res.body.level).toBe(ProgressLevel.PROGRESSING);
    });

    it('Therapist 2 (shared client) CAN VIEW progress entry', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/subgoals/${subgoalId}/progress-entries?limit=10`)
        .set('Authorization', `Bearer ${therapist2Token}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      const found = res.body.data.find((e: any) => e.id === entryId1);
      expect(found).toBeDefined();
    });

    it('Therapist 2 CANNOT edit Therapist 1 progress entry (Author-only)', async () => {
      await request(app.getHttpServer())
        .put(`/api/v1/progress-entries/${entryId1}`)
        .set('Authorization', `Bearer ${therapist2Token}`)
        .send({ remarks: 'Malicious modification attempt' })
        .expect(403);
    });

    it('Therapist 1 CAN edit their own progress entry and creates version row', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/v1/progress-entries/${entryId1}`)
        .set('Authorization', `Bearer ${therapist1Token}`)
        .send({ remarks: 'Updated note by author (P8 Version Test)' })
        .expect(200);

      expect(res.body.remarks).toBe('Updated note by author (P8 Version Test)');

      const version = await prisma.unscopedClient.clinicalEntryVersion.findFirst({
        where: {
          entityType: 'ProgressEntry',
          entityId: entryId1,
          changeType: 'EDIT',
        },
      });
      expect(version).toBeDefined();
    });

    it('Director CAN override and delete Therapist 1 progress entry with version row', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/progress-entries/${entryId1}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      const deleted = await prisma.unscopedClient.progressEntry.findUnique({
        where: { id: entryId1 },
      });
      expect(deleted?.deletedAt).not.toBeNull();

      const version = await prisma.unscopedClient.clinicalEntryVersion.findFirst({
        where: {
          entityType: 'ProgressEntry',
          entityId: entryId1,
          changeType: 'DELETE',
        },
      });
      expect(version).toBeDefined();
    });

    it('Cursor pagination works and never loads all progress entries in one response', async () => {
      // Seed 25 progress entries
      const entriesData = [];
      for (let i = 1; i <= 25; i++) {
        entriesData.push({
          subgoalId,
          authorId: therapist1EmployeeId,
          entryDate: new Date(Date.UTC(2026, 1, i, 10, 0, 0)),
          description: `Progress entry #${i}`,
          level: ProgressLevel.PROGRESSING,
        });
      }
      await prisma.unscopedClient.progressEntry.createMany({
        data: entriesData,
      });

      // Request first page with limit=10
      const page1Res = await request(app.getHttpServer())
        .get(`/api/v1/subgoals/${subgoalId}/progress-entries?limit=10`)
        .set('Authorization', `Bearer ${therapist1Token}`)
        .expect(200);

      expect(page1Res.body.data.length).toBe(10);
      expect(page1Res.body.meta.hasNext).toBe(true);
      expect(page1Res.body.meta.nextCursor).toBeDefined();

      const cursor = page1Res.body.meta.nextCursor;

      // Request second page using cursor
      const page2Res = await request(app.getHttpServer())
        .get(`/api/v1/subgoals/${subgoalId}/progress-entries?limit=10&cursor=${cursor}`)
        .set('Authorization', `Bearer ${therapist1Token}`)
        .expect(200);

      expect(page2Res.body.data.length).toBe(10);
      // Ensure page 2 items are disjoint from page 1 items
      const p1Ids = new Set(page1Res.body.data.map((d: any) => d.id));
      for (const item of page2Res.body.data) {
        expect(p1Ids.has(item.id)).toBe(false);
      }
    });
  });

  describe('4. Query Count Invariance (Constant Queries as Rows Grow)', () => {
    let testPlanId: string;

    beforeAll(async () => {
      // Create a dedicated client and plan for query count test
      const testClient = await prisma.unscopedClient.client.create({
        data: {
          branchId,
          clientCode: 'P8-QCOUNT-CLI',
          name: 'QCount Test Child',
          dob: new Date('2020-01-01'),
          gender: 'FEMALE',
          status: ClientStatus.ACTIVE,
        },
      });

      const plan = await prisma.unscopedClient.treatmentPlan.create({
        data: {
          clientId: testClient.id,
          departmentId,
          therapistId: therapist1EmployeeId,
          sessionsPerWeek: 2,
          feePerSession: 800,
          startDate: new Date('2026-01-01'),
        },
      });
      testPlanId = plan.id;

      // Seed 2 goals initially with 2 subgoals each
      for (let i = 1; i <= 2; i++) {
        const goal = await prisma.unscopedClient.goal.create({
          data: {
            planId: testPlanId,
            term: GoalTerm.SHORT,
            title: `Initial Goal ${i}`,
          },
        });
        await prisma.unscopedClient.subgoal.createMany({
          data: [
            { goalId: goal.id, frequency: SubgoalFrequency.WEEKLY, description: `Initial Subgoal ${i}.1` },
            { goalId: goal.id, frequency: SubgoalFrequency.DAILY, description: `Initial Subgoal ${i}.2` },
          ],
        });
      }
    });

    it('query count stays constant when goals and subgoals grow from 2 to 22', async () => {
      const testClient = await prisma.unscopedClient.client.findFirstOrThrow({
        where: { clientCode: 'P8-QCOUNT-CLI' },
      });

      // 1. Warm-up request
      await request(app.getHttpServer())
        .get(`/api/v1/clients/${testClient.id}/goals`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      // 2. Measure query count for 2 goals
      queryCounter.start();
      const resSmall = await request(app.getHttpServer())
        .get(`/api/v1/clients/${testClient.id}/goals`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);
      const countSmall = queryCounter.stop();

      expect(resSmall.body.length).toBe(2);

      // 3. Seed 20 more goals with 2 subgoals each (total 22 goals, 44 subgoals)
      for (let i = 3; i <= 22; i++) {
        const g = await prisma.unscopedClient.goal.create({
          data: {
            planId: testPlanId,
            term: GoalTerm.LONG,
            title: `Bulk Goal ${i}`,
          },
        });
        await prisma.unscopedClient.subgoal.createMany({
          data: [
            { goalId: g.id, frequency: SubgoalFrequency.WEEKLY, description: `Bulk Subgoal ${i}.1` },
            { goalId: g.id, frequency: SubgoalFrequency.DAILY, description: `Bulk Subgoal ${i}.2` },
          ],
        });
      }

      // 4. Measure query count for 22 goals with 44 subgoals
      queryCounter.start();
      const resLarge = await request(app.getHttpServer())
        .get(`/api/v1/clients/${testClient.id}/goals`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);
      const countLarge = queryCounter.stop();

      expect(resLarge.body.length).toBe(22);

      // Invariance assertion: query count does not grow with row count
      expect(countLarge).toBe(countSmall);
      expect(countLarge).toBeLessThanOrEqual(4);
    });
  });
});
