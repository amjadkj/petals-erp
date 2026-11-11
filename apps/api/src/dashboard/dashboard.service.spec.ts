import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { RoleKey } from '@petals/types';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../common/prisma';
import { CacheService } from '../common/redis';
import { IRequestContext } from '../common/context/request-context';

describe('DashboardService (Unit)', () => {
  let service: DashboardService;
  let prisma: any;
  let cacheService: any;

  const mockDirectorContext: IRequestContext = {
    userId: 'dir-user-uuid',
    roleId: 'role-dir',
    roleKey: RoleKey.DIRECTOR,
    branchIds: ['branch-1', 'branch-2'],
    activeBranchId: 'branch-1',
    sessionId: 'sess-dir',
    isActive: true,
  };

  const mockManagerContext: IRequestContext = {
    userId: 'mgr-user-uuid',
    roleId: 'role-mgr',
    roleKey: RoleKey.MANAGER,
    branchIds: ['branch-1'],
    activeBranchId: 'branch-1',
    sessionId: 'sess-mgr',
    isActive: true,
  };

  const mockTherapistContext: IRequestContext = {
    userId: 'ther-user-uuid',
    roleId: 'role-ther',
    roleKey: RoleKey.THERAPIST,
    branchIds: ['branch-1'],
    activeBranchId: 'branch-1',
    sessionId: 'sess-ther',
    isActive: true,
  };

  const mockParentContext: IRequestContext = {
    userId: 'par-user-uuid',
    roleId: 'role-par',
    roleKey: RoleKey.PARENT,
    branchIds: [],
    activeBranchId: '',
    sessionId: 'sess-par',
    isActive: true,
  };

  beforeEach(async () => {
    prisma = {
      unscopedClient: {
        appointment: {
          count: jest.fn().mockResolvedValue(5),
          findMany: jest.fn().mockResolvedValue([]),
        },
        client: {
          count: jest.fn().mockResolvedValue(42),
        },
        payment: {
          aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 15000 } }),
        },
        invoice: {
          aggregate: jest.fn().mockResolvedValue({
            _count: { id: 3 },
            _sum: { amount: 4500 },
          }),
          count: jest.fn().mockResolvedValue(3),
        },
        report: {
          count: jest.fn().mockResolvedValue(2),
          findMany: jest.fn().mockResolvedValue([]),
        },
        attendanceRecord: {
          count: jest.fn().mockResolvedValue(8),
        },
        lead: {
          count: jest.fn().mockResolvedValue(12),
          findMany: jest.fn().mockResolvedValue([]),
        },
        employee: {
          findUnique: jest.fn().mockResolvedValue({ id: 'emp-therapist-1' }),
        },
        treatmentPlan: {
          findMany: jest.fn().mockResolvedValue([{ clientId: 'c-1' }, { clientId: 'c-2' }]),
        },
        clientGuardian: {
          findMany: jest.fn().mockResolvedValue([
            {
              clientId: 'child-1',
              client: { id: 'child-1', name: 'Timmy', clientCode: 'P-01' },
            },
          ]),
        },
      },
    };

    cacheService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
        { provide: CacheService, useValue: cacheService },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  describe('1. Director Dashboard', () => {
    it('returns full metrics including revenue and pending payments', async () => {
      const res = await service.getDashboard({}, mockDirectorContext);

      expect(res.role).toBe(RoleKey.DIRECTOR);
      expect(res.todaySessions).toBeDefined();
      expect(res.revenue).toBeDefined();
      expect(res.revenue.today).toBe(15000);
      expect(res.revenue.thisWeek).toBe(15000);
      expect(res.revenue.thisMonth).toBe(15000);
      expect(res.pendingPayments.count).toBe(3);
      expect(res.pendingPayments.amount).toBe(4500);
      expect(res.staffPresent).toBe(8);
      expect(res.activeClients).toBe(42);
      expect(cacheService.set).toHaveBeenCalledWith(
        'dashboard:branch:all:director',
        expect.any(Object),
        60,
      );
    });

    it('returns cached result on subsequent request', async () => {
      const cachedData = { role: RoleKey.DIRECTOR, cached: true };
      cacheService.get.mockResolvedValueOnce(cachedData);

      const res = await service.getDashboard({}, mockDirectorContext);

      expect(res).toBe(cachedData);
      expect(prisma.unscopedClient.appointment.count).not.toHaveBeenCalled();
    });
  });

  describe('2. Manager Dashboard', () => {
    it('returns operational view WITHOUT revenue or P&L details', async () => {
      const res = await service.getDashboard({ branchId: 'branch-1' }, mockManagerContext);

      expect(res.role).toBe(RoleKey.MANAGER);
      expect(res.branchId).toBe('branch-1');
      expect(res.todaySessions).toBeDefined();
      expect(res.activeClients).toBe(42);
      expect(res.pendingPaymentsCount).toBe(3);
      expect(res.staffPresent).toBe(8);

      // STRICT REQUIREMENT: No revenue or financial P&L fields
      expect((res as any).revenue).toBeUndefined();
      expect((res as any).pnl).toBeUndefined();
      expect(prisma.unscopedClient.payment.aggregate).not.toHaveBeenCalled();
      expect(cacheService.set).toHaveBeenCalledWith(
        'dashboard:branch:branch-1:manager',
        expect.any(Object),
        60,
      );
    });

    it('rejects access to unassigned branch with 403 Forbidden', async () => {
      await expect(
        service.getDashboard({ branchId: 'unassigned-branch' }, mockManagerContext),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('3. Therapist Dashboard', () => {
    it('returns assigned clients, today schedule and pending reports', async () => {
      const res = await service.getDashboard({}, mockTherapistContext);

      expect(res.role).toBe(RoleKey.THERAPIST);
      expect(res.totalClients).toBe(2);
      expect(res.todayScheduleCount).toBe(5);
      expect(res.pendingReportsCount).toBe(2);
      expect(res.pendingReports.link).toBe('/api/v1/reports');

      // Never calls revenue or payment aggregates
      expect(prisma.unscopedClient.payment.aggregate).not.toHaveBeenCalled();
    });
  });

  describe('4. Parent Dashboard', () => {
    it('returns children, total attended sessions, and today/upcoming sessions', async () => {
      const res = await service.getDashboard({}, mockParentContext);

      expect(res.role).toBe(RoleKey.PARENT);
      expect(res.children.length).toBe(1);
      expect(res.children[0].name).toBe('Timmy');
      expect(res.totalSessions).toBe(5);
      expect(res.todaySessions).toBeDefined();
      expect(res.upcomingSessions).toBeDefined();

      // Never calls revenue or payment aggregates
      expect(prisma.unscopedClient.payment.aggregate).not.toHaveBeenCalled();
    });
  });
});

