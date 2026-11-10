import { SetMetadata } from '@nestjs/common';

export const THROTTLE_KEY = 'throttle';

export interface ThrottleOptions {
  /** Max number of requests in the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
  /** Optional key prefix to namespace this counter */
  keyPrefix?: string;
}

/**
 * Strict per-route counter. Unlike the global token bucket, this is a
 * fixed-window counter — e.g. "5 login attempts per 15 min per account".
 *
 * Usage: @Throttle({ limit: 5, windowSeconds: 900, keyPrefix: 'login' })
 */
export const Throttle = (options: ThrottleOptions) =>
  SetMetadata(THROTTLE_KEY, options);

