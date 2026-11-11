import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  RoleKey,
  LeaveStatus,
  LeaveType,
  AppointmentStatus,
} from '@petals/types';
import { HrService } from './hr.service';
import { PrismaService } from '../common/prisma';
import { CacheService } from '../common/redis';
import { IRequestContext } from '../common/context/request-context';

describe('HrService (Unit)', () => {
  let service: HrService;
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

  beforeEach(async () => {
    prisma = {
      unscopedClient: {
        attendanceRecord: {
          upsert: jest.fn(),
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          findMany: jest.fn(),
        },
        holiday: {
          upsert: jest.fn(),
          findMany: jest.fn(),
          findUnique: jest.fn(),
          delete: jest.fn(),
        },
        leaveRequest: {
          create: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          findUnique: jest.fn(),
          update: jest.fn(),
        },
        employee: {
          findUnique: jest.fn(),
        },
        user: {
          findMany: jest.fn(),
          update: jest.fn(),
        },
        appointment: {
          findMany: jest.fn(),
          count: jest.fn(),
        },
        treatmentPlan: {
          findMany: jest.fn(),
        },
        report: {
          findMany: jest.fn(),
        },
        progressEntry: {
          findMany: jest.fn(),
          count: jest.fn(),
        },
        auditLog: {
          findMany: jest.fn(),
        },
        branch: {
          findFirst: jest.fn(),
        },
      },
    };

    cacheService = {
      del: jest.fn().mockResolvedValue(true),
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HrService,
        { provide: PrismaService, useValue: prisma },
        { provide: CacheService, useValue: cacheService },
      ],
    }).compile();

    service = module.get<HrService>(HrService);
  });

  describe('1. Attendance', () => {
    it('checkIn upserts attendance record for employee', async () => {
      prisma.unscopedClient.employee.findUnique.mockResolvedValue({
        id: 'emp-1',
        user: { branches: [{ branchId: 'branch-1' }] },
      });
      prisma.unscopedClient.attendanceRecord.upsert.mockResolvedValue({
        id: 'att-1',
        employeeId: 'emp-1',
        workDate: new Date('2026-11-11T00:00:00.000Z'),
        checkIn: new Date(),
        employee: { id: 'emp-1', employeeCode: 'EMP-01', user: { name: 'Dr. John' } },
      });

      const res = await service.checkIn(
        { branchId: 'branch-1', workDate: '2026-11-11' },
        mockTherapistContext,
      );

      expect(res.id).toBe('att-1');
      expect(prisma.unscopedClient.attendanceRecord.upsert).toHaveBeenCalled();
    });

    it('checkOut updates checkout timestamp on existing record', async () => {
      prisma.unscopedClient.employee.findUnique.mockResolvedValue({
        id: 'emp-1',
      });
      prisma.unscopedClient.attendanceRecord.findUnique.mockResolvedValue({
        id: 'att-1',
        employeeId: 'emp-1',
      });
      prisma.unscopedClient.attendanceRecord.update.mockResolvedValue({
        id: 'att-1',
        checkOut: new Date(),
      });

      const res = await service.checkOut(
        { workDate: '2026-11-11' },
        mockTherapistContext,
      );

      expect(res.id).toBe('att-1');
      expect(prisma.unscopedClient.attendanceRecord.update).toHaveBeenCalled();
    });

    it('getMonthlyAttendance aggregates attendance records into monthly grid', async () => {
      prisma.unscopedClient.attendanceRecord.findMany.mockResolvedValue([
        {
          id: 'att-1',
          employeeId: 'emp-1',
          branchId: 'branch-1',
          workDate: new Date('2026-11-01T00:00:00.000Z'),
          checkIn: new Date('2026-11-01T09:00:00.000Z'),
          checkOut: new Date('2026-11-01T17:00:00.000Z'),
          employee: {
            employeeCode: 'EMP-01',
            designation: 'Speech Therapist',
            user: { name: 'Alice Smith' },
            department: { id: 'dept-1', code: 'ST', name: 'Speech Therapy' },
          },
        },
        {
          id: 'att-2',
          employeeId: 'emp-1',
          branchId: 'branch-1',
          workDate: new Date('2026-11-02T00:00:00.000Z'),
          checkIn: new Date('2026-11-02T09:05:00.000Z'),
          checkOut: new Date('2026-11-02T17:05:00.000Z'),
          employee: {
            employeeCode: 'EMP-01',
            designation: 'Speech Therapist',
            user: { name: 'Alice Smith' },
            department: { id: 'dept-1', code: 'ST', name: 'Speech Therapy' },
          },
        },
      ]);

      const res = await service.getMonthlyAttendance(
        { branchId: 'branch-1', year: 2026, month: 11 },
        mockDirectorContext,
      );

      expect(res.totalEmployees).toBe(1);
      expect(res.employees[0].daysPresent).toBe(2);
      expect(res.employees[0].days['2026-11-01'].present).toBe(true);
      expect(prisma.unscopedClient.attendanceRecord.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('2. Leave Application & Approval Rules', () => {
    it('applyLeave rejects if fromDate is after toDate', async () => {
      prisma.unscopedClient.employee.findUnique.mockResolvedValue({ id: 'emp-1' });

      await expect(
        service.applyLeave(
          {
            leaveType: LeaveType.CASUAL,
            fromDate: '2026-11-20',
            toDate: '2026-11-15',
          },
          mockTherapistContext,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('approveLeave by Director approves directly, flags conflicting appointments and invalidates cache', async () => {
      prisma.unscopedClient.leaveRequest.findUnique.mockResolvedValue({
        id: 'leave-1',
        employeeId: 'emp-1',
        status: LeaveStatus.PENDING,
        fromDate: new Date('2026-11-15T00:00:00.000Z'),
        toDate: new Date('2026-11-16T00:00:00.000Z'),
        employee: {
          id: 'emp-1',
          user: {
            id: 'user-1',
            name: 'Alice',
            branches: [{ branchId: 'branch-1' }],
          },
        },
      });

      prisma.unscopedClient.leaveRequest.update.mockResolvedValue({
        id: 'leave-1',
        status: LeaveStatus.APPROVED,
        backupApproval: false,
        decidedById: mockDirectorContext.userId,
      });

      prisma.unscopedClient.appointment.findMany.mockResolvedValue([
        {
          id: 'appt-1',
          branchId: 'branch-1',
          clientId: 'client-1',
          startsAt: new Date('2026-11-15T10:00:00.000Z'),
          endsAt: new Date('2026-11-15T10:45:00.000Z'),
          status: AppointmentStatus.SCHEDULED,
        },
      ]);

      const res = await service.approveLeave(
        'leave-1',
        { decisionNote: 'Approved by Director' },
        mockDirectorContext,
      );

      expect(res.backupApproval).toBe(false);
      expect(res.conflictingAppointmentsCount).toBe(1);
      expect(res.conflictingAppointments[0].id).toBe('appt-1');

      // Check cache invalidation was called for affected dates
      expect(cacheService.del).toHaveBeenCalledWith('schedule:branch-1:2026-11-15');
      expect(cacheService.del).toHaveBeenCalledWith('schedule:branch-1:2026-11-16');
    });

    it('approveLeave by Manager is FORBIDDEN when Director is available', async () => {
      prisma.unscopedClient.leaveRequest.findUnique.mockResolvedValue({
        id: 'leave-1',
        employeeId: 'emp-1',
        status: LeaveStatus.PENDING,
        fromDate: new Date('2026-11-15T00:00:00.000Z'),
        toDate: new Date('2026-11-16T00:00:00.000Z'),
        employee: {
          user: { branches: [{ branchId: 'branch-1' }] },
        },
      });

      // Director is available (awayUntil is null)
      prisma.unscopedClient.user.findMany.mockResolvedValue([
        { id: 'dir-1', awayUntil: null },
      ]);

      await expect(
        service.approveLeave('leave-1', {}, mockManagerContext),
      ).rejects.toThrow(ForbiddenException);
    });

    it('approveLeave by Manager SUCCEEDS as backupApproval when Director is marked away', async () => {
      prisma.unscopedClient.leaveRequest.findUnique.mockResolvedValue({
        id: 'leave-1',
        employeeId: 'emp-1',
        status: LeaveStatus.PENDING,
        fromDate: new Date('2026-11-15T00:00:00.000Z'),
        toDate: new Date('2026-11-15T00:00:00.000Z'),
        employee: {
          id: 'emp-1',
          user: {
            id: 'user-1',
            name: 'Alice',
            branches: [{ branchId: 'branch-1' }],
          },
        },
      });

      // Director is marked away until next week
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      prisma.unscopedClient.user.findMany.mockResolvedValue([
        { id: 'dir-1', awayUntil: futureDate },
      ]);

      prisma.unscopedClient.leaveRequest.update.mockResolvedValue({
        id: 'leave-1',
        status: LeaveStatus.APPROVED,
        backupApproval: true,
        decidedById: mockManagerContext.userId,
      });

      prisma.unscopedClient.appointment.findMany.mockResolvedValue([]);

      const res = await service.approveLeave('leave-1', {}, mockManagerContext);

      expect(res.backupApproval).toBe(true);
      expect(prisma.unscopedClient.leaveRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            backupApproval: true,
            status: LeaveStatus.APPROVED,
            decidedById: mockManagerContext.userId,
          }),
        }),
      );
    });

    it('rejectLeave sets status to REJECTED and records decision note', async () => {
      prisma.unscopedClient.leaveRequest.findUnique.mockResolvedValue({
        id: 'leave-1',
        status: LeaveStatus.PENDING,
      });
      prisma.unscopedClient.leaveRequest.update.mockResolvedValue({
        id: 'leave-1',
        status: LeaveStatus.REJECTED,
        decisionNote: 'Understaffed',
      });

      const res = await service.rejectLeave(
        'leave-1',
        { decisionNote: 'Understaffed' },
        mockDirectorContext,
      );

      expect(res.status).toBe(LeaveStatus.REJECTED);
      expect(res.decisionNote).toBe('Understaffed');
    });
  });

  describe('3. Employee Detail Endpoints for Director', () => {
    it('getEmployeeSummary returns assigned cases, sessions, and on-time report rate', async () => {
      prisma.unscopedClient.employee.findUnique.mockResolvedValue({
        id: 'emp-1',
        employeeCode: 'EMP-01',
        designation: 'Senior Therapist',
        user: { id: 'u-1', name: 'Alice', email: 'alice@example.com' },
        department: { id: 'dept-1', code: 'ST', name: 'Speech Therapy' },
      });

      prisma.unscopedClient.treatmentPlan.findMany.mockResolvedValue([
        {
          clientId: 'client-1',
          client: { id: 'client-1', clientCode: 'P-01', name: 'Timmy', status: 'ACTIVE' },
        },
      ]);

      prisma.unscopedClient.appointment.count.mockResolvedValue(15);

      prisma.unscopedClient.report.findMany.mockResolvedValue([
        {
          id: 'rep-1',
          dueOn: new Date('2026-11-10T00:00:00.000Z'),
          submittedAt: new Date('2026-11-09T00:00:00.000Z'), // on-time
        },
        {
          id: 'rep-2',
          dueOn: new Date('2026-11-10T00:00:00.000Z'),
          submittedAt: new Date('2026-11-12T00:00:00.000Z'), // late
        },
      ]);

      const res = await service.getEmployeeSummary('emp-1', mockDirectorContext);

      expect(res.assignedCasesCount).toBe(1);
      expect(res.totalSessions).toBe(15);
      expect(res.reportsSubmitted).toBe(2);
      expect(res.onTimeReportRate).toBe(50.0);
    });

    it('getEmployeeGoals returns paginated goals/sub-goals with remarks', async () => {
      prisma.unscopedClient.employee.findUnique.mockResolvedValue({ id: 'emp-1' });
      prisma.unscopedClient.progressEntry.findMany.mockResolvedValue([
        {
          id: 'pe-1',
          entryDate: new Date('2026-11-10'),
          description: 'Articulation practice',
          response: 'Good',
          remarks: 'Follow up next week',
          level: 'PROGRESSING',
          subgoalId: 'sub-1',
          subgoal: {
            id: 'sub-1',
            description: 'Phoneme /s/ isolation',
            status: 'IN_PROGRESS',
            frequency: 'WEEKLY',
            goal: {
              id: 'g-1',
              title: 'Speech Clarity',
              description: 'Improve consonant sounds',
              term: 'SHORT',
              status: 'IN_PROGRESS',
              plan: {
                client: { id: 'c-1', clientCode: 'P-01', name: 'Timmy' },
              },
            },
          },
        },
      ]);
      prisma.unscopedClient.progressEntry.count.mockResolvedValue(1);

      const res = await service.getEmployeeGoals('emp-1', { page: 1, pageSize: 20 }, mockDirectorContext);

      expect(res.data.length).toBe(1);
      expect(res.data[0].remarks).toBe('Follow up next week');
      expect(res.data[0].goalTitle).toBe('Speech Clarity');
      expect(res.meta.total).toBe(1);
    });

    it('getEmployeeActivityLog returns cursor-paginated activity log', async () => {
      prisma.unscopedClient.employee.findUnique.mockResolvedValue({
        id: 'emp-1',
        userId: 'u-1',
      });
      prisma.unscopedClient.auditLog.findMany.mockResolvedValue([
        {
          id: 'log-1',
          action: 'CREATE_PROGRESS_ENTRY',
          entity: 'ProgressEntry',
          createdAt: new Date(),
        },
      ]);

      const res = await service.getEmployeeActivityLog('emp-1', { limit: 20 }, mockDirectorContext);

      expect(res.data.length).toBe(1);
      expect(res.data[0].action).toBe('CREATE_PROGRESS_ENTRY');
      expect(res.meta.hasNext).toBe(false);
    });
  });
});

