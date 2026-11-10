import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TokenBucketGuard } from './token-bucket.guard';
import { LockoutService } from './lockout.service';

@Global()
@Module({
  providers: [
    LockoutService,
    TokenBucketGuard,
    {
      provide: APP_GUARD,
      useExisting: TokenBucketGuard,
    },
  ],
  exports: [LockoutService, TokenBucketGuard],
})
export class RateLimitModule {}
