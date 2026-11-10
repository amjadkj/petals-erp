import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ChangeType, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma';
import { buildCursorPagination, buildCursorMeta } from '../common/pagination';
import { RestoreEntityDto, VersionHistoryQueryDto } from './dto';

export interface RecordVersionParams {
  entityType: string;
  entityId: string;
  changeType: ChangeType;
  previousContent: any;
  changedById: string;
  reason?: string;
}

@Injectable()
export class VersionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Writes a ClinicalEntryVersion inside a transaction before an edit, delete, or restore.
   * If a transaction client is not supplied, it uses the unscoped Prisma client.
   */
  async recordVersion(
    params: RecordVersionParams,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prisma.unscopedClient;

    const latest = await client.clinicalEntryVersion.findFirst({
      where: {
        entityType: params.entityType,
        entityId: params.entityId,
      },
      orderBy: { versionNo: 'desc' },
      select: { versionNo: true },
    });

    const nextVersionNo = (latest?.versionNo ?? 0) + 1;

    return client.clinicalEntryVersion.create({
      data: {
        entityType: params.entityType,
        entityId: params.entityId,
        versionNo: nextVersionNo,
        changeType: params.changeType,
        previousContent: params.previousContent,
        changedById: params.changedById,
        reason: params.reason,
      },
    });
  }

  /**
   * Helper to record an EDIT version before updating.
   */
  async recordEdit(
    params: Omit<RecordVersionParams, 'changeType'>,
    tx?: Prisma.TransactionClient,
  ) {
    return this.recordVersion({ ...params, changeType: ChangeType.EDIT }, tx);
  }

  /**
   * Helper to record a DELETE version before soft-deleting.
   */
  async recordDelete(
    params: Omit<RecordVersionParams, 'changeType'>,
    tx?: Prisma.TransactionClient,
  ) {
    return this.recordVersion({ ...params, changeType: ChangeType.DELETE }, tx);
  }

  /**
   * Retrieves version history for an entity with cursor pagination.
   */
  async getEntityHistory(
    entityType: string,
    entityId: string,
    query: VersionHistoryQueryDto,
  ) {
    const { cursor, limit = 20 } = query;
    const pagination = buildCursorPagination(cursor, limit);

    const items = await this.prisma.unscopedClient.clinicalEntryVersion.findMany({
      where: {
        entityType,
        entityId,
      },
      ...(pagination as any),
      orderBy: [{ changedAt: 'desc' }, { id: 'asc' }],
      include: {
        changedBy: {
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

  /**
   * Restores a clinical entity to its previous state or a specific version.
   * Records a RESTORE version row before updating the entity.
   */
  async restoreEntity(
    entityType: string,
    entityId: string,
    restoredById: string,
    dto?: RestoreEntityDto,
  ) {
    const lowerType = entityType.toLowerCase();

    return this.prisma.$transaction(async (tx) => {
      let currentRecord: any = null;
      let updateFn: (contentToRestore: any) => Promise<any>;

      if (lowerType === 'assessment') {
        currentRecord = await tx.assessment.findUnique({
          where: { id: entityId },
        });
        if (!currentRecord) {
          throw new NotFoundException(`Assessment with id "${entityId}" not found`);
        }
        updateFn = (content: any) =>
          tx.assessment.update({
            where: { id: entityId },
            data: {
              deletedAt: null,
              tool: content?.tool ?? currentRecord.tool,
              observation: content?.observation ?? currentRecord.observation,
              scores: content?.scores ?? currentRecord.scores,
              summary: content?.summary ?? currentRecord.summary,
              assessedOn: content?.assessedOn
                ? new Date(content.assessedOn)
                : currentRecord.assessedOn,
            },
          });
      } else if (lowerType === 'treatmentplan') {
        currentRecord = await tx.treatmentPlan.findUnique({
          where: { id: entityId },
        });
        if (!currentRecord) {
          throw new NotFoundException(`TreatmentPlan with id "${entityId}" not found`);
        }
        updateFn = (content: any) =>
          tx.treatmentPlan.update({
            where: { id: entityId },
            data: {
              status: content?.status ?? currentRecord.status,
            },
          });
      } else {
        // Fallback for any other clinical delegate
        const delegateName = entityType.charAt(0).toLowerCase() + entityType.slice(1);
        const delegate = (tx as any)[delegateName];
        if (!delegate || typeof delegate.findUnique !== 'function') {
          throw new BadRequestException(
            `Entity type "${entityType}" is not supported for version restore`,
          );
        }
        currentRecord = await delegate.findUnique({ where: { id: entityId } });
        if (!currentRecord) {
          throw new NotFoundException(`${entityType} with id "${entityId}" not found`);
        }
        updateFn = () =>
          delegate.update({
            where: { id: entityId },
            data: { deletedAt: null },
          });
      }

      // Determine previous content to restore
      let contentToRestore = currentRecord;
      if (dto?.versionNo) {
        const targetVersion = await tx.clinicalEntryVersion.findUnique({
          where: {
            entityType_entityId_versionNo: {
              entityType,
              entityId,
              versionNo: dto.versionNo,
            },
          },
        });
        if (!targetVersion) {
          throw new NotFoundException(
            `Version ${dto.versionNo} for ${entityType} "${entityId}" not found`,
          );
        }
        contentToRestore = targetVersion.previousContent;
      } else {
        // Find most recent version before deletion
        const latestVersion = await tx.clinicalEntryVersion.findFirst({
          where: { entityType, entityId },
          orderBy: { versionNo: 'desc' },
        });
        if (latestVersion?.previousContent) {
          contentToRestore = latestVersion.previousContent;
        }
      }

      // Record RESTORE version row
      const restoredVersion = await this.recordVersion(
        {
          entityType,
          entityId,
          changeType: ChangeType.RESTORE,
          previousContent: currentRecord,
          changedById: restoredById,
          reason: dto?.reason || 'Restored by Director',
        },
        tx,
      );

      // Perform entity restoration
      const restoredEntity = await updateFn(contentToRestore);

      return {
        message: `${entityType} restored successfully`,
        version: restoredVersion,
        entity: restoredEntity,
      };
    });
  }
}

