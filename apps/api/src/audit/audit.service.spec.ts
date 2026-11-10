import { AuditService } from './audit.service';

describe('AuditService', () => {
  let service: AuditService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      unscopedClient: {
        auditLog: {
          create: jest.fn(),
          findMany: jest.fn(),
        },
      },
    };

    service = new AuditService(mockPrisma);
  });

  describe('log', () => {
    it('should create an audit log and sanitize sensitive metadata', async () => {
      mockPrisma.unscopedClient.auditLog.create.mockResolvedValue({ id: 'audit-1' });

      const result = await service.log({
        userId: 'user-1',
        action: 'LOGIN',
        entity: 'Auth',
        metadata: {
          email: 'test@petals.com',
          password: 'secretPassword123',
          twoFactorCode: '123456',
          observation: 'Sensitive clinical observation text',
          notes: 'Doctor private notes',
          safeField: 123,
        },
        ipAddress: '127.0.0.1',
      });

      expect(result).toEqual({ id: 'audit-1' });
      expect(mockPrisma.unscopedClient.auditLog.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          action: 'LOGIN',
          entity: 'Auth',
          entityId: undefined,
          branchId: undefined,
          metadata: {
            email: 'test@petals.com',
            password: '[REDACTED]',
            twoFactorCode: '[REDACTED]',
            observation: '[REDACTED_CLINICAL_TEXT]',
            notes: '[REDACTED_CLINICAL_TEXT]',
            safeField: 123,
          },
          ipAddress: '127.0.0.1',
        },
      });
    });

    it('should not throw if prisma create fails', async () => {
      mockPrisma.unscopedClient.auditLog.create.mockRejectedValue(
        new Error('DB Connection lost'),
      );

      const result = await service.log({
        action: 'CREATE',
        entity: 'User',
      });

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should query with cursor pagination and return meta', async () => {
      const mockItems = [
        { id: 'log-1', createdAt: new Date() },
        { id: 'log-2', createdAt: new Date() },
      ];
      mockPrisma.unscopedClient.auditLog.findMany.mockResolvedValue(mockItems);

      const res = await service.findAll({ limit: 2 });

      expect(res.data).toHaveLength(2);
      expect(res.meta.hasNext).toBe(true);
      expect(res.meta.nextCursor).toBe('log-2');
    });

    it('should filter by userId, entity, and date range', async () => {
      mockPrisma.unscopedClient.auditLog.findMany.mockResolvedValue([]);

      await service.findAll({
        userId: 'user-123',
        entity: 'Assessment',
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-01-02T00:00:00.000Z',
        limit: 20,
      });

      expect(mockPrisma.unscopedClient.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: 'user-123',
            entity: 'Assessment',
            createdAt: {
              gte: new Date('2026-01-01T00:00:00.000Z'),
              lte: new Date('2026-01-02T00:00:00.000Z'),
            },
          },
        }),
      );
    });
  });
});

