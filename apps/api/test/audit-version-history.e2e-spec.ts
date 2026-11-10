import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule as AppMainModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/common/prisma';
import { VersionService } from '../src/clinical-history/version.service';
import { hashPassword } from '../src/common/crypto';
import { RoleKey } from '@petals/types';

describe('Audit and Version History Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let versionService: VersionService;

  let directorToken: string;
  let directorUserId: string;
  let therapistToken: string;
  let therapistUserId: string;
  let managerToken: string;

  let testBranchId: string;
  let testDepartmentId: string;
  let testClientId: string;
  let testEmployeeId: string;
  let testAssessmentId: string;
  let therapistRoleId: string;

  const defaultPassword = 'Password123!Secure';
  const directorPassword = 'ChangeMe123!';
  const directorEmail = 'director@petals.com';
  const therapistEmail = 'therapist-p6@petals.com';
  const managerEmail = 'manager-p6@petals.com';

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
    versionService = app.get(VersionService);

    // Clean up any existing test data
    await prisma.unscopedClient.clinicalEntryVersion.deleteMany({
      where: { entityType: 'Assessment' },
    });
    await prisma.unscopedClient.assessment.deleteMany({
      where: { tool: 'TEST-WISC-V' },
    });
    await prisma.unscopedClient.auditLog.deleteMany({
      where: {
        OR: [
          { entity: 'AuditLogTestEntity' },
          { entity: 'ClinicalHistory' },
        ],
      },
    });

    await prisma.unscopedClient.user.deleteMany({
      where: { email: { contains: 'audited-user' } },
    });
    // 1. Get Director
    const directorUser = await prisma.unscopedClient.user.findFirstOrThrow({
      where: { role: { key: RoleKey.DIRECTOR } },
    });
    directorUserId = directorUser.id;

    const dirLoginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: directorEmail, password: directorPassword })
      .expect(200);
    directorToken = dirLoginRes.body.accessToken;

    // 2. Setup test Branch and Department
    let branch = await prisma.unscopedClient.branch.findFirst({
      where: { code: 'P6BR' },
    });
    if (!branch) {
      branch = await prisma.unscopedClient.branch.create({
        data: {
          name: 'Phase 6 Branch',
          code: 'P6BR',
          city: 'Bangalore',
          address: '456 Clinic Road',
          phone: '+919988776655',
        },
      });
    }
    testBranchId = branch.id;

    const dept = await prisma.unscopedClient.department.findFirstOrThrow({
      where: { code: 'OT' },
    });
    testDepartmentId = dept.id;

    // 3. Create Therapist and Manager users
    const therapistRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.THERAPIST },
    });
    therapistRoleId = therapistRole.id;
    const managerRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.MANAGER },
    });

    // Clean up users if exist
    await prisma.unscopedClient.employee.deleteMany({
      where: {
        user: { email: { in: [therapistEmail, managerEmail] } },
      },
    });
    await prisma.unscopedClient.user.deleteMany({
      where: { email: { in: [therapistEmail, managerEmail] } },
    });

    const hashedPassword = await hashPassword(defaultPassword);
    const therapistUser = await prisma.unscopedClient.user.create({
      data: {
        name: 'Therapist Phase 6',
        email: therapistEmail,
        passwordHash: hashedPassword,
        phone: '+919876543261',
        roleId: therapistRole.id,
        branches: { create: { branchId: testBranchId, isPrimary: true } },
      },
    });
    therapistUserId = therapistUser.id;

    const therapistEmp = await prisma.unscopedClient.employee.create({
      data: {
        userId: therapistUserId,
        departmentId: testDepartmentId,
        employeeCode: 'EMP-P6-001',
        designation: 'Occupational Therapist',
        salary: 40000,
        joinedOn: new Date('2025-01-01'),
      },
    });
    testEmployeeId = therapistEmp.id;

    await prisma.unscopedClient.user.create({
      data: {
        name: 'Manager Phase 6',
        email: managerEmail,
        passwordHash: hashedPassword,
        phone: '+919876543262',
        roleId: managerRole.id,
        branches: { create: { branchId: testBranchId, isPrimary: true } },
      },
    });

    // Log in therapist and manager
    const therLoginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: therapistEmail, password: defaultPassword })
      .expect(200);
    therapistToken = therLoginRes.body.accessToken;

    const mgrLoginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: managerEmail, password: defaultPassword })
      .expect(200);
    managerToken = mgrLoginRes.body.accessToken;

    // 4. Create Client for clinical assessments
    let client = await prisma.unscopedClient.client.findFirst({
      where: { clientCode: 'CLI-P6-001' },
    });
    if (!client) {
      client = await prisma.unscopedClient.client.create({
        data: {
          clientCode: 'CLI-P6-001',
          name: 'Junior Test Child',
          dob: new Date('2018-05-15'),
          gender: 'MALE',
          branchId: testBranchId,
        },
      });
    }
    testClientId = client.id;
  });

  afterAll(async () => {
    if (prisma) {
      // Clean up
      await prisma.unscopedClient.clinicalEntryVersion.deleteMany({
        where: { entityType: 'Assessment' },
      });
      await prisma.unscopedClient.assessment.deleteMany({
        where: { tool: 'TEST-WISC-V' },
      });
      await prisma.unscopedClient.client.deleteMany({
        where: { clientCode: 'CLI-P6-001' },
      });
      await prisma.unscopedClient.employee.deleteMany({
        where: {
          user: { email: { in: [therapistEmail, managerEmail] } },
        },
      });
      await prisma.unscopedClient.user.deleteMany({
        where: { email: { in: [therapistEmail, managerEmail] } },
      });
    }
    if (app) {
      await app.close();
    }
  });

  describe('1. AuditInterceptor & Metadata Redaction', () => {
    it('should log login event and redact password in audit metadata', async () => {
      // Login attempt
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: directorEmail,
          password: directorPassword,
        })
        .expect(200);

      // Give async interceptor a moment to write log
      await new Promise((r) => setTimeout(r, 200));

      const auditLogs = await prisma.unscopedClient.auditLog.findMany({
        where: {
          action: 'LOGIN',
          userId: directorUserId,
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      expect(auditLogs.length).toBeGreaterThan(0);
      const log = auditLogs[0];
      expect(log.action).toBe('LOGIN');
      const meta = log.metadata as any;
      expect(meta?.body?.password).toBe('[REDACTED]');
      expect(meta?.body?.email).toBe(directorEmail);
    });

    it('should log mutating request and redact passwords and secrets', async () => {
      const auditedUserEmail = `audited-user-${Date.now()}@petals.com`;
      // Mutating request: Director creates a user with sensitive password
      const res = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          name: 'Audited Test User',
          email: auditedUserEmail,
          phone: '+919876543999',
          roleId: therapistRoleId,
          branches: [{ branchId: testBranchId, isPrimary: true }],
          password: 'SecretPlainPassword123!',
        })
        .expect(201);

      const createdUserId = res.body.id || res.body.data?.id;

      await new Promise((r) => setTimeout(r, 200));

      const log = await prisma.unscopedClient.auditLog.findFirst({
        where: {
          entity: 'User',
          entityId: createdUserId,
          action: 'CREATE',
        },
      });

      expect(log).toBeDefined();
      expect(log?.userId).toBe(directorUserId);
      const meta = log?.metadata as any;
      expect(meta?.body?.password).toBe('[REDACTED]');

      // Cleanup created user
      await prisma.unscopedClient.user.deleteMany({
        where: { id: createdUserId },
      });
    });
  });

  describe('2. Audit Log Endpoint (Director Only & Cursor Pagination)', () => {
    it('should block non-Director roles from viewing audit logs with 403', async () => {
      // Therapist
      await request(app.getHttpServer())
        .get('/api/v1/audit-logs')
        .set('Authorization', `Bearer ${therapistToken}`)
        .expect(403);

      // Manager
      await request(app.getHttpServer())
        .get('/api/v1/audit-logs')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);
    });

    it('should allow Director to list audit logs with filters and cursor pagination', async () => {
      // Seed at least 4 audit logs for pagination testing
      for (let i = 1; i <= 4; i++) {
        await prisma.unscopedClient.auditLog.create({
          data: {
            userId: directorUserId,
            action: `TEST_ACTION_${i}`,
            entity: 'AuditLogTestEntity',
            ipAddress: '127.0.0.1',
          },
        });
      }

      // Page 1: limit 2
      const resPage1 = await request(app.getHttpServer())
        .get('/api/v1/audit-logs?entity=AuditLogTestEntity&limit=2')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(resPage1.body.data).toHaveLength(2);
      expect(resPage1.body.meta.hasNext).toBe(true);
      expect(resPage1.body.meta.nextCursor).toBeDefined();

      const nextCursor = resPage1.body.meta.nextCursor;

      // Page 2: with cursor
      const resPage2 = await request(app.getHttpServer())
        .get(`/api/v1/audit-logs?entity=AuditLogTestEntity&cursor=${nextCursor}&limit=2`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(resPage2.body.data).toHaveLength(2);
      // Items must be different from page 1
      const page1Ids = resPage1.body.data.map((item: any) => item.id);
      const page2Ids = resPage2.body.data.map((item: any) => item.id);
      expect(page1Ids).not.toEqual(expect.arrayContaining(page2Ids));
    });

    it('should filter audit logs by userId', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/audit-logs?userId=${directorUserId}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThan(0);
      for (const item of res.body.data) {
        expect(item.userId).toBe(directorUserId);
      }
    });
  });

  describe('3. Clinical Version History & Restore ("Done When" criteria)', () => {
    it('should edit assessment, delete it, restore it and produce 3 history rows with correct previous content, plus cursor pagination', async () => {
      // 1. Initial Assessment Creation
      const initialAssessment = await prisma.unscopedClient.assessment.create({
        data: {
          clientId: testClientId,
          assessorId: testEmployeeId,
          assessedOn: new Date('2026-02-01'),
          tool: 'TEST-WISC-V',
          observation: 'Initial clinical observation: baseline sensory processing deficits noted.',
          summary: 'Initial baseline summary.',
          scores: { verbal: 85, performance: 90 },
        },
      });
      testAssessmentId = initialAssessment.id;

      // 2. Edit Assessment (Inside transaction: write version before edit)
      const stateBeforeEdit = await prisma.unscopedClient.assessment.findUniqueOrThrow({
        where: { id: testAssessmentId },
      });

      await prisma.$transaction(async (tx) => {
        // Record EDIT version
        await versionService.recordEdit(
          {
            entityType: 'Assessment',
            entityId: testAssessmentId,
            previousContent: stateBeforeEdit,
            changedById: therapistUserId,
            reason: 'Mid-term progress update notes added',
          },
          tx,
        );

        // Apply edit
        await tx.assessment.update({
          where: { id: testAssessmentId },
          data: {
            observation: 'Edited observation: child shows marked improvement in focus and motor coordination.',
            summary: 'Updated mid-term summary with progress metrics.',
          },
        });
      });

      // 3. Delete Assessment (Soft-delete: write version before delete)
      const stateBeforeDelete = await prisma.unscopedClient.assessment.findUniqueOrThrow({
        where: { id: testAssessmentId },
      });

      await prisma.$transaction(async (tx) => {
        // Record DELETE version
        await versionService.recordDelete(
          {
            entityType: 'Assessment',
            entityId: testAssessmentId,
            previousContent: stateBeforeDelete,
            changedById: therapistUserId,
            reason: 'Accidental deletion by clinician',
          },
          tx,
        );

        // Apply soft delete
        await tx.assessment.update({
          where: { id: testAssessmentId },
          data: {
            deletedAt: new Date(),
          },
        });
      });

      // Verify assessment is currently soft-deleted
      const deletedAssessment = await prisma.unscopedClient.assessment.findUniqueOrThrow({
        where: { id: testAssessmentId },
      });
      expect(deletedAssessment.deletedAt).not.toBeNull();

      // 4. Restore Assessment
      // 4a. Non-Director cannot restore (Therapist receives 403 Forbidden)
      await request(app.getHttpServer())
        .post(`/api/v1/clinical/history/Assessment/${testAssessmentId}/restore`)
        .set('Authorization', `Bearer ${therapistToken}`)
        .send({ reason: 'Therapist unauthorized attempt' })
        .expect(403);

      // 4b. Director restores the assessment
      const restoreRes = await request(app.getHttpServer())
        .post(`/api/v1/clinical/history/Assessment/${testAssessmentId}/restore`)
        .set('Authorization', `Bearer ${directorToken}`)
        .send({ reason: 'Restored after clinical review by Director' })
        .expect(201);

      expect(restoreRes.body.message).toContain('restored successfully');
      expect(restoreRes.body.version.changeType).toBe('RESTORE');

      // Verify assessment in database is un-deleted
      const restoredAssessment = await prisma.unscopedClient.assessment.findUniqueOrThrow({
        where: { id: testAssessmentId },
      });
      expect(restoredAssessment.deletedAt).toBeNull();
      expect(restoredAssessment.observation).toContain('child shows marked improvement');

      // 5. Query History: Must see exactly 3 history rows!
      const historyRes = await request(app.getHttpServer())
        .get(`/api/v1/clinical/history/Assessment/${testAssessmentId}`)
        .set('Authorization', `Bearer ${therapistToken}`)
        .expect(200);

      const rows = historyRes.body.data;
      expect(rows).toHaveLength(3);

      // Row 1 (most recent): RESTORE
      const restoreRow = rows[0];
      expect(restoreRow.versionNo).toBe(3);
      expect(restoreRow.changeType).toBe('RESTORE');
      expect(restoreRow.previousContent.deletedAt).not.toBeNull();
      expect(restoreRow.changedBy.email).toBe(directorEmail);

      // Row 2: DELETE
      const deleteRow = rows[1];
      expect(deleteRow.versionNo).toBe(2);
      expect(deleteRow.changeType).toBe('DELETE');
      expect(deleteRow.previousContent.observation).toContain('child shows marked improvement');
      expect(deleteRow.previousContent.deletedAt).toBeNull();

      // Row 3: EDIT
      const editRow = rows[2];
      expect(editRow.versionNo).toBe(1);
      expect(editRow.changeType).toBe('EDIT');
      expect(editRow.previousContent.observation).toContain('Initial clinical observation: baseline sensory');

      // 6. Test History Cursor Pagination
      const histPage1 = await request(app.getHttpServer())
        .get(`/api/v1/clinical/history/Assessment/${testAssessmentId}?limit=2`)
        .set('Authorization', `Bearer ${therapistToken}`)
        .expect(200);

      expect(histPage1.body.data).toHaveLength(2);
      expect(histPage1.body.meta.hasNext).toBe(true);
      expect(histPage1.body.meta.nextCursor).toBeDefined();

      const histCursor = histPage1.body.meta.nextCursor;

      const histPage2 = await request(app.getHttpServer())
        .get(`/api/v1/clinical/history/Assessment/${testAssessmentId}?cursor=${histCursor}&limit=2`)
        .set('Authorization', `Bearer ${therapistToken}`)
        .expect(200);

      expect(histPage2.body.data).toHaveLength(1);
      expect(histPage2.body.meta.hasNext).toBe(false);
      expect(histPage2.body.data[0].versionNo).toBe(1);
    });
  });
});
