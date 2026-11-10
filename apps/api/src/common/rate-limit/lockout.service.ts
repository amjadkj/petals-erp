import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.constants';

export interface LockoutResult {
  locked: boolean;
  retryAfterSeconds: number;
  attempts: number;
}

/**
 * Lockout service with escalating delays.
 *
 * Used for login, OTP, password reset — strict counters that fail closed.
 * Each failure increments a counter; when the threshold is hit, the account
 * is locked for an escalating duration.
 *
 * Escalation: base * 2^(lockouts-1), capped at maxDelaySeconds.
 */
@Injectable()
export class LockoutService {
  private readonly logger = new Logger(LockoutService.name);
  private readonly keyPrefix = 'petals:lockout';

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  /**
   * Record a failed attempt and check if the target is locked out.
   *
   * @param target      Unique identifier (userId, email, IP, phone)
   * @param purpose     Lock category (login, otp_request, otp_verify, password_reset)
   * @param maxAttempts Max allowed failures before lockout
   * @param windowSec   Window in seconds for counting failures
   * @param baseLockSec Base lockout duration in seconds
   * @param maxLockSec  Maximum lockout duration (cap on escalation)
   */
  async recordFailure(
    target: string,
    purpose: string,
    maxAttempts: number,
    windowSec: number,
    baseLockSec: number = 60,
    maxLockSec: number = 3600,
  ): Promise<LockoutResult> {
    const counterKey = `${this.keyPrefix}:${purpose}:count:${target}`;
    const lockKey = `${this.keyPrefix}:${purpose}:lock:${target}`;
    const lockoutCountKey = `${this.keyPrefix}:${purpose}:lockouts:${target}`;

    try {
      // Check if currently locked
      const lockTtl = await this.redis.ttl(lockKey);
      if (lockTtl > 0) {
        const attempts = parseInt(await this.redis.get(counterKey) || '0', 10);
        return { locked: true, retryAfterSeconds: lockTtl, attempts };
      }

      // Increment failure counter
      const attempts = await this.redis.incr(counterKey);
      if (attempts === 1) {
        await this.redis.expire(counterKey, windowSec);
      }

      if (attempts >= maxAttempts) {
        // Escalate lockout duration
        const lockouts = await this.redis.incr(lockoutCountKey);
        if (lockouts === 1) {
          // lockout counter expires after a long window (24h)
          await this.redis.expire(lockoutCountKey, 86400);
        }
        const lockDuration = Math.min(
          baseLockSec * Math.pow(2, lockouts - 1),
          maxLockSec,
        );
        await this.redis.set(lockKey, '1', 'EX', Math.ceil(lockDuration));
        // Reset the failure counter
        await this.redis.del(counterKey);

        return {
          locked: true,
          retryAfterSeconds: Math.ceil(lockDuration),
          attempts,
        };
      }

      return { locked: false, retryAfterSeconds: 0, attempts };
    } catch (err) {
      // Fail closed for auth-related lockouts
      this.logger.error(`Lockout service error: ${(err as Error).message}`);
      return { locked: true, retryAfterSeconds: 60, attempts: 0 };
    }
  }

  /**
   * Check if a target is currently locked out (without recording a failure).
   */
  async isLocked(target: string, purpose: string): Promise<LockoutResult> {
    const lockKey = `${this.keyPrefix}:${purpose}:lock:${target}`;
    const counterKey = `${this.keyPrefix}:${purpose}:count:${target}`;

    try {
      const lockTtl = await this.redis.ttl(lockKey);
      if (lockTtl > 0) {
        const attempts = parseInt(await this.redis.get(counterKey) || '0', 10);
        return { locked: true, retryAfterSeconds: lockTtl, attempts };
      }
      return { locked: false, retryAfterSeconds: 0, attempts: 0 };
    } catch (err) {
      this.logger.error(`Lockout check error: ${(err as Error).message}`);
      return { locked: true, retryAfterSeconds: 60, attempts: 0 };
    }
  }

  /**
   * Clear lockout and failure counter (e.g. after a successful login).
   */
  async clearLockout(target: string, purpose: string): Promise<void> {
    const counterKey = `${this.keyPrefix}:${purpose}:count:${target}`;
    const lockKey = `${this.keyPrefix}:${purpose}:lock:${target}`;
    const lockoutCountKey = `${this.keyPrefix}:${purpose}:lockouts:${target}`;

    try {
      await this.redis.del(counterKey, lockKey, lockoutCountKey);
    } catch (err) {
      this.logger.warn(`Clear lockout error: ${(err as Error).message}`);
    }
  }
}

