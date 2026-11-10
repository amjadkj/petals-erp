// Common module barrel export
export { CommonModule } from './common.module';

// Context
export { RequestContext, IRequestContext, RequestContextMiddleware } from './context';

// Prisma
export { PrismaService, PrismaModule } from './prisma';

// Decorators
export {
  CurrentUser,
  CurrentBranch,
  Public,
  IS_PUBLIC_KEY,
  Roles,
  ROLES_KEY,
  RequirePermission,
  PERMISSION_KEY,
  PermissionRequirement,
} from './decorators';

// Filters
export { GlobalExceptionFilter } from './filters';

// Config
export { EnvironmentVariables, validate } from './config';

// Pagination
export {
  OffsetPaginationDto,
  CursorPaginationDto,
  OffsetPaginationMeta,
  CursorPaginationMeta,
  OffsetPaginatedResponse,
  CursorPaginatedResponse,
  buildOrderBy,
  buildOffsetPagination,
  buildCursorPagination,
  buildOffsetMeta,
  buildCursorMeta,
} from './pagination';

// Redis
export { RedisModule, REDIS_CLIENT, CacheService } from './redis';

// Rate limiting
export {
  RateLimitModule,
  TokenBucketGuard,
  Throttle,
  THROTTLE_KEY,
  ThrottleOptions,
  LockoutService,
  LockoutResult,
} from './rate-limit';

// Testing
export { QueryCounter } from './testing';

