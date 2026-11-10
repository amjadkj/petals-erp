import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeService } from './employee.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { AccessService } from '../access/access.service';
import { ForbiddenException } from '@nestjs/common';
import { RoleKey, AppModule, PermissionAction } from '@petals/types';

describe('EmployeeService', () => {
  let service: EmployeeService;

  const mockPrisma = {
    unscopedClient: {
      user: {
        findUnique: jest.fn(),
      },
      department: {
        findUnique: jest.fn(),
      },
      employee: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    },
  };

  const mockAccessService = {
    resolvePermission: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AccessService, useValue: mockAccessService },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
  });

  describe('create', () => {
    it('should create employee profile with salary when canSetSalary is true', async () => {
      mockPrisma.unscopedClient.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: { key: RoleKey.THERAPIST },
        employee: null,
      });
      mockPrisma.unscopedClient.employee.findUnique.mockResolvedValue(null);
      mockPrisma.unscopedClient.employee.create.mockResolvedValue({
        id: 'emp-1',
        employeeCode: 'EMP-01',
        salary: 50000,
        joinedOn: new Date('2026-01-01'),
      });

      const result = await service.create(
        {
          userId: 'user-1',
          employeeCode: 'EMP-01',
          salary: 50000,
          joinedOn: '2026-01-01',
        },
        true,
      );

      expect(result.id).toBe('emp-1');
      expect((result as any).salary).toBe(50000);
    });

    it('should throw ForbiddenException if salary is provided but canSetSalary is false', async () => {
      mockPrisma.unscopedClient.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: { key: RoleKey.THERAPIST },
        employee: null,
      });
      mockPrisma.unscopedClient.employee.findUnique.mockResolvedValue(null);

      await expect(
        service.create(
          {
            userId: 'user-1',
            employeeCode: 'EMP-01',
            salary: 50000,
            joinedOn: '2026-01-01',
          },
          false,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should hide salary when canViewSalary is false', async () => {
      mockPrisma.unscopedClient.employee.findMany.mockResolvedValue([
        {
          id: 'emp-1',
          employeeCode: 'EMP-01',
          salary: 50000,
          designation: 'Senior OT',
        },
      ]);
      mockPrisma.unscopedClient.employee.count.mockResolvedValue(1);

      const result = await service.findAll(
        { page: 1, pageSize: 20 },
        ['b1'],
        false,
        false, // canViewSalary = false
      );

      expect(result.data.length).toBe(1);
      expect((result.data[0] as any).salary).toBeUndefined();
      expect(result.data[0].employeeCode).toBe('EMP-01');
    });

    it('should include salary when canViewSalary is true', async () => {
      mockPrisma.unscopedClient.employee.findMany.mockResolvedValue([
        {
          id: 'emp-1',
          employeeCode: 'EMP-01',
          salary: 50000,
          designation: 'Senior OT',
        },
      ]);
      mockPrisma.unscopedClient.employee.count.mockResolvedValue(1);

      const result = await service.findAll(
        { page: 1, pageSize: 20 },
        [],
        true,
        true, // canViewSalary = true
      );

      expect(result.data.length).toBe(1);
      expect((result.data[0] as any).salary).toBe(50000);
    });
  });

  describe('checkSalaryPermission', () => {
    it('should resolve salary permission via AccessService', async () => {
      mockAccessService.resolvePermission.mockResolvedValue({ allowed: true });

      const allowed = await service.checkSalaryPermission(
        'user-1',
        'role-1',
        RoleKey.DIRECTOR,
        PermissionAction.VIEW,
      );

      expect(allowed).toBe(true);
      expect(mockAccessService.resolvePermission).toHaveBeenCalledWith(
        'user-1',
        'role-1',
        RoleKey.DIRECTOR,
        AppModule.EMPLOYEE_SALARY,
        PermissionAction.VIEW,
      );
    });
  });
});
