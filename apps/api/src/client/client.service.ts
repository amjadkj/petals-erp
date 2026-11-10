import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { AppointmentStatus, ClientStatus, RoleKey, AppModule, PermissionAction } from '@petals/types';
import { PrismaService } from '../common/prisma';
import { buildOrderBy, buildOffsetPagination, buildOffsetMeta } from '../common/pagination';
import { hashPassword } from '../common/crypto';
import { AccessService } from '../access/access.service';
import { VersionService } from '../clinical-history/version.service';
import {
  CreateClientDto,
  UpdateClientDto,
  ClientQueryDto,
  CreateGuardianDto,
} from './dto';

const CLIENT_SORT_FIELDS = ['name', 'createdAt', 'clientCode', 'status', 'dob'] as const;

export const ALL_PROFILE_TABS = [
  'overview',
  'assessment',
  'payment_plan',
  'progress',
  'reports',
  'documents',
  'sessions',
] as const;

const TAB_MODULE_MAP: Record<string, AppModule> = {
  overview: AppModule.PROFILE_OVERVIEW,
  assessment: AppModule.PROFILE_ASSESSMENT,
  payment_plan: AppModule.PROFILE_PAYMENT_PLAN,
  progress: AppModule.PROFILE_PROGRESS,
  reports: AppModule.PROFILE_REPORTS,
  documents: AppModule.PROFILE_DOCUMENTS,
  sessions: AppModule.PROFILE_SESSIONS,
};

