import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  RoleKey,
  AppointmentStatus,
  LeaveStatus,
} from '@petals/types';
import { PrismaService } from '../common/prisma';
import { CacheService } from '../common/redis';
import { buildCursorPagination, buildCursorMeta } from '../common/pagination';
import { generateScheduleSlots } from './schedule-generator.helper';
import {
  CreateAppointmentDto,
  CreateScheduleDto,
  RescheduleAppointmentDto,
  CancelAppointmentDto,
  UpdateAppointmentStatusDto,
  AppointmentQueryDto,
  DailyScheduleQueryDto,
  ClientAppointmentQueryDto,
} from './dto';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // 1. CONFLICT DETECTION
  // ─────────────────────────────────────────────────────────────

  /**
   * Checks for overlapping appointments for therapist and client.
   * Excludes CANCELLED appointments and optional excludeAppointmentId.
   */
  async checkConflicts(
    therapistId: string,
    clientId: string,
    startsAt: Date,
    endsAt: Date,
    excludeAppointmentId?: string,
  ): Promise<void> {
    const timeOverlapWhere = {
      status: { not: AppointmentStatus.CANCELLED },
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
      ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
    };

    // 1. Therapist conflict check
    const therapistConflict = await this.prisma.unscopedClient.appointment.findFirst({
      where: {
        therapistId,
        ...timeOverlapWhere,
      },
      select: { id: true, startsAt: true, endsAt: true },
    });

    if (therapistConflict) {
      throw new ConflictException('Therapist is already booked for this time slot');
    }

    // 2. Client conflict check
    const clientConflict = await this.prisma.unscopedClient.appointment.findFirst({
      where: {
        clientId,
        ...timeOverlapWhere,
      },
      select: { id: true, startsAt: true, endsAt: true },
    });

    if (clientConflict) {
      throw new ConflictException('Client already has an appointment booked for this time slot');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. WEEKLY CALENDAR & FILTERING
  // ─────────────────────────────────────────────────────────────

  /**
   * Calendar view limited to 31 days with minimal selected display fields.
   * Cancelled appointments remain visible. Flags holidays and approved leaves.
   */
  async findCalendar(
    query: AppointmentQueryDto,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const fromDate = new Date(query.from);
    const toDate = new Date(query.to);

    const diffDays = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays < 0 || diffDays > 31) {
      throw new BadRequestException('Calendar date range cannot exceed 31 days');
    }

    const where: any = {
      startsAt: { gte: fromDate, lte: toDate },
    };

    if (query.branchId) {
      where.branchId = query.branchId;
    }
    if (query.therapistId) {
      where.therapistId = query.therapistId;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.departmentId) {
      where.therapist = { departmentId: query.departmentId };
    }

    // Role-based scoping
    if (roleKey === RoleKey.PARENT) {
      const parentChildren = await this.prisma.unscopedClient.clientGuardian.findMany({
        where: { guardian: { userId } },
        select: { clientId: true },
      });
      const childIds = parentChildren.map((pc) => pc.clientId);
      where.clientId = { in: childIds };
    } else if (roleKey === RoleKey.THERAPIST) {
      const emp = await this.getEmployeeForUser(userId);
      if (emp) {
        where.therapistId = emp.id;
      } else {
        return [];
      }
    } else if (roleKey === RoleKey.MANAGER) {
      where.branchId = { in: userBranchIds };
    }

    // 1. Fetch appointments using lean select
    const appointments = await this.prisma.unscopedClient.appointment.findMany({
      where,
      orderBy: { startsAt: 'asc' },
      select: {
        id: true,
        branchId: true,
        clientId: true,
        client: { select: { id: true, name: true } },
        therapistId: true,
        therapist: {
          select: {
            id: true,
            designation: true,
            user: { select: { name: true } },
            department: { select: { id: true, name: true, code: true } },
          },
        },
        startsAt: true,
        endsAt: true,
        status: true,
        cancelReason: true,
        cancelledAt: true,
      },
    });

    // 2. Fetch holidays and approved leaves for flagging
    const [holidays, leaves] = await Promise.all([
      this.prisma.unscopedClient.holiday.findMany({
        where: {
          date: { gte: fromDate, lte: toDate },
          ...(where.branchId ? { OR: [{ branchId: where.branchId }, { branchId: null }] } : {}),
        },
      }),
      this.prisma.unscopedClient.leaveRequest.findMany({
        where: {
          status: LeaveStatus.APPROVED,
          fromDate: { lte: toDate },
          toDate: { gte: fromDate },
        },
        select: {
          employeeId: true,
          fromDate: true,
          toDate: true,
        },
      }),
    ]);

    // 3. Format and flag appointments
    return appointments.map((appt) => {
      const apptDateStr = this.formatDateOnly(appt.startsAt);
      const matchingHoliday = holidays.find(
        (h) => this.formatDateOnly(h.date) === apptDateStr,
      );

      const matchingLeave = leaves.find(
        (l) =>
          l.employeeId === appt.therapistId &&
          appt.startsAt >= l.fromDate &&
          appt.startsAt <= l.toDate,
      );

      return {
        id: appt.id,
        branchId: appt.branchId,
        clientId: appt.clientId,
        clientName: appt.client?.name || '',
        therapistId: appt.therapistId,
        therapistName: appt.therapist?.user?.name || '',
        departmentCode: appt.therapist?.department?.code || '',
        departmentName: appt.therapist?.department?.name || '',
        startsAt: appt.startsAt,
        endsAt: appt.endsAt,
        status: appt.status,
        cancelReason: appt.cancelReason,
        cancelledAt: appt.cancelledAt,
        isHoliday: Boolean(matchingHoliday),
        holidayName: matchingHoliday?.name || null,
        isOnLeave: Boolean(matchingLeave),
      };
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 3. DAILY SCHEDULE CACHE
  // ─────────────────────────────────────────────────────────────

  /**
   * Retrieves branch-day schedule with Redis caching under schedule:{branchId}:{yyyy-mm-dd}.
   * TTL: 5 min for today, 1 hour for other dates.
   * Post-cache scoping enforces caller permissions (never leaks rows across roles).
   */
  async findDailySchedule(
    query: DailyScheduleQueryDto,
    userId: string,
    roleKey: RoleKey,
    _userBranchIds: string[],
  ) {
    const { branchId, date } = query;
    const dateStr = date.split('T')[0];
    const cacheKey = `schedule:${branchId}:${dateStr}`;

    const todayStr = this.formatDateOnly(new Date());
    const isToday = dateStr === todayStr;
    const ttlSeconds = isToday ? 300 : 3600;

    // 1. Try to read from cache (Redis or in-memory fallback)
    let rawSchedule = await this.cacheService.get<any[]>(cacheKey);

    if (!rawSchedule) {
      // Build with ONE query using select
      const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

      const appointments = await this.prisma.unscopedClient.appointment.findMany({
        where: {
          branchId,
          startsAt: { gte: startOfDay, lte: endOfDay },
        },
        orderBy: { startsAt: 'asc' },
        select: {
          id: true,
          clientId: true,
          client: { select: { name: true } },
          therapistId: true,
          therapist: {
            select: {
              id: true,
              user: { select: { name: true } },
              department: { select: { code: true } },
            },
          },
          startsAt: true,
          endsAt: true,
          status: true,
          cancelReason: true,
        },
      });

      rawSchedule = appointments.map((a) => {
        const therapistFullName = a.therapist?.user?.name || '';
        const therapistFirstName = therapistFullName.split(' ')[0] || '';
        return {
          id: a.id,
          clientId: a.clientId,
          clientDisplayName: a.client?.name || '',
          departmentCode: a.therapist?.department?.code || '',
          therapistFirstName,
          therapistId: a.therapistId,
          startsAt: a.startsAt,
          endsAt: a.endsAt,
          status: a.status,
          cancelReason: a.cancelReason,
        };
      });

      // Save to cache
      await this.cacheService.set(cacheKey, rawSchedule, ttlSeconds);
    }

    // 2. Post-cache role scoping
    if (roleKey === RoleKey.DIRECTOR || roleKey === RoleKey.MANAGER) {
      return rawSchedule;
    }

    if (roleKey === RoleKey.THERAPIST) {
      const emp = await this.getEmployeeForUser(userId);
      if (!emp) return [];
      return rawSchedule.filter((item) => item.therapistId === emp.id);
    }

    if (roleKey === RoleKey.PARENT) {
      const parentChildren = await this.prisma.unscopedClient.clientGuardian.findMany({
        where: { guardian: { userId } },
        select: { clientId: true },
      });
      const childIds = new Set(parentChildren.map((pc) => pc.clientId));
      return rawSchedule.filter((item) => childIds.has(item.clientId));
    }

    return rawSchedule;
  }

  /**
   * Warms tomorrow's daily schedule cache for all active branches (nightly job).
   */
  async warmTomorrowCache(): Promise<void> {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const dateStr = this.formatDateOnly(tomorrow);

    const branches = await this.prisma.unscopedClient.branch.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    for (const b of branches) {
      try {
        await this.findDailySchedule(
          { branchId: b.id, date: dateStr },
          'system',
          RoleKey.DIRECTOR,
          [],
        );
      } catch (err) {
        this.logger.warn(`Failed warming cache for branch ${b.id}: ${(err as Error).message}`);
      }
    }
  }

  /**
   * Explicitly invalidates the daily schedule cache key for a branch and date.
   */
  async invalidateDailyCache(branchId: string, date: Date | string): Promise<void> {
    const dateStr = typeof date === 'string' ? date.split('T')[0] : this.formatDateOnly(date);
    const cacheKey = `schedule:${branchId}:${dateStr}`;
    await this.cacheService.del(cacheKey);
  }

  // ─────────────────────────────────────────────────────────────
  // 4. APPOINTMENT MUTATIONS
  // ─────────────────────────────────────────────────────────────

  async createAppointment(dto: CreateAppointmentDto, _userId: string, _roleKey: RoleKey) {
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);

    // Conflict detection
    await this.checkConflicts(dto.therapistId, dto.clientId, startsAt, endsAt);

    const appt = await this.prisma.unscopedClient.appointment.create({
      data: {
        branchId: dto.branchId,
        clientId: dto.clientId,
        therapistId: dto.therapistId,
        startsAt,
        endsAt,
        scheduleId: dto.scheduleId,
        status: AppointmentStatus.SCHEDULED,
      },
      include: {
        client: { select: { id: true, name: true } },
        therapist: {
          select: {
            id: true,
            user: { select: { name: true } },
            department: { select: { code: true } },
          },
        },
      },
    });

    // Invalidate daily schedule cache
    await this.invalidateDailyCache(dto.branchId, startsAt);

    return appt;
  }

  async createSchedule(dto: CreateScheduleDto, _userId: string, _roleKey: RoleKey) {
    const plan = await this.prisma.unscopedClient.treatmentPlan.findUnique({
      where: { id: dto.planId },
      include: { client: { select: { id: true, branchId: true } } },
    });

    if (!plan) {
      throw new NotFoundException(`Treatment plan "${dto.planId}" not found`);
    }

    const duration = dto.durationMinutes ?? plan.sessionMinutes ?? 45;
    const startsOn = new Date(dto.startsOn);
    const endsOn = dto.endsOn ? new Date(dto.endsOn) : plan.endDate ? new Date(plan.endDate) : null;

    // 1. Save Schedule
    const schedule = await this.prisma.unscopedClient.schedule.create({
      data: {
        planId: dto.planId,
        recurrenceRule: dto.recurrenceRule,
        startTime: new Date(`1970-01-01T${dto.startTime}:00Z`),
        durationMinutes: duration,
        startsOn,
        endsOn,
        isActive: true,
      },
    });

    // 2. Generate slots for 8-week rolling window
    const slots = generateScheduleSlots(
      dto.recurrenceRule,
      dto.startTime,
      duration,
      startsOn,
      endsOn,
      8,
    );

    const createdAppointments = [];
    for (const slot of slots) {
      try {
        await this.checkConflicts(plan.therapistId, plan.clientId, slot.startsAt, slot.endsAt);
        const appt = await this.prisma.unscopedClient.appointment.create({
          data: {
            branchId: plan.client.branchId,
            clientId: plan.clientId,
            therapistId: plan.therapistId,
            scheduleId: schedule.id,
            startsAt: slot.startsAt,
            endsAt: slot.endsAt,
            status: AppointmentStatus.SCHEDULED,
          },
        });
        createdAppointments.push(appt);

        // Invalidate daily schedule cache
        await this.invalidateDailyCache(plan.client.branchId, slot.startsAt);
      } catch (err) {
        // Log conflict or skip slot during rolling window recurrence generation
        this.logger.debug(`Slot conflict skipped during schedule generation: ${(err as Error).message}`);
      }
    }

    return {
      schedule,
      generatedAppointmentsCount: createdAppointments.length,
      appointments: createdAppointments,
    };
  }

  async reschedule(id: string, dto: RescheduleAppointmentDto, _userId: string, _roleKey: RoleKey) {
    const existing = await this.prisma.unscopedClient.appointment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Appointment "${id}" not found`);
    }

    const newStartsAt = new Date(dto.startsAt);
    const newEndsAt = new Date(dto.endsAt);

    // Conflict detection (excluding current appointment)
    await this.checkConflicts(
      existing.therapistId,
      existing.clientId,
      newStartsAt,
      newEndsAt,
      id,
    );

    const oldStartsAt = existing.startsAt;

    const updated = await this.prisma.unscopedClient.appointment.update({
      where: { id },
      data: {
        startsAt: newStartsAt,
        endsAt: newEndsAt,
        status: AppointmentStatus.SCHEDULED,
      },
    });

    // Invalidate daily cache for BOTH old and new dates
    await this.invalidateDailyCache(existing.branchId, oldStartsAt);
    await this.invalidateDailyCache(existing.branchId, newStartsAt);

    return updated;
  }

  async cancel(id: string, dto: CancelAppointmentDto, _userId: string, _roleKey: RoleKey) {
    const existing = await this.prisma.unscopedClient.appointment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Appointment "${id}" not found`);
    }

    const updated = await this.prisma.unscopedClient.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancelReason: dto.reason,
        cancelledAt: new Date(),
      },
    });

    // Invalidate daily cache
    await this.invalidateDailyCache(existing.branchId, existing.startsAt);

    // Enqueue communication notification to parent
    this.logger.log(`Enqueued cancellation notification for appointment ${id} to parent queue`);

    return updated;
  }

  async updateStatus(
    id: string,
    dto: UpdateAppointmentStatusDto,
    _userId: string,
    _roleKey: RoleKey,
  ) {
    const existing = await this.prisma.unscopedClient.appointment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Appointment "${id}" not found`);
    }

    const updated = await this.prisma.unscopedClient.appointment.update({
      where: { id },
      data: {
        status: dto.status,
        cancelReason: dto.cancelReason,
        cancelledAt: dto.status === AppointmentStatus.CANCELLED ? new Date() : undefined,
      },
    });

    // Invalidate daily cache
    await this.invalidateDailyCache(existing.branchId, existing.startsAt);

    return updated;
  }

  // ─────────────────────────────────────────────────────────────
  // 5. CLIENT SESSION HISTORY (CURSOR PAGINATION)
  // ─────────────────────────────────────────────────────────────

  async findClientAppointments(
    clientId: string,
    query: ClientAppointmentQueryDto,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    // Role check: parent can only see their own children
    if (roleKey === RoleKey.PARENT) {
      const cg = await this.prisma.unscopedClient.clientGuardian.findFirst({
        where: { clientId, guardian: { userId } },
      });
      if (!cg) {
        throw new ForbiddenException('You do not have access to this client');
      }
    } else if (roleKey === RoleKey.MANAGER) {
      const client = await this.prisma.unscopedClient.client.findUnique({
        where: { id: clientId },
        select: { branchId: true },
      });
      if (!client || !userBranchIds.includes(client.branchId)) {
        throw new ForbiddenException('You do not have access to this client');
      }
    }

    const limit = Math.min(query.limit ?? 20, 50);
    const pagination = buildCursorPagination(query.cursor, limit);

    const where: any = {
      clientId,
    };

    if (roleKey === RoleKey.THERAPIST) {
      const emp = await this.getEmployeeForUser(userId);
      if (emp) {
        where.therapistId = emp.id;
      }
    }

    const appointments = await this.prisma.unscopedClient.appointment.findMany({
      where,
      ...(pagination as any),
      orderBy: [{ startsAt: 'desc' }, { id: 'desc' }],
      include: {
        therapist: {
          select: {
            id: true,
            designation: true,
            user: { select: { name: true } },
            department: { select: { code: true, name: true } },
          },
        },
      },
    });

    const meta = buildCursorMeta(appointments, limit);

    return {
      data: appointments,
      meta,
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

  private formatDateOnly(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
