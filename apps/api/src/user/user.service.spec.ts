import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { CacheService } from '../common/redis/cache.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { RoleKey } from '@petals/types';

describe('UserService', () => {
  let service: UserService;

  const mockPrisma: any = {
    unscopedClient: {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      role: {
        findUnique: jest.fn(),
      },
      branch: {
        findMany: jest.fn(),
      },
      userBranch: {
        createMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      session: {
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn((cb: any) => cb(mockPrisma.unscopedClient)),
    },
  };

  const mockCache = {
    deleteByPrefix: jest.fn().mockResolvedValue(1),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CacheService, useValue: mockCache },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('should create staff user and assign branches with primary branch', async () => {
      mockPrisma.unscopedClient.user.findUnique
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce({
          id: 'user-1',
          name: 'Staff Member',
          email: 'staff@petals.com',
          role: { key: RoleKey.THERAPIST },
          branches: [{ branchId: 'b1', isPrimary: true }],
        }); // findById check

      mockPrisma.unscopedClient.role.findUnique.mockResolvedValue({
        id: 'role-1',
        key: RoleKey.THERAPIST,
      });

      mockPrisma.unscopedClient.branch.findMany.mockResolvedValue([{ id: 'b1' }]);
      mockPrisma.unscopedClient.user.create.mockResolvedValue({ id: 'user-1' });

      const result = await service.create({
        name: 'Staff Member',
        email: 'staff@petals.com',
        roleId: 'role-1',
        branches: [{ branchId: 'b1', isPrimary: true }],
      });

      expect(result.id).toBe('user-1');
      expect(mockCache.deleteByPrefix).toHaveBeenCalledWith('user_perms:user-1');
    });

    it('should reject creating a user with PARENT role', async () => {
      mockPrisma.unscopedClient.user.findUnique.mockResolvedValue(null);
      mockPrisma.unscopedClient.role.findUnique.mockResolvedValue({
        id: 'role-parent',
        key: RoleKey.PARENT,
      });

      await expect(
        service.create({
          name: 'Parent User',
          email: 'parent@petals.com',
          roleId: 'role-parent',
          branches: [{ branchId: 'b1' }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject duplicate email', async () => {
      mockPrisma.unscopedClient.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.create({
          name: 'Duplicate',
          email: 'existing@petals.com',
          roleId: 'role-1',
          branches: [{ branchId: 'b1' }],
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deactivate', () => {
    it('should deactivate user, revoke sessions, and invalidate permission cache', async () => {
      mockPrisma.unscopedClient.user.findUnique
        .mockResolvedValueOnce({
          id: 'user-1',
          roleId: 'r1',
          branches: [],
        })
        .mockResolvedValueOnce({
          id: 'user-1',
          isActive: false,
          branches: [],
        });

      await service.deactivate('user-1');

      expect(mockPrisma.unscopedClient.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({ isActive: false }),
        }),
      );
      expect(mockPrisma.unscopedClient.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(mockCache.deleteByPrefix).toHaveBeenCalledWith('auth:refresh:user-1:');
      expect(mockCache.deleteByPrefix).toHaveBeenCalledWith('user_perms:user-1');
    });
  });
});
