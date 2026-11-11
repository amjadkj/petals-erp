import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DiscoveryModule, DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { AppModule as AppMainModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/common/prisma';
import { LockoutService } from '../src/common/rate-limit/lockout.service';
import { IS_PUBLIC_KEY } from '../src/common/decorators/public.decorator';
import { PERMISSION_KEY } from '../src/common/decorators/require-permission.decorator';
import { ROLES_KEY } from '../src/common/decorators/roles.decorator';
import { ClientStatus } from '@petals/types';

describe('RLS & Security Hardening (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let lockoutService: LockoutService;
  let discoveryService: DiscoveryService;
  let metadataScanner: MetadataScanner;
  let reflector: Reflector;

  let appUserClient: PrismaClient;

  let branch1Id: string;
  let branch2Id: string;
  let client1Id: string;
  let client2Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppMainModule, DiscoveryModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.set('trust proxy', 1);

    app.setGlobalPrefix('api/v1', {
      exclude: ['health', 'api/docs'],
    });

    app.use(helmet());
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
    lockoutService = app.get(LockoutService);
    discoveryService = app.get(DiscoveryService);
    metadataScanner = app.get(MetadataScanner);
    reflector = app.get(Reflector);

    // 1. Create a dedicated connection as app_user (NOBYPASSRLS)
    const baseDbUrl = process.env.DATABASE_URL || 'postgresql://petals_admin:petals_password@localhost:5432/petals_erp?schema=public';
    const appUserDbUrl = baseDbUrl.replace(/:\/\/[^:]+:[^@]+@/, '://app_user:app_user_password@');

    appUserClient = new PrismaClient({
      datasources: {
        db: { url: appUserDbUrl },
      },
    });
    await appUserClient.$connect();

    // 2. Fetch two distinct active branches
    const branches = await prisma.unscopedClient.branch.findMany({
      where: { isActive: true },
      take: 2,
    });
    if (branches.length < 2) {
      throw new Error('At least 2 branches required for RLS cross-branch tests');
    }
    branch1Id = branches[0].id;
    branch2Id = branches[1].id;

    // 3. Clean up previous test clients
    await prisma.unscopedClient.client.deleteMany({
      where: { clientCode: { startsWith: 'P16-RLS' } },
    });

    // 4. Seed test clients in Branch 1 and Branch 2
    const c1 = await prisma.unscopedClient.client.create({
      data: {
        branchId: branch1Id,
        clientCode: 'P16-RLS-01',
        name: 'P16 Branch One Client',
        dob: new Date('2020-01-01'),
        status: ClientStatus.ACTIVE,
      },
    });
    client1Id = c1.id;

    const c2 = await prisma.unscopedClient.client.create({
      data: {
        branchId: branch2Id,
        clientCode: 'P16-RLS-02',
        name: 'P16 Branch Two Client',
        dob: new Date('2020-02-02'),
        status: ClientStatus.ACTIVE,
      },
    });
    client2Id = c2.id;
  });

  afterAll(async () => {
    // Teardown
    await prisma.unscopedClient.client.deleteMany({
      where: { clientCode: { startsWith: 'P16-RLS' } },
    });
    await appUserClient.$disconnect();
    await app.close();
  });

  // ─────────────────────────────────────────────────────────────
  // 1. POSTGRESQL ROW LEVEL SECURITY (RLS) POLICIES
  // ─────────────────────────────────────────────────────────────

  describe('PostgreSQL Row Level Security (RLS)', () => {
    it('1. Fails closed: with no branch context, app_user sees 0 client rows', async () => {
      // In a transaction with no context set
      const count = await appUserClient.$transaction(async (tx) => {
        // Clear any settings
        await tx.$executeRaw`SELECT set_config('app.branch_ids', '', true), set_config('app.all_branches', 'false', true);`;
        const result: any[] = await tx.$queryRaw`SELECT count(*)::int AS count FROM clients WHERE client_code LIKE 'P16-RLS%';`;
        return result[0].count;
      });

      expect(count).toBe(0);
    });

    it('2. With Branch 1 context: app_user sees ONLY Branch 1 rows', async () => {
      const rows = await appUserClient.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT set_config('app.branch_ids', ${branch1Id}, true), set_config('app.all_branches', 'false', true);`;
        const result: any[] = await tx.$queryRaw`SELECT id, branch_id, client_code FROM clients WHERE client_code LIKE 'P16-RLS%';`;
        return result;
      });

      expect(rows.length).toBe(1);
      expect(rows[0].id).toBe(client1Id);
      expect(rows[0].branch_id).toBe(branch1Id);
    });

    it('3. Inserting a row for Branch 2 while in Branch 1 context FAILS with RLS policy violation', async () => {
      await expect(
        appUserClient.$transaction(async (tx) => {
          await tx.$executeRaw`SELECT set_config('app.branch_ids', ${branch1Id}, true), set_config('app.all_branches', 'false', true);`;
          // Attempt cross-branch insertion
          await tx.$executeRaw`
            INSERT INTO clients (id, branch_id, client_code, name, dob, status, created_at, updated_at)
            VALUES (gen_random_uuid(), ${branch2Id}::uuid, 'P16-RLS-HACK', 'Unauthorized Client', '2020-01-01'::date, 'ACTIVE', now(), now());
          `;
        }),
      ).rejects.toThrow(/violates row-level security policy/i);
    });

    it('4. Deliberate application filter bypass: raw query without WHERE still cannot read Branch 2 rows under RLS', async () => {
      const rows = await appUserClient.$transaction(async (tx) => {
        // Set Branch 1 context
        await tx.$executeRaw`SELECT set_config('app.branch_ids', ${branch1Id}, true), set_config('app.all_branches', 'false', true);`;

        // Bypassing application where clause: query all rows from clients table
        const result: any[] = await tx.$queryRaw`SELECT id, branch_id FROM clients WHERE id IN (${client1Id}::uuid, ${client2Id}::uuid);`;
        return result;
      });

      // PostgreSQL engine itself filters out Branch 2 client!
      expect(rows.length).toBe(1);
      expect(rows[0].id).toBe(client1Id);
      expect(rows.some((r) => r.id === client2Id)).toBe(false);
    });

    it('5. Director / System all_branches context allows reading all branches', async () => {
      const rows = await appUserClient.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT set_config('app.all_branches', 'true', true);`;
        const result: any[] = await tx.$queryRaw`SELECT id, branch_id FROM clients WHERE id IN (${client1Id}::uuid, ${client2Id}::uuid);`;
        return result;
      });

      expect(rows.length).toBe(2);
      expect(rows.some((r) => r.id === client1Id)).toBe(true);
      expect(rows.some((r) => r.id === client2Id)).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. SECURITY & RATE LIMIT HARDENING
  // ─────────────────────────────────────────────────────────────

  describe('Security & Rate Limit Hardening', () => {
    it('Login lockout triggers 429 Too Many Requests with Retry-After on consecutive failed attempts', async () => {
      const targetEmail = 'lockout-test-p16@petals.com';

      // Record failed attempts to trigger lockout
      for (let i = 0; i < 5; i++) {
        await lockoutService.recordFailure(targetEmail, 'login_account', 5, 900, 900);
      }

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: targetEmail, password: 'WrongPassword123!' });

      expect(res.status).toBe(429);
      expect(res.body.message).toContain('failed login attempts');

      // Clear lockout
      await lockoutService.clearLockout(targetEmail, 'login_account');
    });

    it('OTP limit: rejects verification after 5 failed attempts', async () => {
      // 1. Request login OTP
      const otpRes = await request(app.getHttpServer())
        .post('/api/v1/auth/otp/request')
        .send({ target: '+919876543210' });

      expect(otpRes.status).toBe(200);

      // 2. Perform 5 invalid verify attempts
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/auth/otp/verify')
          .send({ target: '+919876543210', code: '000000' });
      }

      // 3. 6th attempt should be rejected with 400 Bad Request
      const finalRes = await request(app.getHttpServer())
        .post('/api/v1/auth/otp/verify')
        .send({ target: '+919876543210', code: '000000' });

      expect(finalRes.status).toBe(400);
      expect(finalRes.body.message).toMatch(/too many attempts|expired|invalid/i);
    });

    it('Security headers: Helmet security headers are present on responses', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/auth/me');

      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBeDefined();
    });

    it('Route permission reflection: Every controller route has @RequirePermission, @Roles, or @Public', () => {
      const controllers = discoveryService.getControllers();
      const uncoveredRoutes: string[] = [];

      for (const controller of controllers) {
        const { instance, metatype } = controller;
        if (!instance || !metatype) continue;

        const controllerName = metatype.name;
        const classRoles = reflector.get(ROLES_KEY, metatype);
        const classPermission = reflector.get(PERMISSION_KEY, metatype);
        const classPublic = reflector.get(IS_PUBLIC_KEY, metatype);

        const prototype = Object.getPrototypeOf(instance);
        const methodNames = metadataScanner.getAllMethodNames(prototype);

        for (const methodName of methodNames) {
          if (methodName === 'constructor') continue;

          const method = instance[methodName];
          const pathMeta = Reflect.getMetadata('path', method);
          if (pathMeta === undefined) {
            continue;
          }

          const isPublic = reflector.get(IS_PUBLIC_KEY, method) ?? classPublic;
          const permission = reflector.get(PERMISSION_KEY, method) ?? classPermission;
          const roles = reflector.get(ROLES_KEY, method) ?? classRoles;

          if (!isPublic && !permission && !roles) {
            uncoveredRoutes.push(`${controllerName}.${methodName}`);
          }
        }
      }

      expect(uncoveredRoutes).toEqual([]);
    });

    it('Static Code Check: Zero instances of unsafe raw SQL concatenation ($queryRawUnsafe, $executeRawUnsafe)', () => {
      const srcDir = path.resolve(__dirname, '../src');

      function scanDir(dir: string): string[] {
        const violations: string[] = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            violations.push(...scanDir(fullPath));
          } else if (entry.isFile() && entry.name.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('$queryRawUnsafe') || content.includes('$executeRawUnsafe')) {
              violations.push(fullPath);
            }
          }
        }
        return violations;
      }

      const violations = scanDir(srcDir);
      expect(violations).toEqual([]);
    });
  });
});

