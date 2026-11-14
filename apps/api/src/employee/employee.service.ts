import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AccessService } from '../access/access.service';
import { AppModule, PermissionAction, RoleKey } from '@petals/types';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto } from './dto';
import {
  buildOffsetPagination,
  buildOffsetMeta,
  buildOrderBy,
} from '../common/pagination/pagination.helper';
import { Prisma } from '@prisma/client';
import { hashPassword } from '../common/crypto/crypto.util';

export const EMPLOYEE_SORT_FIELDS = [
  'employeeCode',
  'joinedOn',
  'createdAt',
  'designation',
] as const;

@Injectable()
export class EmployeeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: AccessService,
  ) {}

  async create(dto: CreateEmployeeDto, canSetSalary: boolean) {
    if (dto.salary !== undefined && !canSetSalary) {
      throw new ForbiddenException('Permission denied: cannot set employee salary');
    }

    // Branch A: Existing user supplied
    if (dto.userId) {
      const user = await this.prisma.unscopedClient.user.findUnique({
        where: { id: dto.userId },
        include: { employee: true, role: true },
      });
      if (!user) {
        throw new NotFoundException(`User with ID '${dto.userId}' not found`);
      }
      if (user.role.key === RoleKey.PARENT) {
        throw new BadRequestException('Cannot create an employee profile for a parent user');
      }
      if (user.employee) {
        throw new ConflictException(`User '${dto.userId}' already has an employee profile`);
      }

      const employeeCode = dto.employeeCode || `PTL-E${Math.floor(100 + Math.random() * 900)}`;
      const existingCode = await this.prisma.unscopedClient.employee.findUnique({
        where: { employeeCode },
      });
      if (existingCode) {
        throw new ConflictException(`Employee code '${employeeCode}' already exists`);
      }

      if (dto.departmentId) {
        const dept = await this.prisma.unscopedClient.department.findUnique({
          where: { id: dto.departmentId },
        });
        if (!dept) {
          throw new NotFoundException(`Department with ID '${dto.departmentId}' not found`);
        }
      }

      const employee = await this.prisma.unscopedClient.employee.create({
        data: {
          userId: dto.userId,
          employeeCode,
          departmentId: dto.departmentId,
          designation: dto.designation,
          salary: dto.salary !== undefined ? new Prisma.Decimal(dto.salary) : null,
          joinedOn: dto.joinedOn ? new Date(dto.joinedOn) : new Date(),
        },
        include: {
          department: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              isActive: true,
              role: { select: { id: true, key: true, name: true } },
              branches: {
                select: {
                  branchId: true,
                  isPrimary: true,
                  branch: { select: { id: true, name: true, code: true, city: true } },
                },
              },
            },
          },
        },
      });

      if (!canSetSalary) {
        const copy: Record<string, any> = { ...employee };
        delete copy.salary;
        return copy;
      }
      return employee;
    }

    // Branch B: Create user + employee atomically
    if (!dto.name || !dto.email || !dto.password) {
      throw new BadRequestException('Name, email, and password are required when creating a new employee');
    }
    if (!dto.branchId) {
      throw new BadRequestException('Branch ID is required when creating a new employee');
    }

    const email = dto.email.toLowerCase().trim();
    const existingUser = await this.prisma.unscopedClient.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException(`User with email '${dto.email}' already exists`);
    }

    const branch = await this.prisma.unscopedClient.branch.findUnique({
      where: { id: dto.branchId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID '${dto.branchId}' not found`);
    }

    const targetRoleKey = dto.roleKey || RoleKey.THERAPIST;
    const role = await this.prisma.unscopedClient.role.findUnique({
      where: { key: targetRoleKey },
    });
    if (!role) {
      throw new NotFoundException(`Role '${targetRoleKey}' not found`);
    }
    if (role.key === RoleKey.PARENT) {
      throw new BadRequestException('Cannot create an employee profile for a parent user');
    }

    let deptId = dto.departmentId;
    if (!deptId && dto.departmentName) {
      const dept = await this.prisma.unscopedClient.department.findFirst({
        where: { name: { equals: dto.departmentName, mode: 'insensitive' } },
      });
      if (dept) {
        deptId = dept.id;
      }
    } else if (deptId) {
      const dept = await this.prisma.unscopedClient.department.findUnique({
        where: { id: deptId },
      });
      if (!dept) {
        throw new NotFoundException(`Department with ID '${deptId}' not found`);
      }
    }

    // Resolve or generate unique employeeCode
    let employeeCode = dto.employeeCode;
    if (employeeCode) {
      const existingCode = await this.prisma.unscopedClient.employee.findUnique({
        where: { employeeCode },
      });
      if (existingCode) {
        throw new ConflictException(`Employee code '${employeeCode}' already exists`);
      }
    } else {
      const count = await this.prisma.unscopedClient.employee.count();
      let candidate = `PTL-E${String(count + 1).padStart(3, '0')}`;
      let attempts = 0;
      while (
        (await this.prisma.unscopedClient.employee.findUnique({ where: { employeeCode: candidate } })) &&
        attempts < 10
      ) {
        attempts++;
        candidate = `PTL-E${Math.floor(100 + Math.random() * 900)}`;
      }
      employeeCode = candidate;
    }

    // Hash password with Argon2id
    const passwordHash = await hashPassword(dto.password);

    const employee = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: dto.name!.trim(),
          email,
          phone: dto.phone?.trim() || null,
          passwordHash,
          roleId: role.id,
          isActive: true,
        },
      });

      await tx.userBranch.create({
        data: {
          userId: newUser.id,
          branchId: dto.branchId!,
          isPrimary: true,
        },
      });

      return tx.employee.create({
        data: {
          userId: newUser.id,
          employeeCode,
          departmentId: deptId || null,
          designation: dto.designation || null,
          salary: dto.salary !== undefined && canSetSalary ? new Prisma.Decimal(dto.salary) : null,
          joinedOn: dto.joinedOn ? new Date(dto.joinedOn) : new Date(),
        },
        include: {
          department: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              isActive: true,
              role: { select: { id: true, key: true, name: true } },
              branches: {
                select: {
                  branchId: true,
                  isPrimary: true,
                  branch: { select: { id: true, name: true, code: true, city: true } },
                },
              },
            },
          },
        },
      });
    });

    if (!canSetSalary) {
      const copy: Record<string, any> = { ...employee };
      delete copy.salary;
      return copy;
    }
    return employee;
  }

  async findAll(
    query: EmployeeQueryDto,
    userBranchIds: string[],
    isDirector: boolean,
    canViewSalary: boolean,
  ) {
    const where: Prisma.EmployeeWhereInput = {};

    const userWhere: Prisma.UserWhereInput = {};

    if (!isDirector) {
      userWhere.branches = {
        some: {
          branchId: { in: userBranchIds },
        },
      };
    }

    if (query.branchId) {
      if (!isDirector && !userBranchIds.includes(query.branchId)) {
        throw new ForbiddenException('You do not have access to this branch');
      }
      userWhere.branches = {
        some: {
          branchId: query.branchId,
        },
      };
    }

    if (Object.keys(userWhere).length > 0) {
      where.user = userWhere;
    }

    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }

    if (query.search) {
      where.OR = [
        { employeeCode: { contains: query.search, mode: 'insensitive' } },
        { designation: { contains: query.search, mode: 'insensitive' } },
        { user: { name: { contains: query.search, mode: 'insensitive' } } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const orderBy = buildOrderBy(query.sort, EMPLOYEE_SORT_FIELDS);
    const { skip, take } = buildOffsetPagination(query.page, query.pageSize);

    // Fixed query count: 1 count query + 1 findMany query with relation batching
    const [employees, total] = await Promise.all([
      this.prisma.unscopedClient.employee.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          department: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              isActive: true,
              role: { select: { id: true, key: true, name: true } },
              branches: {
                select: {
                  branchId: true,
                  isPrimary: true,
                  branch: { select: { id: true, name: true, code: true, city: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.unscopedClient.employee.count({ where }),
    ]);

    const sanitized = employees.map((emp) => {
      if (!canViewSalary) {
        const copy: Record<string, any> = { ...emp };
        delete copy.salary;
        return copy;
      }
      return emp;
    });

    return {
      data: sanitized,
      meta: buildOffsetMeta(total, query.page, query.pageSize),
    };
  }

  async findById(
    id: string,
    userBranchIds: string[],
    isDirector: boolean,
    canViewSalary: boolean,
  ) {
    const employee = await this.prisma.unscopedClient.employee.findUnique({
      where: { id },
      include: {
        department: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
            role: { select: { id: true, key: true, name: true } },
            branches: {
              select: {
                branchId: true,
                isPrimary: true,
                branch: { select: { id: true, name: true, code: true, city: true } },
              },
            },
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID '${id}' not found`);
    }

    if (!isDirector) {
      const sharesBranch = employee.user.branches.some((b) =>
        userBranchIds.includes(b.branchId),
      );
      if (!sharesBranch) {
        throw new ForbiddenException('You do not have access to view this employee');
      }
    }

    if (!canViewSalary) {
      const copy: Record<string, any> = { ...employee };
      delete copy.salary;
      return copy;
    }

    return employee;
  }

  async update(
    id: string,
    dto: UpdateEmployeeDto,
    canUpdateSalary: boolean,
  ) {
    const employee = await this.prisma.unscopedClient.employee.findUnique({
      where: { id },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID '${id}' not found`);
    }

    if (dto.departmentId) {
      const dept = await this.prisma.unscopedClient.department.findUnique({
        where: { id: dto.departmentId },
      });
      if (!dept) {
        throw new NotFoundException(`Department with ID '${dto.departmentId}' not found`);
      }
    }

    if (dto.salary !== undefined && !canUpdateSalary) {
      throw new ForbiddenException('Permission denied: cannot update employee salary');
    }

    const updated = await this.prisma.unscopedClient.$transaction(async (tx) => {
      if (dto.name !== undefined || dto.phone !== undefined) {
        await tx.user.update({
          where: { id: employee.userId },
          data: {
            ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
            ...(dto.phone !== undefined ? { phone: dto.phone.trim() || null } : {}),
          },
        });
      }

      if (dto.branchId) {
        const branchExists = await tx.branch.findUnique({
          where: { id: dto.branchId },
        });
        if (!branchExists) {
          throw new NotFoundException(`Branch with ID '${dto.branchId}' not found`);
        }

        const existingPrimary = await tx.userBranch.findFirst({
          where: { userId: employee.userId, isPrimary: true },
        });

        if (existingPrimary) {
          if (existingPrimary.branchId !== dto.branchId) {
            await tx.userBranch.delete({
              where: {
                userId_branchId: {
                  userId: employee.userId,
                  branchId: existingPrimary.branchId,
                },
              },
            });
            await tx.userBranch.upsert({
              where: {
                userId_branchId: {
                  userId: employee.userId,
                  branchId: dto.branchId,
                },
              },
              create: {
                userId: employee.userId,
                branchId: dto.branchId,
                isPrimary: true,
              },
              update: {
                isPrimary: true,
              },
            });
          }
        } else {
          await tx.userBranch.create({
            data: {
              userId: employee.userId,
              branchId: dto.branchId,
              isPrimary: true,
            },
          });
        }
      }

      return tx.employee.update({
        where: { id },
        data: {
          departmentId: dto.departmentId,
          designation: dto.designation,
          salary: dto.salary !== undefined ? new Prisma.Decimal(dto.salary) : undefined,
          joinedOn: dto.joinedOn ? new Date(dto.joinedOn) : undefined,
        },
        include: {
          department: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              isActive: true,
              role: { select: { id: true, key: true, name: true } },
              branches: {
                select: {
                  branchId: true,
                  isPrimary: true,
                  branch: { select: { id: true, name: true, code: true, city: true } },
                },
              },
            },
          },
        },
      });
    });

    if (!canUpdateSalary) {
      const copy: Record<string, any> = { ...updated };
      delete copy.salary;
      return copy;
    }

    return updated;
  }

  async checkSalaryPermission(
    userId: string,
    roleId: string,
    roleKey: RoleKey,
    action: PermissionAction,
  ): Promise<boolean> {
    const result = await this.accessService.resolvePermission(
      userId,
      roleId,
      roleKey,
      AppModule.EMPLOYEE_SALARY,
      action,
    );
    return result.allowed;
  }
}
