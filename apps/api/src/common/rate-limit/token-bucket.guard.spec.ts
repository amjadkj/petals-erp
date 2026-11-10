import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenBucketGuard } from './token-bucket.guard';
import { RequestContext, IRequestContext } from '../context/request-context';
import { RoleKey } from '@petals/types';

describe('TokenBucketGuard', () => {
  let guard: TokenBucketGuard;
  let mockRedis: any;
  let reflector: Reflector;

  beforeEach(() => {
    mockRedis = {
      status: 'close', // will test memory fallback or mock
      on: jest.fn(),
    };
    reflector = new Reflector();
    guard = new TokenBucketGuard(mockRedis, reflector);
  });

  function createMockContext(options: {
    ip?: string;
    userId?: string;
    headers?: Record<string, string>;
    handler?: any;
  }): ExecutionContext {
    const { ip = '192.168.1.100', headers = {}, handler = () => {} } = options;

    const mockRequest = {
      ip,
      headers,
      socket: { remoteAddress: ip },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => ({}),
      }),
      getHandler: () => handler,
    } as unknown as ExecutionContext;
  }

  it('should exempt requests with valid webhook signature header', async () => {
    const context = createMockContext({
      headers: { 'x-webhook-signature': 'sha256=abcdef123456' },
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow requests within the unauthenticated IP capacity and block burst with 429 and Retry-After', async () => {
    const ip = '10.0.0.99';
    const context = createMockContext({ ip });

    // Fallback IP limiter capacity is 10
    for (let i = 0; i < 10; i++) {
      const allowed = await guard.canActivate(context);
      expect(allowed).toBe(true);
    }

    // 11th request in the same burst exceeds capacity
    try {
      await guard.canActivate(context);
      fail('Expected guard to throw 429 HttpException');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpException);
      const httpErr = err as HttpException;
      expect(httpErr.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      const response = httpErr.getResponse() as any;
      expect(response.statusCode).toBe(429);
      expect(response.retryAfter).toBeGreaterThan(0);
    }
  });

  it('should ensure two authenticated users behind the same IP do not affect each other', async () => {
    const sharedIp = '203.0.113.50';

    const user1Ctx: IRequestContext = {
      userId: 'user-id-1',
      roleKey: RoleKey.THERAPIST,
      isActive: true,
      branchIds: ['branch-1'],
      activeBranchId: 'branch-1',
      sessionId: 'sess-1',
    };

    const user2Ctx: IRequestContext = {
      userId: 'user-id-2',
      roleKey: RoleKey.THERAPIST,
      isActive: true,
      branchIds: ['branch-1'],
      activeBranchId: 'branch-1',
      sessionId: 'sess-2',
    };

    const contextUser1 = createMockContext({ ip: sharedIp });
    const contextUser2 = createMockContext({ ip: sharedIp });

    // Exhaust user1's 40 token capacity
    await RequestContext.run(user1Ctx, async () => {
      for (let i = 0; i < 40; i++) {
        const allowed = await guard.canActivate(contextUser1);
        expect(allowed).toBe(true);
      }

      // 41st request for user1 fails
      await expect(guard.canActivate(contextUser1)).rejects.toThrow(HttpException);
    });

    // User 2 behind the EXACT SAME IP should still have full quota!
    await RequestContext.run(user2Ctx, async () => {
      const allowed = await guard.canActivate(contextUser2);
      expect(allowed).toBe(true);
    });
  });
});
