import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

const NAMESPACE = 'petals';

/**
 * Cache service wrapping Redis with namespaced keys, TTL, JSON serialisation,
 * and hit/miss metrics. All keys are prefixed with `petals:`.
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private hits = 0;
  private misses = 0;

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  private key(raw: string): string {
    return `${NAMESPACE}:${raw}`;
  }

  /**
   * Is Redis connected and ready?
   */
  isReady(): boolean {
    return this.redis.status === 'ready';
  }

  /**
   * GET a cached value. Returns null on miss or if Redis is down.
   */
  async get<T = unknown>(rawKey: string): Promise<T | null> {
    try {
      const val = await this.redis.get(this.key(rawKey));
      if (val === null) {
        this.misses++;
        return null;
      }
      this.hits++;
      return JSON.parse(val) as T;
    } catch (err) {
      this.logger.warn(`Cache GET error for ${rawKey}: ${(err as Error).message}`);
      this.misses++;
      return null;
    }
  }

  /**
   * SET a cached value with a TTL in seconds.
   */
  async set(rawKey: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.redis.set(this.key(rawKey), serialized, 'EX', ttlSeconds);
    } catch (err) {
      this.logger.warn(`Cache SET error for ${rawKey}: ${(err as Error).message}`);
    }
  }

  /**
   * Get or compute: returns cached value if present, otherwise calls `factory`,
   * caches the result, and returns it.
   */
  async getOrSet<T>(rawKey: string, ttlSeconds: number, factory: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(rawKey);
    if (cached !== null) {
      return cached;
    }
    const value = await factory();
    await this.set(rawKey, value, ttlSeconds);
    return value;
  }

  /**
   * Delete a specific key.
   */
  async del(rawKey: string): Promise<void> {
    try {
      await this.redis.del(this.key(rawKey));
    } catch (err) {
      this.logger.warn(`Cache DEL error for ${rawKey}: ${(err as Error).message}`);
    }
  }

  /**
   * Delete all keys matching a prefix (uses SCAN, safe for production).
   * Example: deleteByPrefix('permissions:') deletes all petals:permissions:* keys.
   */
  async deleteByPrefix(rawPrefix: string): Promise<number> {
    const pattern = this.key(`${rawPrefix}*`);
    let deleted = 0;
    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100,
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.redis.del(...keys);
          deleted += keys.length;
        }
      } while (cursor !== '0');
    } catch (err) {
      this.logger.warn(`Cache deleteByPrefix error for ${rawPrefix}: ${(err as Error).message}`);
    }
    return deleted;
  }

  /**
   * Returns hit/miss metrics and resets counters.
   */
  getMetrics(): { hits: number; misses: number; hitRate: number } {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? this.hits / total : 0;
    const result = { hits: this.hits, misses: this.misses, hitRate };
    this.hits = 0;
    this.misses = 0;
    return result;
  }
}

