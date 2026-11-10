import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import Redis from 'ioredis';
import { RateLimiterRedis, RateLimiterMemory, RateLimiterAbstract } from 'rate-limiter-flexible';
import { REDIS_CLIENT } from '../redis/redis.constants';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { THROTTLE_KEY, ThrottleOptions } from './throttle.decorator';
import { RequestContext } from '../context/request-context';

const WEBHOOK_HEADER = 'x-webhook-signature';

/**
 * Global rate-limiting guard.
 *
 * - Authenticated users: token-bucket per userId (capacity 40, refill 2/s)
 * - Unauthenticated IPs: token-bucket per IP (capacity 10, refill 0.5/s)
 * - Per-route @Throttle: strict fixed-window counter
 * - Webhooks with signature header are exempt from user limits
 * - Fail-open for general limits if Redis is down; fail-closed for auth routes
 */
@Injectable()
export class TokenBucketGuard implements CanActivate {
  private readonly logger = new Logger(TokenBucketGuard.name);
  private userLimiter?: RateLimiterAbstract;
  private ipLimiter?: RateLimiterAbstract;
  private fallbackUserLimiter!: RateLimiterMemory;
  private fallbackIpLimiter!: RateLimiterMemory;
  private throttleLimiters = new Map<string, RateLimiterAbstract>();
  private redisAvailable = false;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly reflector: Reflector,
  ) {
    this.initLimiters();
  }

  private initLimiters() {
    // In-memory fallback limiters (small capacity for fail-closed auth routes)
    this.fallbackUserLimiter = new RateLimiterMemory({
      points: 40,
      duration: 20, // 40 tokens, 2/s refill = 20s to refill
      keyPrefix: 'fb_user',
    });
    this.fallbackIpLimiter = new RateLimiterMemory({
      points: 10,
      duration: 20, // 10 tokens, 0.5/s refill = 20s to refill
      keyPrefix: 'fb_ip',
    });

    try {
      if (this.redis.status === 'ready' || this.redis.status === 'connecting') {
        this.setupRedisLimiters();
      } else {
        this.redis.on('ready', () => this.setupRedisLimiters());
      }
    } catch {
      this.logger.warn('Redis not available for rate limiting, using memory fallback');
    }
  }

  private setupRedisLimiters() {
    try {
      // Token bucket: points = capacity, duration = capacity / refillRate
      // User: 40 capacity, 2/s refill → duration = 20s
      this.userLimiter = new RateLimiterRedis({
        storeClient: this.redis,
        points: 40,
        duration: 20,
        keyPrefix: 'rl_user',
        insuranceLimiter: this.fallbackUserLimiter,
      });

      // IP: 10 capacity, 0.5/s refill → duration = 20s
      this.ipLimiter = new RateLimiterRedis({
        storeClient: this.redis,
        points: 10,
        duration: 20,
        keyPrefix: 'rl_ip',
        insuranceLimiter: this.fallbackIpLimiter,
      });

      this.redisAvailable = true;
      this.logger.log('Redis rate limiters initialized');
    } catch (err) {
      this.logger.warn(`Failed to init Redis limiters: ${(err as Error).message}`);
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Webhooks with a signature header are exempt
    if (request.headers[WEBHOOK_HEADER]) {
      return true;
    }

    // Check for per-route @Throttle first
    const throttle = this.reflector.get<ThrottleOptions | undefined>(
      THROTTLE_KEY,
      context.getHandler(),
    );

    if (throttle) {
      await this.checkThrottle(request, throttle);
    }

    // Global token bucket
    const reqCtx = RequestContext.current();
    const userId = reqCtx?.userId;

    try {
      if (userId) {
        // Authenticated: rate limit by userId (never by IP alone — branches share an office IP)
        const limiter = this.userLimiter || this.fallbackUserLimiter;
        await limiter.consume(userId, 1);
      } else {
        // Unauthenticated: rate limit by IP
        const ip = request.ip || request.socket?.remoteAddress || 'unknown';
        const limiter = this.ipLimiter || this.fallbackIpLimiter;
        await limiter.consume(ip, 1);
      }
    } catch (rateLimitRes: any) {
      if (rateLimitRes?.msBeforeNext) {
        const retryAfter = Math.ceil(rateLimitRes.msBeforeNext / 1000);
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Too many requests',
            error: 'Too Many Requests',
            retryAfter,
          },
          HttpStatus.TOO_MANY_REQUESTS,
          { cause: { headers: { 'Retry-After': String(retryAfter) } } },
        );
      }
      // If the error doesn't look like a rate-limit rejection, fail open
      // (unless this is an auth route)
      const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());
      if (!isPublic) {
        // Auth route: fail open (authenticated user already passed AuthGuard)
        return true;
      }
      return true; // fail open for general limits
    }

    return true;
  }

  private async checkThrottle(request: any, options: ThrottleOptions): Promise<void> {
    const { limit, windowSeconds, keyPrefix = 'throttle' } = options;
    const reqCtx = RequestContext.current();
    const identifier = reqCtx?.userId || request.ip || 'unknown';
    const fullKey = `${keyPrefix}:${identifier}`;

    let limiter = this.throttleLimiters.get(fullKey);
    if (!limiter) {
      if (this.redisAvailable) {
        limiter = new RateLimiterRedis({
          storeClient: this.redis,
          points: limit,
          duration: windowSeconds,
          keyPrefix: `rl_${keyPrefix}`,
        });
      } else {
        limiter = new RateLimiterMemory({
          points: limit,
          duration: windowSeconds,
          keyPrefix: `rl_${keyPrefix}`,
        });
      }
      this.throttleLimiters.set(fullKey, limiter);
    }

    try {
      await limiter.consume(identifier, 1);
    } catch (rateLimitRes: any) {
      const retryAfter = rateLimitRes?.msBeforeNext
        ? Math.ceil(rateLimitRes.msBeforeNext / 1000)
        : windowSeconds;
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests for this action',
          error: 'Too Many Requests',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
        { cause: { headers: { 'Retry-After': String(retryAfter) } } },
      );
    }
  }
}

