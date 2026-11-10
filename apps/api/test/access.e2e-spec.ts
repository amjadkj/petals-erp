import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector, ModulesContainer } from '@nestjs/core';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule as AppMainModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/common/prisma';
import { hashPassword } from '../src/common/crypto';
import { RoleKey, AppModule, PermissionAction, PermissionScope } from '@petals/types';
import { IS_PUBLIC_KEY } from '../src/common/decorators/public.decorator';
import { ROLES_KEY } from '../src/common/decorators/roles.decorator';
import { PERMISSION_KEY } from '../src/common/decorators/require-permission.decorator';

describe('Access Control Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let reflector: Reflector;

  let directorToken: string;
  let managerToken: string;
  let therapistToken: string;
  let parentToken: string;

  let managerUserId: string;

  const managerEmail = 'manager-access-test@petals.com';
  const therapistEmail = 'therapist-access-test@petals.com';
  const parentEmail = 'parent-access-test@petals.com';
  const defaultPassword = 'Password123!Secure';

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
    reflector = app.get(Reflector);

    // Clean up test users
    await prisma.unscopedClient.user.deleteMany({
      where: { email: { in: [managerEmail, therapistEmail, parentEmail] } },
    });

    const managerRole = await prisma.unscopedClient.role.findUniqueOrThrow({ where: { key: RoleKey.MANAGER } });
    const therapistRole = await prisma.unscopedClient.role.findUniqueOrThrow({ where: { key: RoleKey.THERAPIST } });
    const parentRole = await prisma.unscopedClient.role.findUniqueOrThrow({ where: { key: RoleKey.PARENT } });
    const branch = await prisma.unscopedClient.branch.findFirstOrThrow();

    const passwordHash = await hashPassword(defaultPassword);

    // Create Manager
    const mgr = await prisma.unscopedClient.user.create({
      data: {
        email: managerEmail,
        name: 'Access Manager',
        passwordHash,
        roleId: managerRole.id,
        isActive: true,
        branches: { create: { branchId: branch.id, isPrimary: true } },
      },
    });
    managerUserId = mgr.id;

    // Create Therapist
    await prisma.unscopedClient.user.create({
      data: {
        email: therapistEmail,
        name: 'Access Therapist',
        passwordHash,
        roleId: therapistRole.id,
        isActive: true,
        branches: { create: { branchId: branch.id, isPrimary: true } },
      },
    });

    // Create Parent
    await prisma.unscopedClient.user.create({
      data: {
        email: parentEmail,
        name: 'Access Parent',
        passwordHash,
        roleId: parentRole.id,
        isActive: true,
        branches: { create: { branchId: branch.id, isPrimary: true } },
      },
    });

    // Log in all users to get tokens
    const dirLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('X-Forwarded-For', '10.2.0.1')
      .send({ email: 'director@petals.com', password: 'ChangeMe123!' });
    directorToken = dirLogin.body.accessToken;

    const mgrLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('X-Forwarded-For', '10.2.0.2')
      .send({ email: managerEmail, password: defaultPassword });
    managerToken = mgrLogin.body.accessToken;

    const thLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('X-Forwarded-For', '10.2.0.3')
      .send({ email: therapistEmail, password: defaultPassword });
    therapistToken = thLogin.body.accessToken;

    const prLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('X-Forwarded-For', '10.2.0.4')
      .send({ email: parentEmail, password: defaultPassword });
    parentToken = prLogin.body.accessToken;
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.unscopedClient.user.deleteMany({
        where: { email: { in: [managerEmail, therapistEmail, parentEmail] } },
      });
    }
    if (app) {
      await app.close();
    }
  });

  describe('1. Disabled module returns 403', () => {
    it('should return 403 Forbidden when accessing a module disabled for the role', async () => {
      // Manager has FINANCIAL_PNL disabled
      const res = await request(app.getHttpServer())
        .get('/api/v1/access/test/financial-pnl')
        .set('X-Forwarded-For', '10.2.1.1')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);

      expect(res.body.message).toContain('disabled');
    });
  });

  describe('2. Manager cannot read clinical assessments', () => {
    it('should return 403 when Manager attempts to read clinical assessments', async () => {
      // Manager has PROFILE_ASSESSMENT disabled
      const res = await request(app.getHttpServer())
        .get('/api/v1/access/test/assessments')
        .set('X-Forwarded-For', '10.2.2.1')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);

      expect(res.body.message).toContain('disabled');
    });
  });

  describe('3. Therapist scoping (cannot read other therapist data without VIEW_ALL)', () => {
    it('should attach ASSIGNED scope to request context for Therapist on clients', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/access/test/clients')
        .set('X-Forwarded-For', '10.2.3.1')
        .set('Authorization', `Bearer ${therapistToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.scope).toBe(PermissionScope.ASSIGNED);
    });
  });

  describe('4. User override beats the role', () => {
    it('should grant access to Manager when Director sets an override', async () => {
      // 1. Initially Manager is forbidden from reading assessments
      await request(app.getHttpServer())
        .get('/api/v1/access/test/assessments')
        .set('X-Forwarded-For', '10.2.4.1')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);

      // First ensure module is enabled on role or override grants action
      // 2. Director enables PROFILE_ASSESSMENT module for Manager role temporarily or adds override
      await request(app.getHttpServer())
        .put('/api/v1/access/roles/MANAGER/modules')
        .set('X-Forwarded-For', '10.2.4.2')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          modules: [{ module: AppModule.PROFILE_ASSESSMENT, enabled: true }],
        })
        .expect(200);

      // Now set user override for Manager on VIEW action
      await request(app.getHttpServer())
        .put(`/api/v1/access/overrides/${managerUserId}`)
        .set('X-Forwarded-For', '10.2.4.3')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          overrides: [
            {
              module: AppModule.PROFILE_ASSESSMENT,
              action: PermissionAction.VIEW,
              allowed: true,
            },
          ],
        })
        .expect(200);

      // 3. Manager can now view assessments
      const res = await request(app.getHttpServer())
        .get('/api/v1/access/test/assessments')
        .set('X-Forwarded-For', '10.2.4.4')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      // 4. Clean up override and restore module state
      await request(app.getHttpServer())
        .delete(`/api/v1/access/overrides/${managerUserId}?module=PROFILE_ASSESSMENT&action=VIEW`)
        .set('X-Forwarded-For', '10.2.4.5')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .put('/api/v1/access/roles/MANAGER/modules')
        .set('X-Forwarded-For', '10.2.4.6')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          modules: [{ module: AppModule.PROFILE_ASSESSMENT, enabled: false }],
        })
        .expect(200);

      // Manager is forbidden again
      await request(app.getHttpServer())
        .get('/api/v1/access/test/assessments')
        .set('X-Forwarded-For', '10.2.4.7')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);
    });
  });

  describe('5. The Director cannot be locked out', () => {
    it('should always allow Director even on modules disabled for other roles', async () => {
      // Director accessing FINANCIAL_PNL
      const resPnl = await request(app.getHttpServer())
        .get('/api/v1/access/test/financial-pnl')
        .set('X-Forwarded-For', '10.2.5.1')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(resPnl.body.success).toBe(true);
      expect(resPnl.body.scope).toBe(PermissionScope.ALL);

      // Director accessing clinical assessments
      const resAssess = await request(app.getHttpServer())
        .get('/api/v1/access/test/assessments')
        .set('X-Forwarded-For', '10.2.5.2')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(resAssess.body.success).toBe(true);
      expect(resAssess.body.scope).toBe(PermissionScope.ALL);
    });

    it('should refuse to modify Director permissions', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/access/roles/DIRECTOR/modules')
        .set('X-Forwarded-For', '10.2.5.3')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          modules: [{ module: AppModule.DASHBOARD, enabled: false }],
        })
        .expect(403);
    });
  });

  describe('6. Permission changes apply on the very next request', () => {
    it('should invalidate cache and apply updated permissions immediately', async () => {
      // 1. Verify Manager cannot access FINANCIAL_PNL
      await request(app.getHttpServer())
        .get('/api/v1/access/test/financial-pnl')
        .set('X-Forwarded-For', '10.2.6.1')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);

      // 2. Director enables FINANCIAL_PNL for Manager and grants VIEW
      await request(app.getHttpServer())
        .put('/api/v1/access/roles/MANAGER/modules')
        .set('X-Forwarded-For', '10.2.6.2')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          modules: [{ module: AppModule.FINANCIAL_PNL, enabled: true }],
        })
        .expect(200);

      await request(app.getHttpServer())
        .put('/api/v1/access/roles/MANAGER/permissions')
        .set('X-Forwarded-For', '10.2.6.3')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          permissions: [
            { module: AppModule.FINANCIAL_PNL, action: PermissionAction.VIEW, allowed: true },
          ],
        })
        .expect(200);

      // 3. Very next request succeeds without any app restart!
      await request(app.getHttpServer())
        .get('/api/v1/access/test/financial-pnl')
        .set('X-Forwarded-For', '10.2.6.4')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      // 4. Restore: Director disables FINANCIAL_PNL again
      await request(app.getHttpServer())
        .put('/api/v1/access/roles/MANAGER/modules')
        .set('X-Forwarded-For', '10.2.6.5')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          modules: [{ module: AppModule.FINANCIAL_PNL, enabled: false }],
        })
        .expect(200);

      // 5. Very next request is rejected again immediately!
      await request(app.getHttpServer())
        .get('/api/v1/access/test/financial-pnl')
        .set('X-Forwarded-For', '10.2.6.6')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);
    });
  });

  describe('7. Director Endpoints and Role Restrictions', () => {
    it('should allow Director to list roles and permissions', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/access/roles')
        .set('X-Forwarded-For', '10.2.7.1')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(4);
    });

    it('should reject non-Director from accessing role management endpoints', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/access/roles')
        .set('X-Forwarded-For', '10.2.7.2')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);
    });

    it('should return complete resolved permissions map for user UI', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/access/me/permissions')
        .set('X-Forwarded-For', '10.2.7.3')
        .set('Authorization', `Bearer ${therapistToken}`)
        .expect(200);

      expect(res.body.roleKey).toBe(RoleKey.THERAPIST);
      expect(res.body.permissions).toBeDefined();
      expect(res.body.permissions[AppModule.APPOINTMENTS].enabled).toBe(true);
      expect(res.body.permissions[AppModule.FINANCIAL_PNL].enabled).toBe(false);

      // Verify Parent permissions
      const parentRes = await request(app.getHttpServer())
        .get('/api/v1/access/me/permissions')
        .set('X-Forwarded-For', '10.2.7.4')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      expect(parentRes.body.roleKey).toBe(RoleKey.PARENT);
      expect(parentRes.body.permissions[AppModule.PROFILE_OVERVIEW].actions.VIEW).toBe(true);
      expect(parentRes.body.permissions[AppModule.PROFILE_OVERVIEW].actions.CREATE).toBe(false);
    });
  });

  describe('8. Route Protection Verification (fails if any route lacks @RequirePermission, @Roles or @Public)', () => {
    it('should ensure EVERY single route in the application has @RequirePermission, @Roles or @Public', () => {
      const modulesContainer = app.get(ModulesContainer);
      const uncoveredRoutes: string[] = [];

      for (const module of modulesContainer.values()) {
        for (const controller of module.controllers.values()) {
          const prototype = controller.metatype?.prototype;
          if (!prototype) continue;

          const methodNames = Object.getOwnPropertyNames(prototype).filter(
            (m) => m !== 'constructor' && typeof prototype[m] === 'function',
          );

          for (const methodName of methodNames) {
            const handler = prototype[methodName];
            const isPublic = reflector.get<boolean>(IS_PUBLIC_KEY, handler);
            const roles = reflector.get<RoleKey[]>(ROLES_KEY, handler);
            const perm = reflector.get(PERMISSION_KEY, handler);

            if (!isPublic && !roles && !perm) {
              uncoveredRoutes.push(`${controller.name}.${methodName}`);
            }
          }
        }
      }

      // If any route is unprotected, fail the test and list them
      expect(uncoveredRoutes).toEqual([]);
    });
  });
});
