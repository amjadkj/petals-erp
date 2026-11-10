import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { authenticator } from 'otplib';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/common/prisma';
import { CacheService } from '../src/common/redis';
import { hashPassword } from '../src/common/crypto';
import { RoleKey } from '@petals/types';

describe('Auth Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cacheService: CacheService;

  const testEmail = 'e2e-test-user@petals.com';
  const testPassword = 'Password123!Secure';
  let testUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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

    // Clean up test data
    await prisma.unscopedClient.user.deleteMany({
      where: { email: { in: [testEmail, 'lockout-test@petals.com', 'otp-user@petals.com'] } },
    });

    // Create a fresh test user
    const therapistRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.THERAPIST },
    });

    const branch = await prisma.unscopedClient.branch.findFirstOrThrow();

    const createdUser = await prisma.unscopedClient.user.create({
      data: {
        email: testEmail,
        name: 'E2E Therapist',
        passwordHash: await hashPassword(testPassword),
        roleId: therapistRole.id,
        isActive: true,
        twoFactorEnabled: false,
        branches: {
          create: {
            branchId: branch.id,
            isPrimary: true,
          },
        },
      },
    });

    testUserId = createdUser.id;
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.unscopedClient.user.deleteMany({
        where: { email: { in: [testEmail, 'lockout-test@petals.com', 'otp-user@petals.com'] } },
      });
    }
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/v1/auth/login', () => {
    const ip = '10.0.1.1';

    it('should successfully log in with valid credentials and return tokens with cookies', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('X-Forwarded-For', ip)
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('csrfToken');
      expect(res.body.user).toEqual(
        expect.objectContaining({
          email: testEmail,
          roleKey: RoleKey.THERAPIST,
        }),
      );

      // Check cookies
      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.includes('refreshToken='))).toBe(true);
      expect(cookies.some((c) => c.includes('csrfToken='))).toBe(true);
    });

    it('should reject invalid password without revealing details', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('X-Forwarded-For', ip)
        .send({
          email: testEmail,
          password: 'WrongPassword999!',
        })
        .expect(401);

      expect(res.body.message).toContain('Invalid');
    });

    it('should reject non-existent user with same generic message', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('X-Forwarded-For', ip)
        .send({
          email: 'nonexistent-user-123456@petals.com',
          password: 'AnyPassword123!',
        })
        .expect(401);

      expect(res.body.message).toContain('Invalid');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    const ip = '10.0.2.1';

    it('should return current user profile, role, and branches when authenticated', async () => {
      // 1. Log in
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('X-Forwarded-For', ip)
        .send({ email: testEmail, password: testPassword })
        .expect(200);

      const token = loginRes.body.accessToken;

      // 2. Fetch /me
      const meRes = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('X-Forwarded-For', ip)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(meRes.body).toEqual(
        expect.objectContaining({
          id: testUserId,
          email: testEmail,
          roleKey: RoleKey.THERAPIST,
          branches: expect.any(Array),
        }),
      );
      expect(meRes.body.branches.length).toBeGreaterThan(0);
    });

    it('should reject request when token is missing', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('X-Forwarded-For', ip)
        .expect(401);
    });
  });

  describe('Refresh Token Rotation and CSRF Validation', () => {
    const ip = '10.0.3.1';

    it('should rotate refresh token and issue new access token', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('X-Forwarded-For', ip)
        .send({ email: testEmail, password: testPassword })
        .expect(200);

      const cookies = loginRes.headers['set-cookie'] as unknown as string[];
      const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));
      const csrfCookie = cookies.find((c) => c.startsWith('csrfToken='));

      const refreshToken = refreshCookie?.split(';')[0];
      const csrfTokenValue = csrfCookie?.split(';')[0]?.split('=')[1];

      // Refresh using cookie + csrf header
      const refreshRes = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('X-Forwarded-For', ip)
        .set('Cookie', [`${refreshToken}; ${csrfCookie?.split(';')[0]}`])
        .set('x-csrf-token', csrfTokenValue || '')
        .expect(200);

      expect(refreshRes.body).toHaveProperty('accessToken');
      expect(refreshRes.body).toHaveProperty('csrfToken');

      // Replaying the old refresh token should be rejected (reuse detection)
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('X-Forwarded-For', ip)
        .set('Cookie', [`${refreshToken}; ${csrfCookie?.split(';')[0]}`])
        .set('x-csrf-token', csrfTokenValue || '')
        .expect(401);
    });

    it('should reject refresh if CSRF header does not match cookie', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('X-Forwarded-For', ip)
        .send({ email: testEmail, password: testPassword })
        .expect(200);

      const cookies = loginRes.headers['set-cookie'] as unknown as string[];
      const refreshToken = cookies.find((c) => c.startsWith('refreshToken='))?.split(';')[0];
      const csrfCookie = cookies.find((c) => c.startsWith('csrfToken='))?.split(';')[0];

      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('X-Forwarded-For', ip)
        .set('Cookie', [`${refreshToken}; ${csrfCookie}`])
        .set('x-csrf-token', 'wrong-csrf-token')
        .expect(403);
    });
  });

  describe('Session Revocation and Deactivation Enforcement', () => {
    const ip = '10.0.4.1';

    it('should immediately reject request if session is revoked in DB', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('X-Forwarded-For', ip)
        .send({ email: testEmail, password: testPassword })
        .expect(200);

      const token = loginRes.body.accessToken;

      // Verify token works
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('X-Forwarded-For', ip)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Revoke all sessions for this user in DB
      await prisma.unscopedClient.session.updateMany({
        where: { userId: testUserId },
        data: { revokedAt: new Date() },
      });

      // Token should now be rejected immediately
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('X-Forwarded-For', ip)
        .set('Authorization', `Bearer ${token}`)
        .expect(401);

      expect(res.body.message).toContain('revoked');
    });

    it('should immediately block deactivated user on next request', async () => {
      // 1. Log in
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('X-Forwarded-For', ip)
        .send({ email: testEmail, password: testPassword })
        .expect(200);

      const token = loginRes.body.accessToken;

      try {
        // 2. Deactivate user in DB
        await prisma.unscopedClient.user.update({
          where: { id: testUserId },
          data: { isActive: false },
        });

        // 3. Clear cache if any
        if (cacheService && cacheService.del) {
          await cacheService.del(`user:${testUserId}`);
        }

        // 4. Request should be rejected
        const res = await request(app.getHttpServer())
          .get('/api/v1/auth/me')
          .set('X-Forwarded-For', ip)
          .set('Authorization', `Bearer ${token}`)
          .expect(401);

        expect(res.body.message).toContain('deactivated');
      } finally {
        // Always restore user to active state
        await prisma.unscopedClient.user.update({
          where: { id: testUserId },
          data: { isActive: true },
        });
        if (cacheService && cacheService.del) {
          await cacheService.del(`user:${testUserId}`);
        }
      }
    });

    it('should reflect role changes immediately on next request', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('X-Forwarded-For', ip)
        .send({ email: testEmail, password: testPassword })
        .expect(200);

      const token = loginRes.body.accessToken;

      // Switch role to MANAGER
      const managerRole = await prisma.unscopedClient.role.findUniqueOrThrow({
        where: { key: RoleKey.MANAGER },
      });

      await prisma.unscopedClient.user.update({
        where: { id: testUserId },
        data: { roleId: managerRole.id },
      });

      // Clear cached user data
      if (cacheService && cacheService.del) {
        await cacheService.del(`user:${testUserId}`);
      }

      const meRes = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('X-Forwarded-For', ip)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(meRes.body.roleKey).toBe(RoleKey.MANAGER);
    });
  });

  describe('2FA Flow (setup, enable, challenge verify)', () => {
    const ip = '10.0.5.1';

    it('should complete full 2FA lifecycle', async () => {
      // 1. Log in
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('X-Forwarded-For', ip)
        .send({ email: testEmail, password: testPassword })
        .expect(200);

      const token = loginRes.body.accessToken;

      // 2. Setup 2FA
      const setupRes = await request(app.getHttpServer())
        .post('/api/v1/auth/2fa/setup')
        .set('X-Forwarded-For', ip)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(setupRes.body).toHaveProperty('secret');
      expect(setupRes.body).toHaveProperty('qrCodeUrl');
      const secret = setupRes.body.secret;

      // 3. Generate valid TOTP code and enable
      const code = authenticator.generate(secret);
      await request(app.getHttpServer())
        .post('/api/v1/auth/2fa/enable')
        .set('X-Forwarded-For', ip)
        .set('Authorization', `Bearer ${token}`)
        .send({ code })
        .expect(200);

      // 4. Log in again - should require 2FA challenge
      const challengeRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('X-Forwarded-For', ip)
        .send({ email: testEmail, password: testPassword })
        .expect(200);

      expect(challengeRes.body.requires2FA).toBe(true);
      expect(challengeRes.body).toHaveProperty('tempToken');

      // 5. Complete login with 2FA TOTP code
      const verifyCode = authenticator.generate(secret);
      const finalRes = await request(app.getHttpServer())
        .post('/api/v1/auth/2fa/verify-login')
        .set('X-Forwarded-For', ip)
        .send({
          tempToken: challengeRes.body.tempToken,
          code: verifyCode,
        })
        .expect(200);

      expect(finalRes.body).toHaveProperty('accessToken');
      expect(finalRes.body.user.email).toBe(testEmail);

      // Disable 2FA to keep user clean
      const disableCode = authenticator.generate(secret);
      await request(app.getHttpServer())
        .post('/api/v1/auth/2fa/disable')
        .set('X-Forwarded-For', ip)
        .set('Authorization', `Bearer ${finalRes.body.accessToken}`)
        .send({ password: testPassword, code: disableCode })
        .expect(200);
    });
  });

  describe('Lockout Escalation & 429 Headers', () => {
    const ip = '10.0.6.1';

    it('should escalate lockout and return 429 after repeated failures', async () => {
      const lockoutEmail = 'lockout-test@petals.com';

      // Create a dedicated user for lockout testing
      const role = await prisma.unscopedClient.role.findFirstOrThrow();
      await prisma.unscopedClient.user.create({
        data: {
          email: lockoutEmail,
          name: 'Lockout Target',
          passwordHash: await hashPassword('ValidPass123!'),
          roleId: role.id,
          isActive: true,
        },
      });

      // Submit 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .set('X-Forwarded-For', ip)
          .send({ email: lockoutEmail, password: 'WrongPassword!' });
      }

      // 6th attempt should trigger 429 Too Many Requests
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('X-Forwarded-For', ip)
        .send({ email: lockoutEmail, password: 'WrongPassword!' })
        .expect(429);

      expect(res.body.statusCode).toBe(429);
      expect(res.body.retryAfter).toBeGreaterThan(0);
      expect(res.headers['retry-after']).toBeDefined();
    });
  });

  describe('OTP Flow', () => {
    const ip = '10.0.7.1';

    it('should request and verify OTP for phone/email login', async () => {
      const otpPhone = '+919999988888';
      const role = await prisma.unscopedClient.role.findUniqueOrThrow({
        where: { key: RoleKey.PARENT },
      });

      // Create a Parent user with this phone
      await prisma.unscopedClient.user.create({
        data: {
          email: 'otp-user@petals.com',
          phone: otpPhone,
          name: 'Parent User',
          passwordHash: await hashPassword('TemporaryPassword123!'),
          roleId: role.id,
          isActive: true,
        },
      });

      // 1. Request OTP
      const reqRes = await request(app.getHttpServer())
        .post('/api/v1/auth/otp/request')
        .set('X-Forwarded-For', ip)
        .send({ target: otpPhone, purpose: 'LOGIN' })
        .expect(200);

      expect(reqRes.body.message).toContain('OTP sent');

      // 2. Fetch the created OTP code from the database
      const latestOtp = await prisma.unscopedClient.otpCode.findFirstOrThrow({
        where: { target: otpPhone, usedAt: null },
        orderBy: { createdAt: 'desc' },
      });

      // Set known code hash for verification
      const testCode = '765432';
      const { sha256 } = await import('../src/common/crypto');
      await prisma.unscopedClient.otpCode.update({
        where: { id: latestOtp.id },
        data: { codeHash: sha256(testCode) },
      });

      // 3. Verify OTP
      const verifyRes = await request(app.getHttpServer())
        .post('/api/v1/auth/otp/verify')
        .set('X-Forwarded-For', ip)
        .send({ target: otpPhone, code: testCode })
        .expect(200);

      expect(verifyRes.body).toHaveProperty('accessToken');
      expect(verifyRes.body.user.roleKey).toBe(RoleKey.PARENT);
    });
  });
});
