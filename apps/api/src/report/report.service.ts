import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  RoleKey,
  ReportStatus,
} from '@petals/types';
import { PrismaService } from '../common/prisma';
import { CacheService } from '../common/redis';
import {
  buildOrderBy,
  buildOffsetPagination,
  buildOffsetMeta,
  buildCursorPagination,
  buildCursorMeta,
} from '../common/pagination';
import { StorageService } from './storage.service';
import {
  CreateReportDto,
  UpdateReportDto,
  ReportQueryDto,
  DueReportQueryDto,
  ReportActivityQueryDto,
  CreateDocumentDto,
  DocumentUploadUrlDto,
  DocumentQueryDto,
} from './dto';

const REPORT_SORT_FIELDS = ['createdAt', 'dueOn', 'title', 'status'] as const;
const DUE_REPORT_SORT_FIELDS = ['dueOn', 'createdAt', 'status'] as const;
const DOCUMENT_SORT_FIELDS = ['createdAt', 'title'] as const;

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly storage: StorageService,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // 1. CLIENT REPORTS
  // ─────────────────────────────────────────────────────────────

  async createReport(
    clientId: string,
    dto: CreateReportDto,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    if (roleKey === RoleKey.PARENT) {
      throw new ForbiddenException('Parents cannot create reports');
    }

    const client = await this.prisma.unscopedClient.client.findUnique({
      where: { id: clientId, deletedAt: null },
    });
    if (!client) {
      throw new NotFoundException(`Client "${clientId}" not found`);
    }

    if (roleKey !== RoleKey.DIRECTOR && !userBranchIds.includes(client.branchId)) {
      throw new ForbiddenException('You do not have access to this client branch');
    }

    // Resolve author (Employee)
    let authorId: string;
    const emp = await this.prisma.unscopedClient.employee.findUnique({
      where: { userId },
    });

    if (emp) {
      authorId = emp.id;
    } else {
      // If director or staff has no employee record, use first active employee in branch
      const fallbackEmp = await this.prisma.unscopedClient.employee.findFirst({
        where: { user: { branches: { some: { branchId: client.branchId } } } },
      });
      if (!fallbackEmp) {
        throw new BadRequestException('No employee record found for report author');
      }
      authorId = fallbackEmp.id;
    }

    return this.prisma.unscopedClient.report.create({
      data: {
        clientId,
        authorId,
        type: dto.type,
        title: dto.title,
        content: dto.content,
        fileUrl: dto.fileUrl,
        dueOn: dto.dueOn ? new Date(dto.dueOn) : null,
        status: ReportStatus.DRAFT,
        sharedWithParent: false,
      },
      include: {
        author: { select: { id: true, employeeCode: true, user: { select: { id: true, name: true } } } },
        client: { select: { id: true, name: true, clientCode: true, branchId: true } },
      },
    });
  }

  async findClientReports(
    clientId: string,
    query: ReportQueryDto,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const client = await this.prisma.unscopedClient.client.findUnique({
      where: { id: clientId, deletedAt: null },
    });
    if (!client) {
      throw new NotFoundException(`Client "${clientId}" not found`);
    }

    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const { skip, take } = buildOffsetPagination(page, pageSize);
    const orderBy = buildOrderBy(query.sort, REPORT_SORT_FIELDS);

    const where: any = {
      clientId,
      deletedAt: null,
    };

    if (query.type) {
      where.type = query.type;
    }
    if (query.status) {
      where.status = query.status;
    }

    // Role-based visibility
    if (roleKey === RoleKey.PARENT) {
      // Parents only see reports marked as shared for their children
      const cg = await this.prisma.unscopedClient.clientGuardian.findFirst({
        where: { clientId, guardian: { userId } },
      });
      if (!cg) {
        throw new ForbiddenException('You do not have access to this client');
      }
      where.sharedWithParent = true;
    } else if (roleKey === RoleKey.THERAPIST) {
      // Therapists only see their own cases
      const emp = await this.prisma.unscopedClient.employee.findUnique({
        where: { userId },
      });
      if (emp) {
        where.authorId = emp.id;
      }
    } else if (roleKey === RoleKey.MANAGER) {
      if (!userBranchIds.includes(client.branchId)) {
        throw new ForbiddenException('You do not have access to this client branch');
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.unscopedClient.report.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          author: { select: { id: true, employeeCode: true, user: { select: { id: true, name: true } } } },
        },
      }),
      this.prisma.unscopedClient.report.count({ where }),
    ]);

    return {
      data: items,
      meta: buildOffsetMeta(total, page, pageSize),
    };
  }

  async getReportsSummary(
    clientId: string,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const client = await this.prisma.unscopedClient.client.findUnique({
      where: { id: clientId, deletedAt: null },
    });
    if (!client) {
      throw new NotFoundException(`Client "${clientId}" not found`);
    }

    const where: any = {
      clientId,
      deletedAt: null,
    };

    if (roleKey === RoleKey.PARENT) {
      const cg = await this.prisma.unscopedClient.clientGuardian.findFirst({
        where: { clientId, guardian: { userId } },
      });
      if (!cg) {
        throw new ForbiddenException('You do not have access to this client');
      }
      where.sharedWithParent = true;
    } else if (roleKey === RoleKey.THERAPIST) {
      const emp = await this.prisma.unscopedClient.employee.findUnique({
        where: { userId },
      });
      if (emp) {
        where.authorId = emp.id;
      }
    } else if (roleKey === RoleKey.MANAGER) {
      if (!userBranchIds.includes(client.branchId)) {
        throw new ForbiddenException('You do not have access to this client branch');
      }
    }

    // Counts per status in one single groupBy query
    const groups = await this.prisma.unscopedClient.report.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    });

    const summary: Record<string, number> = {
      [ReportStatus.DRAFT]: 0,
      [ReportStatus.SUBMITTED]: 0,
      [ReportStatus.REVIEWED]: 0,
      [ReportStatus.SHARED]: 0,
      total: 0,
    };

    for (const g of groups) {
      summary[g.status] = g._count._all;
      summary.total += g._count._all;
    }

    return summary;
  }

  async findReportById(
    id: string,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const report = await this.prisma.unscopedClient.report.findUnique({
      where: { id, deletedAt: null },
      include: {
        client: { select: { id: true, name: true, clientCode: true, branchId: true } },
        author: { select: { id: true, employeeCode: true, user: { select: { id: true, name: true } } } },
      },
    });

    if (!report) {
      throw new NotFoundException(`Report "${id}" not found`);
    }

    if (roleKey === RoleKey.PARENT) {
      if (!report.sharedWithParent) {
        throw new ForbiddenException('This report has not been shared with parents');
      }
      const cg = await this.prisma.unscopedClient.clientGuardian.findFirst({
        where: { clientId: report.clientId, guardian: { userId } },
      });
      if (!cg) {
        throw new ForbiddenException('You do not have access to this report');
      }
    } else if (roleKey === RoleKey.THERAPIST) {
      const emp = await this.prisma.unscopedClient.employee.findUnique({ where: { userId } });
      if (emp && report.authorId !== emp.id) {
        throw new ForbiddenException('You can only view your own cases');
      }
    } else if (roleKey === RoleKey.MANAGER) {
      if (!userBranchIds.includes(report.client.branchId)) {
        throw new ForbiddenException('You do not have access to this branch');
      }
    }

    return report;
  }

  async updateReport(
    id: string,
    dto: UpdateReportDto,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const report = await this.findReportById(id, userId, roleKey, userBranchIds);

    if (roleKey === RoleKey.PARENT) {
      throw new ForbiddenException('Parents cannot update reports');
    }

    // Therapist can only edit their own cases
    if (roleKey === RoleKey.THERAPIST) {
      const emp = await this.prisma.unscopedClient.employee.findUnique({ where: { userId } });
      if (emp && report.authorId !== emp.id) {
        throw new ForbiddenException('You can only update your own cases');
      }
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.fileUrl !== undefined) data.fileUrl = dto.fileUrl;
    if (dto.dueOn !== undefined) data.dueOn = dto.dueOn ? new Date(dto.dueOn) : null;
    if (dto.status !== undefined) {
      data.status = dto.status;
      if (dto.status === ReportStatus.SUBMITTED && !report.submittedAt) {
        data.submittedAt = new Date();
      }
      if (dto.status === ReportStatus.SHARED) {
        data.sharedWithParent = true;
      }
    }

    return this.prisma.unscopedClient.report.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, employeeCode: true, user: { select: { id: true, name: true } } } },
        client: { select: { id: true, name: true, clientCode: true, branchId: true } },
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 2. SHARE TRANSACTION (REPORT + AUDIT + ACTIVITY + NOTIFICATION)
  // ─────────────────────────────────────────────────────────────

  async shareReport(
    id: string,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    if (roleKey === RoleKey.PARENT) {
      throw new ForbiddenException('Parents cannot share reports');
    }

    await this.findReportById(id, userId, roleKey, userBranchIds);

    // One transaction: set shared, write audit, record activity, queue parent notification
    return this.prisma.$transaction(async (tx) => {
      // 1. Update Report status & shared flag
      const updatedReport = await tx.report.update({
        where: { id },
        data: {
          sharedWithParent: true,
          status: ReportStatus.SHARED,
        },
        include: {
          client: { select: { id: true, name: true, branchId: true } },
        },
      });

      // 2. Write Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'SHARE_REPORT',
          entity: 'Report',
          entityId: id,
          branchId: updatedReport.client.branchId,
          metadata: {
            clientId: updatedReport.clientId,
            clientName: updatedReport.client.name,
            reportTitle: updatedReport.title,
            sharedAt: new Date(),
          },
        },
      });

      // 3. Queue Parent Notification(s)
      const guardians = await tx.clientGuardian.findMany({
        where: { clientId: updatedReport.clientId },
        include: { guardian: { select: { userId: true, name: true } } },
      });

      const parentNotifications = [];
      for (const cg of guardians) {
        if (cg.guardian?.userId) {
          const notification = await tx.notification.create({
            data: {
              userId: cg.guardian.userId,
              type: 'REPORT_SHARED',
              title: 'New Clinical Report Available',
              body: `A new report "${updatedReport.title}" has been shared for ${updatedReport.client.name}.`,
              data: {
                reportId: id,
                clientId: updatedReport.clientId,
                reportType: updatedReport.type,
              },
            },
          });
          parentNotifications.push(notification);
        }
      }

      this.logger.log(`Report ${id} shared with ${parentNotifications.length} parent notification(s) queued.`);

      return {
        message: 'Report shared successfully with parent',
        report: updatedReport,
        notificationsQueued: parentNotifications.length,
      };
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 3. REPORT ACTIVITY TIMELINE (CURSOR PAGINATION)
  // ─────────────────────────────────────────────────────────────

  async getClientReportActivity(
    clientId: string,
    query: ReportActivityQueryDto,
    _userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const client = await this.prisma.unscopedClient.client.findUnique({
      where: { id: clientId, deletedAt: null },
    });
    if (!client) {
      throw new NotFoundException(`Client "${clientId}" not found`);
    }

    if (roleKey === RoleKey.MANAGER && !userBranchIds.includes(client.branchId)) {
      throw new ForbiddenException('You do not have access to this branch');
    }

    const limit = Math.min(query.limit ?? 20, 100);
    const pagination = buildCursorPagination(query.cursor, limit);

    // Find reports for this client to correlate audit logs
    const clientReports = await this.prisma.unscopedClient.report.findMany({
      where: { clientId },
      select: { id: true },
    });
    const reportIds = clientReports.map((r) => r.id);

    const where: any = {
      entity: 'Report',
      entityId: { in: reportIds },
    };

    const findArgs: any = {
      where,
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
      include: {
        user: { select: { id: true, name: true } },
      },
    };
    if ((pagination as any).cursor) {
      findArgs.cursor = (pagination as any).cursor;
      findArgs.skip = (pagination as any).skip;
    }

    const items = await this.prisma.unscopedClient.auditLog.findMany(findArgs);

    return {
      data: items,
      meta: buildCursorMeta(items, limit),
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 4. GLOBAL DUE REPORTS (DIRECTOR & MANAGER ONLY, OVERDUE DETECTION)
  // ─────────────────────────────────────────────────────────────

  async getDueReports(
    query: DueReportQueryDto,
    _userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    if (roleKey !== RoleKey.DIRECTOR && roleKey !== RoleKey.MANAGER) {
      throw new ForbiddenException('Only Director and Manager can access the global due reports dashboard');
    }

    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const { skip, take } = buildOffsetPagination(page, pageSize);
    const orderBy = buildOrderBy(query.sort, DUE_REPORT_SORT_FIELDS);

    const where: any = {
      deletedAt: null,
      status: { not: ReportStatus.SHARED },
      dueOn: { not: null },
    };

    if (roleKey === RoleKey.MANAGER) {
      where.client = { branchId: { in: userBranchIds } };
    } else if (query.branchId) {
      where.client = { branchId: query.branchId };
    }

    if (query.therapistId) {
      where.authorId = query.therapistId;
    }

    if (query.type) {
      where.type = query.type;
    }

    const now = new Date();
    if (query.overdueOnly) {
      where.dueOn = { lt: now };
    }

    const [items, total] = await Promise.all([
      this.prisma.unscopedClient.report.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          client: { select: { id: true, name: true, clientCode: true, branch: { select: { id: true, name: true, code: true } } } },
          author: { select: { id: true, employeeCode: true, user: { select: { id: true, name: true } } } },
        },
      }),
      this.prisma.unscopedClient.report.count({ where }),
    ]);

    const data = items.map((r) => {
      const isOverdue = r.dueOn ? new Date(r.dueOn) < now && r.status !== ReportStatus.SHARED : false;
      return {
        ...r,
        isOverdue,
      };
    });

    return {
      data,
      meta: buildOffsetMeta(total, page, pageSize),
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 5. DAILY JOB: REMINDERS FOR THERAPISTS WITH OVERDUE REPORTS
  // ─────────────────────────────────────────────────────────────

  async checkOverdueReportsAndNotify(): Promise<{ overdueCount: number; notificationsCreated: number }> {
    const now = new Date();

    const overdueReports = await this.prisma.unscopedClient.report.findMany({
      where: {
        dueOn: { lt: now },
        status: { not: ReportStatus.SHARED },
        deletedAt: null,
      },
      include: {
        author: { select: { id: true, userId: true, user: { select: { id: true, name: true } } } },
      },
    });

    // Group overdue reports by author userId
    const therapistMap = new Map<string, typeof overdueReports>();
    for (const r of overdueReports) {
      if (r.author?.userId) {
        const list = therapistMap.get(r.author.userId) || [];
        list.push(r);
        therapistMap.set(r.author.userId, list);
      }
    }

    let notificationsCreated = 0;
    for (const [authorUserId, reports] of therapistMap.entries()) {
      await this.prisma.unscopedClient.notification.create({
        data: {
          userId: authorUserId,
          type: 'OVERDUE_REPORTS_REMINDER',
          title: 'Overdue Clinical Reports Reminder',
          body: `You have ${reports.length} report(s) past due date requiring submission/completion.`,
          data: {
            overdueReportIds: reports.map((r) => r.id),
            count: reports.length,
          },
        },
      });
      notificationsCreated++;
    }

    this.logger.log(`Overdue check: found ${overdueReports.length} overdue reports, created ${notificationsCreated} reminders.`);
    return {
      overdueCount: overdueReports.length,
      notificationsCreated,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 6. DOCUMENTS (SIGNED URLS + 30 UPLOADS/HR LIMIT + SIZE/TYPE CHECKS)
  // ─────────────────────────────────────────────────────────────

  async generateDocumentUploadUrl(
    clientId: string,
    dto: DocumentUploadUrlDto,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    if (roleKey === RoleKey.PARENT) {
      throw new ForbiddenException('Parents cannot upload clinical documents');
    }

    const client = await this.prisma.unscopedClient.client.findUnique({
      where: { id: clientId, deletedAt: null },
    });
    if (!client) {
      throw new NotFoundException(`Client "${clientId}" not found`);
    }

    if (roleKey !== RoleKey.DIRECTOR && !userBranchIds.includes(client.branchId)) {
      throw new ForbiddenException('You do not have access to this client branch');
    }

    // Rate limit: 30 uploads per hour per user
    const rateKey = `rate:doc_upload:${userId}`;
    const currentCount = (await this.cacheService.get<number>(rateKey)) || 0;
    if (currentCount >= 30) {
      throw new BadRequestException('Document upload rate limit exceeded: maximum 30 uploads per hour');
    }

    // File type and size validation
    this.storage.validateFile(dto.fileType, dto.fileSizeBytes);

    await this.cacheService.set(rateKey, currentCount + 1, 3600);

    return this.storage.generateSignedUploadUrl(clientId, dto.fileName, dto.fileType);
  }

  async createDocument(
    clientId: string,
    dto: CreateDocumentDto,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    if (roleKey === RoleKey.PARENT) {
      throw new ForbiddenException('Parents cannot record documents');
    }

    const client = await this.prisma.unscopedClient.client.findUnique({
      where: { id: clientId, deletedAt: null },
    });
    if (!client) {
      throw new NotFoundException(`Client "${clientId}" not found`);
    }

    if (roleKey !== RoleKey.DIRECTOR && !userBranchIds.includes(client.branchId)) {
      throw new ForbiddenException('You do not have access to this client branch');
    }

    return this.prisma.unscopedClient.document.create({
      data: {
        clientId,
        uploadedById: userId,
        title: dto.title,
        fileUrl: dto.fileUrl,
        mimeType: dto.mimeType,
        sharedWithParent: dto.sharedWithParent ?? false,
      },
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
    });
  }

  async findClientDocuments(
    clientId: string,
    query: DocumentQueryDto,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const client = await this.prisma.unscopedClient.client.findUnique({
      where: { id: clientId, deletedAt: null },
    });
    if (!client) {
      throw new NotFoundException(`Client "${clientId}" not found`);
    }

    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const { skip, take } = buildOffsetPagination(page, pageSize);
    const orderBy = buildOrderBy(query.sort, DOCUMENT_SORT_FIELDS);

    const where: any = {
      clientId,
      deletedAt: null,
    };

    if (roleKey === RoleKey.PARENT) {
      const cg = await this.prisma.unscopedClient.clientGuardian.findFirst({
        where: { clientId, guardian: { userId } },
      });
      if (!cg) {
        throw new ForbiddenException('You do not have access to this client');
      }
      where.sharedWithParent = true;
    } else if (roleKey === RoleKey.MANAGER) {
      if (!userBranchIds.includes(client.branchId)) {
        throw new ForbiddenException('You do not have access to this client branch');
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.unscopedClient.document.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          uploadedBy: { select: { id: true, name: true } },
        },
      }),
      this.prisma.unscopedClient.document.count({ where }),
    ]);

    return {
      data: items,
      meta: buildOffsetMeta(total, page, pageSize),
    };
  }

  async getDocumentDownloadUrl(
    documentId: string,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const doc = await this.prisma.unscopedClient.document.findUnique({
      where: { id: documentId, deletedAt: null },
      include: {
        client: { select: { id: true, branchId: true } },
      },
    });

    if (!doc) {
      throw new NotFoundException(`Document "${documentId}" not found`);
    }

    if (roleKey === RoleKey.PARENT) {
      if (!doc.sharedWithParent) {
        throw new ForbiddenException('This document has not been shared with parents');
      }
      const cg = await this.prisma.unscopedClient.clientGuardian.findFirst({
        where: { clientId: doc.clientId, guardian: { userId } },
      });
      if (!cg) {
        throw new ForbiddenException('You do not have access to this document');
      }
    } else if (roleKey === RoleKey.MANAGER) {
      if (!userBranchIds.includes(doc.client.branchId)) {
        throw new ForbiddenException('You do not have access to this branch');
      }
    }

    return this.storage.generateSignedDownloadUrl(doc.fileUrl);
  }
}
