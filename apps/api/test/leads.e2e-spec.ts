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
  RoleKey,
  LeadStage,
} from '@petals/types';

describe('Leads Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let queryCounter: QueryCounter;

  let directorToken: string;
  let managerToken: string;
  let therapistToken: string;
  let parentToken: string;

  let managerUserId: string;
  let managerEmployeeId: string;
  let branchId: string;
  let branch2Id: string;

  const defaultPassword = 'Password123!Secure';
  const directorPassword = 'ChangeMe123!';
  const managerEmail = 'manager1-p12@petals.com';
  const therapistEmail = 'therapist1-p12@petals.com';
  const parentEmail = 'parent1-p12@petals.com';

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

    // Teardown previous test data
    await prisma.unscopedClient.notification.deleteMany({
      where: {
        user: { email: { in: [managerEmail, therapistEmail, parentEmail] } },
      },
    });
    await prisma.unscopedClient.auditLog.deleteMany({
      where: {
        entity: 'Lead',
      },
    });
    await prisma.unscopedClient.clientGuardian.deleteMany({
      where: {
        client: { clientCode: { startsWith: 'P12' } },
      },
    });
    await prisma.unscopedClient.client.deleteMany({
      where: { clientCode: { startsWith: 'P12' } },
    });
    await prisma.unscopedClient.lead.deleteMany({
      where: {
        name: { startsWith: 'P12' },
      },
    });
    await prisma.unscopedClient.guardian.deleteMany({
      where: { user: { email: parentEmail } },
    });
    await prisma.unscopedClient.employee.deleteMany({
      where: { user: { email: { in: [managerEmail, therapistEmail] } } },
    });
    await prisma.unscopedClient.user.deleteMany({
      where: { email: { in: [managerEmail, therapistEmail, parentEmail] } },
    });

    // 1. Setup Branches
    const branch1 = await prisma.unscopedClient.branch.upsert({
      where: { code: 'P12B1' },
      update: {},
      create: {
        name: 'Phase 12 Branch One',
        code: 'P12B1',
        city: 'Kochi',
      },
    });
    branchId = branch1.id;

    const branch2 = await prisma.unscopedClient.branch.upsert({
      where: { code: 'P12B2' },
      update: {},
      create: {
        name: 'Phase 12 Branch Two',
        code: 'P12B2',
        city: 'Calicut',
      },
    });
    branch2Id = branch2.id;

    // 2. Log in Director
    const dirRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'director@petals.com', password: directorPassword })
      .expect(200);
    directorToken = dirRes.body.accessToken;

    const hashedPassword = await hashPassword(defaultPassword);

    // 3. Setup Manager in Branch 1
    const managerRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.MANAGER },
    });
    const managerUser = await prisma.unscopedClient.user.create({
      data: {
        email: managerEmail,
        passwordHash: hashedPassword,
        name: 'P12 Manager One',
        roleId: managerRole.id,
        isActive: true,
        branches: {
          create: [{ branchId, isPrimary: true }],
        },
      },
    });
    managerUserId = managerUser.id;

    const managerEmp = await prisma.unscopedClient.employee.create({
      data: {
        userId: managerUserId,
        employeeCode: 'P12-EMP-MGR',
        joinedOn: new Date('2026-01-01'),
      },
    });
    managerEmployeeId = managerEmp.id;

    const mgrLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: managerEmail, password: defaultPassword })
      .expect(200);
    managerToken = mgrLogin.body.accessToken;

    // 4. Setup Therapist
    const therapistRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.THERAPIST },
    });
    await prisma.unscopedClient.user.create({
      data: {
        email: therapistEmail,
        passwordHash: hashedPassword,
        name: 'P12 Therapist',
        roleId: therapistRole.id,
        isActive: true,
        branches: {
          create: [{ branchId, isPrimary: true }],
        },
      },
    });
    const thLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: therapistEmail, password: defaultPassword })
      .expect(200);
    therapistToken = thLogin.body.accessToken;

    // 5. Setup Parent
    const parentRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.PARENT },
    });
    await prisma.unscopedClient.user.create({
      data: {
        email: parentEmail,
        passwordHash: hashedPassword,
        name: 'P12 Parent User',
        roleId: parentRole.id,
        isActive: true,
        branches: {
          create: [{ branchId, isPrimary: true }],
        },
      },
    });
    const pLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: parentEmail, password: defaultPassword })
      .expect(200);
    parentToken = pLogin.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('RBAC & Role Scoping', () => {
    it('forbids Therapist and Parent from accessing /leads', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/leads')
        .set('Authorization', `Bearer ${therapistToken}`)
        .expect(403);

      await request(app.getHttpServer())
        .get('/api/v1/leads')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(403);
    });

    it('forbids Manager from creating a lead in an unassigned branch', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          branchId: branch2Id, // Manager only has branchId
          name: 'P12 Unassigned Child',
          contact: '+919876540001',
        })
        .expect(403);

      expect(res.body.message).toContain('unassigned branch');
    });

    it('allows Manager to create a lead in their assigned branch', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          branchId,
          name: 'P12 Child Alpha',
          contact: '+919876540002',
          childAge: 4,
          concern: 'Speech delay and lack of eye contact',
          source: 'Instagram',
          ownerId: managerEmployeeId,
          notes: 'Parents requested weekend consult',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.stage).toBe(LeadStage.NEW);
      expect(res.body.name).toBe('P12 Child Alpha');
      expect(res.headers['cache-control']).toContain('no-store');
    });
  });

  describe('Direct CONVERTED Stage Validation', () => {
    let testLeadId: string;

    beforeAll(async () => {
      const lead = await prisma.unscopedClient.lead.create({
        data: {
          branchId,
          name: 'P12 Stage Validation Child',
          contact: '+919876540003',
          stage: LeadStage.NEW,
        },
      });
      testLeadId = lead.id;
    });

    it('rejects POST /leads with stage CONVERTED directly', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          branchId,
          name: 'P12 Bad Lead',
          contact: '+919876540004',
          stage: LeadStage.CONVERTED,
        })
        .expect(400);

      expect(res.body.message).toContain('conversion flow');
    });

    it('rejects PATCH /leads/:id with stage CONVERTED directly', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/leads/${testLeadId}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          stage: LeadStage.CONVERTED,
        })
        .expect(400);

      expect(res.body.message).toContain('conversion flow');
    });

    it('allows updating lead notes and stage to CONTACTED or ASSESSMENT_SCHEDULED', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/leads/${testLeadId}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          stage: LeadStage.CONTACTED,
          notes: 'Spoke with mother, scheduled for next Tuesday',
        })
        .expect(200);

      expect(res.body.stage).toBe(LeadStage.CONTACTED);
      expect(res.body.notes).toContain('Spoke with mother');
    });
  });

  describe('Lead Conversion Preview: GET /leads/:id/convert-preview', () => {
    let previewLeadId: string;

    beforeAll(async () => {
      const lead = await prisma.unscopedClient.lead.create({
        data: {
          branchId,
          name: 'P12 Preview Child',
          contact: '+919876543333',
          childAge: 6,
          concern: 'Motor clumsiness and speech',
          source: 'Word of mouth',
          notes: 'Father is an NRI working in Dubai',
          stage: LeadStage.ASSESSMENT_SCHEDULED,
        },
      });
      previewLeadId = lead.id;
    });

    it('returns prefilled draft with estimated DOB, formatted case history, and guardian contact', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/leads/${previewLeadId}/convert-preview`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(res.body.leadId).toBe(previewLeadId);
      expect(res.body.branchId).toBe(branchId);
      expect(res.body.name).toBe('P12 Preview Child');
      expect(res.body.childAge).toBe(6);
      const expectedBirthYear = new Date().getFullYear() - 6;
      expect(res.body.dob).toBe(`${expectedBirthYear}-01-01`);
      expect(res.body.guardianPhone).toBe('+919876543333');
      expect(res.body.guardianWhatsApp).toBe('+919876543333');
      expect(res.body.caseHistory).toContain('Source: Word of mouth');
      expect(res.body.caseHistory).toContain('Concern: Motor clumsiness');
      expect(res.body.caseHistory).toContain('Notes: Father is an NRI');
      expect(res.headers['cache-control']).toContain('no-store');
    });

    it('forbids Manager from previewing a lead in another branch', async () => {
      const otherLead = await prisma.unscopedClient.lead.create({
        data: {
          branchId: branch2Id,
          name: 'P12 Other Branch Lead',
          contact: '+919876543334',
        },
      });

      await request(app.getHttpServer())
        .get(`/api/v1/leads/${otherLead.id}/convert-preview`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);
    });
  });

  describe('Lead Conversion: POST /leads/:id/convert', () => {
    let convertLeadId: string;

    beforeEach(async () => {
      const lead = await prisma.unscopedClient.lead.create({
        data: {
          branchId,
          name: 'P12 Convert Test Child',
          contact: '+919876545555',
          childAge: 5,
          concern: 'Sensory issues',
          source: 'Pediatrician Referral',
          stage: LeadStage.ASSESSMENT_SCHEDULED,
        },
      });
      convertLeadId = lead.id;
    });

    it('executes atomic conversion: creates client, parent user, guardian, link, audit entry and welcome notification', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/leads/${convertLeadId}/convert`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'P12 Convert Test Child',
          dob: '2021-05-15',
          gender: 'MALE',
          caseHistory: 'Sensory processing differences noted by pediatrician',
          guardianName: 'Suresh Kumar',
          guardianPhone: '+919876545555',
          guardianEmail: 'suresh.p12@petals.local',
          guardianRelation: 'Father',
          guardianConsent: true,
        })
        .expect(201);

      expect(res.body.client).toBeDefined();
      expect(res.body.client.id).toBeDefined();
      expect(res.body.client.clientCode).toMatch(/^P12B1-\d{4}-\d{4}$/);
      expect(res.body.client.leadId).toBe(convertLeadId);

      // Verify lead is marked CONVERTED and row was preserved
      const updatedLead = await prisma.unscopedClient.lead.findUnique({
        where: { id: convertLeadId },
        include: { client: true },
      });
      expect(updatedLead?.stage).toBe(LeadStage.CONVERTED);
      expect(updatedLead?.client?.id).toBe(res.body.client.id);

      // Verify Guardian and ClientGuardian
      const clientGuardian = await prisma.unscopedClient.clientGuardian.findFirst({
        where: { clientId: res.body.client.id },
        include: { guardian: { include: { user: true } } },
      });
      expect(clientGuardian).toBeDefined();
      expect(clientGuardian?.isPrimary).toBe(true);
      expect(clientGuardian?.relation).toBe('Father');
      expect(clientGuardian?.guardian.name).toBe('Suresh Kumar');
      expect(clientGuardian?.guardian.whatsappConsent).toBe(true);
      expect(clientGuardian?.guardian.user.email).toBe('suresh.p12@petals.local');

      // Verify Audit Log
      const auditLog = await prisma.unscopedClient.auditLog.findFirst({
        where: {
          entity: 'Lead',
          entityId: convertLeadId,
          action: 'CONVERT_LEAD',
        },
      });
      expect(auditLog).toBeDefined();
      expect(auditLog?.userId).toBe(managerUserId);

      // Verify Welcome Notification queued
      const notification = await prisma.unscopedClient.notification.findFirst({
        where: {
          userId: clientGuardian?.guardian.userId,
          type: 'WELCOME_CONSENT',
        },
      });
      expect(notification).toBeDefined();
      expect(notification?.title).toContain('Welcome');
    });

    it('rejects double conversion with 409 Conflict', async () => {
      // First conversion
      await request(app.getHttpServer())
        .post(`/api/v1/leads/${convertLeadId}/convert`)
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          name: 'P12 Convert Test Child',
          dob: '2021-05-15',
          guardianName: 'Suresh Kumar',
          guardianPhone: '+919876545555',
        })
        .expect(201);

      // Second conversion attempt
      const res = await request(app.getHttpServer())
        .post(`/api/v1/leads/${convertLeadId}/convert`)
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          name: 'P12 Convert Test Child',
          dob: '2021-05-15',
          guardianName: 'Suresh Kumar',
          guardianPhone: '+919876545555',
        })
        .expect(409);

      expect(res.body.message).toContain('already been converted');
    });

    it('forbids conversion if manager is not assigned to the lead branch', async () => {
      const branch2Lead = await prisma.unscopedClient.lead.create({
        data: {
          branchId: branch2Id,
          name: 'P12 Branch 2 Child',
          contact: '+919876546666',
        },
      });

      const res = await request(app.getHttpServer())
        .post(`/api/v1/leads/${branch2Lead.id}/convert`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'P12 Branch 2 Child',
          dob: '2021-05-15',
          guardianName: 'Suresh Kumar',
          guardianPhone: '+919876546666',
        })
        .expect(403);

      expect(res.body.message).toContain('unassigned branch');
    });
  });

  describe('Kanban Board & List Endpoints', () => {
    beforeAll(async () => {
      // Seed 25 leads for pagination testing
      const stageList = [
        LeadStage.NEW,
        LeadStage.CONTACTED,
        LeadStage.ASSESSMENT_SCHEDULED,
        LeadStage.LOST,
      ];
      for (let i = 1; i <= 25; i++) {
        await prisma.unscopedClient.lead.create({
          data: {
            branchId,
            name: `P12 Board Lead ${i}`,
            contact: `+9198765000${String(i).padStart(2, '0')}`,
            stage: stageList[i % stageList.length],
            nextFollowUp: new Date(),
          },
        });
      }
    });

    it('returns 5 columns with counts from single groupBy and max 20 cards per column', async () => {
      queryCounter.start();

      const res = await request(app.getHttpServer())
        .get('/api/v1/leads/board')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      const queryCount = queryCounter.stop();

      expect(res.body.columns).toHaveLength(5);
      for (const col of res.body.columns) {
        expect(col.stage).toBeDefined();
        expect(typeof col.totalCount).toBe('number');
        expect(Array.isArray(col.items)).toBe(true);
        expect(col.items.length).toBeLessThanOrEqual(20);
      }

      // Query count verification: 1 groupBy + 5 column queries = constant queries (<= 7 queries)
      expect(queryCount).toBeLessThanOrEqual(7);
      expect(res.headers['cache-control']).toContain('no-store');
    });

    it('loads more cards for a specific stage column via cursor pagination', async () => {
      const boardRes = await request(app.getHttpServer())
        .get('/api/v1/leads/board')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      const targetCol = boardRes.body.columns.find((c: any) => c.items.length > 0);
      expect(targetCol).toBeDefined();

      const singleColRes = await request(app.getHttpServer())
        .get(`/api/v1/leads/board?stage=${targetCol.stage}&limitPerColumn=5`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(singleColRes.body.columns).toHaveLength(1);
      expect(singleColRes.body.columns[0].stage).toBe(targetCol.stage);
      expect(singleColRes.body.columns[0].items.length).toBeLessThanOrEqual(5);
    });

    it('paginates list view with offset pagination and whitelisted sorting', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/leads?page=1&pageSize=10&sort=name:asc')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBeLessThanOrEqual(10);
      expect(res.body.meta).toEqual(
        expect.objectContaining({
          page: 1,
          pageSize: 10,
          total: expect.any(Number),
          hasNext: expect.any(Boolean),
        }),
      );
    });
  });

  describe('Follow-up Reminder Job: POST /leads/check-follow-ups', () => {
    beforeAll(async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await prisma.unscopedClient.lead.create({
        data: {
          branchId,
          name: 'P12 Overdue Child',
          contact: '+919876599999',
          stage: LeadStage.NEW,
          nextFollowUp: yesterday,
          ownerId: managerEmployeeId,
        },
      });
    });

    it('triggers reminder check and generates notification for overdue lead owner', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/leads/check-follow-ups')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(res.body.checked).toBeGreaterThanOrEqual(1);
      expect(res.body.notified).toBeGreaterThanOrEqual(1);

      const notif = await prisma.unscopedClient.notification.findFirst({
        where: {
          userId: managerUserId,
          type: 'LEAD_FOLLOW_UP',
          body: { contains: 'P12 Overdue Child' },
        },
      });
      expect(notif).toBeDefined();
      expect(notif?.body).toContain('P12 Overdue Child');
    });
  });
});
