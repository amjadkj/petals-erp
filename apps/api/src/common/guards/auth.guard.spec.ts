// Mock @nestjs/jwt before any imports to avoid ESM parse errors
jest.mock('@nestjs/jwt', () => ({
  JwtService: class JwtService {
    verifyAsync = jest.fn();
  },
}));

import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { RoleKey } from '@petals/types';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockReflector: Reflector;
  let mockJwt: any;
  let mockPrisma: any;
  let mockCache: any;

  beforeEach(() => {
    mockReflector = new Reflector();
    mockJwt = {
      verifyAsync: jest.fn(),
    };
    mockPrisma = {
      unscopedClient: {
        session: {
          findUnique: jest.fn(),
        },
        user: {
          findUnique: jest.fn(),
        },
        branch: {
          findMany: jest.fn(),
        },
      },
    };
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
    };

    guard = new AuthGuard(mockReflector, mockJwt, mockPrisma, mockCache);
  });

  function createMockContext(headers: Record<string, string> = {}, isPublic = false) {
    jest.spyOn(mockReflector, 'getAllAndOverride').mockReturnValue(isPublic);

    const mockRequest = {
      headers,
      ip: '127.0.0.1',
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: () => () => {},
      getClass: () => class {},
    } as any;
  }

  it('should allow access to public routes marked with @Public()', async () => {
    const context = createMockContext({}, true);
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if Authorization header is missing', async () => {
    const context = createMockContext({});
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Authentication token is missing'),
    );
  });

  it('should throw UnauthorizedException if session is revoked in database', async () => {
    const context = createMockContext({ authorization: 'Bearer valid.jwt.token' });
    mockJwt.verifyAsync.mockResolvedValue({ sub: 'user-1', sessionId: 'sess-1' });

    // Session is revoked!
    mockPrisma.unscopedClient.session.findUnique.mockResolvedValue({
      id: 'sess-1',
      userId: 'user-1',
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 100000),
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Session has been revoked or expired'),
    );
  });

  it('should immediately block deactivated user on next request', async () => {
    const context = createMockContext({ authorization: 'Bearer valid.jwt.token' });
    mockJwt.verifyAsync.mockResolvedValue({ sub: 'user-deactivated', sessionId: 'sess-1' });

    mockPrisma.unscopedClient.session.findUnique.mockResolvedValue({
      id: 'sess-1',
      userId: 'user-deactivated',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 100000),
    });

    // User is deactivated
    mockCache.get.mockResolvedValue(null);
    mockPrisma.unscopedClient.user.findUnique.mockResolvedValue({
      id: 'user-deactivated',
      isActive: false,
      role: { key: RoleKey.THERAPIST },
      branches: [],
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('User account has been deactivated'),
    );
  });

  it('should populate request context and allow valid request', async () => {
    const context = createMockContext({ authorization: 'Bearer valid.jwt.token' });
    mockJwt.verifyAsync.mockResolvedValue({ sub: 'user-1', sessionId: 'sess-1' });

    mockPrisma.unscopedClient.session.findUnique.mockResolvedValue({
      id: 'sess-1',
      userId: 'user-1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 100000),
    });

    mockCache.get.mockResolvedValue({
      id: 'user-1',
      isActive: true,
      roleKey: RoleKey.THERAPIST,
      branchIds: ['branch-1'],
      primaryBranchId: 'branch-1',
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);

    const req = context.switchToHttp().getRequest();
    expect(req.user).toEqual(
      expect.objectContaining({
        userId: 'user-1',
        roleKey: RoleKey.THERAPIST,
        branchIds: ['branch-1'],
        activeBranchId: 'branch-1',
        sessionId: 'sess-1',
      }),
    );
  });
});

