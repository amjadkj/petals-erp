import { Injectable, Optional } from '@nestjs/common';
import { PrismaService } from './common/prisma';
import { CacheService } from './common/redis';

@Injectable()
export class AppService {
  constructor(
    @Optional() private readonly prisma?: PrismaService,
    @Optional() private readonly cache?: CacheService,
  ) {}

  async getHealth(): Promise<{
    status: 'ok' | 'degraded';
    database: string;
    redis: string;
    uptime: number;
    timestamp: string;
  }> {
    let dbStatus = 'ok';
    let redisStatus = 'ok';

    if (this.prisma) {
      try {
        await this.prisma.unscopedClient.$queryRaw`SELECT 1;`;
      } catch {
        dbStatus = 'disconnected';
      }
    }

    if (this.cache) {
      try {
        const ping = await this.cache.get('health_check_ping');
        if (ping === null) {
          await this.cache.set('health_check_ping', 'pong', 5);
        }
      } catch {
        redisStatus = 'fallback';
      }
    }

    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      database: dbStatus,
      redis: redisStatus,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}

