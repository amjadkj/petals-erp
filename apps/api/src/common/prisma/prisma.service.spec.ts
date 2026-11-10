import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RequestContext, IRequestContext } from '../context/request-context';
import { RoleKey } from '@petals/types';

describe('PrismaService - Branch Scoping', () => {
  let service: PrismaService;
  let mockRawClient: any;

  beforeEach(() => {
    service = new PrismaService();
    mockRawClient = {
      $connect: jest.fn().mockResolvedValue(undefined),
      $disconnect: jest.fn().mockResolvedValue(undefined),
      $extends: jest.fn((extension) => extension),
    };
    (service as any)._client = mockRawClient;
  });

  const branchA = '11111111-1111-1111-1111-111111111111';
  const branchB = '22222222-2222-2222-2222-222222222222';

  const userContextBranchA: IRequestContext = {
    userId: 'user-branch-a',
    roleKey: RoleKey.THERAPIST,
    isActive: true,
    branchIds: [branchA],
    activeBranchId: branchA,
    sessionId: 'session-1',
  };

  it('should inject branchId filter into findMany queries for branch-scoped models', async () => {
    await service.onModuleInit();
    const extension = mockRawClient.$extends.mock.results[0].value;
    const allOperationsHook = extension.query.$allModels.$allOperations;

    await RequestContext.run(userContextBranchA, async () => {
      const mockQuery = jest.fn().mockResolvedValue([{ id: 'c1', branchId: branchA }]);
      const args: any = { where: { status: 'ACTIVE' } };

      const result = await allOperationsHook({
        model: 'Client',
        operation: 'findMany',
        args,
        query: mockQuery,
      });

      expect(mockQuery).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
          branchId: { in: [branchA] },
        },
      });
      expect(result).toEqual([{ id: 'c1', branchId: branchA }]);
    });
  });

  it('should not allow branch A user to read a branch B record via findUnique', async () => {
    await service.onModuleInit();
    const extension = mockRawClient.$extends.mock.results[0].value;
    const allOperationsHook = extension.query.$allModels.$allOperations;

    await RequestContext.run(userContextBranchA, async () => {
      // Simulate underlying DB finding a record that belongs to branch B
      const mockQuery = jest.fn().mockResolvedValue({ id: 'c2', branchId: branchB });
      const args: any = { where: { id: 'c2' } };

      const result = await allOperationsHook({
        model: 'Client',
        operation: 'findUnique',
        args,
        query: mockQuery,
      });

      // Branch scoping blocks access and returns null
      expect(result).toBeNull();
    });
  });

  it('should throw ForbiddenException if user tries to create a record for another branch', async () => {
    await service.onModuleInit();
    const extension = mockRawClient.$extends.mock.results[0].value;
    const allOperationsHook = extension.query.$allModels.$allOperations;

    await RequestContext.run(userContextBranchA, async () => {
      const mockQuery = jest.fn();
      const args: any = {
        data: {
          name: 'Jane Doe',
          branchId: branchB, // Attempting to create in unauthorized Branch B
        },
      };

      await expect(
        allOperationsHook({
          model: 'Client',
          operation: 'create',
          args,
          query: mockQuery,
        }),
      ).rejects.toThrow(ForbiddenException);

      expect(mockQuery).not.toHaveBeenCalled();
    });
  });

  it('should allow create when branchId matches user allowed branches', async () => {
    await service.onModuleInit();
    const extension = mockRawClient.$extends.mock.results[0].value;
    const allOperationsHook = extension.query.$allModels.$allOperations;

    await RequestContext.run(userContextBranchA, async () => {
      const mockQuery = jest.fn().mockResolvedValue({ id: 'c3', branchId: branchA });
      const args: any = {
        data: {
          name: 'John Doe',
          branchId: branchA,
        },
      };

      const result = await allOperationsHook({
        model: 'Client',
        operation: 'create',
        args,
        query: mockQuery,
      });

      expect(mockQuery).toHaveBeenCalledWith(args);
      expect(result).toEqual({ id: 'c3', branchId: branchA });
    });
  });

  it('should bypass scoping for models that are not branch-scoped (e.g. Department)', async () => {
    await service.onModuleInit();
    const extension = mockRawClient.$extends.mock.results[0].value;
    const allOperationsHook = extension.query.$allModels.$allOperations;

    await RequestContext.run(userContextBranchA, async () => {
      const mockQuery = jest.fn().mockResolvedValue([{ id: 'd1', name: 'Speech Therapy' }]);
      const args: any = { where: {} };

      const result = await allOperationsHook({
        model: 'Department',
        operation: 'findMany',
        args,
        query: mockQuery,
      });

      // where clause should not be modified
      expect(mockQuery).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual([{ id: 'd1', name: 'Speech Therapy' }]);
    });
  });
});

