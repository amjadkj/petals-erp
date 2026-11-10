import { ForbiddenException } from '@nestjs/common';
import { AppointmentStatus, RoleKey } from '@petals/types';
import { ClientService } from './client.service';

describe('ClientService', () => {
  let service: ClientService;
  let mockPrisma: any;
  let mockAccessService: any;
  let mockVersionService: any;

  beforeEach(() => {
    mockPrisma = {
      unscopedClient: {
        client: {
          findMany: jest.fn(),
          count: jest.fn(),
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
        },
        appointment: {
          groupBy: jest.fn(),
        },
        branch: {
          findUnique: jest.fn(),
        },
        employee: {
          findUnique: jest.fn(),
        },
        user: {
          findUnique: jest.fn(),
          create: jest.fn(),
        },
        guardian: {
          findUnique: jest.fn(),
          create: jest.fn(),
        },
        clientGuardian: {
          upsert: jest.fn(),
        },
        role: {
          findUniqueOrThrow: jest.fn(),
        },
      },
      $transaction: jest.fn(async (cb) => cb(mockPrisma.unscopedClient)),
    };

    mockAccessService = {
      resolvePermission: jest.fn().mockResolvedValue({ allowed: true }),
    };

    mockVersionService = {
      recordEdit: jest.fn().mockResolvedValue({ id: 'v-1' }),
      recordDelete: jest.fn().mockResolvedValue({ id: 'v-2' }),
    };

    service = new ClientService(mockPrisma, mockAccessService, mockVersionService);
  });

  describe('findAll', () => {
    it('should scope client list to parent own children when role is PARENT', async () => {
      mockPrisma.unscopedClient.client.findMany.mockResolvedValue([]);
      mockPrisma.unscopedClient.client.count.mockResolvedValue(0);

      await service.findAll(
        { page: 1, pageSize: 20 },
        'parent-user-1',
        'parent-role-id',
        RoleKey.PARENT,
        [],
      );

      expect(mockPrisma.unscopedClient.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            guardians: {
              some: {
                guardian: {
                  userId: 'parent-user-1',
                },
              },
            },
          }),
        }),
      );
    });

    it('should strip caseHistory and restrict fields for MANAGER role', async () => {
      const mockClients = [
        {
          id: 'c-1',
          name: 'Child One',
          caseHistory: 'Confidential clinical history',
          branchId: 'b-1',
        },
      ];
      mockPrisma.unscopedClient.client.findMany.mockResolvedValue(mockClients);
      mockPrisma.unscopedClient.client.count.mockResolvedValue(1);
      mockPrisma.unscopedClient.appointment.groupBy.mockResolvedValue([]);

      const res = await service.findAll(
        { page: 1, pageSize: 20 },
        'manager-user-1',
        'mgr-role-id',
        RoleKey.MANAGER,
        ['b-1'],
      );

      expect(res.data).toHaveLength(1);
      expect(res.data[0].caseHistory).toBeUndefined();
      expect(res.data[0].name).toBe('Child One');
    });

    it('should aggregate scheduled and attended session counts via groupBy', async () => {
      const mockClients = [{ id: 'c-1', name: 'Child One', branchId: 'b-1' }];
      mockPrisma.unscopedClient.client.findMany.mockResolvedValue(mockClients);
      mockPrisma.unscopedClient.client.count.mockResolvedValue(1);
      mockPrisma.unscopedClient.appointment.groupBy.mockResolvedValue([
        { clientId: 'c-1', status: AppointmentStatus.SCHEDULED, _count: { _all: 5 } },
        { clientId: 'c-1', status: AppointmentStatus.ATTENDED, _count: { _all: 3 } },
      ]);

      const res = await service.findAll(
        { page: 1, pageSize: 20 },
        'dir-user-1',
        'dir-role-id',
        RoleKey.DIRECTOR,
        ['b-1'],
      );

      expect(res.data[0].scheduledSessionsCount).toBe(5);
      expect(res.data[0].attendedSessionsCount).toBe(3);
    });
  });

  describe('create', () => {
    it('should reject client creation in unassigned branch for non-Director', async () => {
      await expect(
        service.create(
          {
            branchId: 'unassigned-branch',
            name: 'New Child',
            dob: '2019-01-01',
          },
          false,
          ['my-branch-id'],
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should auto-generate client code per branch if omitted', async () => {
      mockPrisma.unscopedClient.branch.findUnique.mockResolvedValue({
        id: 'b-1',
        code: 'BLR',
      });
      mockPrisma.unscopedClient.client.count.mockResolvedValue(4);
      mockPrisma.unscopedClient.client.create.mockResolvedValue({
        id: 'c-new',
        clientCode: 'BLR-2026-0005',
        name: 'Auto Code Child',
      });
      mockPrisma.unscopedClient.client.findUnique.mockResolvedValue({
        id: 'c-new',
        clientCode: 'BLR-2026-0005',
      });

      await service.create(
        {
          branchId: 'b-1',
          name: 'Auto Code Child',
          dob: '2019-05-10',
        },
        true,
        ['b-1'],
      );

      const year = new Date().getFullYear();
      expect(mockPrisma.unscopedClient.client.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            clientCode: `BLR-${year}-0005`,
          }),
        }),
      );
    });
  });

  describe('getHeader', () => {
    it('should resolve allowedTabs for parent based on ClientGuardian flags', async () => {
      const mockClient = {
        id: 'c-1',
        name: 'Child One',
        branchId: 'b-1',
        guardians: [
          {
            guardian: { userId: 'parent-1' },
            canViewOverview: true,
            canViewAssessment: false,
            canViewPaymentPlan: true,
            canViewReports: false,
          },
        ],
      };
      mockPrisma.unscopedClient.client.findUnique.mockResolvedValue(mockClient);

      const res = await service.getHeader(
        'c-1',
        'parent-1',
        'parent-role',
        RoleKey.PARENT,
        [],
      );

      expect(res.allowedTabs).toEqual(['overview', 'payment_plan']);
    });
  });

  describe('getOverview', () => {
    it('should throw ForbiddenException if parent does not have canViewOverview permission', async () => {
      const mockClient = {
        id: 'c-1',
        name: 'Child One',
        branchId: 'b-1',
        guardians: [
          {
            guardian: { userId: 'parent-1' },
            canViewOverview: false,
          },
        ],
      };
      mockPrisma.unscopedClient.client.findUnique.mockResolvedValue(mockClient);

      await expect(
        service.getOverview('c-1', 'parent-1', RoleKey.PARENT, []),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should strip caseHistory for Manager', async () => {
      const mockClient = {
        id: 'c-1',
        name: 'Child One',
        branchId: 'b-1',
        caseHistory: 'Confidential clinical history',
        guardians: [],
      };
      mockPrisma.unscopedClient.client.findUnique.mockResolvedValue(mockClient);

      const res = await service.getOverview(
        'c-1',
        'mgr-1',
        RoleKey.MANAGER,
        ['b-1'],
      );

      expect(res.caseHistory).toBeUndefined();
    });
  });
});
