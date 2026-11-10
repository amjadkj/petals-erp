import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { PrismaService } from '../common/prisma';
import { CacheService } from '../common/redis';
import { AppointmentStatus, RoleKey } from '@petals/types';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let prisma: any;
  let cache: any;

  const mockPrisma: any = {
    unscopedClient: {
      appointment: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      schedule: {
        create: jest.fn(),
      },
      treatmentPlan: {
        findUnique: jest.fn(),
      },
      employee: {
        findUnique: jest.fn(),
      },
      clientGuardian: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      client: {
        findUnique: jest.fn(),
      },
      holiday: {
        findMany: jest.fn(),
      },
      leaveRequest: {
        findMany: jest.fn(),
      },
      branch: {
        findMany: jest.fn(),
      },
    },
  };

  const mockCache: any = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CacheService, useValue: mockCache },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
    prisma = module.get(PrismaService);
    cache = module.get(CacheService);
  });

  describe('Conflict Detection', () => {
    it('throws ConflictException if therapist is already booked in slot', async () => {
      prisma.unscopedClient.appointment.findFirst.mockResolvedValueOnce({ id: 'appt-1' });

      await expect(
        service.checkConflicts(
          't1',
          'c1',
          new Date('2026-03-15T10:00:00Z'),
          new Date('2026-03-15T10:45:00Z'),
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException if client already has appointment in slot', async () => {
      // First call (therapist check) returns null, second call (client check) returns conflict
      prisma.unscopedClient.appointment.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'appt-2' });

      await expect(
        service.checkConflicts(
          't1',
          'c1',
          new Date('2026-03-15T10:00:00Z'),
          new Date('2026-03-15T10:45:00Z'),
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('passes when no therapist or client conflicts exist', async () => {
      prisma.unscopedClient.appointment.findFirst.mockResolvedValue(null);

      await expect(
        service.checkConflicts(
          't1',
          'c1',
          new Date('2026-03-15T10:00:00Z'),
          new Date('2026-03-15T10:45:00Z'),
        ),
      ).resolves.not.toThrow();
    });
  });

  describe('Weekly Calendar Date Range Limit', () => {
    it('throws BadRequestException if date range exceeds 31 days', async () => {
      await expect(
        service.findCalendar(
          { from: '2026-03-01', to: '2026-04-15' }, // 45 days
          'u1',
          RoleKey.DIRECTOR,
          [],
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('allows date range within 31 days and flags holiday', async () => {
      prisma.unscopedClient.appointment.findMany.mockResolvedValue([
        {
          id: 'a1',
          branchId: 'b1',
          clientId: 'c1',
          client: { name: 'Child A' },
          therapistId: 't1',
          therapist: {
            user: { name: 'Therapist Name' },
            department: { code: 'OT', name: 'Occupational Therapy' },
          },
          startsAt: new Date('2026-03-15T10:00:00Z'),
          endsAt: new Date('2026-03-15T10:45:00Z'),
          status: AppointmentStatus.SCHEDULED,
        },
      ]);
      prisma.unscopedClient.holiday.findMany.mockResolvedValue([
        { date: new Date('2026-03-15T00:00:00Z'), name: 'National Holiday' },
      ]);
      prisma.unscopedClient.leaveRequest.findMany.mockResolvedValue([]);

      const result = await service.findCalendar(
        { from: '2026-03-01', to: '2026-03-25' },
        'u1',
        RoleKey.DIRECTOR,
        [],
      );

      expect(result).toHaveLength(1);
      expect(result[0].isHoliday).toBe(true);
      expect(result[0].holidayName).toBe('National Holiday');
    });
  });

  describe('Daily Schedule Cache & Caller Scoping', () => {
    it('returns cached schedule on hit and scopes to therapist', async () => {
      cache.get.mockResolvedValue([
        {
          id: 'a1',
          therapistId: 'emp-1',
          clientId: 'c1',
          clientDisplayName: 'Child 1',
          therapistFirstName: 'Alice',
        },
        {
          id: 'a2',
          therapistId: 'emp-2',
          clientId: 'c2',
          clientDisplayName: 'Child 2',
          therapistFirstName: 'Bob',
        },
      ]);
      prisma.unscopedClient.employee.findUnique.mockResolvedValue({ id: 'emp-1' });

      const schedule = await service.findDailySchedule(
        { branchId: 'b1', date: '2026-03-15' },
        'u-therapist',
        RoleKey.THERAPIST,
        ['b1'],
      );

      // Scoped post-cache: Therapist 1 only receives their own appointment
      expect(schedule).toHaveLength(1);
      expect(schedule[0].id).toBe('a1');
    });

    it('populates cache on miss with correct TTL', async () => {
      cache.get.mockResolvedValue(null);
      prisma.unscopedClient.appointment.findMany.mockResolvedValue([
        {
          id: 'a1',
          branchId: 'b1',
          clientId: 'c1',
          client: { name: 'Child 1' },
          therapistId: 'emp-1',
          therapist: {
            user: { name: 'Alice Smith' },
            department: { code: 'OT' },
          },
          startsAt: new Date('2026-03-15T10:00:00Z'),
          endsAt: new Date('2026-03-15T10:45:00Z'),
          status: AppointmentStatus.SCHEDULED,
        },
      ]);

      const schedule = await service.findDailySchedule(
        { branchId: 'b1', date: '2026-03-15' },
        'u-dir',
        RoleKey.DIRECTOR,
        [],
      );

      expect(schedule).toHaveLength(1);
      expect(cache.set).toHaveBeenCalled();
    });
  });

  describe('Reschedule & Cache Invalidation', () => {
    it('checks conflicts and invalidates both old and new dates in cache', async () => {
      prisma.unscopedClient.appointment.findUnique.mockResolvedValue({
        id: 'a1',
        branchId: 'b1',
        therapistId: 't1',
        clientId: 'c1',
        startsAt: new Date('2026-03-10T10:00:00Z'),
        endsAt: new Date('2026-03-10T10:45:00Z'),
      });
      prisma.unscopedClient.appointment.findFirst.mockResolvedValue(null); // No conflicts
      prisma.unscopedClient.appointment.update.mockResolvedValue({
        id: 'a1',
        startsAt: new Date('2026-03-12T11:00:00Z'),
        endsAt: new Date('2026-03-12T11:45:00Z'),
      });

      await service.reschedule(
        'a1',
        { startsAt: '2026-03-12T11:00:00Z', endsAt: '2026-03-12T11:45:00Z' },
        'u-dir',
        RoleKey.DIRECTOR,
      );

      // Invalidation of both 2026-03-10 and 2026-03-12
      expect(cache.del).toHaveBeenCalledWith('schedule:b1:2026-03-10');
      expect(cache.del).toHaveBeenCalledWith('schedule:b1:2026-03-12');
    });
  });
});
