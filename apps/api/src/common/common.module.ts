import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { PrismaModule } from './prisma';
import { RedisModule } from './redis';
import { RateLimitModule } from './rate-limit';
import { RequestContextMiddleware } from './context';

@Module({
  imports: [PrismaModule, RedisModule, RateLimitModule],
  exports: [PrismaModule, RedisModule, RateLimitModule],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}

