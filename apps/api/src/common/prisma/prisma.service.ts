import { Injectable, OnModuleInit, OnModuleDestroy, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { RoleKey } from '@petals/types';
import { RequestContext } from '../context/request-context';

/**
 * Models that carry a branchId and must be automatically scoped
 * to the current user's allowed branches.
 */
const BRANCH_SCOPED_MODELS = new Set([
  'Client',
  'Lead',
  'Appointment',
  'Invoice',
  'Expense',
  'AttendanceRecord',
]);

/** Operations where we inject a branchId WHERE filter */
const FILTERABLE_READ_OPS = new Set([
  'findMany',
  'findFirst',
  'findFirstOrThrow',
  'count',
  'aggregate',
  'groupBy',
]);

/** Operations where we scope the WHERE to allowed branches */
const SCOPED_WRITE_OPS = new Set([
  'update',
  'updateMany',
  'delete',
  'deleteMany',
]);

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private _client!: PrismaClient;
  private _extended: any; // Extended client type
  private _queryCount = 0;
  private _queryCountEnabled = false;

  async onModuleInit() {
    if (!this._client) {
      this._client = new PrismaClient({
        log: process.env.NODE_ENV === 'development'
          ? [{ emit: 'event', level: 'query' }]
          : [],
      });

      // Query counting for tests
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        (this._client as any).$on?.('query', () => {
          if (this._queryCountEnabled) {
            this._queryCount++;
          }
        });
      }

      await this._client.$connect();
      this.logger.log('Prisma connected');
    }

    this._extended = this.createExtendedClient();
  }

  async onModuleDestroy() {
    await this._client.$disconnect();
  }

  private createExtendedClient() {
    return this._client.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const ctx = RequestContext.current();

            // No context, no branch restriction, or Director (unrestricted access) → pass through
            if (!ctx?.branchIds?.length || !model || !BRANCH_SCOPED_MODELS.has(model) || ctx?.roleKey === RoleKey.DIRECTOR) {
              return query(args);
            }

            const branchIds = ctx.branchIds;
            const branchFilter = { branchId: { in: branchIds } };

            // Read operations: inject WHERE filter
            if (FILTERABLE_READ_OPS.has(operation)) {
              (args as any).where = { ...(args as any).where, ...branchFilter };
              return query(args);
            }

            // findUnique / findUniqueOrThrow: post-query check
            // (can't inject extra fields into a unique where clause)
            if (operation === 'findUnique' || operation === 'findUniqueOrThrow') {
              const result = await query(args);
              if (result && !(result as any).branchId) {
                return result; // No branchId on result (select excluded it) — can't check
              }
              if (result && !branchIds.includes((result as any).branchId)) {
                if (operation === 'findUniqueOrThrow') {
                  throw new Prisma.PrismaClientKnownRequestError(
                    'Record not found or not accessible in your branch',
                    { code: 'P2025', clientVersion: Prisma.prismaVersion.client },
                  );
                }
                return null;
              }
              return result;
            }

            // Scoped writes: inject branch filter
            if (SCOPED_WRITE_OPS.has(operation)) {
              (args as any).where = { ...(args as any).where, ...branchFilter };
              return query(args);
            }

            // Create: validate that branchId is allowed
            if (operation === 'create') {
              const data = (args as any).data;
              if (data?.branchId && !branchIds.includes(data.branchId)) {
                throw new ForbiddenException('Cannot create record in unauthorized branch');
              }
              return query(args);
            }

            // createMany: validate all branchIds
            if (operation === 'createMany') {
              const dataArray = (args as any).data;
              if (Array.isArray(dataArray)) {
                for (const item of dataArray) {
                  if (item.branchId && !branchIds.includes(item.branchId)) {
                    throw new ForbiddenException('Cannot create record in unauthorized branch');
                  }
                }
              }
              return query(args);
            }

            // upsert: scope where + validate create data
            if (operation === 'upsert') {
              (args as any).where = { ...(args as any).where, ...branchFilter };
              const createData = (args as any).create;
              if (createData?.branchId && !branchIds.includes(createData.branchId)) {
                throw new ForbiddenException('Cannot create record in unauthorized branch');
              }
              return query(args);
            }

            return query(args);
          },
        },
      },
    });
  }

  /**
   * Branch-scoped client — use this for all normal service queries.
   * Branch filtering is applied automatically based on the request context.
   */
  get client(): PrismaClient {
    return this._extended as PrismaClient;
  }

  /**
   * Unscoped client — use ONLY for system-level operations (seeding, migrations,
   * cross-branch admin queries by Director). Bypasses branch scoping.
   */
  get unscopedClient(): PrismaClient {
    return this._client;
  }

  /**
   * Delegate $transaction from the extended client so services can use it directly.
   */
  async $transaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: { maxWait?: number; timeout?: number; isolationLevel?: Prisma.TransactionIsolationLevel },
  ): Promise<T> {
    return this._extended.$transaction(fn, options);
  }

  /**
   * Delegate $queryRaw so services can run tagged template queries directly.
   */
  async $queryRaw<T = unknown>(query: Prisma.Sql): Promise<T> {
    const client = this._extended ?? this._client;
    return client.$queryRaw(query);
  }

  // ─── Query counting for tests ───

  startQueryCount(): void {
    this._queryCount = 0;
    this._queryCountEnabled = true;
  }

  stopQueryCount(): number {
    this._queryCountEnabled = false;
    return this._queryCount;
  }

  getQueryCount(): number {
    return this._queryCount;
  }

  resetQueryCount(): void {
    this._queryCount = 0;
  }
}

