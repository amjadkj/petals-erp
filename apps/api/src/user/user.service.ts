import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CacheService } from '../common/redis/cache.service';
import { hashPassword } from '../common/crypto/crypto.util';
import { RoleKey } from '@petals/types';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto';
import {
  buildOffsetPagination,
  buildOffsetMeta,
  buildOrderBy,
} from '../common/pagination/pagination.helper';
import { Prisma } from '@prisma/client';

export const USER_SORT_FIELDS = ['name', 'email', 'createdAt'] as const;

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.unscopedClient.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException(`User with email '${dto.email}' already exists`);
    }

    const role = await this.prisma.unscopedClient.role.findUnique({
      where: { id: dto.roleId },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID '${dto.roleId}' not found`);
    }
    if (role.key === RoleKey.PARENT) {
      throw new BadRequestException(
        'Parent users cannot be created directly; they are created through the guardian flow',
      );
    }

    // Verify all branches exist
    const branchIds = dto.branches.map((b) => b.branchId);
    const existingBranches = await this.prisma.unscopedClient.branch.findMany({
      where: { id: { in: branchIds } },
    });
    if (existingBranches.length !== branchIds.length) {
      throw new BadRequestException('One or more branch IDs are invalid');
    }

    // Ensure exactly one primary branch
    let hasPrimary = false;
    const branchesToCreate = dto.branches.map((b) => {
      let isPrimary = !!b.isPrimary;
      if (isPrimary) {
        if (hasPrimary) {
          isPrimary = false; // Only allow one primary
        } else {
          hasPrimary = true;
        }
      }
      return { branchId: b.branchId, isPrimary };
    });

    if (!hasPrimary && branchesToCreate.length > 0) {
      branchesToCreate[0].isPrimary = true;
    }

    const rawPassword = dto.password || 'ChangeMe123!';
    const passwordHash = await hashPassword(rawPassword);

    const createdUser = await this.prisma.unscopedClient.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email.toLowerCase(),
          phone: dto.phone,
          passwordHash,
          roleId: role.id,
          isActive: true,
        },
      });

      await tx.userBranch.createMany({
        data: branchesToCreate.map((b) => ({
          userId: user.id,
          branchId: b.branchId,
          isPrimary: b.isPrimary,
        })),
      });

      return user;
    });

    // Invalidate permission cache
    await this.cacheService.deleteByPrefix(`user_perms:${createdUser.id}`);

    return this.findById(createdUser.id, branchIds, true);
  }

  async findAll(query: UserQueryDto, userBranchIds: string[], isDirector: boolean) {
    const where: Prisma.UserWhereInput = {};

    if (!isDirector) {
      where.branches = {
        some: {
          branchId: { in: userBranchIds },
        },
      };
    }

    if (query.branchId) {
      if (!isDirector && !userBranchIds.includes(query.branchId)) {
        throw new ForbiddenException('You do not have access to this branch');
      }
      where.branches = {
        some: {
          branchId: query.branchId,
        },
      };
    }

    if (query.roleId) {
      where.roleId = query.roleId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = buildOrderBy(query.sort, USER_SORT_FIELDS);
    const { skip, take } = buildOffsetPagination(query.page, query.pageSize);

    const [users, total] = await Promise.all([
      this.prisma.unscopedClient.user.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
          twoFactorEnabled: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          role: {
            select: {
              id: true,
              key: true,
              name: true,
            },
          },
          branches: {
            select: {
              branchId: true,
              isPrimary: true,
              branch: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  city: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.unscopedClient.user.count({ where }),
    ]);

    return {
      data: users,
      meta: buildOffsetMeta(total, query.page, query.pageSize),
    };
  }

  async findById(id: string, userBranchIds: string[], isDirector: boolean) {
    const user = await this.prisma.unscopedClient.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            key: true,
            name: true,
          },
        },
        branches: {
          select: {
            branchId: true,
            isPrimary: true,
            branch: {
              select: {
                id: true,
                name: true,
                code: true,
                city: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    if (!isDirector) {
      const userHasSharedBranch = user.branches.some((b) =>
        userBranchIds.includes(b.branchId),
      );
      if (!userHasSharedBranch) {
        throw new ForbiddenException('You do not have access to view this user');
      }
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.unscopedClient.user.findUnique({
      where: { id },
      include: { branches: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    let roleChanged = false;
    if (dto.roleId && dto.roleId !== user.roleId) {
      const role = await this.prisma.unscopedClient.role.findUnique({
        where: { id: dto.roleId },
      });
      if (!role) {
        throw new NotFoundException(`Role with ID '${dto.roleId}' not found`);
      }
      if (role.key === RoleKey.PARENT) {
        throw new BadRequestException(
          'Cannot assign PARENT role; parent users belong to guardian flow',
        );
      }
      roleChanged = true;
    }

    let branchesChanged = false;
    let branchesToCreate: { branchId: string; isPrimary: boolean }[] = [];
    if (dto.branches) {
      const branchIds = dto.branches.map((b) => b.branchId);
      const existingBranches = await this.prisma.unscopedClient.branch.findMany({
        where: { id: { in: branchIds } },
      });
      if (existingBranches.length !== branchIds.length) {
        throw new BadRequestException('One or more branch IDs are invalid');
      }

      let hasPrimary = false;
      branchesToCreate = dto.branches.map((b) => {
        let isPrimary = !!b.isPrimary;
        if (isPrimary) {
          if (hasPrimary) {
            isPrimary = false;
          } else {
            hasPrimary = true;
          }
        }
        return { branchId: b.branchId, isPrimary };
      });
      if (!hasPrimary && branchesToCreate.length > 0) {
        branchesToCreate[0].isPrimary = true;
      }
      branchesChanged = true;
    }

    await this.prisma.unscopedClient.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          name: dto.name,
          phone: dto.phone,
          roleId: dto.roleId,
          isActive: dto.isActive,
        },
      });

      if (branchesChanged) {
        await tx.userBranch.deleteMany({
          where: { userId: id },
        });

        await tx.userBranch.createMany({
          data: branchesToCreate.map((b) => ({
            userId: id,
            branchId: b.branchId,
            isPrimary: b.isPrimary,
          })),
        });
      }
    });

    // If deactivated, revoke all sessions and tokens
    if (dto.isActive === false) {
      await this.prisma.unscopedClient.session.deleteMany({
        where: { userId: id },
      });
      await this.cacheService.deleteByPrefix(`auth:refresh:${id}:`);
    }

    // Invalidate permission cache
    if (roleChanged || branchesChanged || dto.isActive !== undefined) {
      await this.cacheService.deleteByPrefix(`user_perms:${id}`);
    }

    return this.findById(id, [], true);
  }

  async deactivate(id: string) {
    return this.update(id, { isActive: false });
  }
}
