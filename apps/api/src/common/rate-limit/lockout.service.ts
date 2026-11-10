import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.constants';

export interface LockoutResult {
  locked: boolean;
  retryAfterSeconds: number;
  attempts: number;
}

interface MemoryLockEntry {
  count: number;
  countExpiresAt: number;
  lockUntil: number;
  lockouts: number;
  lockoutsExpiresAt: number;
}

/**
 * Lockout service with escalating delays.
 *
 * Used for login, OTP, password reset — strict counters.
 * Each failure increments a counter; when the threshold is hit, the account
 * is locked for an escalating duration.
 *
 * Escalation: base * 2^(lockouts-1), capped at maxDelaySeconds.
 * Automatically falls back to in-memory store when Redis is offline.
 */
@Injectable()
export class LockoutService {
  private readonly logger = new Logger(LockoutService.name);
  private readonly keyPrefix = 'petals:lockout';
  private readonly memoryStore = new Map<string, MemoryLockEntry>();

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  private isRedisReady(): boolean {
    return this.redis?.status === 'ready';
  }

  private getMemoryEntry(key: string): MemoryLockEntry {
    let entry = this.memoryStore.get(key);
    const now = Date.now();
    if (!entry) {
      entry = { count: 0, countExpiresAt: 0, lockUntil: 0, lockouts: 0, lockoutsExpiresAt: 0 };
      this.memoryStore.set(key, entry);
    }
    // Clean up expired count
    if (entry.countExpiresAt > 0 && entry.countExpiresAt < now) {
      entry.count = 0;
      entry.countExpiresAt = 0;
    }
    // Clean up expired lockout counter
    if (entry.lockoutsExpiresAt > 0 && entry.lockoutsExpiresAt < now) {
      entry.lockouts = 0;
      entry.lockoutsExpiresAt = 0;
    }
    return entry;
  }

  /**
   * Record a failed attempt and check if the target is locked out.
   */
  async recordFailure(
    target: string,
    purpose: string,
    maxAttempts: number,
    windowSec: number,
    baseLockSec: number = 60,
    maxLockSec: number = 3600,
  ): Promise<LockoutResult> {
    const memoryKey = `${purpose}:${target}`;

    if (!this.isRedisReady()) {
      const now = Date.now();
      const entry = this.getMemoryEntry(memoryKey);

      if (entry.lockUntil > now) {
        const remainingSec = Math.ceil((entry.lockUntil - now) / 1000);
        return { locked: true, retryAfterSeconds: remainingSec, attempts: entry.count };
      }

      entry.count += 1;
      if (entry.count === 1) {
        entry.countExpiresAt = now + windowSec * 1000;
      }

      if (entry.count >= maxAttempts) {
        entry.lockouts += 1;
        if (entry.lockouts === 1) {
          entry.lockoutsExpiresAt = now + 86400 * 1000;
        }
        const lockDuration = Math.min(
          baseLockSec * Math.pow(2, entry.lockouts - 1),
          maxLockSec,
        );
        entry.lockUntil = now + lockDuration * 1000;
        entry.count = 0;
        return {
          locked: true,
          retryAfterSeconds: Math.ceil(lockDuration),
          attempts: maxAttempts,
        };
      }

      return { locked: false, retryAfterSeconds: 0, attempts: entry.count };
    }

    const counterKey = `${this.keyPrefix}:${purpose}:count:${target}`;
    const lockKey = `${this.keyPrefix}:${purpose}:lock:${target}`;
    const lockoutCountKey = `${this.keyPrefix}:${purpose}:lockouts:${target}`;

    try {
      // Check if currently locked
      const lockTtl = await this.redis.ttl(lockKey);
      if (lockTtl > 0) {
        const attempts = parseInt((await this.redis.get(counterKey)) || '0', 10);
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
          await this.redis.expire(lockoutCountKey, 86400);
        }
        const lockDuration = Math.min(
          baseLockSec * Math.pow(2, lockouts - 1),
          maxLockSec,
        );
        await this.redis.set(lockKey, '1', 'EX', Math.ceil(lockDuration));
        await this.redis.del(counterKey);

        return {
          locked: true,
          retryAfterSeconds: Math.ceil(lockDuration),
          attempts,
        };
      }

      return { locked: false, retryAfterSeconds: 0, attempts };
    } catch (err) {
      this.logger.error(`Lockout service Redis error: ${(err as Error).message}`);
      return { locked: false, retryAfterSeconds: 0, attempts: 0 };
    }
  }

  /**
   * Check if a target is currently locked out (without recording a failure).
   */
  async isLocked(target: string, purpose: string): Promise<LockoutResult> {
    const memoryKey = `${purpose}:${target}`;

    if (!this.isRedisReady()) {
      const entry = this.getMemoryEntry(memoryKey);
      const now = Date.now();
      if (entry.lockUntil > now) {
        const remainingSec = Math.ceil((entry.lockUntil - now) / 1000);
        return { locked: true, retryAfterSeconds: remainingSec, attempts: entry.count };
      }
      return { locked: false, retryAfterSeconds: 0, attempts: entry.count };
    }

    const lockKey = `${this.keyPrefix}:${purpose}:lock:${target}`;
    const counterKey = `${this.keyPrefix}:${purpose}:count:${target}`;

    try {
      const lockTtl = await this.redis.ttl(lockKey);
      if (lockTtl > 0) {
        const attempts = parseInt((await this.redis.get(counterKey)) || '0', 10);
        return { locked: true, retryAfterSeconds: lockTtl, attempts };
      }
      return { locked: false, retryAfterSeconds: 0, attempts: 0 };
    } catch (err) {
      this.logger.error(`Lockout check Redis error: ${(err as Error).message}`);
      return { locked: false, retryAfterSeconds: 0, attempts: 0 };
    }
  }

  /**
   * Clear lockout and failure counter (e.g. after a successful login).
   */
  async clearLockout(target: string, purpose: string): Promise<void> {
    const memoryKey = `${purpose}:${target}`;
    this.memoryStore.delete(memoryKey);

    if (!this.isRedisReady()) {
      return;
    }

    const counterKey = `${this.keyPrefix}:${purpose}:count:${target}`;
    const lockKey = `${this.keyPrefix}:${purpose}:lock:${target}`;
    const lockoutCountKey = `${this.keyPrefix}:${purpose}:lockouts:${target}`;

    try {
      await this.redis.del(counterKey, lockKey, lockoutCountKey);
    } catch (err) {
      this.logger.warn(`Clear lockout Redis error: ${(err as Error).message}`);
    }
  }
}
