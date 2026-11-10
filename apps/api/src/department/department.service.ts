import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.unscopedClient.department.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const department = await this.prisma.unscopedClient.department.findUnique({
      where: { id },
    });
    if (!department) {
      throw new NotFoundException(`Department with ID '${id}' not found`);
    }
    return department;
  }
}

