import { NotFoundException } from '@nestjs/common';
import { ChangeType } from '@prisma/client';
import { VersionService } from './version.service';

describe('VersionService', () => {
  let service: VersionService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      unscopedClient: {
        clinicalEntryVersion: {
          findFirst: jest.fn(),
          findUnique: jest.fn(),
          findMany: jest.fn(),
          create: jest.fn(),
        },
        assessment: {
          findUnique: jest.fn(),
          update: jest.fn(),
        },
      },
      $transaction: jest.fn(async (cb) => {
        return cb(mockPrisma.unscopedClient);
      }),
    };

    service = new VersionService(mockPrisma);
  });

  describe('recordVersion', () => {
    it('should increment versionNo starting from 1 if no previous version', async () => {
      mockPrisma.unscopedClient.clinicalEntryVersion.findFirst.mockResolvedValue(null);
      mockPrisma.unscopedClient.clinicalEntryVersion.create.mockResolvedValue({
        id: 'ver-1',
        versionNo: 1,
      });

      const res = await service.recordVersion({
        entityType: 'Assessment',
        entityId: 'assess-123',
        changeType: ChangeType.EDIT,
        previousContent: { observation: 'Old notes' },
        changedById: 'user-1',
        reason: 'Updated observations',
      });

      expect(res.versionNo).toBe(1);
      expect(mockPrisma.unscopedClient.clinicalEntryVersion.create).toHaveBeenCalledWith({
        data: {
          entityType: 'Assessment',
          entityId: 'assess-123',
          versionNo: 1,
          changeType: ChangeType.EDIT,
          previousContent: { observation: 'Old notes' },
          changedById: 'user-1',
          reason: 'Updated observations',
        },
      });
    });

    it('should increment versionNo from latest version', async () => {
      mockPrisma.unscopedClient.clinicalEntryVersion.findFirst.mockResolvedValue({
        versionNo: 2,
      });
      mockPrisma.unscopedClient.clinicalEntryVersion.create.mockResolvedValue({
        id: 'ver-3',
        versionNo: 3,
      });

      const res = await service.recordVersion({
        entityType: 'Assessment',
        entityId: 'assess-123',
        changeType: ChangeType.DELETE,
        previousContent: { observation: 'New notes' },
        changedById: 'user-1',
      });

      expect(res.versionNo).toBe(3);
    });
  });

  describe('getEntityHistory', () => {
    it('should return cursor paginated history', async () => {
      const mockItems = [
        { id: 'ver-2', versionNo: 2, changedAt: new Date() },
        { id: 'ver-1', versionNo: 1, changedAt: new Date() },
      ];
      mockPrisma.unscopedClient.clinicalEntryVersion.findMany.mockResolvedValue(mockItems);

      const res = await service.getEntityHistory('Assessment', 'assess-123', { limit: 2 });

      expect(res.data).toHaveLength(2);
      expect(res.meta.hasNext).toBe(true);
      expect(res.meta.nextCursor).toBe('ver-1');
    });
  });

  describe('restoreEntity', () => {
    it('should throw NotFoundException if entity is not found', async () => {
      mockPrisma.unscopedClient.assessment.findUnique.mockResolvedValue(null);

      await expect(
        service.restoreEntity('Assessment', 'assess-nonexistent', 'dir-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should restore assessment and record RESTORE version', async () => {
      const mockDeletedAssessment = {
        id: 'assess-1',
        observation: 'Current deleted obs',
        summary: 'Deleted summary',
        tool: 'WISC-V',
        scores: {},
        assessedOn: new Date(),
        deletedAt: new Date(),
      };

      mockPrisma.unscopedClient.assessment.findUnique.mockResolvedValue(mockDeletedAssessment);
      mockPrisma.unscopedClient.clinicalEntryVersion.findFirst
        .mockResolvedValueOnce({
          versionNo: 2,
          previousContent: {
            observation: 'Original obs',
            summary: 'Original summary',
          },
        })
        .mockResolvedValueOnce({ versionNo: 2 }); // For recordVersion latest version query

      mockPrisma.unscopedClient.clinicalEntryVersion.create.mockResolvedValue({
        id: 'ver-3',
        versionNo: 3,
        changeType: ChangeType.RESTORE,
      });

      mockPrisma.unscopedClient.assessment.update.mockResolvedValue({
        ...mockDeletedAssessment,
        deletedAt: null,
        observation: 'Original obs',
        summary: 'Original summary',
      });

      const result = await service.restoreEntity('Assessment', 'assess-1', 'dir-1', {
        reason: 'Restoring accidental deletion',
      });

      expect(result.message).toContain('restored successfully');
      expect(result.version.changeType).toBe(ChangeType.RESTORE);
      expect(mockPrisma.unscopedClient.assessment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'assess-1' },
          data: expect.objectContaining({
            deletedAt: null,
            observation: 'Original obs',
            summary: 'Original summary',
          }),
        }),
      );
    });
  });
});

