import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateBranchDto, UpdateBranchDto, BranchQueryDto } from './dto';
import {
  buildOffsetPagination,
  buildOffsetMeta,
  buildOrderBy,
} from '../common/pagination/pagination.helper';
import { Prisma } from '@prisma/client';

export const BRANCH_SORT_FIELDS = ['name', 'code', 'city', 'createdAt'] as const;

@Injectable()
export class BranchService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBranchDto) {
    const existing = await this.prisma.unscopedClient.branch.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Branch code '${dto.code}' already exists`);
    }

    return this.prisma.unscopedClient.branch.create({
      data: {
        name: dto.name,
        code: dto.code,
        city: dto.city,
        address: dto.address,
        phone: dto.phone,
        timezone: dto.timezone || 'Asia/Kolkata',
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });
  }

  async findAll(query: BranchQueryDto, userBranchIds: string[], isDirector: boolean) {
    const where: Prisma.BranchWhereInput = {};

    if (!isDirector) {
      where.id = { in: userBranchIds };
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = buildOrderBy(query.sort, BRANCH_SORT_FIELDS);
    const { skip, take } = buildOffsetPagination(query.page, query.pageSize);

    const [items, total] = await Promise.all([
      this.prisma.unscopedClient.branch.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      this.prisma.unscopedClient.branch.count({ where }),
    ]);

    return {
      data: items,
      meta: buildOffsetMeta(total, query.page, query.pageSize),
    };
  }

  async findById(id: string, userBranchIds: string[], isDirector: boolean) {
    if (!isDirector && !userBranchIds.includes(id)) {
      throw new ForbiddenException('You do not have access to this branch');
    }

    const branch = await this.prisma.unscopedClient.branch.findUnique({
      where: { id },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID '${id}' not found`);
    }

    return branch;
  }

  async update(id: string, dto: UpdateBranchDto) {
    const branch = await this.prisma.unscopedClient.branch.findUnique({
      where: { id },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID '${id}' not found`);
    }

    if (dto.code && dto.code !== branch.code) {
      const existing = await this.prisma.unscopedClient.branch.findUnique({
        where: { code: dto.code },
      });
      if (existing) {
        throw new ConflictException(`Branch code '${dto.code}' already exists`);
      }
    }

    return this.prisma.unscopedClient.branch.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    const branch = await this.prisma.unscopedClient.branch.findUnique({
      where: { id },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID '${id}' not found`);
    }

    return this.prisma.unscopedClient.branch.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
