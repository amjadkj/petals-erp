import { Global, Module, Logger, OnApplicationShutdown, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';
import { CacheService } from './cache.service';

export { REDIS_CLIENT };

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (config: ConfigService) => {
        const logger = new Logger('RedisModule');
        const redisUrl = config.get<string>('REDIS_URL', 'redis://localhost:6379');

        const client = new Redis(redisUrl, {
          maxRetriesPerRequest: 1,
          retryStrategy(times: number) {
            if (times > 2) {
              return null; // Stop retrying quickly when offline
            }
            return Math.min(times * 100, 1000);
          },
          lazyConnect: true,
          enableOfflineQueue: false,
        });

        client.on('connect', () => logger.log(`Redis connected via REDIS_URL`));
        client.on('error', (err) => logger.debug(`Redis offline: ${err.message}`));
        client.on('close', () => logger.debug('Redis connection closed'));

        // Attempt connection but don't block startup if Redis is down
        client.connect().catch((err) => {
          logger.warn(`Redis not available: ${err.message}. Rate limiting will use in-memory fallback.`);
        });

        return client;
      },
      inject: [ConfigService],
    },
    CacheService,
  ],
  exports: [REDIS_CLIENT, CacheService],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async onApplicationShutdown() {
    try {
      if (this.redis.status !== 'end') {
        this.redis.disconnect();
      }
    } catch {
      // Ignore disconnect errors during shutdown
    }
  }
}
