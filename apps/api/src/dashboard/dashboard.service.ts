import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  RoleKey,
  AppointmentStatus,
  ClientStatus,
  InvoiceStatus,
  ReportStatus,
  LeadStage,
  PlanStatus,
} from '@petals/types';
import { PrismaService } from '../common/prisma';
import { CacheService } from '../common/redis';
import { IRequestContext } from '../common/context/request-context';
import { DashboardQueryDto } from './dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Main dashboard dispatcher: routes caller to the appropriate role dashboard.
   */
  async getDashboard(query: DashboardQueryDto, user: IRequestContext) {
    switch (user.roleKey) {
      case RoleKey.DIRECTOR:
        return this.getDirectorDashboard(query);
      case RoleKey.MANAGER:
        return this.getManagerDashboard(query, user);
      case RoleKey.THERAPIST:
        return this.getTherapistDashboard(user);
      case RoleKey.PARENT:
        return this.getParentDashboard(user);
      default:
        throw new ForbiddenException('Invalid role for dashboard access');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 1. DIRECTOR DASHBOARD
  // ─────────────────────────────────────────────────────────────

  private async getDirectorDashboard(query: DashboardQueryDto) {
    const branchKey = query.branchId && query.branchId !== 'ALL' ? query.branchId : 'all';
    const cacheKey = `dashboard:branch:${branchKey}:director`;

    // 1. Check cache (TTL 60s)
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const { todayStart, todayEnd, weekStart, monthStart, todayDate } = this.getDateWindows();
    const branchFilter = branchKey !== 'all' ? { branchId: branchKey } : {};
    const invoiceBranchFilter = branchKey !== 'all' ? { invoice: { branchId: branchKey } } : {};

    // 2. Parallel fixed aggregate queries
    const [
      attendedCount,
      cancelledCount,
      scheduledCount,
      activeClientsCount,
      todayPayments,
      weekPayments,
      monthPayments,
      pendingInvoices,
      overdueReportsCount,
      staffPresentCount,
      newLeadsCount,
      topLeads,
    ] = await Promise.all([
      // Sessions today
      this.prisma.unscopedClient.appointment.count({
        where: {
          ...branchFilter,
          startsAt: { gte: todayStart, lte: todayEnd },
          status: AppointmentStatus.ATTENDED,
        },
      }),
      this.prisma.unscopedClient.appointment.count({
        where: {
          ...branchFilter,
          startsAt: { gte: todayStart, lte: todayEnd },
          status: AppointmentStatus.CANCELLED,
        },
      }),
      this.prisma.unscopedClient.appointment.count({
        where: {
          ...branchFilter,
          startsAt: { gte: todayStart, lte: todayEnd },
          status: AppointmentStatus.SCHEDULED,
        },
      }),
      // Active clients
      this.prisma.unscopedClient.client.count({
        where: {
          ...branchFilter,
          status: ClientStatus.ACTIVE,
          deletedAt: null,
        },
      }),
      // Revenue today
      this.prisma.unscopedClient.payment.aggregate({
        where: {
          ...invoiceBranchFilter,
          paidAt: { gte: todayStart, lte: todayEnd },
        },
        _sum: { amount: true },
      }),
      // Revenue this week
      this.prisma.unscopedClient.payment.aggregate({
        where: {
          ...invoiceBranchFilter,
          paidAt: { gte: weekStart, lte: todayEnd },
        },
        _sum: { amount: true },
      }),
      // Revenue this month
      this.prisma.unscopedClient.payment.aggregate({
        where: {
          ...invoiceBranchFilter,
          paidAt: { gte: monthStart, lte: todayEnd },
        },
        _sum: { amount: true },
      }),
      // Pending payments
      this.prisma.unscopedClient.invoice.aggregate({
        where: {
          ...branchFilter,
          status: InvoiceStatus.PENDING,
        },
        _count: { id: true },
        _sum: { amount: true },
      }),
      // Overdue reports
      this.prisma.unscopedClient.report.count({
        where: {
          status: { in: [ReportStatus.DRAFT, ReportStatus.SUBMITTED] },
          dueOn: { lt: todayStart },
          deletedAt: null,
        },
      }),
      // Staff present today
      this.prisma.unscopedClient.attendanceRecord.count({
        where: {
          ...branchFilter,
          workDate: todayDate,
          checkIn: { not: null },
        },
      }),
      // New leads count
      this.prisma.unscopedClient.lead.count({
        where: {
          ...branchFilter,
          stage: LeadStage.NEW,
        },
      }),
      // Top 10 leads
      this.prisma.unscopedClient.lead.findMany({
        where: {
          ...branchFilter,
          stage: { in: [LeadStage.NEW, LeadStage.CONTACTED] },
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          stage: true,
          contact: true,
          createdAt: true,
        },
      }),
    ]);

    const totalTodaySessions = attendedCount + scheduledCount + cancelledCount;
    const utilisationDenominator = attendedCount + scheduledCount;
    const therapistUtilisation =
      utilisationDenominator > 0
        ? Number(((attendedCount / utilisationDenominator) * 100).toFixed(1))
        : 0;

    const result = {
      role: RoleKey.DIRECTOR,
      branchId: branchKey,
      todaySessions: {
        attended: attendedCount,
        cancelled: cancelledCount,
        scheduled: scheduledCount,
        total: totalTodaySessions,
      },
      activeClients: activeClientsCount,
      revenue: {
        today: Number(todayPayments._sum.amount || 0),
        thisWeek: Number(weekPayments._sum.amount || 0),
        thisMonth: Number(monthPayments._sum.amount || 0),
      },
      pendingPayments: {
        count: pendingInvoices._count.id,
        amount: Number(pendingInvoices._sum.amount || 0),
      },
      overdueReports: overdueReportsCount,
      staffPresent: staffPresentCount,
      therapistUtilisation,
      leads: {
        newCount: newLeadsCount,
        recent: topLeads,
        link: '/api/v1/leads',
      },
    };

    // Cache for 60 seconds
    await this.cacheService.set(cacheKey, result, 60);

    return result;
  }

  // ─────────────────────────────────────────────────────────────
  // 2. MANAGER DASHBOARD (OPERATIONAL VIEW WITHOUT P&L)
  // ─────────────────────────────────────────────────────────────

  private async getManagerDashboard(query: DashboardQueryDto, user: IRequestContext) {
    const userBranchIds = user.branchIds || [];
    const requestedBranchId = query.branchId && query.branchId !== 'ALL' ? query.branchId : undefined;

    const branchId = requestedBranchId || userBranchIds[0];
    if (requestedBranchId && !userBranchIds.includes(requestedBranchId)) {
      throw new ForbiddenException('You do not have access to this branch');
    }
    if (!branchId) {
      throw new ForbiddenException('Manager has no assigned branch');
    }

    const cacheKey = `dashboard:branch:${branchId}:manager`;
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const { todayStart, todayEnd, todayDate } = this.getDateWindows();
    const branchFilter = { branchId };

    // Operational view queries (STRICTLY NO P&L / REVENUE)
    const [
      attendedCount,
      cancelledCount,
      scheduledCount,
      activeClientsCount,
      pendingInvoicesCount,
      overdueReportsCount,
      staffPresentCount,
      newLeadsCount,
      topLeads,
    ] = await Promise.all([
      this.prisma.unscopedClient.appointment.count({
        where: {
          ...branchFilter,
          startsAt: { gte: todayStart, lte: todayEnd },
          status: AppointmentStatus.ATTENDED,
        },
      }),
      this.prisma.unscopedClient.appointment.count({
        where: {
          ...branchFilter,
          startsAt: { gte: todayStart, lte: todayEnd },
          status: AppointmentStatus.CANCELLED,
        },
      }),
      this.prisma.unscopedClient.appointment.count({
        where: {
          ...branchFilter,
          startsAt: { gte: todayStart, lte: todayEnd },
          status: AppointmentStatus.SCHEDULED,
        },
      }),
      this.prisma.unscopedClient.client.count({
        where: {
          ...branchFilter,
          status: ClientStatus.ACTIVE,
          deletedAt: null,
        },
      }),
      this.prisma.unscopedClient.invoice.count({
        where: {
          ...branchFilter,
          status: InvoiceStatus.PENDING,
        },
      }),
      this.prisma.unscopedClient.report.count({
        where: {
          client: { branchId },
          status: { in: [ReportStatus.DRAFT, ReportStatus.SUBMITTED] },
          dueOn: { lt: todayStart },
          deletedAt: null,
        },
      }),
      this.prisma.unscopedClient.attendanceRecord.count({
        where: {
          ...branchFilter,
          workDate: todayDate,
          checkIn: { not: null },
        },
      }),
      this.prisma.unscopedClient.lead.count({
        where: {
          ...branchFilter,
          stage: LeadStage.NEW,
        },
      }),
      this.prisma.unscopedClient.lead.findMany({
        where: {
          ...branchFilter,
          stage: { in: [LeadStage.NEW, LeadStage.CONTACTED] },
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          stage: true,
          contact: true,
          createdAt: true,
        },
      }),
    ]);

    const totalTodaySessions = attendedCount + scheduledCount + cancelledCount;
    const utilisationDenominator = attendedCount + scheduledCount;
    const therapistUtilisation =
      utilisationDenominator > 0
        ? Number(((attendedCount / utilisationDenominator) * 100).toFixed(1))
        : 0;

    const result = {
      role: RoleKey.MANAGER,
      branchId,
      todaySessions: {
        attended: attendedCount,
        cancelled: cancelledCount,
        scheduled: scheduledCount,
        total: totalTodaySessions,
      },
      activeClients: activeClientsCount,
      pendingPaymentsCount: pendingInvoicesCount, // Count only, NO revenue numbers
      overdueReports: overdueReportsCount,
      staffPresent: staffPresentCount,
      therapistUtilisation,
      leads: {
        newCount: newLeadsCount,
        recent: topLeads,
        link: '/api/v1/leads',
      },
    };

    await this.cacheService.set(cacheKey, result, 60);

    return result;
  }

  // ─────────────────────────────────────────────────────────────
  // 3. THERAPIST DASHBOARD (PER-USER, NOT SHARED IN BRANCH CACHE)
  // ─────────────────────────────────────────────────────────────

  private async getTherapistDashboard(user: IRequestContext) {
    const employee = await this.prisma.unscopedClient.employee.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    });

    if (!employee) {
      throw new NotFoundException('Therapist employee profile not found');
    }

    const { todayStart, todayEnd } = this.getDateWindows();
    const therapistId = employee.id;

    const [
      totalClientsCount,
      todayScheduleCount,
      todaySessions,
      pendingReportsCount,
      pendingReports,
    ] = await Promise.all([
      // Total active clients assigned to this therapist
      this.prisma.unscopedClient.treatmentPlan.findMany({
        where: {
          therapistId,
          status: PlanStatus.ACTIVE,
          client: { deletedAt: null },
        },
        select: { clientId: true },
        distinct: ['clientId'],
      }),
      // Today's schedule count
      this.prisma.unscopedClient.appointment.count({
        where: {
          therapistId,
          startsAt: { gte: todayStart, lte: todayEnd },
        },
      }),
      // Top 10 appointments today
      this.prisma.unscopedClient.appointment.findMany({
        where: {
          therapistId,
          startsAt: { gte: todayStart, lte: todayEnd },
        },
        take: 10,
        orderBy: { startsAt: 'asc' },
        select: {
          id: true,
          clientId: true,
          client: { select: { name: true, clientCode: true } },
          startsAt: true,
          endsAt: true,
          status: true,
          cancelReason: true,
        },
      }),
      // Pending reports count
      this.prisma.unscopedClient.report.count({
        where: {
          authorId: therapistId,
          status: { in: [ReportStatus.DRAFT, ReportStatus.SUBMITTED] },
          deletedAt: null,
        },
      }),
      // Top 10 pending reports
      this.prisma.unscopedClient.report.findMany({
        where: {
          authorId: therapistId,
          status: { in: [ReportStatus.DRAFT, ReportStatus.SUBMITTED] },
          deletedAt: null,
        },
        take: 10,
        orderBy: { dueOn: 'asc' },
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          dueOn: true,
          clientId: true,
          client: { select: { name: true, clientCode: true } },
        },
      }),
    ]);

    return {
      role: RoleKey.THERAPIST,
      totalClients: totalClientsCount.length,
      todayScheduleCount,
      todaySessions,
      pendingReportsCount,
      pendingReports: {
        items: pendingReports,
        link: '/api/v1/reports',
      },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 4. PARENT DASHBOARD (PER-USER, NOT SHARED IN BRANCH CACHE)
  // ─────────────────────────────────────────────────────────────

  private async getParentDashboard(user: IRequestContext) {
    const parentChildren = await this.prisma.unscopedClient.clientGuardian.findMany({
      where: { guardian: { userId: user.userId } },
      select: {
        clientId: true,
        client: {
          select: {
            id: true,
            name: true,
            clientCode: true,
          },
        },
      },
    });

    const childIds = parentChildren.map((pc) => pc.clientId);
    if (childIds.length === 0) {
      return {
        role: RoleKey.PARENT,
        children: [],
        totalSessions: 0,
        todaySessions: [],
        upcomingSessions: [],
      };
    }

    const { todayStart, todayEnd } = this.getDateWindows();

    const [totalSessionsCount, todaySessions, upcomingSessions] = await Promise.all([
      // Total attended sessions for their children
      this.prisma.unscopedClient.appointment.count({
        where: {
          clientId: { in: childIds },
          status: AppointmentStatus.ATTENDED,
        },
      }),
      // Today's sessions for children
      this.prisma.unscopedClient.appointment.findMany({
        where: {
          clientId: { in: childIds },
          startsAt: { gte: todayStart, lte: todayEnd },
        },
        orderBy: { startsAt: 'asc' },
        select: {
          id: true,
          clientId: true,
          client: { select: { name: true } },
          therapist: { select: { user: { select: { name: true } } } },
          startsAt: true,
          endsAt: true,
          status: true,
        },
      }),
      // Top 10 upcoming sessions
      this.prisma.unscopedClient.appointment.findMany({
        where: {
          clientId: { in: childIds },
          startsAt: { gt: todayEnd },
          status: AppointmentStatus.SCHEDULED,
        },
        take: 10,
        orderBy: { startsAt: 'asc' },
        select: {
          id: true,
          clientId: true,
          client: { select: { name: true } },
          therapist: { select: { user: { select: { name: true } } } },
          startsAt: true,
          endsAt: true,
          status: true,
        },
      }),
    ]);

    return {
      role: RoleKey.PARENT,
      children: parentChildren.map((pc) => pc.client),
      totalSessions: totalSessionsCount,
      todaySessions,
      upcomingSessions,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────

  private getDateWindows() {
    const now = new Date();
    const todayStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
    );
    const todayEnd = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999),
    );

    // Week start (Sunday)
    const dayOfWeek = now.getUTCDay();
    const weekStart = new Date(todayStart);
    weekStart.setUTCDate(weekStart.getUTCDate() - dayOfWeek);

    // Month start (1st of current month)
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));

    // Today Date object for attendanceRecord (Date type without time)
    const todayDate = new Date(`${todayStart.toISOString().split('T')[0]}T00:00:00.000Z`);

    return { todayStart, todayEnd, weekStart, monthStart, todayDate };
  }
}

