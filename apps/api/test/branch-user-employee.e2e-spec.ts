import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule as AppMainModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/common/prisma';
import { hashPassword } from '../src/common/crypto';
import { RoleKey, AppModule, PermissionAction } from '@petals/types';
import { QueryCounter } from '../src/common/testing/query-count.helper';

describe('Branch, User, and Employee Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let queryCounter: QueryCounter;

  let directorToken: string;
  let managerToken: string;
  let therapistToken: string;

  let branchAlphaId: string;
  let branchBetaId: string;
  let managerUserId: string;
  let therapistEmpId: string;

  const defaultPassword = 'Password123!Secure';
  const managerEmail = 'manager-phase5@petals.com';
  const therapistEmail = 'therapist-phase5@petals.com';

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

    // Clean up test data - delete employees first (FK: employees.user_id -> users.id)
    await prisma.unscopedClient.employee.deleteMany({
      where: {
        user: {
          email: {
            in: [
              managerEmail,
              therapistEmail,
              'new-staff-p5@petals.com',
              'temp-deact@petals.com',
            ],
          },
        },
      },
    });
    await prisma.unscopedClient.user.deleteMany({
      where: {
        email: {
          in: [
            managerEmail,
            therapistEmail,
            'new-staff-p5@petals.com',
            'temp-deact@petals.com',
          ],
        },
      },
    });
    await prisma.unscopedClient.branch.deleteMany({
      where: { code: { in: ['ALP-01', 'BET-01', 'GAM-01'] } },
    });

    await prisma.unscopedClient.branch.deleteMany({
      where: { code: { in: ['ALP-01', 'BET-01', 'GAM-01'] } },
    });

    // Create 2 test branches
    const branchAlpha = await prisma.unscopedClient.branch.create({
      data: {
        name: 'Branch Alpha',
        code: 'ALP-01',
        city: 'Kochi',
        isActive: true,
      },
    });
    branchAlphaId = branchAlpha.id;

    const branchBeta = await prisma.unscopedClient.branch.create({
      data: {
        name: 'Branch Beta',
        code: 'BET-01',
        city: 'Calicut',
        isActive: true,
      },
    });
    branchBetaId = branchBeta.id;

    const managerRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.MANAGER },
    });
    const therapistRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.THERAPIST },
    });

    const passwordHash = await hashPassword(defaultPassword);

    // Create Manager (assigned ONLY to Branch Alpha)
    const mgr = await prisma.unscopedClient.user.create({
      data: {
        email: managerEmail,
        name: 'Manager Phase5',
        passwordHash,
        roleId: managerRole.id,
        isActive: true,
      },
    });
    managerUserId = mgr.id;
    await prisma.unscopedClient.userBranch.create({
      data: { userId: mgr.id, branchId: branchAlphaId, isPrimary: true },
    });

    // Create Therapist (assigned to Branch Alpha)
    const th = await prisma.unscopedClient.user.create({
      data: {
        email: therapistEmail,
        name: 'Therapist Phase5',
        passwordHash,
        roleId: therapistRole.id,
        isActive: true,
      },
    });
    therapistEmpId = th.id;
    await prisma.unscopedClient.userBranch.create({
      data: { userId: th.id, branchId: branchAlphaId, isPrimary: true },
    });

    // Create employee profile for therapist
    const emp = await prisma.unscopedClient.employee.create({
      data: {
        userId: th.id,
        employeeCode: 'TH-P5-01',
        designation: 'Senior Speech Therapist',
        salary: 75000,
        joinedOn: new Date('2025-01-01'),
      },
    });
    therapistEmpId = emp.id;

    // Login Director
    const dirRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('X-Forwarded-For', '10.5.0.1')
      .send({ email: 'director@petals.com', password: 'ChangeMe123!' });
    directorToken = dirRes.body.accessToken;

    // Login Manager
    const mgrRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('X-Forwarded-For', '10.5.0.2')
      .send({ email: managerEmail, password: defaultPassword });
    managerToken = mgrRes.body.accessToken;

    // Login Therapist
    const thRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('X-Forwarded-For', '10.5.0.3')
      .send({ email: therapistEmail, password: defaultPassword });
    therapistToken = thRes.body.accessToken;
  });

  afterAll(async () => {
    // Delete employees first (FK constraint: employees.user_id -> users.id)
    await prisma.unscopedClient.employee.deleteMany({
      where: {
        user: {
          email: { in: [managerEmail, therapistEmail, 'new-staff-p5@petals.com', 'temp-deact@petals.com'] },
        },
      },
    });
    await prisma.unscopedClient.user.deleteMany({
      where: {
        email: {
          in: [
            managerEmail,
            therapistEmail,
            'new-staff-p5@petals.com',
            'temp-deact@petals.com',
          ],
        },
      },
    });
    await prisma.unscopedClient.branch.deleteMany({
      where: { code: { in: ['ALP-01', 'BET-01', 'GAM-01'] } },
    });
    await app.close();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Branch Scoping & CRUD
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Branch Scoping and Management', () => {
    it('should forbid non-director from creating a branch', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/branches')
        .set('Authorization', `Bearer ${managerToken}`)
        .set('X-Forwarded-For', '10.5.1.1')
        .send({ name: 'Unauthorized Branch', code: 'GAM-01' });

      expect(res.status).toBe(403);
    });

    it('should allow Director to create a branch', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/branches')
        .set('Authorization', `Bearer ${directorToken}`)
        .set('X-Forwarded-For', '10.5.1.2')
        .send({ name: 'Branch Gamma', code: 'GAM-01', city: 'Trivandrum' });

      expect(res.status).toBe(201);
      expect(res.body.code).toBe('GAM-01');
    });

    it('should allow Director to see all branches', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/branches')
        .set('Authorization', `Bearer ${directorToken}`)
        .set('X-Forwarded-For', '10.5.1.3');

      expect(res.status).toBe(200);
      const codes = res.body.data.map((b: any) => b.code);
      expect(codes).toContain('ALP-01');
      expect(codes).toContain('BET-01');
      expect(codes).toContain('GAM-01');
    });

    it('should ensure non-director user only sees assigned branches', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/branches')
        .set('Authorization', `Bearer ${managerToken}`)
        .set('X-Forwarded-For', '10.5.1.4');

      expect(res.status).toBe(200);
      const codes = res.body.data.map((b: any) => b.code);
      // Manager is ONLY assigned to Branch Alpha
      expect(codes).toContain('ALP-01');
      expect(codes).not.toContain('BET-01');
      expect(codes).not.toContain('GAM-01');
    });

    it('should forbid non-director from accessing unassigned branch by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/branches/${branchBetaId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .set('X-Forwarded-For', '10.5.1.5');

      expect(res.status).toBe(403);
    });

    it('should allow non-director to access assigned branch by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/branches/${branchAlphaId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .set('X-Forwarded-For', '10.5.1.6');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(branchAlphaId);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Departments
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Departments', () => {
    it('should return seeded departments for staff members', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/departments')
        .set('Authorization', `Bearer ${therapistToken}`)
        .set('X-Forwarded-For', '10.5.2.1');

      expect(res.status).toBe(200);
      const codes = res.body.map((d: any) => d.code);
      expect(codes).toContain('ST');
      expect(codes).toContain('OT');
      expect(codes).toContain('PT');
      expect(codes).toContain('ABA');
      expect(codes).toContain('CP');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. User CRUD, Branch Assignment & Deactivation
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Staff Users', () => {
    it('should allow creating a staff user with branches and primary branch', async () => {
      const therapistRole = await prisma.unscopedClient.role.findUniqueOrThrow({
        where: { key: RoleKey.THERAPIST },
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${directorToken}`)
        .set('X-Forwarded-For', '10.5.3.1')
        .send({
          name: 'New Staff P5',
          email: 'new-staff-p5@petals.com',
          phone: '+919876500000',
          roleId: therapistRole.id,
          branches: [
            { branchId: branchAlphaId, isPrimary: true },
            { branchId: branchBetaId, isPrimary: false },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe('new-staff-p5@petals.com');
      expect(res.body.branches.length).toBe(2);
      const primaryBranch = res.body.branches.find((b: any) => b.isPrimary);
      expect(primaryBranch.branchId).toBe(branchAlphaId);
    });

    it('should reject creating a user with PARENT role directly', async () => {
      const parentRole = await prisma.unscopedClient.role.findUniqueOrThrow({
        where: { key: RoleKey.PARENT },
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${directorToken}`)
        .set('X-Forwarded-For', '10.5.3.2')
        .send({
          name: 'Illegal Parent',
          email: 'illegal-parent@petals.com',
          roleId: parentRole.id,
          branches: [{ branchId: branchAlphaId, isPrimary: true }],
        });

      expect(res.status).toBe(400);
    });

    it('should immediately block deactivated user on next request', async () => {
      const therapistRole = await prisma.unscopedClient.role.findUniqueOrThrow({
        where: { key: RoleKey.THERAPIST },
      });

      // Create a temp user and login
      const tempUser = await prisma.unscopedClient.user.create({
        data: {
          name: 'Temp Deact User',
          email: 'temp-deact@petals.com',
          passwordHash: await hashPassword(defaultPassword),
          roleId: therapistRole.id,
          isActive: true,
        },
      });
      await prisma.unscopedClient.userBranch.create({
        data: { userId: tempUser.id, branchId: branchAlphaId, isPrimary: true },
      });

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('X-Forwarded-For', '10.5.3.3')
        .send({ email: 'temp-deact@petals.com', password: defaultPassword });
      const tempToken = loginRes.body.accessToken;

      // Verify tempToken works
      const testBefore = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${tempToken}`)
        .set('X-Forwarded-For', '10.5.3.4');
      expect(testBefore.status).toBe(200);

      // Director deactivates user
      const deactRes = await request(app.getHttpServer())
        .patch(`/api/v1/users/${tempUser.id}/deactivate`)
        .set('Authorization', `Bearer ${directorToken}`)
        .set('X-Forwarded-For', '10.5.3.5');
      expect(deactRes.status).toBe(200);

      // Verify immediate 401 on next request with that token
      const testAfter = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${tempToken}`)
        .set('X-Forwarded-For', '10.5.3.6');
      expect(testAfter.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Employees & Salary Permission Visibility
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Employees and Salary Permission', () => {
    it('should return salary to Director who has EMPLOYEE_SALARY VIEW permission', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/employees/${therapistEmpId}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .set('X-Forwarded-For', '10.5.4.1');

      expect(res.status).toBe(200);
      expect(res.body.salary).toBeDefined();
      expect(Number(res.body.salary)).toBe(75000);
    });

    it('should hide salary from Manager who lacks EMPLOYEE_SALARY VIEW permission', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/employees/${therapistEmpId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .set('X-Forwarded-For', '10.5.4.2');

      expect(res.status).toBe(200);
      expect(res.body.salary).toBeUndefined();
      expect(res.body.employeeCode).toBe('TH-P5-01');
    });

    it('should hide salary in employee list for users without permission', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/employees')
        .set('Authorization', `Bearer ${managerToken}`)
        .set('X-Forwarded-For', '10.5.4.3');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      for (const emp of res.body.data) {
        expect(emp.salary).toBeUndefined();
      }
    });

    it('should immediately show salary once Director grants EMPLOYEE_SALARY VIEW override', async () => {
      // Grant override to Manager
      const overrideRes = await request(app.getHttpServer())
        .put(`/api/v1/access/overrides/${managerUserId}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .set('X-Forwarded-For', '10.5.4.4')
        .send({
          overrides: [
            {
              module: AppModule.EMPLOYEE_SALARY,
              action: PermissionAction.VIEW,
              allowed: true,
            },
          ],
        });

      expect(overrideRes.status).toBe(200);

      // Manager immediately sees salary
      const res = await request(app.getHttpServer())
        .get(`/api/v1/employees/${therapistEmpId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .set('X-Forwarded-For', '10.5.4.5');

      expect(res.status).toBe(200);
      expect(res.body.salary).toBeDefined();
      expect(Number(res.body.salary)).toBe(75000);

      // Clean up override
      await request(app.getHttpServer())
        .delete(`/api/v1/access/overrides/${managerUserId}?module=${AppModule.EMPLOYEE_SALARY}&action=${PermissionAction.VIEW}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .set('X-Forwarded-For', '10.5.4.6');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Pagination Caps
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Pagination Caps', () => {
    it('should reject pageSize exceeding 100 with 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/employees?pageSize=250')
        .set('Authorization', `Bearer ${directorToken}`)
        .set('X-Forwarded-For', '10.5.5.1');

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('pageSize must not be greater than 100')]),
      );
    });

    it('should accept valid pageSize and return pagination meta', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/employees?page=1&pageSize=10')
        .set('Authorization', `Bearer ${directorToken}`)
        .set('X-Forwarded-For', '10.5.5.2');

      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.pageSize).toBe(10);
      expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. Query Count Verification
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Employee List Query Count', () => {
    it('should execute a fixed number of queries (no N+1 per row queries)', async () => {
      queryCounter.start();

      const res = await request(app.getHttpServer())
        .get('/api/v1/employees?pageSize=20')
        .set('Authorization', `Bearer ${directorToken}`)
        .set('X-Forwarded-For', '10.5.6.1');

      const count = queryCounter.stop();

      expect(res.status).toBe(200);
      // Auth guard does user session/role lookup (1-2 queries)
      // Employee listing does count + findMany + includes (2-3 queries)
      // Total queries should be <= 6 (never N+1 per employee row)
      expect(count).toBeLessThanOrEqual(6);
    });
  });
});

