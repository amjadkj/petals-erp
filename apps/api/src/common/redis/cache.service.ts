import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

const NAMESPACE = 'petals';

interface MemoryCacheEntry {
  value: string;
  expiresAt: number;
}

/**
 * Cache service wrapping Redis with namespaced keys, TTL, JSON serialisation,
 * and hit/miss metrics. All keys are prefixed with `petals:`.
 *
 * Automatically falls back to an in-memory store when Redis is offline.
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private hits = 0;
  private misses = 0;
  private readonly memoryFallback = new Map<string, MemoryCacheEntry>();

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  private key(raw: string): string {
    return `${NAMESPACE}:${raw}`;
  }

  /**
   * Is Redis connected and ready?
   */
  isReady(): boolean {
    return this.redis?.status === 'ready';
  }

  /**
   * GET a cached value. Returns null on miss.
   */
  async get<T = unknown>(rawKey: string): Promise<T | null> {
    const k = this.key(rawKey);

    if (this.isReady()) {
      try {
        const val = await this.redis.get(k);
        if (val === null) {
          this.misses++;
          return null;
        }
        this.hits++;
        return JSON.parse(val) as T;
      } catch (err) {
        this.logger.warn(`Cache GET error for ${rawKey}: ${(err as Error).message}`);
      }
    }

    // Fallback in-memory check
    const entry = this.memoryFallback.get(k);
    if (entry) {
      if (entry.expiresAt > Date.now()) {
        this.hits++;
        return JSON.parse(entry.value) as T;
      }
      this.memoryFallback.delete(k);
    }

    this.misses++;
    return null;
  }

  /**
   * SET a cached value with a TTL in seconds.
   */
  async set(rawKey: string, value: unknown, ttlSeconds: number): Promise<void> {
    const k = this.key(rawKey);
    const serialized = JSON.stringify(value);

    // Save in memory fallback
    this.memoryFallback.set(k, {
      value: serialized,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    if (this.isReady()) {
      try {
        await this.redis.set(k, serialized, 'EX', ttlSeconds);
      } catch (err) {
        this.logger.warn(`Cache SET error for ${rawKey}: ${(err as Error).message}`);
      }
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
    const k = this.key(rawKey);
    this.memoryFallback.delete(k);

    if (this.isReady()) {
      try {
        await this.redis.del(k);
      } catch (err) {
        this.logger.warn(`Cache DEL error for ${rawKey}: ${(err as Error).message}`);
      }
    }
  }

  /**
   * Delete all keys matching a prefix.
   */
  async deleteByPrefix(rawPrefix: string): Promise<number> {
    const pattern = this.key(`${rawPrefix}*`);
    let deleted = 0;

    // Delete in-memory matching keys
    const memPrefix = this.key(rawPrefix);
    for (const key of this.memoryFallback.keys()) {
      if (key.startsWith(memPrefix)) {
        this.memoryFallback.delete(key);
        deleted++;
      }
    }

    if (this.isReady()) {
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
