import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  BoardQueryDto,
  ConvertLeadDto,
  CreateLeadDto,
  LeadQueryDto,
  UpdateLeadDto,
} from './dto';
import { ClientStatus, LeadStage, RoleKey } from '@petals/types';
import {
  buildOffsetMeta,
  buildOffsetPagination,
  buildOrderBy,
} from '../common/pagination';
import { hashPassword } from '../common/crypto';

const LEAD_SORT_FIELDS = ['createdAt', 'updatedAt', 'name', 'nextFollowUp', 'stage'];

@Injectable()
export class LeadService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new lead: POST /leads
   */
  async create(
    dto: CreateLeadDto,
    _userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    if (roleKey !== RoleKey.DIRECTOR && !userBranchIds.includes(dto.branchId)) {
      throw new ForbiddenException('Cannot create lead in an unassigned branch');
    }

    if (dto.stage === LeadStage.CONVERTED) {
      throw new BadRequestException(
        'Cannot create a lead directly in CONVERTED stage. Use conversion flow.',
      );
    }

    const branch = await this.prisma.unscopedClient.branch.findUnique({
      where: { id: dto.branchId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch "${dto.branchId}" not found`);
    }

    if (dto.ownerId) {
      const owner = await this.prisma.unscopedClient.employee.findUnique({
        where: { id: dto.ownerId },
      });
      if (!owner) {
        throw new NotFoundException(`Owner employee "${dto.ownerId}" not found`);
      }
    }

    return this.prisma.unscopedClient.lead.create({
      data: {
        branchId: dto.branchId,
        name: dto.name,
        contact: dto.contact,
        childAge: dto.childAge,
        concern: dto.concern,
        source: dto.source,
        ownerId: dto.ownerId,
        stage: dto.stage ?? LeadStage.NEW,
        nextFollowUp: dto.nextFollowUp ? new Date(dto.nextFollowUp) : null,
        notes: dto.notes,
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        owner: { select: { id: true, employeeCode: true, user: { select: { name: true } } } },
      },
    });
  }

  /**
   * List leads with offset pagination: GET /leads
   */
  async findAll(
    query: LeadQueryDto,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const where: any = {};

    // Branch scoping
    if (roleKey !== RoleKey.DIRECTOR) {
      if (query.branchId) {
        if (!userBranchIds.includes(query.branchId)) {
          throw new ForbiddenException('Cannot access leads in an unassigned branch');
        }
        where.branchId = query.branchId;
      } else {
        where.branchId = { in: userBranchIds };
      }
    } else if (query.branchId) {
      where.branchId = query.branchId;
    }

    if (query.stage) {
      where.stage = query.stage;
    }

    if (query.ownerId) {
      where.ownerId = query.ownerId;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { contact: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const { skip, take } = buildOffsetPagination(page, pageSize);

    let sortParam = query.sort;
    if (sortParam?.includes(':')) {
      const [field, dir] = sortParam.split(':');
      sortParam = dir?.toLowerCase() === 'desc' ? `-${field}` : field;
    }
    const orderBy = buildOrderBy(sortParam, LEAD_SORT_FIELDS);

    const [total, leads] = await Promise.all([
      this.prisma.unscopedClient.lead.count({ where }),
      this.prisma.unscopedClient.lead.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          branch: { select: { id: true, name: true, code: true } },
          owner: { select: { id: true, employeeCode: true, user: { select: { name: true } } } },
          client: { select: { id: true, clientCode: true, name: true } },
        },
      }),
    ]);

    return {
      data: leads,
      meta: buildOffsetMeta(total, page, pageSize),
    };
  }

  /**
   * Kanban board with stage counts from single groupBy and first 20 cards per stage: GET /leads/board
   */
  async getBoard(
    query: BoardQueryDto,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const baseWhere: any = {};

    if (roleKey !== RoleKey.DIRECTOR) {
      if (query.branchId) {
        if (!userBranchIds.includes(query.branchId)) {
          throw new ForbiddenException('Cannot access leads in an unassigned branch');
        }
        baseWhere.branchId = query.branchId;
      } else {
        baseWhere.branchId = { in: userBranchIds };
      }
    } else if (query.branchId) {
      baseWhere.branchId = query.branchId;
    }

    const stages = [
      LeadStage.NEW,
      LeadStage.CONTACTED,
      LeadStage.ASSESSMENT_SCHEDULED,
      LeadStage.CONVERTED,
      LeadStage.LOST,
    ];

    // Single groupBy query for stage counts
    const stageCounts = await this.prisma.unscopedClient.lead.groupBy({
      by: ['stage'],
      where: baseWhere,
      _count: { _all: true },
    });

    const countMap: Record<LeadStage, number> = {
      [LeadStage.NEW]: 0,
      [LeadStage.CONTACTED]: 0,
      [LeadStage.ASSESSMENT_SCHEDULED]: 0,
      [LeadStage.CONVERTED]: 0,
      [LeadStage.LOST]: 0,
    };
    for (const row of stageCounts) {
      countMap[row.stage as LeadStage] = row._count._all;
    }

    const limit = query.limitPerColumn ?? 20;

    // If loading more for a single column:
    if (query.stage) {
      const stageWhere: any = { ...baseWhere, stage: query.stage };
      const findArgs: any = {
        where: stageWhere,
        take: limit + 1,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        include: {
          owner: { select: { id: true, employeeCode: true, user: { select: { name: true } } } },
          branch: { select: { id: true, name: true, code: true } },
          client: { select: { id: true, clientCode: true } },
        },
      };

      if (query.cursor) {
        findArgs.cursor = { id: query.cursor };
        findArgs.skip = 1;
      }

      const items = await this.prisma.unscopedClient.lead.findMany(findArgs);
      const hasMore = items.length > limit;
      const data = hasMore ? items.slice(0, limit) : items;
      const nextCursor = hasMore ? data[data.length - 1].id : null;

      return {
        columns: [
          {
            stage: query.stage,
            totalCount: countMap[query.stage],
            items: data,
            nextCursor,
            hasMore,
          },
        ],
      };
    }

    // Default: fetch first 20 for all 5 stages in parallel
    const columnPromises = stages.map(async (stage) => {
      const items = await this.prisma.unscopedClient.lead.findMany({
        where: { ...baseWhere, stage },
        take: limit + 1,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        include: {
          owner: { select: { id: true, employeeCode: true, user: { select: { name: true } } } },
          branch: { select: { id: true, name: true, code: true } },
          client: { select: { id: true, clientCode: true } },
        },
      });

      const hasMore = items.length > limit;
      const data = hasMore ? items.slice(0, limit) : items;
      const nextCursor = hasMore ? data[data.length - 1].id : null;

      return {
        stage,
        totalCount: countMap[stage],
        items: data,
        nextCursor,
        hasMore,
      };
    });

    const columns = await Promise.all(columnPromises);
    return { columns };
  }

  /**
   * Find single lead by id: GET /leads/:id
   */
  async findOne(
    id: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const lead = await this.prisma.unscopedClient.lead.findUnique({
      where: { id },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        owner: { select: { id: true, employeeCode: true, user: { select: { name: true } } } },
        client: { select: { id: true, clientCode: true, name: true } },
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead "${id}" not found`);
    }

    if (roleKey !== RoleKey.DIRECTOR && !userBranchIds.includes(lead.branchId)) {
      throw new ForbiddenException('Cannot access lead in an unassigned branch');
    }

    return lead;
  }

  /**
   * Update lead: PATCH /leads/:id
   * Plain stage update to CONVERTED is strictly forbidden.
   */
  async update(
    id: string,
    dto: UpdateLeadDto,
    _userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const lead = await this.findOne(id, roleKey, userBranchIds);

    if (dto.stage === LeadStage.CONVERTED) {
      throw new BadRequestException(
        'Cannot set stage to CONVERTED directly. Use the conversion flow.',
      );
    }

    if (lead.stage === LeadStage.CONVERTED && dto.stage && (dto.stage as any) !== LeadStage.CONVERTED) {
      throw new BadRequestException('Cannot change stage of an already converted lead.');
    }

    if (dto.ownerId) {
      const owner = await this.prisma.unscopedClient.employee.findUnique({
        where: { id: dto.ownerId },
      });
      if (!owner) {
        throw new NotFoundException(`Owner employee "${dto.ownerId}" not found`);
      }
    }

    return this.prisma.unscopedClient.lead.update({
      where: { id },
      data: {
        name: dto.name,
        contact: dto.contact,
        childAge: dto.childAge,
        concern: dto.concern,
        source: dto.source,
        ownerId: dto.ownerId,
        nextFollowUp: dto.nextFollowUp !== undefined
          ? (dto.nextFollowUp ? new Date(dto.nextFollowUp) : null)
          : undefined,
        notes: dto.notes,
        stage: dto.stage,
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        owner: { select: { id: true, employeeCode: true, user: { select: { name: true } } } },
        client: { select: { id: true, clientCode: true } },
      },
    });
  }

  /**
   * Preview conversion draft prefilled from lead: GET /leads/:id/convert-preview
   */
  async getConvertPreview(
    id: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const lead = await this.findOne(id, roleKey, userBranchIds);

    if (lead.stage === LeadStage.CONVERTED || (lead as any).client) {
      throw new ConflictException('Lead has already been converted');
    }

    // Prefill estimated dob if childAge is known
    let dob: string | null = null;
    if (lead.childAge !== null && lead.childAge !== undefined && lead.childAge >= 0) {
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - lead.childAge;
      dob = `${birthYear}-01-01`;
    }

    // Prefill starting case history from concern and notes
    const caseHistoryParts: string[] = [];
    if (lead.source) {
      caseHistoryParts.push(`Source: ${lead.source}`);
    }
    if (lead.createdAt) {
      caseHistoryParts.push(`Enquiry Date: ${lead.createdAt.toISOString().slice(0, 10)}`);
    }
    if (lead.concern) {
      caseHistoryParts.push(`Concern: ${lead.concern}`);
    }
    if (lead.notes) {
      caseHistoryParts.push(`Notes: ${lead.notes}`);
    }

    return {
      leadId: lead.id,
      branchId: lead.branchId,
      name: lead.name,
      childAge: lead.childAge,
      dob,
      gender: null,
      caseHistory: caseHistoryParts.join('\n'),
      guardianName: null,
      guardianPhone: lead.contact,
      guardianWhatsApp: lead.contact,
      guardianEmail: null,
      guardianRelation: 'Parent',
    };
  }

  /**
   * Execute atomic lead conversion in one transaction: POST /leads/:id/convert
   */
  async convert(
    id: string,
    dto: ConvertLeadDto,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    // 1. Initial access check
    const initialLead = await this.prisma.unscopedClient.lead.findUnique({
      where: { id },
      include: { branch: true, client: true },
    });
    if (!initialLead) {
      throw new NotFoundException(`Lead "${id}" not found`);
    }

    if (roleKey !== RoleKey.DIRECTOR && !userBranchIds.includes(initialLead.branchId)) {
      throw new ForbiddenException('Cannot convert lead in an unassigned branch');
    }

    if (initialLead.stage === LeadStage.CONVERTED || initialLead.client) {
      throw new ConflictException('Lead has already been converted');
    }

    // 2. Atomic transaction
    return this.prisma.$transaction(async (tx) => {
      // Re-read lead with lock
      const lead = await tx.lead.findUnique({
        where: { id },
        include: { branch: true, client: true },
      });
      if (!lead) {
        throw new NotFoundException(`Lead "${id}" not found`);
      }
      if (lead.stage === LeadStage.CONVERTED || lead.client) {
        throw new ConflictException('Lead has already been converted');
      }

      // Generate unique branch client code
      const year = new Date().getFullYear();
      const count = await tx.client.count({
        where: { branchId: lead.branchId },
      });
      const clientCode = `${lead.branch.code}-${year}-${String(count + 1).padStart(4, '0')}`;

      // Create Client record linked to leadId
      const client = await tx.client.create({
        data: {
          branchId: lead.branchId,
          leadId: lead.id,
          clientCode,
          name: dto.name,
          dob: new Date(dto.dob),
          gender: dto.gender,
          caseHistory: dto.caseHistory,
          status: ClientStatus.ACTIVE,
        },
      });

      // Find or create PARENT user without sending login messages
      let parentUser = null;
      if (dto.guardianEmail) {
        parentUser = await tx.user.findUnique({
          where: { email: dto.guardianEmail.toLowerCase() },
        });
      }
      if (!parentUser && dto.guardianPhone) {
        parentUser = await tx.user.findFirst({
          where: { phone: dto.guardianPhone },
        });
      }

      if (!parentUser) {
        const parentRole = await tx.role.findUniqueOrThrow({
          where: { key: RoleKey.PARENT },
        });
        const pwd = 'ChangeMe123!';
        const passwordHash = await hashPassword(pwd);
        const userEmail = dto.guardianEmail
          ? dto.guardianEmail.toLowerCase()
          : `parent_${Date.now()}_${Math.floor(Math.random() * 10000)}@petals.local`;

        parentUser = await tx.user.create({
          data: {
            name: dto.guardianName,
            email: userEmail,
            phone: dto.guardianPhone,
            passwordHash,
            roleId: parentRole.id,
            isActive: true,
            branches: {
              create: { branchId: lead.branchId, isPrimary: true },
            },
          },
        });
      }

      // Find or create Guardian record
      let guardian = await tx.guardian.findUnique({
        where: { userId: parentUser.id },
      });
      if (!guardian) {
        guardian = await tx.guardian.create({
          data: {
            userId: parentUser.id,
            name: dto.guardianName,
            whatsappNo: dto.guardianWhatsApp || dto.guardianPhone,
            whatsappConsent: dto.guardianConsent ?? false,
            emailConsent: dto.guardianConsent ?? false,
            consentRecordedAt: dto.guardianConsent ? new Date() : undefined,
          },
        });
      }

      // Create ClientGuardian link with isPrimary = true
      await tx.clientGuardian.create({
        data: {
          clientId: client.id,
          guardianId: guardian.id,
          relation: dto.guardianRelation || 'Parent',
          isPrimary: true,
          canViewOverview: true,
          canViewPaymentPlan: true,
          canViewAssessment: false,
          canViewReports: false,
        },
      });

      // Update lead stage to CONVERTED
      await tx.lead.update({
        where: { id: lead.id },
        data: { stage: LeadStage.CONVERTED },
      });

      // Write AuditLog
      await tx.auditLog.create({
        data: {
          action: 'CONVERT_LEAD',
          entity: 'Lead',
          entityId: lead.id,
          userId,
          metadata: {
            clientId: client.id,
            clientCode: client.clientCode,
          },
        },
      });

      // Queue optional welcome/consent message only if consent was recorded
      if (dto.guardianConsent) {
        await tx.notification.create({
          data: {
            userId: parentUser.id,
            type: 'WELCOME_CONSENT',
            title: 'Welcome to Petals CDC',
            body: `Consent recorded. Welcome ${dto.guardianName}! Profile created for ${dto.name}.`,
            data: { clientId: client.id, leadId: lead.id },
          },
        });
      }

      return {
        client,
        leadId: lead.id,
        guardianId: guardian.id,
      };
    });
  }

  /**
   * Follow-up reminder job: check leads due today or overdue and notify owners
   */
  async checkFollowUpsAndNotify() {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const dueLeads = await this.prisma.unscopedClient.lead.findMany({
      where: {
        stage: {
          in: [
            LeadStage.NEW,
            LeadStage.CONTACTED,
            LeadStage.ASSESSMENT_SCHEDULED,
          ],
        },
        nextFollowUp: { lte: today, not: null },
      },
      include: {
        owner: { select: { id: true, userId: true } },
        branch: { select: { id: true, name: true } },
      },
    });

    let notifiedCount = 0;

    for (const lead of dueLeads) {
      let recipientUserId = (lead as any).owner?.userId;

      // If no owner assigned, find managers of the lead's branch
      if (!recipientUserId) {
        const managerUserBranch = await this.prisma.unscopedClient.userBranch.findFirst({
          where: {
            branchId: lead.branchId,
            user: { role: { key: RoleKey.MANAGER }, isActive: true },
          },
          select: { userId: true },
        });
        recipientUserId = managerUserBranch?.userId;
      }

      if (recipientUserId) {
        await this.prisma.unscopedClient.notification.create({
          data: {
            userId: recipientUserId,
            type: 'LEAD_FOLLOW_UP',
            title: 'Lead Follow-up Due',
            body: `Follow-up due for ${lead.name} (${lead.contact}). Stage: ${lead.stage}.`,
            data: { leadId: lead.id, branchId: lead.branchId },
          },
        });
        notifiedCount++;
      }
    }

    return {
      checked: dueLeads.length,
      notified: notifiedCount,
    };
  }
}
