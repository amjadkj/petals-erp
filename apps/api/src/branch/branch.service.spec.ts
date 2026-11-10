import { Test, TestingModule } from '@nestjs/testing';
import { BranchService } from './branch.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('BranchService', () => {
  let service: BranchService;

  const mockPrisma = {
    unscopedClient: {
      branch: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BranchService>(BranchService);
  });

  describe('create', () => {
    it('should create a new branch successfully', async () => {
      mockPrisma.unscopedClient.branch.findUnique.mockResolvedValue(null);
      mockPrisma.unscopedClient.branch.create.mockResolvedValue({
        id: 'branch-1',
        name: 'Calicut Branch',
        code: 'CAL-01',
      });

      const result = await service.create({
        name: 'Calicut Branch',
        code: 'CAL-01',
      });

      expect(result.id).toBe('branch-1');
      expect(mockPrisma.unscopedClient.branch.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if branch code already exists', async () => {
      mockPrisma.unscopedClient.branch.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.create({ name: 'Duplicate', code: 'CAL-01' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all branches for Director', async () => {
      mockPrisma.unscopedClient.branch.findMany.mockResolvedValue([{ id: 'b1' }, { id: 'b2' }]);
      mockPrisma.unscopedClient.branch.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, pageSize: 20 }, [], true);

      expect(result.data.length).toBe(2);
      expect(mockPrisma.unscopedClient.branch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });

    it('should scope branches to userBranchIds for non-director', async () => {
      mockPrisma.unscopedClient.branch.findMany.mockResolvedValue([{ id: 'b1' }]);
      mockPrisma.unscopedClient.branch.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, pageSize: 20 }, ['b1'], false);

      expect(result.data.length).toBe(1);
      expect(mockPrisma.unscopedClient.branch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { in: ['b1'] } },
        }),
      );
    });
  });

  describe('findById', () => {
    it('should allow Director to access any branch', async () => {
      mockPrisma.unscopedClient.branch.findUnique.mockResolvedValue({ id: 'b2', name: 'Branch 2' });

      const result = await service.findById('b2', ['b1'], true);
      expect(result.id).toBe('b2');
    });

    it('should throw ForbiddenException for non-director accessing unassigned branch', async () => {
      await expect(
        service.findById('b2', ['b1'], false),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if branch does not exist', async () => {
      mockPrisma.unscopedClient.branch.findUnique.mockResolvedValue(null);

      await expect(
        service.findById('b1', ['b1'], false),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

