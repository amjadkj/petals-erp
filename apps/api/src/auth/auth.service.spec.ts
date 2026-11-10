// Mock @nestjs/jwt before any imports to avoid ESM parse errors
jest.mock('@nestjs/jwt', () => ({
  JwtService: class JwtService {
    sign = jest.fn();
    verify = jest.fn();
  },
}));

import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RoleKey } from '@petals/types';
import { hashPassword, encryptSecret, sha256 } from '../common/crypto';

describe('AuthService', () => {
  let service: AuthService;
  let mockPrisma: any;
  let mockJwt: any;
  let mockConfig: any;
  let mockCache: any;
  let mockLockout: any;
  let mockOtpService: any;

  beforeEach(() => {
    mockPrisma = {
      unscopedClient: {
        user: {
          findUnique: jest.fn(),
          findFirst: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          count: jest.fn(),
        },
        session: {
          create: jest.fn(),
          findUnique: jest.fn(),
          update: jest.fn(),
          updateMany: jest.fn(),
        },
      },
    };

    mockJwt = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn(),
    };

    mockConfig = {
      get: jest.fn().mockImplementation((_key, defaultVal) => defaultVal),
    };

    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      deleteByPrefix: jest.fn(),
    };

    mockLockout = {
      recordFailure: jest.fn().mockResolvedValue({ locked: false, retryAfterSeconds: 0, attempts: 1 }),
      clearLockout: jest.fn().mockResolvedValue(undefined),
    };

    mockOtpService = {
      verifyOtp: jest.fn(),
    };

    service = new AuthService(
      mockPrisma,
      mockJwt,
      mockConfig,
      mockCache,
      mockLockout,
      mockOtpService,
    );
  });

  describe('login', () => {
    it('should successfully authenticate user with valid credentials and return tokens', async () => {
      const password = 'CorrectPassword123!';
      const passwordHash = await hashPassword(password);

      mockPrisma.unscopedClient.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'doctor@petals.com',
        name: 'Dr. Smith',
        passwordHash,
        isActive: true,
        twoFactorEnabled: false,
        role: { key: RoleKey.THERAPIST },
      });

      mockPrisma.unscopedClient.session.create.mockResolvedValue({ id: 'sess-1' });
      mockPrisma.unscopedClient.user.update.mockResolvedValue({});

      const result = await service.login({ email: 'doctor@petals.com', password });

      expect('accessToken' in result).toBe(true);
      if ('accessToken' in result) {
        expect(result.accessToken).toBe('mock-jwt-token');
        expect(result.refreshToken).toBeDefined();
        expect(result.csrfToken).toBeDefined();
        expect(result.user.roleKey).toBe(RoleKey.THERAPIST);
      }
      expect(mockLockout.clearLockout).toHaveBeenCalledWith('doctor@petals.com', 'login_account');
    });

    it('should throw UnauthorizedException with generic message for invalid password', async () => {
      const passwordHash = await hashPassword('ActualPassword123!');

      mockPrisma.unscopedClient.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'doctor@petals.com',
        passwordHash,
        isActive: true,
        twoFactorEnabled: false,
        role: { key: RoleKey.THERAPIST },
      });

      await expect(
        service.login({ email: 'doctor@petals.com', password: 'WrongPassword!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw generic UnauthorizedException if user does not exist (no user enumeration)', async () => {
      mockPrisma.unscopedClient.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nonexistent@petals.com', password: 'AnyPassword!' }),
      ).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
    });

    it('should throw UnauthorizedException if user is deactivated', async () => {
      const password = 'Password123!';
      const passwordHash = await hashPassword(password);

      mockPrisma.unscopedClient.user.findUnique.mockResolvedValue({
        id: 'user-2',
        email: 'inactive@petals.com',
        passwordHash,
        isActive: false,
        role: { key: RoleKey.THERAPIST },
      });

      await expect(
        service.login({ email: 'inactive@petals.com', password }),
      ).rejects.toThrow(/deactivated/i);
    });

    it('should return requires2FA: true and tempToken when 2FA is enabled', async () => {
      const password = 'Password123!';
      const passwordHash = await hashPassword(password);

      mockPrisma.unscopedClient.user.findUnique.mockResolvedValue({
        id: 'director-1',
        email: 'director@petals.com',
        passwordHash,
        isActive: true,
        twoFactorEnabled: true,
        twoFactorSecret: encryptSecret('JBSWY3DPEHPK3PXP'),
        role: { key: RoleKey.DIRECTOR },
      });

      const result = await service.login({ email: 'director@petals.com', password });

      expect(result).toEqual({
        requires2FA: true,
        tempToken: 'mock-jwt-token',
      });
    });
  });

  describe('refreshTokens (Rotation & Reuse Detection)', () => {
    it('should rotate tokens and create new session in same family', async () => {
      const rawToken = 'valid-refresh-token';
      const tokenHash = sha256(rawToken);
      const csrfToken = 'valid-csrf-token';

      mockPrisma.unscopedClient.session.findUnique.mockResolvedValue({
        id: 'sess-1',
        userId: 'user-1',
        familyId: 'family-1',
        refreshTokenHash: tokenHash,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 100000),
        user: { isActive: true, role: { key: RoleKey.THERAPIST } },
      });

      mockPrisma.unscopedClient.session.update.mockResolvedValue({});
      mockPrisma.unscopedClient.session.create.mockResolvedValue({ id: 'sess-2' });

      const result = await service.refreshTokens(rawToken, csrfToken, csrfToken);

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBeDefined();
      expect(result.csrfToken).toBeDefined();

      // Old session was revoked
      expect(mockPrisma.unscopedClient.session.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sess-1' },
          data: expect.objectContaining({ revokedAt: expect.any(Date) }),
        }),
      );

      // New session created in SAME familyId
      expect(mockPrisma.unscopedClient.session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ familyId: 'family-1' }),
        }),
      );
    });

    it('should REVOKE entire family chain upon refresh token reuse', async () => {
      const reusedToken = 'reused-token';
      const tokenHash = sha256(reusedToken);

      mockPrisma.unscopedClient.session.findUnique.mockResolvedValue({
        id: 'sess-old',
        userId: 'user-1',
        familyId: 'family-compromised',
        refreshTokenHash: tokenHash,
        revokedAt: new Date(), // Already revoked!
        expiresAt: new Date(Date.now() + 100000),
        user: { isActive: true, role: { key: RoleKey.THERAPIST } },
      });

      await expect(
        service.refreshTokens(reusedToken, 'csrf', 'csrf'),
      ).rejects.toThrow(/revoked due to token reuse/i);

      // All sessions with that familyId must be revoked
      expect(mockPrisma.unscopedClient.session.updateMany).toHaveBeenCalledWith({
        where: { familyId: 'family-compromised' },
        data: expect.objectContaining({ revokedAt: expect.any(Date) }),
      });
    });

    it('should throw ForbiddenException if CSRF header does not match cookie', async () => {
      await expect(
        service.refreshTokens('token', 'csrf-cookie', 'wrong-csrf-header'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Director Demote/Deactivate Protection', () => {
    it('should reject deactivating or demoting the last active Director', async () => {
      mockPrisma.unscopedClient.user.findUnique.mockResolvedValue({
        id: 'dir-1',
        role: { key: RoleKey.DIRECTOR },
      });

      mockPrisma.unscopedClient.user.count.mockResolvedValue(1); // Only 1 active director exists

      await expect(service.assertCanDeactivateOrDemote('dir-1')).rejects.toThrow(
        /Cannot deactivate or demote the last active Director/,
      );
    });

    it('should allow deactivating a Director if multiple active Directors exist', async () => {
      mockPrisma.unscopedClient.user.findUnique.mockResolvedValue({
        id: 'dir-1',
        role: { key: RoleKey.DIRECTOR },
      });

      mockPrisma.unscopedClient.user.count.mockResolvedValue(2); // 2 active directors exist

      await expect(service.assertCanDeactivateOrDemote('dir-1')).resolves.not.toThrow();
    });
  });
});

