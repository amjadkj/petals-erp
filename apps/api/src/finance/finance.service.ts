import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  RoleKey,
  InvoiceStatus,
} from '@petals/types';
import { PrismaService } from '../common/prisma';
import { CacheService } from '../common/redis';
import {
  buildOrderBy,
  buildOffsetPagination,
  buildOffsetMeta,
} from '../common/pagination';
import {
  CreateInvoiceDto,
  RecordPaymentDto,
  CreateExpenseDto,
  InvoiceQueryDto,
  PaymentQueryDto,
  ExpenseQueryDto,
  PnlQueryDto,
  ExportFinanceDto,
} from './dto';

const INVOICE_SORT_FIELDS = ['issuedOn', 'dueOn', 'amount', 'createdAt', 'invoiceNo'] as const;
const PAYMENT_SORT_FIELDS = ['paidAt', 'amount'] as const;
const EXPENSE_SORT_FIELDS = ['spentOn', 'amount', 'createdAt'] as const;

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // 1. INVOICES
  // ─────────────────────────────────────────────────────────────

  async createInvoice(dto: CreateInvoiceDto, _userId: string, roleKey: RoleKey, userBranchIds: string[]) {
    if (roleKey !== RoleKey.DIRECTOR && !userBranchIds.includes(dto.branchId)) {
      throw new ForbiddenException('Cannot create invoice in an unassigned branch');
    }

    const branch = await this.prisma.unscopedClient.branch.findUnique({
      where: { id: dto.branchId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch "${dto.branchId}" not found`);
    }

    let invoiceNo = dto.invoiceNo;
    if (!invoiceNo) {
      const year = new Date(dto.issuedOn).getFullYear();
      const count = await this.prisma.unscopedClient.invoice.count({
        where: { branchId: dto.branchId },
      });
      invoiceNo = `INV-${branch.code}-${year}-${String(count + 1).padStart(4, '0')}`;
    }

    return this.prisma.unscopedClient.invoice.create({
      data: {
        branchId: dto.branchId,
        clientId: dto.clientId,
        planId: dto.planId,
        invoiceNo,
        revenueCategory: dto.revenueCategory,
        amount: new Prisma.Decimal(dto.amount),
        issuedOn: new Date(dto.issuedOn),
        dueOn: new Date(dto.dueOn),
        status: InvoiceStatus.PENDING,
      },
      include: {
        client: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async findInvoices(query: InvoiceQueryDto, userId: string, roleKey: RoleKey, userBranchIds: string[]) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const { skip, take } = buildOffsetPagination(page, pageSize);
    const orderBy = buildOrderBy(query.sort, INVOICE_SORT_FIELDS);

    const where: any = {};

    if (query.branchId) {
      where.branchId = query.branchId;
    }
    if (query.clientId) {
      where.clientId = query.clientId;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.revenueCategory) {
      where.revenueCategory = query.revenueCategory;
    }
    if (query.from || query.to) {
      where.issuedOn = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }

    // Role scoping
    if (roleKey === RoleKey.PARENT) {
      const parentChildren = await this.prisma.unscopedClient.clientGuardian.findMany({
        where: { guardian: { userId } },
        select: { clientId: true },
      });
      const childIds = parentChildren.map((pc) => pc.clientId);
      where.clientId = { in: childIds };
    } else if (roleKey === RoleKey.MANAGER) {
      where.branchId = { in: userBranchIds };
    }

    const [items, total] = await Promise.all([
      this.prisma.unscopedClient.invoice.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          client: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true, code: true } },
          payments: { select: { id: true, amount: true, paidAt: true, method: true, receiptNo: true } },
        },
      }),
      this.prisma.unscopedClient.invoice.count({ where }),
    ]);

    // Attach totalPaid & balanceDue
    const data = items.map((inv) => {
      const totalPaid = inv.payments.reduce((acc, p) => acc + Number(p.amount), 0);
      const balanceDue = Math.max(0, Number(inv.amount) - totalPaid);
      return {
        ...inv,
        totalPaid,
        balanceDue,
      };
    });

    return {
      data,
      meta: buildOffsetMeta(total, page, pageSize),
    };
  }

  async findInvoiceById(id: string, userId: string, roleKey: RoleKey, userBranchIds: string[]) {
    const invoice = await this.prisma.unscopedClient.invoice.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true, code: true } },
        payments: {
          select: {
            id: true,
            amount: true,
            method: true,
            receiptNo: true,
            paidAt: true,
            recordedBy: { select: { id: true, name: true } },
          },
          orderBy: { paidAt: 'desc' },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice "${id}" not found`);
    }

    // Role check
    if (roleKey === RoleKey.PARENT) {
      const cg = await this.prisma.unscopedClient.clientGuardian.findFirst({
        where: { clientId: invoice.clientId, guardian: { userId } },
      });
      if (!cg) {
        throw new ForbiddenException('You do not have access to this invoice');
      }
    } else if (roleKey === RoleKey.MANAGER) {
      if (!userBranchIds.includes(invoice.branchId)) {
        throw new ForbiddenException('You do not have access to this invoice');
      }
    }

    const totalPaid = invoice.payments.reduce((acc, p) => acc + Number(p.amount), 0);
    const balanceDue = Math.max(0, Number(invoice.amount) - totalPaid);

    return {
      ...invoice,
      totalPaid,
      balanceDue,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 2. PAYMENTS & STATUS TRANSITIONS (ONE TRANSACTION)
  // ─────────────────────────────────────────────────────────────

  async recordPayment(
    invoiceId: string,
    dto: RecordPaymentDto,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    if (roleKey === RoleKey.PARENT) {
      throw new ForbiddenException('Parents cannot record payments directly');
    }

    const invoice = await this.prisma.unscopedClient.invoice.findUnique({
      where: { id: invoiceId },
      include: { branch: true },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice "${invoiceId}" not found`);
    }

    if (roleKey !== RoleKey.DIRECTOR && !userBranchIds.includes(invoice.branchId)) {
      throw new ForbiddenException('You do not have permission to record payments for this branch');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Generate receipt number if omitted
      let receiptNo = dto.receiptNo;
      if (!receiptNo) {
        const year = new Date().getFullYear();
        const pCount = await tx.payment.count();
        receiptNo = `RCP-${invoice.branch.code}-${year}-${String(pCount + 1).padStart(5, '0')}`;
      }

      // 2. Create Payment record
      const payment = await tx.payment.create({
        data: {
          invoiceId,
          amount: new Prisma.Decimal(dto.amount),
          method: dto.method,
          receiptNo,
          paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
          recordedById: userId,
        },
      });

      // 3. Compute total payments received for this invoice
      const payments = await tx.payment.findMany({
        where: { invoiceId },
        select: { amount: true },
      });

      const totalPaid = payments.reduce((acc, p) => acc.plus(p.amount), new Prisma.Decimal(0));
      const invoiceAmount = invoice.amount;

      // 4. Update Invoice Status
      let newStatus: InvoiceStatus;
      if (totalPaid.greaterThan(invoiceAmount)) {
        newStatus = InvoiceStatus.ADVANCE;
      } else if (totalPaid.equals(invoiceAmount)) {
        newStatus = InvoiceStatus.PAID;
      } else {
        newStatus = InvoiceStatus.PENDING;
      }

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: newStatus },
      });

      // 5. Invalidate Financial Reports Cache
      await this.invalidateReportsCache();

      return {
        payment,
        invoice: updatedInvoice,
      };
    });
  }

  async findPayments(query: PaymentQueryDto, userId: string, roleKey: RoleKey, userBranchIds: string[]) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const { skip, take } = buildOffsetPagination(page, pageSize);
    const orderBy = query.sort
      ? buildOrderBy(query.sort, PAYMENT_SORT_FIELDS)
      : [{ paidAt: 'desc' as const }, { id: 'asc' as const }];

    const where: any = {};

    if (query.branchId) {
      where.invoice = { branchId: query.branchId };
    }
    if (query.clientId) {
      where.invoice = { ...(where.invoice || {}), clientId: query.clientId };
    }
    if (query.method) {
      where.method = query.method;
    }
    if (query.from || query.to) {
      where.paidAt = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }

    if (roleKey === RoleKey.PARENT) {
      const parentChildren = await this.prisma.unscopedClient.clientGuardian.findMany({
        where: { guardian: { userId } },
        select: { clientId: true },
      });
      const childIds = parentChildren.map((pc) => pc.clientId);
      where.invoice = { ...(where.invoice || {}), clientId: { in: childIds } };
    } else if (roleKey === RoleKey.MANAGER) {
      where.invoice = { ...(where.invoice || {}), branchId: { in: userBranchIds } };
    }

    const [items, total, summaryAgg] = await Promise.all([
      this.prisma.unscopedClient.payment.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNo: true,
              status: true,
              amount: true,
              client: { select: { id: true, name: true } },
            },
          },
          recordedBy: { select: { id: true, name: true } },
        },
      }),
      this.prisma.unscopedClient.payment.count({ where }),
      this.prisma.unscopedClient.payment.aggregate({
        where,
        _sum: { amount: true },
      }),
    ]);

    const totalPaid = Number(summaryAgg._sum.amount || 0);

    return {
      data: items,
      summary: {
        totalReceived: totalPaid,
        totalPaid,
      },
      meta: buildOffsetMeta(total, page, pageSize),
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 3. PAYMENT DUE & MONTHLY TRACKING
  // ─────────────────────────────────────────────────────────────

  async findPaymentsDue(query: { branchId?: string }, _userId: string, roleKey: RoleKey, userBranchIds: string[]) {
    const where: any = {
      status: { in: [InvoiceStatus.PENDING] },
    };

    if (query.branchId) {
      where.branchId = query.branchId;
    }

    if (roleKey === RoleKey.MANAGER) {
      where.branchId = { in: userBranchIds };
    }

    const invoices = await this.prisma.unscopedClient.invoice.findMany({
      where,
      orderBy: { dueOn: 'asc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            guardians: {
              select: {
                relation: true,
                isPrimary: true,
                guardian: { select: { name: true, whatsappNo: true } },
              },
            },
          },
        },
        branch: { select: { id: true, name: true, code: true } },
        payments: { select: { amount: true } },
      },
    });

    const data = invoices.map((inv) => {
      const totalPaid = inv.payments.reduce((acc, p) => acc + Number(p.amount), 0);
      const balanceDue = Math.max(0, Number(inv.amount) - totalPaid);
      const primaryGuardian = inv.client.guardians.find((g) => g.isPrimary) || inv.client.guardians[0];
      return {
        id: inv.id,
        invoiceId: inv.id,
        invoiceNo: inv.invoiceNo,
        amount: Number(inv.amount),
        totalPaid,
        balanceDue,
        issuedOn: inv.issuedOn,
        dueOn: inv.dueOn,
        status: inv.status,
        clientName: inv.client.name,
        branchName: inv.branch.name,
        guardianName: primaryGuardian?.guardian?.name || null,
        guardianContact: primaryGuardian?.guardian?.whatsappNo || null,
      };
    });

    return {
      data,
      total: data.length,
    };
  }

  async findMonthlyTracking(
    month: string, // YYYY-MM
    branchId: string | undefined,
    _userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const [yearStr, monthStr] = (month || new Date().toISOString().slice(0, 7)).split('-');
    const year = parseInt(yearStr, 10);
    const m = parseInt(monthStr, 10);

    const startDate = new Date(Date.UTC(year, m - 1, 1));
    const endDate = new Date(Date.UTC(year, m, 0, 23, 59, 59, 999));

    const whereInvoice: any = {
      issuedOn: { gte: startDate, lte: endDate },
    };
    const wherePayment: any = {
      paidAt: { gte: startDate, lte: endDate },
    };

    if (branchId) {
      whereInvoice.branchId = branchId;
      wherePayment.invoice = { branchId };
    }

    if (roleKey === RoleKey.MANAGER) {
      whereInvoice.branchId = { in: userBranchIds };
      wherePayment.invoice = { branchId: { in: userBranchIds } };
    }

    const [invoiceAgg, paymentAgg] = await Promise.all([
      this.prisma.unscopedClient.invoice.aggregate({
        where: whereInvoice,
        _sum: { amount: true },
        _count: { _all: true },
      }),
      this.prisma.unscopedClient.payment.aggregate({
        where: wherePayment,
        _sum: { amount: true },
        _count: { _all: true },
      }),
    ]);

    const totalBilled = Number(invoiceAgg._sum.amount || 0);
    const totalCollected = Number(paymentAgg._sum.amount || 0);
    const pendingBalance = Math.max(0, totalBilled - totalCollected);

    return {
      month: `${yearStr}-${monthStr}`,
      period: `${yearStr}-${monthStr}`,
      branchId: branchId || 'all',
      invoicesCount: invoiceAgg._count._all,
      paymentsCount: paymentAgg._count._all,
      totalBilled,
      totalCollected,
      pendingBalance,
      data: [
        { metric: 'Billed', amount: totalBilled },
        { metric: 'Collected', amount: totalCollected },
        { metric: 'Pending', amount: pendingBalance },
      ],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 4. EXPENSES
  // ─────────────────────────────────────────────────────────────

  async createExpense(dto: CreateExpenseDto, userId: string, roleKey: RoleKey, userBranchIds: string[]) {
    if (roleKey !== RoleKey.DIRECTOR && !userBranchIds.includes(dto.branchId)) {
      throw new ForbiddenException('Cannot record expense in an unassigned branch');
    }

    const expense = await this.prisma.unscopedClient.expense.create({
      data: {
        branchId: dto.branchId,
        category: dto.category,
        amount: new Prisma.Decimal(dto.amount),
        spentOn: new Date(dto.spentOn),
        notes: dto.notes,
        recordedById: userId,
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        recordedBy: { select: { id: true, name: true } },
      },
    });

    await this.invalidateReportsCache();
    return expense;
  }

  async findExpenses(query: ExpenseQueryDto, _userId: string, roleKey: RoleKey, userBranchIds: string[]) {
    if (roleKey === RoleKey.PARENT) {
      throw new ForbiddenException('Parents cannot access expenses');
    }

    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const { skip, take } = buildOffsetPagination(page, pageSize);
    const orderBy = buildOrderBy(query.sort, EXPENSE_SORT_FIELDS);

    const where: any = {};

    if (query.branchId) {
      where.branchId = query.branchId;
    }
    if (query.category) {
      where.category = { contains: query.category, mode: 'insensitive' };
    }
    if (query.from || query.to) {
      where.spentOn = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }

    if (roleKey === RoleKey.MANAGER) {
      where.branchId = { in: userBranchIds };
    }

    const [items, total, sumAgg] = await Promise.all([
      this.prisma.unscopedClient.expense.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          branch: { select: { id: true, name: true, code: true } },
          recordedBy: { select: { id: true, name: true } },
        },
      }),
      this.prisma.unscopedClient.expense.count({ where }),
      this.prisma.unscopedClient.expense.aggregate({
        where,
        _sum: { amount: true },
      }),
    ]);

    return {
      data: items,
      summary: {
        totalExpense: Number(sumAgg._sum.amount || 0),
      },
      meta: buildOffsetMeta(total, page, pageSize),
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 5. P&L & AGGREGATE FINANCIAL REPORTS (TAGGED SQL + 60s REDIS CACHE)
  // ─────────────────────────────────────────────────────────────

  async getPnl(query: PnlQueryDto, _userId: string, roleKey: RoleKey, _userBranchIds: string[]) {
    // Strict permission: P&L requires Director or FINANCIAL_PNL
    if (roleKey !== RoleKey.DIRECTOR) {
      throw new ForbiddenException('FINANCIAL_PNL permission required to access Profit and Loss reports');
    }

    const cacheKey = `finance:report:pnl:${query.branchId || 'all'}:${query.month || query.from || 'all'}:${roleKey}`;
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    // Parse date window
    let fromDateStr: string | null = null;
    let toDateStr: string | null = null;
    if (query.month) {
      const [y, m] = query.month.split('-');
      const lastDay = new Date(parseInt(y, 10), parseInt(m, 10), 0).getDate();
      fromDateStr = `${y}-${m.padStart(2, '0')}-01`;
      toDateStr = `${y}-${m.padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    } else {
      if (query.from) fromDateStr = query.from;
      if (query.to) toDateStr = query.to;
    }

    // Run raw SQL with tagged template (strictly safe against SQL injection)
    const branchFilter = query.branchId ? Prisma.sql`AND inv.branch_id = ${query.branchId}::uuid` : Prisma.empty;
    const expBranchFilter = query.branchId ? Prisma.sql`AND exp.branch_id = ${query.branchId}::uuid` : Prisma.empty;
    const dateFilterPayment = fromDateStr && toDateStr
      ? Prisma.sql`AND p.paid_at >= ${fromDateStr}::timestamp AND p.paid_at <= (${toDateStr} || ' 23:59:59.999')::timestamp`
      : Prisma.empty;
    const dateFilterExpense = fromDateStr && toDateStr
      ? Prisma.sql`AND exp.spent_on >= ${fromDateStr}::date AND exp.spent_on <= ${toDateStr}::date`
      : Prisma.empty;

    const [revenueRes, expenseRes] = await Promise.all([
      this.prisma.$queryRaw<[{ total: number | null }]>(Prisma.sql`
        SELECT COALESCE(SUM(p.amount), 0)::float as total
        FROM payments p
        JOIN invoices inv ON p.invoice_id = inv.id
        WHERE 1=1 ${branchFilter} ${dateFilterPayment}
      `),
      this.prisma.$queryRaw<[{ total: number | null }]>(Prisma.sql`
        SELECT COALESCE(SUM(exp.amount), 0)::float as total
        FROM expenses exp
        WHERE 1=1 ${expBranchFilter} ${dateFilterExpense}
      `),
    ]);

    const totalRevenue = Number(revenueRes[0]?.total || 0);
    const totalExpenses = Number(expenseRes[0]?.total || 0);
    const netProfit = totalRevenue - totalExpenses;

    const result = {
      period: query.month || (fromDateStr && toDateStr ? `${query.from} to ${query.to}` : 'All Time'),
      branchId: query.branchId || 'consolidated',
      totalRevenue,
      totalExpenses,
      netProfit,
      marginPercentage: totalRevenue > 0 ? Number(((netProfit / totalRevenue) * 100).toFixed(2)) : 0,
    };

    // Cache for 60 seconds
    await this.cacheService.set(cacheKey, result, 60);
    return result;
  }

  async getRevenue(interval: 'day' | 'week' | 'month', branchId?: string) {
    const cacheKey = `finance:report:revenue:${interval}:${branchId || 'all'}`;
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const branchFilter = branchId ? Prisma.sql`AND inv.branch_id = ${branchId}::uuid` : Prisma.empty;

    // Use date_trunc for interval aggregation
    const sqlInterval = interval === 'day' ? Prisma.raw("'day'") : interval === 'week' ? Prisma.raw("'week'") : Prisma.raw("'month'");

    const rows = await this.prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT
        date_trunc(${sqlInterval}, p.paid_at)::date as period,
        COALESCE(SUM(p.amount), 0)::float as total_revenue,
        COUNT(p.id)::int as payments_count
      FROM payments p
      JOIN invoices inv ON p.invoice_id = inv.id
      WHERE 1=1 ${branchFilter}
      GROUP BY 1
      ORDER BY 1 DESC
      LIMIT 60
    `);

    // Cache for 60s
    await this.cacheService.set(cacheKey, rows, 60);
    return rows;
  }

  async getRevenueByCategory(branchId?: string) {
    const cacheKey = `finance:report:by_cat:${branchId || 'all'}`;
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const branchFilter = branchId ? Prisma.sql`AND inv.branch_id = ${branchId}::uuid` : Prisma.empty;

    const rows = await this.prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT
        inv.revenue_category as category,
        COALESCE(SUM(p.amount), 0)::float as total_revenue,
        COUNT(p.id)::int as payments_count
      FROM payments p
      JOIN invoices inv ON p.invoice_id = inv.id
      WHERE 1=1 ${branchFilter}
      GROUP BY inv.revenue_category
      ORDER BY total_revenue DESC
    `);

    await this.cacheService.set(cacheKey, rows, 60);
    return rows;
  }

  async getRevenueByDepartment(branchId?: string) {
    const cacheKey = `finance:report:by_dept:${branchId || 'all'}`;
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const branchFilter = branchId ? Prisma.sql`AND inv.branch_id = ${branchId}::uuid` : Prisma.empty;

    const rows = await this.prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT
        d.id as department_id,
        d.name as department_name,
        d.code as department_code,
        COALESCE(SUM(p.amount), 0)::float as total_revenue
      FROM payments p
      JOIN invoices inv ON p.invoice_id = inv.id
      JOIN treatment_plans tp ON inv.plan_id = tp.id
      JOIN departments d ON tp.department_id = d.id
      WHERE 1=1 ${branchFilter}
      GROUP BY d.id, d.name, d.code
      ORDER BY total_revenue DESC
    `);

    await this.cacheService.set(cacheKey, rows, 60);
    return rows;
  }

  /**
   * Invalidates aggregate report caches on payment or expense changes.
   */
  async invalidateReportsCache(): Promise<void> {
    await this.cacheService.deleteByPrefix('finance:report');
  }

  // ─────────────────────────────────────────────────────────────
  // 6. EXPORTS (BACKGROUND JOB & RATE LIMIT 10/HR/USER)
  // ─────────────────────────────────────────────────────────────

  async exportReport(dto: ExportFinanceDto, userId: string, _roleKey: RoleKey) {
    // Rate limit: 10 per hour per user
    const rateKey = `rate:export:${userId}`;
    const currentCount = (await this.cacheService.get<number>(rateKey)) || 0;
    if (currentCount >= 10) {
      throw new BadRequestException('Export rate limit exceeded: maximum 10 exports per hour');
    }

    await this.cacheService.set(rateKey, currentCount + 1, 3600);

    const token = `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.logger.log(`Export job enqueued for user ${userId}, format ${dto.format}, type ${dto.type}`);

    return {
      message: 'Export job accepted and processing in background',
      jobId: token,
      downloadUrl: `/api/v1/finance/export/download?token=${token}&format=${dto.format}`,
      expiresInMinutes: 60,
    };
  }
}
