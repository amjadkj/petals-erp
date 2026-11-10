import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma';
import { buildCursorPagination, buildCursorMeta } from '../common/pagination';
import { AuditLogQueryDto } from './dto';
import { sanitizeAuditMetadata } from './audit.sanitizer';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Writes an audit log entry.
   * Never throws - logs error to Logger to avoid crashing the main application flow.
   */
  async log(params: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    branchId?: string;
    metadata?: any;
    ipAddress?: string;
  }) {
    try {
      const sanitizedMeta = params.metadata
        ? sanitizeAuditMetadata(params.metadata)
        : undefined;

      return await this.prisma.unscopedClient.auditLog.create({
        data: {
          userId: params.userId,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          branchId: params.branchId,
          metadata: sanitizedMeta,
          ipAddress: params.ipAddress,
        },
      });
    } catch (err) {
      this.logger.warn(`Failed to write audit log: ${(err as Error).message}`);
      return null;
    }
  }

  /**
   * Retrieves audit logs with cursor pagination and optional filters.
   */
  async findAll(query: AuditLogQueryDto) {
    const { cursor, limit = 20, userId, entity, branchId, startDate, endDate } = query;
    const pagination = buildCursorPagination(cursor, limit);

    const where: Prisma.AuditLogWhereInput = {};
    if (userId) where.userId = userId;
    if (entity) where.entity = entity;
    if (branchId) where.branchId = branchId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const items = await this.prisma.unscopedClient.auditLog.findMany({
      where,
      ...(pagination as any),
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const meta = buildCursorMeta(items, limit);
    return { data: items, meta };
  }
}

