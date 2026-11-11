import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as crypto from 'crypto';
import { AppModule as AppMainModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/common/prisma';
import { CacheService } from '../src/common/redis';
import { hashPassword } from '../src/common/crypto';
import {
  RoleKey,
  CommunicationChannel,
  MessageStatus,
  TemplateStatus,
  ClientStatus,
} from '@petals/types';

describe('Communication Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cacheService: CacheService;

  let directorToken: string;
  let managerToken: string;
  let therapistToken: string;
  let parentToken: string;

  let branchId: string;
  let branch2Id: string;
  let child1Id: string;
  let child2Id: string;
  let guardian1Id: string;

  const defaultPassword = 'Password123!Secure';
  const directorPassword = 'ChangeMe123!';
  const managerEmail = 'manager1-p13@petals.com';
  const therapistEmail = 'therapist1-p13@petals.com';
  const parentEmail = 'parent1-p13@petals.com';

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
    await prisma.unscopedClient.communicationLog.deleteMany({
      where: {
        recipient: { in: ['+919876500013', '+919876500014', 'parent1-p13@petals.com'] },
      },
    });
    await prisma.unscopedClient.whatsappTemplate.deleteMany({
      where: {
        name: { in: ['p13_test_template', 'p13_unapproved_template', 'p13_bulk_template'] },
      },
    });
    await prisma.unscopedClient.clientGuardian.deleteMany({
      where: { client: { clientCode: { startsWith: 'P13' } } },
    });
    await prisma.unscopedClient.client.deleteMany({
      where: { clientCode: { startsWith: 'P13' } },
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
      where: { code: 'P13B1' },
      update: {},
      create: {
        name: 'Phase 13 Branch One',
        code: 'P13B1',
        city: 'Kochi',
      },
    });
    branchId = branch1.id;

    const branch2 = await prisma.unscopedClient.branch.upsert({
      where: { code: 'P13B2' },
      update: {},
      create: {
        name: 'Phase 13 Branch Two',
        code: 'P13B2',
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
        name: 'P13 Manager',
        roleId: managerRole.id,
        isActive: true,
        branches: {
          create: [{ branchId, isPrimary: true }],
        },
      },
    });
    await prisma.unscopedClient.employee.create({
      data: {
        userId: managerUser.id,
        employeeCode: 'P13-EMP-MGR',
        joinedOn: new Date('2026-01-01'),
      },
    });
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
        name: 'P13 Therapist',
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

    // 5. Setup Parent & Guardian
    const parentRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.PARENT },
    });
    const parentUser = await prisma.unscopedClient.user.create({
      data: {
        email: parentEmail,
        passwordHash: hashedPassword,
        name: 'P13 Parent User',
        phone: '+919876500013',
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

    const guardian1 = await prisma.unscopedClient.guardian.create({
      data: {
        userId: parentUser.id,
        name: 'P13 Parent User',
        whatsappNo: '+919876500013',
        whatsappConsent: true,
        emailConsent: true,
      },
    });
    guardian1Id = guardian1.id;

    // 6. Setup Clients
    const client1 = await prisma.unscopedClient.client.create({
      data: {
        branchId,
        clientCode: 'P13B1-2026-0001',
        name: 'P13 Child One',
        dob: new Date('2021-01-01'),
        status: ClientStatus.ACTIVE,
      },
    });
    child1Id = client1.id;

    await prisma.unscopedClient.clientGuardian.create({
      data: {
        clientId: child1Id,
        guardianId: guardian1Id,
        relation: 'Mother',
        isPrimary: true,
      },
    });

    const client2 = await prisma.unscopedClient.client.create({
      data: {
        branchId: branch2Id,
        clientCode: 'P13B2-2026-0002',
        name: 'P13 Child Two',
        dob: new Date('2020-05-15'),
        status: ClientStatus.ACTIVE,
      },
    });
    child2Id = client2.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('RBAC & Role Scoping', () => {
    it('forbids Therapist and Parent from managing templates', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/communication/templates')
        .set('Authorization', `Bearer ${therapistToken}`)
        .expect(403);

      await request(app.getHttpServer())
        .get('/api/v1/communication/templates')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(403);
    });

    it('forbids Manager from sending messages to clients in an unassigned branch', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/communication/send')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          clientId: child2Id, // in Branch 2
          channel: CommunicationChannel.EMAIL,
          customMessage: 'Reminder message',
        })
        .expect(403);

      expect(res.body.message).toContain('unassigned branch');
    });
  });

  describe('WhatsApp Templates Approval Workflow', () => {
    let unapprovedTemplateId: string;
    let approvedTemplateId: string;

    it('allows Manager to create a template in DRAFT status', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/communication/templates')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'p13_unapproved_template',
          body: 'Hello {{guardianName}}, this is a draft message.',
          language: 'en',
        })
        .expect(201);

      expect(res.body.name).toBe('p13_unapproved_template');
      expect(res.body.status).toBe(TemplateStatus.DRAFT);
      unapprovedTemplateId = res.body.id;
    });

    it('strictly forbids sending WhatsApp messages using unapproved templates', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/communication/send')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          clientId: child1Id,
          channel: CommunicationChannel.WHATSAPP,
          templateId: unapprovedTemplateId,
        })
        .expect(400);

      expect(res.body.message).toContain('Only approved templates can be used');
    });

    it('allows Director to approve a template', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/communication/templates/${unapprovedTemplateId}/approve`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(201);

      expect(res.body.status).toBe(TemplateStatus.APPROVED);
      expect(res.body.approvedBy).toBeDefined();
      approvedTemplateId = unapprovedTemplateId;
    });

    it('successfully queues WhatsApp message using the approved template', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/communication/send')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          clientId: child1Id,
          channel: CommunicationChannel.WHATSAPP,
          templateId: approvedTemplateId,
          parameters: { guardianName: 'P13 Parent' },
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.channel).toBe(CommunicationChannel.WHATSAPP);
      expect(res.body.status).toBe(MessageStatus.QUEUED);
      expect(res.headers['cache-control']).toContain('no-store');
    });
  });

  describe('Clinical Details Privacy Protection', () => {
    it('rejects message if it contains sensitive clinical terms', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/communication/send')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          clientId: child1Id,
          channel: CommunicationChannel.EMAIL,
          customMessage: 'Please review the child diagnosis before appointment.',
        })
        .expect(400);

      expect(res.body.message).toContain('sensitive clinical details');
    });
  });

  describe('Rate Limiting & Caps (429s)', () => {
    let bulkTemplateId: string;

    beforeAll(async () => {
      const t = await prisma.unscopedClient.whatsappTemplate.create({
        data: {
          name: 'p13_bulk_template',
          body: 'Hello {{guardianName}}, fees are pending.',
          status: TemplateStatus.APPROVED,
        },
      });
      bulkTemplateId = t.id;
    });

    it('enforces 5 bulk sends per hour per user, rejecting the 6th with 429', async () => {
      // Execute 5 bulk sends
      for (let i = 1; i <= 5; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/communication/send-bulk')
          .set('Authorization', `Bearer ${managerToken}`)
          .send({
            branchId,
            filter: 'ALL_ACTIVE',
            channel: CommunicationChannel.WHATSAPP,
            templateId: bulkTemplateId,
          })
          .expect(201);
      }

      // 6th bulk send must be rejected with 429 Too Many Requests
      const res = await request(app.getHttpServer())
        .post('/api/v1/communication/send-bulk')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          branchId,
          filter: 'ALL_ACTIVE',
          channel: CommunicationChannel.WHATSAPP,
          templateId: bulkTemplateId,
        })
        .expect(429);

      expect(res.body.message).toContain('max 5 bulk sends per hour');
    });

    it('enforces daily branch message cap with 429', async () => {
      // Simulate branch cap reached by setting cache key
      const today = new Date().toISOString().slice(0, 10);
      const capKey = `rate:branch_msgs:${branchId}:${today}`;
      await cacheService.set(capKey, 500, 86400);

      const res = await request(app.getHttpServer())
        .post('/api/v1/communication/send')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          clientId: child1Id,
          channel: CommunicationChannel.EMAIL,
          customMessage: 'Important update from clinic.',
        })
        .expect(429);

      expect(res.body.message).toContain('Daily message cap');

      // Reset cache cap for subsequent tests
      await cacheService.set(capKey, 10, 86400);
    });
  });

  describe('Delivery-Status Webhook Verification', () => {
    let testLogId: string;
    const providerRef = 'test_wa_ref_999';

    beforeAll(async () => {
      const log = await prisma.unscopedClient.communicationLog.create({
        data: {
          clientId: child1Id,
          sentById: (await prisma.unscopedClient.user.findFirstOrThrow({ where: { email: managerEmail } })).id,
          channel: CommunicationChannel.WHATSAPP,
          recipient: '+919876500013',
          providerRef,
          status: MessageStatus.SENT,
        },
      });
      testLogId = log.id;
    });

    it('rejects webhook with missing or invalid signature (401 Unauthorized)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/communication/webhook')
        .send({
          providerRef,
          status: MessageStatus.DELIVERED,
        })
        .expect(401);

      await request(app.getHttpServer())
        .post('/api/v1/communication/webhook')
        .set('x-hub-signature-256', 'sha256=invalidhash')
        .send({
          providerRef,
          status: MessageStatus.DELIVERED,
        })
        .expect(401);
    });

    it('accepts webhook with valid signature and updates communication log status', async () => {
      const secret = process.env.WHATSAPP_WEBHOOK_SECRET || 'test-webhook-secret';
      const body = {
        providerRef,
        status: MessageStatus.READ,
      };
      const rawBodyStr = JSON.stringify(body);
      const validHash = crypto.createHmac('sha256', secret).update(rawBodyStr).digest('hex');

      const res = await request(app.getHttpServer())
        .post('/api/v1/communication/webhook')
        .set('x-hub-signature-256', `sha256=${validHash}`)
        .send(body)
        .expect(200);

      expect(res.body.received).toBe(true);

      const updated = await prisma.unscopedClient.communicationLog.findUnique({
        where: { id: testLogId },
      });
      expect(updated?.status).toBe(MessageStatus.READ);
    });
  });

  describe('Call Logs & Cursor Pagination', () => {
    beforeAll(async () => {
      // Seed 5 call logs
      for (let i = 1; i <= 5; i++) {
        await request(app.getHttpServer())
          .post(`/api/v1/clients/${child1Id}/call-logs`)
          .set('Authorization', `Bearer ${managerToken}`)
          .send({
            recipient: '+919876500013',
            notes: `Phone discussion ${i} with mother`,
            durationSeconds: 60 * i,
          })
          .expect(201);
      }
    });

    it('paginates client communication logs via cursor pagination', async () => {
      // Page 1: limit 2
      const resPage1 = await request(app.getHttpServer())
        .get(`/api/v1/clients/${child1Id}/communication-logs?limit=2`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(resPage1.body.data).toHaveLength(2);
      expect(resPage1.body.meta.hasNext).toBe(true);
      expect(resPage1.body.meta.nextCursor).toBeDefined();

      const cursor = resPage1.body.meta.nextCursor;

      // Page 2: with cursor
      const resPage2 = await request(app.getHttpServer())
        .get(`/api/v1/clients/${child1Id}/communication-logs?limit=2&cursor=${cursor}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(resPage2.body.data).toHaveLength(2);
      expect(resPage2.body.data[0].id).not.toBe(resPage1.body.data[0].id);
      expect(resPage2.headers['cache-control']).toContain('no-store');
    });
  });
});

