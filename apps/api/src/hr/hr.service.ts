import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  RoleKey,
  LeaveStatus,
  AppointmentStatus,
  PlanStatus,
  ReportStatus,
} from '@petals/types';
import { PrismaService } from '../common/prisma';
import { CacheService } from '../common/redis';
import { IRequestContext } from '../common/context/request-context';
import {
  buildOffsetPagination,
  buildOffsetMeta,
  buildCursorPagination,
  buildCursorMeta,
  buildOrderBy,
} from '../common/pagination';
import {
  CheckInDto,
  CheckOutDto,
  DailyAttendanceQueryDto,
  MonthlyAttendanceQueryDto,
  CreateHolidayDto,
  HolidayQueryDto,
  CreateLeaveRequestDto,
  LeaveQueryDto,
  LeaveDecisionDto,
  DirectorAvailabilityDto,
  EmployeeGoalsQueryDto,
  EmployeeActivityQueryDto,
} from './dto';

@Injectable()
export class HrService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // 1. ATTENDANCE (CHECK-IN / CHECK-OUT / VIEWS)
  // ─────────────────────────────────────────────────────────────

  /**
   * Staff check-in for a work date (defaults to today).
   */
  async checkIn(dto: CheckInDto, user: IRequestContext) {
    const employeeId = await this.resolveTargetEmployeeId(dto.employeeId, user);
    const branchId = await this.resolveBranchId(dto.branchId, employeeId, user);

    const workDate = dto.workDate
      ? this.parseDateOnly(dto.workDate)
      : this.parseDateOnly(new Date());

    const checkInTime = dto.checkIn ? new Date(dto.checkIn) : new Date();

    const record = await this.prisma.unscopedClient.attendanceRecord.upsert({
      where: {
        employeeId_workDate: {
          employeeId,
          workDate,
        },
      },
      update: {
        checkIn: checkInTime,
        branchId,
      },
      create: {
        employeeId,
        branchId,
        workDate,
        checkIn: checkInTime,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            user: { select: { name: true } },
          },
        },
      },
    });

    return record;
  }

  /**
   * Staff check-out for a work date.
   */
  async checkOut(dto: CheckOutDto, user: IRequestContext) {
    const employeeId = await this.resolveTargetEmployeeId(dto.employeeId, user);
    const workDate = dto.workDate
      ? this.parseDateOnly(dto.workDate)
      : this.parseDateOnly(new Date());

    const checkOutTime = dto.checkOut ? new Date(dto.checkOut) : new Date();

    const existing = await this.prisma.unscopedClient.attendanceRecord.findUnique({
      where: {
        employeeId_workDate: {
          employeeId,
          workDate,
        },
      },
    });

    if (!existing) {
      const branchId = await this.resolveBranchId(undefined, employeeId, user);
      return this.prisma.unscopedClient.attendanceRecord.create({
        data: {
          employeeId,
          branchId,
          workDate,
          checkOut: checkOutTime,
        },
        include: {
          employee: {
            select: {
              id: true,
              employeeCode: true,
              user: { select: { name: true } },
            },
          },
        },
      });
    }

    return this.prisma.unscopedClient.attendanceRecord.update({
      where: { id: existing.id },
      data: {
        checkOut: checkOutTime,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            user: { select: { name: true } },
          },
        },
      },
    });
  }

  /**
   * Daily attendance view per branch.
   * Therapist sees only their own record; Manager sees branch staff; Director sees all.
   */
  async getDailyAttendance(query: DailyAttendanceQueryDto, user: IRequestContext) {
    const workDate = this.parseDateOnly(query.date);
    const where: any = { workDate };

    if (user.roleKey === RoleKey.THERAPIST) {
      const callerEmp = await this.getEmployeeForUser(user.userId);
      if (!callerEmp) return [];
      where.employeeId = callerEmp.id;
    } else if (user.roleKey === RoleKey.MANAGER) {
      if (query.branchId) {
        if (!user.branchIds?.includes(query.branchId)) {
          throw new ForbiddenException('You do not have access to this branch');
        }
        where.branchId = query.branchId;
      } else {
        where.branchId = { in: user.branchIds || [] };
      }
    } else {
      // Director
      if (query.branchId) {
        where.branchId = query.branchId;
      }
    }

    return this.prisma.unscopedClient.attendanceRecord.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            designation: true,
            user: { select: { name: true } },
            department: { select: { id: true, code: true, name: true } },
          },
        },
      },
      orderBy: { employee: { employeeCode: 'asc' } },
    });
  }

  /**
   * Monthly attendance view per branch.
   * STRICT REQUIREMENT: The monthly grid comes from ONE aggregate query, NOT one query per employee!
   */
  async getMonthlyAttendance(query: MonthlyAttendanceQueryDto, user: IRequestContext) {
    const { branchId, year, month } = query;

    // Check manager branch permission
    if (user.roleKey === RoleKey.MANAGER && !user.branchIds?.includes(branchId)) {
      throw new ForbiddenException('You do not have access to this branch');
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const where: any = {
      branchId,
      workDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (user.roleKey === RoleKey.THERAPIST) {
      const callerEmp = await this.getEmployeeForUser(user.userId);
      if (!callerEmp) {
        return { year, month, branchId, employees: [] };
      }
      where.employeeId = callerEmp.id;
    } else if (query.employeeId) {
      where.employeeId = query.employeeId;
    }

    // SINGLE AGGREGATE QUERY:
    const records = await this.prisma.unscopedClient.attendanceRecord.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            designation: true,
            user: { select: { name: true } },
            department: { select: { id: true, code: true, name: true } },
          },
        },
      },
      orderBy: [{ employeeId: 'asc' }, { workDate: 'asc' }],
    });

    // In-memory aggregation into monthly grid per employee
    const employeeMap = new Map<
      string,
      {
        employeeId: string;
        employeeCode: string;
        employeeName: string;
        designation: string | null;
        departmentCode: string | null;
        daysPresent: number;
        days: Record<
          string,
          {
            workDate: string;
            checkIn: Date | null;
            checkOut: Date | null;
            present: boolean;
          }
        >;
      }
    >();

    for (const rec of records) {
      const dateKey = rec.workDate.toISOString().split('T')[0];
      if (!employeeMap.has(rec.employeeId)) {
        employeeMap.set(rec.employeeId, {
          employeeId: rec.employeeId,
          employeeCode: rec.employee.employeeCode,
          employeeName: rec.employee.user.name,
          designation: rec.employee.designation,
          departmentCode: rec.employee.department?.code || null,
          daysPresent: 0,
          days: {},
        });
      }

      const empEntry = employeeMap.get(rec.employeeId)!;
      empEntry.days[dateKey] = {
        workDate: dateKey,
        checkIn: rec.checkIn,
        checkOut: rec.checkOut,
        present: Boolean(rec.checkIn),
      };
      if (rec.checkIn) {
        empEntry.daysPresent += 1;
      }
    }

    return {
      year,
      month,
      branchId,
      totalEmployees: employeeMap.size,
      employees: Array.from(employeeMap.values()),
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 2. HOLIDAYS
  // ─────────────────────────────────────────────────────────────

  async createHoliday(dto: CreateHolidayDto, user: IRequestContext) {
    if (user.roleKey === RoleKey.MANAGER) {
      if (!dto.branchId || !user.branchIds?.includes(dto.branchId)) {
        throw new ForbiddenException('Managers can only create holidays for their assigned branch');
      }
    }

    const date = this.parseDateOnly(dto.date);

    return this.prisma.unscopedClient.holiday.upsert({
      where: {
        branchId_date: {
          branchId: dto.branchId || null as any,
          date,
        },
      },
      update: {
        name: dto.name,
      },
      create: {
        branchId: dto.branchId || null,
        date,
        name: dto.name,
      },
    });
  }

  async getHolidays(query: HolidayQueryDto, _user: IRequestContext) {
    const where: any = {};

    if (query.branchId) {
      where.OR = [{ branchId: query.branchId }, { branchId: null }];
    }

    if (query.year) {
      const start = new Date(Date.UTC(query.year, 0, 1));
      const end = new Date(Date.UTC(query.year, 11, 31, 23, 59, 59, 999));
      where.date = { gte: start, lte: end };
    }

    return this.prisma.unscopedClient.holiday.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  async deleteHoliday(id: string, user: IRequestContext) {
    const holiday = await this.prisma.unscopedClient.holiday.findUnique({
      where: { id },
    });

    if (!holiday) {
      throw new NotFoundException(`Holiday "${id}" not found`);
    }

    if (user.roleKey === RoleKey.MANAGER) {
      if (!holiday.branchId || !user.branchIds?.includes(holiday.branchId)) {
        throw new ForbiddenException('Managers can only delete holidays for their assigned branch');
      }
    }

    return this.prisma.unscopedClient.holiday.delete({
      where: { id },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 3. LEAVE REQUESTS & BACKUP APPROVAL WORKFLOW
  // ─────────────────────────────────────────────────────────────

  /**
   * Apply for leave.
   * Therapists can only apply for themselves.
   */
  async applyLeave(dto: CreateLeaveRequestDto, user: IRequestContext) {
    const employeeId = await this.resolveTargetEmployeeId(dto.employeeId, user);
    const fromDate = this.parseDateOnly(dto.fromDate);
    const toDate = this.parseDateOnly(dto.toDate);

    if (fromDate > toDate) {
      throw new BadRequestException('fromDate cannot be after toDate');
    }

    return this.prisma.unscopedClient.leaveRequest.create({
      data: {
        employeeId,
        leaveType: dto.leaveType,
        fromDate,
        toDate,
        reason: dto.reason,
        status: LeaveStatus.PENDING,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            user: { select: { name: true } },
          },
        },
      },
    });
  }

  /**
   * List leave requests with offset pagination.
   * Therapist: own requests only.
   * Manager: staff in assigned branches.
   * Director: all.
   */
  async getLeaves(query: LeaveQueryDto, user: IRequestContext) {
    const where: any = {};

    if (user.roleKey === RoleKey.THERAPIST) {
      const callerEmp = await this.getEmployeeForUser(user.userId);
      if (!callerEmp) {
        return { data: [], meta: buildOffsetMeta(0, query.page, query.pageSize) };
      }
      where.employeeId = callerEmp.id;
    } else if (user.roleKey === RoleKey.MANAGER) {
      where.employee = {
        user: {
          branches: {
            some: {
              branchId: { in: user.branchIds || [] },
            },
          },
        },
      };
      if (query.branchId) {
        if (!user.branchIds?.includes(query.branchId)) {
          throw new ForbiddenException('You do not have access to this branch');
        }
        where.employee.user.branches = {
          some: { branchId: query.branchId },
        };
      }
    } else {
      // Director
      if (query.branchId) {
        where.employee = {
          user: {
            branches: {
              some: { branchId: query.branchId },
            },
          },
        };
      }
    }

    if (query.employeeId && user.roleKey !== RoleKey.THERAPIST) {
      where.employeeId = query.employeeId;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.leaveType) {
      where.leaveType = query.leaveType;
    }
    if (query.fromDate) {
      where.fromDate = { gte: this.parseDateOnly(query.fromDate) };
    }
    if (query.toDate) {
      where.toDate = { lte: this.parseDateOnly(query.toDate) };
    }

    const pagination = buildOffsetPagination(query.page, query.pageSize);
    const orderBy = query.sort
      ? buildOrderBy(query.sort, ['createdAt', 'fromDate', 'toDate', 'status'], 'createdAt')
      : [{ createdAt: 'desc' as const }, { id: 'desc' as const }];

    const [items, total] = await Promise.all([
      this.prisma.unscopedClient.leaveRequest.findMany({
        where,
        ...pagination,
        orderBy,
        include: {
          employee: {
            select: {
              id: true,
              employeeCode: true,
              user: { select: { name: true } },
              department: { select: { id: true, code: true, name: true } },
            },
          },
          decidedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.unscopedClient.leaveRequest.count({ where }),
    ]);

    return {
      data: items,
      meta: buildOffsetMeta(total, query.page, query.pageSize),
    };
  }

  /**
   * Approve leave request.
   * Director approves directly.
   * Manager can approve ONLY when Director is marked away/unavailable.
   * Approved leave flags conflicting appointments and invalidates affected daily schedule cache keys.
   */
  async approveLeave(id: string, dto: LeaveDecisionDto, user: IRequestContext) {
    const leave = await this.prisma.unscopedClient.leaveRequest.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                branches: { select: { branchId: true } },
              },
            },
          },
        },
      },
    });

    if (!leave) {
      throw new NotFoundException(`Leave request "${id}" not found`);
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(`Leave request is already ${leave.status.toLowerCase()}`);
    }

    let backupApproval = false;

    if (user.roleKey === RoleKey.DIRECTOR) {
      backupApproval = false;
    } else if (user.roleKey === RoleKey.MANAGER) {
      // Check backup approval rule: Is the director marked unavailable?
      const directors = await this.prisma.unscopedClient.user.findMany({
        where: {
          role: { key: RoleKey.DIRECTOR },
          isActive: true,
        },
        select: { id: true, awayUntil: true },
      });

      const now = new Date();
      const isDirectorUnavailable =
        directors.length > 0 &&
        directors.every((d) => d.awayUntil && new Date(d.awayUntil) > now);

      if (!isDirectorUnavailable) {
        throw new ForbiddenException(
          'Director is currently available; backup approval not permitted',
        );
      }

      backupApproval = true;
    } else {
      throw new ForbiddenException('Only Director or backup Manager can approve leave requests');
    }

    // 1. Update leave request
    const updatedLeave = await this.prisma.unscopedClient.leaveRequest.update({
      where: { id },
      data: {
        status: LeaveStatus.APPROVED,
        backupApproval,
        decidedById: user.userId,
        decisionNote: dto.decisionNote,
        decidedAt: new Date(),
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            user: { select: { name: true } },
          },
        },
        decidedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 2. Identify conflicting appointments
    const endOfToDate = new Date(leave.toDate);
    endOfToDate.setUTCHours(23, 59, 59, 999);

    const conflictingAppointments = await this.prisma.unscopedClient.appointment.findMany({
      where: {
        therapistId: leave.employeeId,
        startsAt: {
          gte: leave.fromDate,
          lte: endOfToDate,
        },
        status: { not: AppointmentStatus.CANCELLED },
      },
      select: {
        id: true,
        branchId: true,
        clientId: true,
        startsAt: true,
        endsAt: true,
        status: true,
      },
    });

    // 3. Invalidate daily schedule cache for all affected dates and branches
    const affectedBranchIds = new Set<string>();
    for (const b of leave.employee.user.branches) {
      affectedBranchIds.add(b.branchId);
    }
    for (const appt of conflictingAppointments) {
      affectedBranchIds.add(appt.branchId);
    }

    const cur = new Date(leave.fromDate);
    while (cur <= leave.toDate) {
      const dateStr = cur.toISOString().split('T')[0];
      for (const branchId of affectedBranchIds) {
        const cacheKey = `schedule:${branchId}:${dateStr}`;
        await this.cacheService.del(cacheKey);
      }
      cur.setUTCDate(cur.getUTCDate() + 1);
    }

    return {
      leave: updatedLeave,
      backupApproval,
      conflictingAppointmentsCount: conflictingAppointments.length,
      conflictingAppointments,
    };
  }

  /**
   * Reject leave request.
   */
  async rejectLeave(id: string, dto: LeaveDecisionDto, user: IRequestContext) {
    const leave = await this.prisma.unscopedClient.leaveRequest.findUnique({
      where: { id },
    });

    if (!leave) {
      throw new NotFoundException(`Leave request "${id}" not found`);
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(`Leave request is already ${leave.status.toLowerCase()}`);
    }

    let backupApproval = false;

    if (user.roleKey === RoleKey.DIRECTOR) {
      backupApproval = false;
    } else if (user.roleKey === RoleKey.MANAGER) {
      const directors = await this.prisma.unscopedClient.user.findMany({
        where: {
          role: { key: RoleKey.DIRECTOR },
          isActive: true,
        },
        select: { id: true, awayUntil: true },
      });

      const now = new Date();
      const isDirectorUnavailable =
        directors.length > 0 &&
        directors.every((d) => d.awayUntil && new Date(d.awayUntil) > now);

      if (!isDirectorUnavailable) {
        throw new ForbiddenException(
          'Director is currently available; backup decision not permitted',
        );
      }

      backupApproval = true;
    } else {
      throw new ForbiddenException('Only Director or backup Manager can reject leave requests');
    }

    return this.prisma.unscopedClient.leaveRequest.update({
      where: { id },
      data: {
        status: LeaveStatus.REJECTED,
        backupApproval,
        decidedById: user.userId,
        decisionNote: dto.decisionNote,
        decidedAt: new Date(),
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            user: { select: { name: true } },
          },
        },
        decidedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Director marks themselves unavailable (or available).
   */
  async setDirectorAvailability(dto: DirectorAvailabilityDto, user: IRequestContext) {
    if (user.roleKey !== RoleKey.DIRECTOR) {
      throw new ForbiddenException('Only Director can set director availability');
    }

    const awayUntil = dto.awayUntil ? new Date(dto.awayUntil) : null;

    return this.prisma.unscopedClient.user.update({
      where: { id: user.userId },
      data: { awayUntil },
      select: {
        id: true,
        name: true,
        email: true,
        awayUntil: true,
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 4. EMPLOYEE DETAIL ENDPOINTS FOR DIRECTOR
  // ─────────────────────────────────────────────────────────────

  /**
   * Summary metrics for an employee:
   * Assigned cases, total sessions, reports submitted, on-time report rate.
   */
  async getEmployeeSummary(employeeId: string, _user: IRequestContext) {
    const employee = await this.prisma.unscopedClient.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, code: true, name: true } },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee "${employeeId}" not found`);
    }

    // 1. Assigned cases (unique clients from active treatment plans)
    const activePlans = await this.prisma.unscopedClient.treatmentPlan.findMany({
      where: {
        therapistId: employeeId,
        status: PlanStatus.ACTIVE,
      },
      select: {
        clientId: true,
        client: {
          select: {
            id: true,
            clientCode: true,
            name: true,
            status: true,
          },
        },
      },
      distinct: ['clientId'],
    });

    const assignedCases = activePlans.map((p) => p.client);

    // 2. Total sessions (attended appointments)
    const totalSessions = await this.prisma.unscopedClient.appointment.count({
      where: {
        therapistId: employeeId,
        status: AppointmentStatus.ATTENDED,
      },
    });

    // 3. Reports submitted and on-time report rate
    const submittedReports = await this.prisma.unscopedClient.report.findMany({
      where: {
        authorId: employeeId,
        status: { in: [ReportStatus.SUBMITTED, ReportStatus.REVIEWED, ReportStatus.SHARED] },
      },
      select: {
        id: true,
        dueOn: true,
        submittedAt: true,
      },
    });

    const reportsSubmitted = submittedReports.length;
    const onTimeReports = submittedReports.filter(
      (r) => !r.dueOn || !r.submittedAt || r.submittedAt <= r.dueOn,
    ).length;

    const onTimeReportRate =
      reportsSubmitted > 0 ? Number(((onTimeReports / reportsSubmitted) * 100).toFixed(1)) : 100;

    return {
      employee: {
        id: employee.id,
        employeeCode: employee.employeeCode,
        name: employee.user.name,
        email: employee.user.email,
        designation: employee.designation,
        department: employee.department,
      },
      assignedCasesCount: assignedCases.length,
      assignedCases,
      totalSessions,
      reportsSubmitted,
      onTimeReportRate,
    };
  }

  /**
   * Goals / Sub-goals entered by the employee with description, response and remarks (paginated).
   */
  async getEmployeeGoals(
    employeeId: string,
    query: EmployeeGoalsQueryDto,
    _user: IRequestContext,
  ) {
    const employee = await this.prisma.unscopedClient.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee "${employeeId}" not found`);
    }

    const pagination = buildOffsetPagination(query.page, query.pageSize);
    const where = {
      authorId: employeeId,
      deletedAt: null,
    };

    const [items, total] = await Promise.all([
      this.prisma.unscopedClient.progressEntry.findMany({
        where,
        ...pagination,
        orderBy: [{ entryDate: 'desc' }, { id: 'desc' }],
        include: {
          subgoal: {
            select: {
              id: true,
              description: true,
              frequency: true,
              status: true,
              goal: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  term: true,
                  status: true,
                  plan: {
                    select: {
                      id: true,
                      client: {
                        select: {
                          id: true,
                          clientCode: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.unscopedClient.progressEntry.count({ where }),
    ]);

    return {
      data: items.map((entry) => ({
        id: entry.id,
        entryDate: entry.entryDate,
        description: entry.description,
        response: entry.response,
        remarks: entry.remarks,
        level: entry.level,
        subgoalId: entry.subgoalId,
        subgoalDescription: entry.subgoal?.description,
        subgoalStatus: entry.subgoal?.status,
        goalTitle: entry.subgoal?.goal?.title,
        goalDescription: entry.subgoal?.goal?.description,
        goalTerm: entry.subgoal?.goal?.term,
        client: entry.subgoal?.goal?.plan?.client,
      })),
      meta: buildOffsetMeta(total, query.page, query.pageSize),
    };
  }

  /**
   * Activity log of everything the employee entered (cursor pagination).
   */
  async getEmployeeActivityLog(
    employeeId: string,
    query: EmployeeActivityQueryDto,
    _user: IRequestContext,
  ) {
    const employee = await this.prisma.unscopedClient.employee.findUnique({
      where: { id: employeeId },
      select: { userId: true },
    });

    if (!employee) {
      throw new NotFoundException(`Employee "${employeeId}" not found`);
    }

    const limit = query.limit || 20;
    const pagination = buildCursorPagination(query.cursor, limit);

    const items = await this.prisma.unscopedClient.auditLog.findMany({
      where: {
        userId: employee.userId,
      },
      take: pagination.take,
      ...(pagination.cursor ? { cursor: pagination.cursor, skip: pagination.skip } : {}),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    return {
      data: items,
      meta: buildCursorMeta(items, limit),
    };
  }

  // ─────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────

  private async getEmployeeForUser(userId: string) {
    return this.prisma.unscopedClient.employee.findUnique({
      where: { userId },
    });
  }

  private async resolveTargetEmployeeId(
    requestedId: string | undefined,
    user: IRequestContext,
  ): Promise<string> {
    if (user.roleKey === RoleKey.THERAPIST) {
      const emp = await this.getEmployeeForUser(user.userId);
      if (!emp) {
        throw new ForbiddenException('Therapist user does not have an employee profile');
      }
      return emp.id;
    }

    if (requestedId) {
      const targetEmp = await this.prisma.unscopedClient.employee.findUnique({
        where: { id: requestedId },
      });
      if (!targetEmp) {
        throw new NotFoundException(`Employee "${requestedId}" not found`);
      }
      return targetEmp.id;
    }

    const selfEmp = await this.getEmployeeForUser(user.userId);
    if (selfEmp) {
      return selfEmp.id;
    }

    throw new BadRequestException('employeeId is required');
  }

  private async resolveBranchId(
    requestedBranchId: string | undefined,
    employeeId: string,
    user: IRequestContext,
  ): Promise<string> {
    if (requestedBranchId) {
      return requestedBranchId;
    }

    if (user.branchIds && user.branchIds.length > 0) {
      return user.branchIds[0];
    }

    const emp = await this.prisma.unscopedClient.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: {
          include: {
            branches: { select: { branchId: true } },
          },
        },
      },
    });

    if (emp?.user?.branches?.[0]?.branchId) {
      return emp.user.branches[0].branchId;
    }

    const defaultBranch = await this.prisma.unscopedClient.branch.findFirst({
      where: { isActive: true },
      select: { id: true },
    });

    if (defaultBranch) {
      return defaultBranch.id;
    }

    throw new BadRequestException('No branch could be resolved for this operation');
  }

  private parseDateOnly(val: string | Date): Date {
    const str = typeof val === 'string' ? val.split('T')[0] : val.toISOString().split('T')[0];
    return new Date(`${str}T00:00:00.000Z`);
  }
}