@Injectable()
export class ClientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: AccessService,
    private readonly versionService: VersionService,
  ) {}

  /**
   * Retrieves clients with offset pagination, filters, role scoping, and session counts.
   * Uses a single groupBy query for session counts to strictly avoid N+1 queries.
   */
  async findAll(
    query: ClientQueryDto,
    userId: string,
    _roleId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const { skip, take } = buildOffsetPagination(page, pageSize);
    const orderBy = buildOrderBy(query.sort, CLIENT_SORT_FIELDS);

    const where: any = {
      deletedAt: null,
    };

    // 1. Role Scoping
    if (roleKey === RoleKey.PARENT) {
      // Parent can only see their own children
      where.guardians = {
        some: {
          guardian: {
            userId,
          },
        },
      };
    } else if (roleKey === RoleKey.DIRECTOR) {
      if (query.branchId) {
        where.branchId = query.branchId;
      }
    } else if (roleKey === RoleKey.MANAGER) {
      // Manager can only see clients in assigned branches
      if (query.branchId) {
        if (!userBranchIds.includes(query.branchId)) {
          throw new ForbiddenException('You do not have access to this branch');
        }
        where.branchId = query.branchId;
      } else {
        where.branchId = { in: userBranchIds };
      }
    } else if (roleKey === RoleKey.THERAPIST) {
      // Therapist sees clients in their assigned branches and assigned treatment plans/appointments
      if (query.branchId) {
        if (!userBranchIds.includes(query.branchId)) {
          throw new ForbiddenException('You do not have access to this branch');
        }
        where.branchId = query.branchId;
      } else {
        where.branchId = { in: userBranchIds };
      }

      // Check if therapist has ASSIGNED scope
      const therapistEmp = await this.prisma.unscopedClient.employee.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (therapistEmp) {
        where.OR = [
          { plans: { some: { therapistId: therapistEmp.id } } },
          { appointments: { some: { therapistId: therapistEmp.id } } },
        ];
      }
    }

    // 2. Query Filters
    if (query.status) {
      where.status = query.status;
    }

    if (query.departmentId) {
      where.plans = {
        some: {
          departmentId: query.departmentId,
          status: 'ACTIVE',
        },
      };
    }

    if (query.therapistId) {
      where.plans = {
        some: {
          therapistId: query.therapistId,
          status: 'ACTIVE',
        },
      };
    }

    if (query.search) {
      const searchFilter = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { clientCode: { contains: query.search, mode: 'insensitive' } },
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchFilter }];
        delete where.OR;
      } else {
        where.OR = searchFilter;
      }
    }

    // 3. Query Database (page + total count)
    const [clients, total] = await Promise.all([
      this.prisma.unscopedClient.client.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          branchId: true,
          clientCode: true,
          name: true,
          dob: true,
          gender: true,
          status: true,
          caseHistory: true,
          createdAt: true,
          updatedAt: true,
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
              city: true,
            },
          },
          plans: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              department: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
              therapist: {
                select: {
                  id: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          guardians: {
            select: {
              relation: true,
              isPrimary: true,
              guardian: {
                select: {
                  id: true,
                  name: true,
                  whatsappNo: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.unscopedClient.client.count({ where }),
    ]);

    // 4. Batch Session Counts in ONE query (No N+1)
    const clientIds = clients.map((c) => c.id);
    const sessionCountsMap = new Map<string, { scheduled: number; attended: number }>();

    if (clientIds.length > 0) {
      const counts = await this.prisma.unscopedClient.appointment.groupBy({
        by: ['clientId', 'status'],
        where: {
          clientId: { in: clientIds },
          status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.ATTENDED] },
        },
        _count: { _all: true },
      });

      for (const row of counts) {
        const item = sessionCountsMap.get(row.clientId) || { scheduled: 0, attended: 0 };
        if (row.status === AppointmentStatus.SCHEDULED) {
          item.scheduled = row._count._all;
        } else if (row.status === AppointmentStatus.ATTENDED) {
          item.attended = row._count._all;
        }
        sessionCountsMap.set(row.clientId, item);
      }
    }

    // 5. Sanitize and attach session counts
    const sanitized = clients.map((c) => {
      const copy: any = { ...c };
      const counts = sessionCountsMap.get(c.id) || { scheduled: 0, attended: 0 };
      copy.scheduledSessionsCount = counts.scheduled;
      copy.attendedSessionsCount = counts.attended;

      // Manager field restriction: Manager gets administrative fields only (caseHistory stripped)
      if (roleKey === RoleKey.MANAGER) {
        delete copy.caseHistory;
      }

      return copy;
    });

    return {
      data: sanitized,
      meta: buildOffsetMeta(total, page, pageSize),
    };
  }

  /**
   * Creates a new client and optionally initial guardians.
   */
  async create(dto: CreateClientDto, isDirector: boolean, userBranchIds: string[]) {
    if (!isDirector && !userBranchIds.includes(dto.branchId)) {
      throw new ForbiddenException('Cannot create client in an unassigned branch');
    }

    const branch = await this.prisma.unscopedClient.branch.findUnique({
      where: { id: dto.branchId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with id "${dto.branchId}" not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      // Auto-generate client code if omitted
      let clientCode = dto.clientCode;
      if (!clientCode) {
        const year = new Date().getFullYear();
        const count = await tx.client.count({
          where: { branchId: dto.branchId },
        });
        clientCode = `${branch.code}-${year}-${String(count + 1).padStart(4, '0')}`;
      }

      const client = await tx.client.create({
        data: {
          branchId: dto.branchId,
          clientCode,
          name: dto.name,
          dob: new Date(dto.dob),
          gender: dto.gender,
          caseHistory: dto.caseHistory,
          status: dto.status ?? ClientStatus.ACTIVE,
        },
      });

      // Link initial guardians if provided
      if (dto.guardians && dto.guardians.length > 0) {
        for (const gDto of dto.guardians) {
          await this.createOrLinkGuardianInternal(tx, client.id, gDto, dto.branchId);
        }
      }

      return this.findByIdInternal(tx, client.id);
    });
  }

  /**
   * Header endpoint: GET /clients/:id
   * Returns small header with dynamically resolved allowedTabs.
   */
  async getHeader(
    id: string,
    userId: string,
    roleId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const client = await this.findClientWithAccessCheck(id, userId, roleKey, userBranchIds);

    const allowedTabs = await this.resolveAllowedTabs(client, userId, roleId, roleKey);

    return {
      id: client.id,
      clientCode: client.clientCode,
      name: client.name,
      dob: client.dob,
      gender: client.gender,
      status: client.status,
      branchId: client.branchId,
      branch: client.branch,
      allowedTabs,
    };
  }

  /**
   * Overview tab: GET /clients/:id/overview
   * Returns demographics, primary guardian, active plans, and caseHistory (unless Manager).
   */
  async getOverview(
    id: string,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const client = await this.findClientWithAccessCheck(id, userId, roleKey, userBranchIds);

    // Parent check: verify canViewOverview on ClientGuardian
    if (roleKey === RoleKey.PARENT) {
      const cg = client.guardians.find((g: any) => g.guardian.userId === userId);
      if (!cg || !cg.canViewOverview) {
        throw new ForbiddenException('Parent is not authorized to view the Overview tab for this client');
      }
    }

    const copy: any = { ...client };

    // Manager field restriction: strip caseHistory
    if (roleKey === RoleKey.MANAGER) {
      delete copy.caseHistory;
    }

    return copy;
  }

  /**
   * Guardians tab: GET /clients/:id/guardians
   */
  async getGuardians(
    id: string,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const client = await this.findClientWithAccessCheck(id, userId, roleKey, userBranchIds);
    return client.guardians;
  }

  /**
   * Adds or links a guardian to a client: POST /clients/:id/guardians
   * Supports multiple children per parent.
   */
  async addGuardian(
    clientId: string,
    dto: CreateGuardianDto,
    isDirector: boolean,
    userBranchIds: string[],
  ) {
    const client = await this.prisma.unscopedClient.client.findUnique({
      where: { id: clientId },
    });
    if (!client || client.deletedAt) {
      throw new NotFoundException(`Client "${clientId}" not found`);
    }

    if (!isDirector && !userBranchIds.includes(client.branchId)) {
      throw new ForbiddenException('Cannot modify client in an unassigned branch');
    }

    return this.prisma.$transaction(async (tx) => {
      const linked = await this.createOrLinkGuardianInternal(tx, clientId, dto, client.branchId);
      return linked;
    });
  }

  /**
   * Updates client: PUT /clients/:id
   */
  async update(
    id: string,
    dto: UpdateClientDto,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const isDirector = roleKey === RoleKey.DIRECTOR;
    const client = await this.prisma.unscopedClient.client.findUnique({
      where: { id },
    });
    if (!client || client.deletedAt) {
      throw new NotFoundException(`Client "${id}" not found`);
    }

    if (!isDirector && !userBranchIds.includes(client.branchId)) {
      throw new ForbiddenException('Cannot update client in an unassigned branch');
    }

    // Manager cannot edit clinical caseHistory
    if (roleKey === RoleKey.MANAGER && dto.caseHistory !== undefined) {
      delete dto.caseHistory;
    }

    return this.prisma.$transaction(async (tx) => {
      // Record version before update if caseHistory changed
      if (dto.caseHistory && dto.caseHistory !== client.caseHistory) {
        await this.versionService.recordEdit(
          {
            entityType: 'Client',
            entityId: id,
            previousContent: client,
            changedById: userId,
            reason: 'Case history updated',
          },
          tx,
        );
      }

      const updated = await tx.client.update({
        where: { id },
        data: {
          name: dto.name,
          dob: dto.dob ? new Date(dto.dob) : undefined,
          gender: dto.gender,
          caseHistory: dto.caseHistory,
          status: dto.status,
          branchId: dto.branchId,
        },
      });

      return updated;
    });
  }

  /**
   * Soft-deletes a client: DELETE /clients/:id
   */
  async remove(id: string, userId: string, roleKey: RoleKey, userBranchIds: string[]) {
    const isDirector = roleKey === RoleKey.DIRECTOR;
    const client = await this.prisma.unscopedClient.client.findUnique({
      where: { id },
    });
    if (!client || client.deletedAt) {
      throw new NotFoundException(`Client "${id}" not found`);
    }

    if (!isDirector && !userBranchIds.includes(client.branchId)) {
      throw new ForbiddenException('Cannot delete client in an unassigned branch');
    }

    return this.prisma.$transaction(async (tx) => {
      await this.versionService.recordDelete(
        {
          entityType: 'Client',
          entityId: id,
          previousContent: client,
          changedById: userId,
          reason: 'Client soft deleted',
        },
        tx,
      );

      return tx.client.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });
  }

  // ──────────────────────── Helper Methods ────────────────────────

  private async findClientWithAccessCheck(
    id: string,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const client = await this.prisma.unscopedClient.client.findUnique({
      where: { id },
      include: {
        branch: { select: { id: true, name: true, code: true, city: true } },
        plans: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            status: true,
            department: { select: { id: true, name: true, code: true } },
            therapist: {
              select: {
                id: true,
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
        guardians: {
          include: {
            guardian: {
              select: {
                id: true,
                name: true,
                whatsappNo: true,
                userId: true,
                user: { select: { id: true, email: true } },
              },
            },
          },
        },
      },
    });

    if (!client || client.deletedAt) {
      throw new NotFoundException(`Client "${id}" not found`);
    }

    // Role-based access check
    if (roleKey === RoleKey.PARENT) {
      const isMyChild = client.guardians.some((g) => g.guardian.userId === userId);
      if (!isMyChild) {
        throw new ForbiddenException('You do not have access to this client profile');
      }
    } else if (roleKey === RoleKey.MANAGER || roleKey === RoleKey.THERAPIST) {
      if (!userBranchIds.includes(client.branchId)) {
        throw new ForbiddenException('You do not have access to clients from this branch');
      }
    }

    return client;
  }

  private async resolveAllowedTabs(
    client: any,
    userId: string,
    roleId: string,
    roleKey: RoleKey,
  ): Promise<string[]> {
    if (roleKey === RoleKey.DIRECTOR) {
      return [...ALL_PROFILE_TABS];
    }

    if (roleKey === RoleKey.PARENT) {
      const cg = client.guardians.find((g: any) => g.guardian.userId === userId);
      if (!cg) {
        return [];
      }

      const tabs: string[] = [];
      if (cg.canViewOverview) tabs.push('overview');
      if (cg.canViewAssessment) tabs.push('assessment');
      if (cg.canViewPaymentPlan) tabs.push('payment_plan');
      if (cg.canViewReports) tabs.push('reports');
      return tabs;
    }

    // Manager / Therapist: check system permissions for each tab module
    const allowed: string[] = [];
    for (const tab of ALL_PROFILE_TABS) {
      const appModule = TAB_MODULE_MAP[tab];
      if (!appModule) continue;

      const perm = await this.accessService.resolvePermission(
        userId,
        roleId,
        roleKey,
        appModule,
        PermissionAction.VIEW,
      );

      if (perm.allowed) {
        allowed.push(tab);
      }
    }

    return allowed;
  }

  private async createOrLinkGuardianInternal(
    tx: any,
    clientId: string,
    dto: CreateGuardianDto,
    branchId: string,
  ) {
    // 1. Find or create Parent User
    let parentUser = await tx.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!parentUser) {
      const parentRole = await tx.role.findUniqueOrThrow({
        where: { key: RoleKey.PARENT },
      });
      const pwd = dto.password || 'ChangeMe123!';
      const passwordHash = await hashPassword(pwd);

      parentUser = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email.toLowerCase(),
          phone: dto.phone,
          passwordHash,
          roleId: parentRole.id,
          isActive: true,
          branches: {
            create: { branchId, isPrimary: true },
          },
        },
      });
    }

    // 2. Find or create Guardian record
    let guardian = await tx.guardian.findUnique({
      where: { userId: parentUser.id },
    });

    if (!guardian) {
      guardian = await tx.guardian.create({
        data: {
          userId: parentUser.id,
          name: dto.name,
          whatsappNo: dto.whatsappNo || dto.phone,
          whatsappConsent: dto.whatsappConsent ?? false,
          emailConsent: dto.emailConsent ?? false,
          consentRecordedAt:
            dto.whatsappConsent || dto.emailConsent ? new Date() : undefined,
        },
      });
    }

    // 3. Upsert ClientGuardian relationship
    const clientGuardian = await tx.clientGuardian.upsert({
      where: {
        clientId_guardianId: {
          clientId,
          guardianId: guardian.id,
        },
      },
      update: {
        relation: dto.relation,
        isPrimary: dto.isPrimary ?? false,
        canViewOverview: dto.canViewOverview ?? true,
        canViewAssessment: dto.canViewAssessment ?? false,
        canViewPaymentPlan: dto.canViewPaymentPlan ?? true,
        canViewReports: dto.canViewReports ?? false,
      },
      create: {
        clientId,
        guardianId: guardian.id,
        relation: dto.relation,
        isPrimary: dto.isPrimary ?? false,
        canViewOverview: dto.canViewOverview ?? true,
        canViewAssessment: dto.canViewAssessment ?? false,
        canViewPaymentPlan: dto.canViewPaymentPlan ?? true,
        canViewReports: dto.canViewReports ?? false,
      },
      include: {
        guardian: {
          select: {
            id: true,
            name: true,
            whatsappNo: true,
            user: { select: { id: true, email: true } },
          },
        },
      },
    });

    return clientGuardian;
  }

  private async findByIdInternal(tx: any, id: string) {
    return tx.client.findUnique({
      where: { id },
      include: {
        branch: { select: { id: true, name: true, code: true, city: true } },
        guardians: {
          include: {
            guardian: {
              select: {
                id: true,
                name: true,
                whatsappNo: true,
                user: { select: { id: true, email: true } },
              },
            },
          },
        },
      },
    });
  }
}
