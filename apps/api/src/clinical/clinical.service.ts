import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  RoleKey,
  PlanStatus,
} from '@petals/types';
import { PrismaService } from '../common/prisma';
import {
  buildOrderBy,
  buildOffsetPagination,
  buildOffsetMeta,
  buildCursorPagination,
  buildCursorMeta,
} from '../common/pagination';
import { VersionService } from '../clinical-history/version.service';
import {
  CreateAssessmentDto,
  UpdateAssessmentDto,
  AssessmentQueryDto,
  CreateTreatmentPlanDto,
  UpdateTreatmentPlanDto,
  CreateGoalDto,
  UpdateGoalDto,
  CreateSubgoalDto,
  UpdateSubgoalDto,
  CreateProgressEntryDto,
  UpdateProgressEntryDto,
  ProgressEntryQueryDto,
} from './dto';

const ASSESSMENT_SORT_FIELDS = ['assessedOn', 'createdAt'] as const;

@Injectable()
export class ClinicalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly versionService: VersionService,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // CLIENT ACCESS CHECK & HELPERS
  // ─────────────────────────────────────────────────────────────

  /**
   * Validates client visibility according to role:
   * - Director: unrestricted access across all clients.
   * - Parent: access only to linked children; assessment tab requires canViewAssessment flag.
   * - Manager: access only to clients in assigned branches.
   * - Therapist: shared-client visibility (access to clients in assigned branches OR
   *   assigned treatment plans/appointments).
   */
  async checkClientReadAccess(
    clientId: string,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
    checkAssessmentTab = false,
  ) {
    const client = await this.prisma.unscopedClient.client.findUnique({
      where: { id: clientId },
      include: {
        guardians: {
          select: {
            canViewAssessment: true,
            guardian: { select: { userId: true } },
          },
        },
      },
    });

    if (!client || client.deletedAt) {
      throw new NotFoundException(`Client "${clientId}" not found`);
    }

    if (roleKey === RoleKey.DIRECTOR) {
      return client;
    }

    if (roleKey === RoleKey.PARENT) {
      const cg = client.guardians.find((g) => g.guardian.userId === userId);
      if (!cg) {
        throw new ForbiddenException('You do not have access to this client');
      }
      if (checkAssessmentTab && !cg.canViewAssessment) {
        throw new ForbiddenException('Parent is not permitted to view assessments for this client');
      }
      return client;
    }

    if (roleKey === RoleKey.MANAGER) {
      if (!userBranchIds.includes(client.branchId)) {
        throw new ForbiddenException('You do not have access to clients in this branch');
      }
      return client;
    }

    if (roleKey === RoleKey.THERAPIST) {
      // Shared client visibility: branch match OR assigned treatment plan/appointment
      if (userBranchIds.includes(client.branchId)) {
        return client;
      }

      // Check if therapist is assigned via treatment plan or appointment
      const emp = await this.getEmployeeForUser(userId);
      if (emp) {
        const assignedPlan = await this.prisma.unscopedClient.treatmentPlan.findFirst({
          where: { clientId, therapistId: emp.id },
          select: { id: true },
        });
        if (assignedPlan) {
          return client;
        }

        const assignedAppt = await this.prisma.unscopedClient.appointment.findFirst({
          where: { clientId, therapistId: emp.id },
          select: { id: true },
        });
        if (assignedAppt) {
          return client;
        }
      }

      throw new ForbiddenException('You do not have access to this client');
    }

    return client;
  }

  /**
   * Helper to retrieve Employee record for a given User ID.
   */
  async getEmployeeForUser(userId: string) {
    return this.prisma.unscopedClient.employee.findUnique({
      where: { userId },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 1. ASSESSMENTS
  // ─────────────────────────────────────────────────────────────

  async findAssessments(
    clientId: string,
    query: AssessmentQueryDto,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    await this.checkClientReadAccess(clientId, userId, roleKey, userBranchIds, true);

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const { skip, take } = buildOffsetPagination(page, pageSize);
    const orderBy = buildOrderBy(query.sort, ASSESSMENT_SORT_FIELDS);

    const where: any = {
      clientId,
      deletedAt: null,
    };

    const [items, total] = await Promise.all([
      this.prisma.unscopedClient.assessment.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          assessor: {
            select: {
              id: true,
              designation: true,
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
      this.prisma.unscopedClient.assessment.count({ where }),
    ]);

    return {
      data: items,
      meta: buildOffsetMeta(total, page, pageSize),
    };
  }

  async createAssessment(
    clientId: string,
    dto: CreateAssessmentDto,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    await this.checkClientReadAccess(clientId, userId, roleKey, userBranchIds);

    let assessorId = dto.assessorId;
    if (roleKey === RoleKey.DIRECTOR && assessorId) {
      const emp = await this.prisma.unscopedClient.employee.findUnique({
        where: { id: assessorId },
      });
      if (!emp) {
        throw new NotFoundException(`Assessor employee "${assessorId}" not found`);
      }
    } else {
      const emp = await this.getEmployeeForUser(userId);
      if (!emp) {
        throw new BadRequestException('Current user does not have an associated employee profile');
      }
      assessorId = emp.id;
    }

    return this.prisma.unscopedClient.assessment.create({
      data: {
        clientId,
        assessorId,
        assessedOn: new Date(dto.assessedOn),
        tool: dto.tool,
        observation: dto.observation,
        scores: dto.scores ?? undefined,
        summary: dto.summary,
      },
      include: {
        assessor: {
          select: {
            id: true,
            designation: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
  }

  async updateAssessment(
    id: string,
    dto: UpdateAssessmentDto,
    userId: string,
    roleKey: RoleKey,
  ) {
    const existing = await this.prisma.unscopedClient.assessment.findUnique({
      where: { id },
      include: { assessor: true },
    });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Assessment "${id}" not found`);
    }

    // Author-only editing for therapists; Director override
    if (roleKey !== RoleKey.DIRECTOR) {
      const emp = await this.getEmployeeForUser(userId);
      if (!emp || existing.assessorId !== emp.id) {
        throw new ForbiddenException('Therapists can only edit their own assessments');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      await this.versionService.recordEdit(
        {
          entityType: 'Assessment',
          entityId: id,
          previousContent: existing,
          changedById: userId,
          reason: 'Assessment updated',
        },
        tx,
      );

      return tx.assessment.update({
        where: { id },
        data: {
          assessedOn: dto.assessedOn ? new Date(dto.assessedOn) : undefined,
          tool: dto.tool,
          observation: dto.observation,
          scores: dto.scores ?? undefined,
          summary: dto.summary,
          assessorId: dto.assessorId,
        },
        include: {
          assessor: {
            select: {
              id: true,
              designation: true,
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });
    });
  }

  async deleteAssessment(id: string, userId: string, roleKey: RoleKey) {
    const existing = await this.prisma.unscopedClient.assessment.findUnique({
      where: { id },
    });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Assessment "${id}" not found`);
    }

    if (roleKey !== RoleKey.DIRECTOR) {
      const emp = await this.getEmployeeForUser(userId);
      if (!emp || existing.assessorId !== emp.id) {
        throw new ForbiddenException('Therapists can only delete their own assessments');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      await this.versionService.recordDelete(
        {
          entityType: 'Assessment',
          entityId: id,
          previousContent: existing,
          changedById: userId,
          reason: 'Assessment soft deleted',
        },
        tx,
      );

      return tx.assessment.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 2. TREATMENT PLANS
  // ─────────────────────────────────────────────────────────────

  async findTreatmentPlans(
    clientId: string,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    await this.checkClientReadAccess(clientId, userId, roleKey, userBranchIds);

    return this.prisma.unscopedClient.treatmentPlan.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      include: {
        department: { select: { id: true, name: true, code: true } },
        therapist: {
          select: {
            id: true,
            designation: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
  }

  async createTreatmentPlan(
    clientId: string,
    dto: CreateTreatmentPlanDto,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    await this.checkClientReadAccess(clientId, userId, roleKey, userBranchIds);

    const [dept, therapist] = await Promise.all([
      this.prisma.unscopedClient.department.findUnique({
        where: { id: dto.departmentId },
      }),
      this.prisma.unscopedClient.employee.findUnique({
        where: { id: dto.therapistId },
      }),
    ]);

    if (!dept) {
      throw new NotFoundException(`Department "${dto.departmentId}" not found`);
    }
    if (!therapist) {
      throw new NotFoundException(`Therapist employee "${dto.therapistId}" not found`);
    }

    return this.prisma.unscopedClient.treatmentPlan.create({
      data: {
        clientId,
        departmentId: dto.departmentId,
        therapistId: dto.therapistId,
        sessionsPerWeek: dto.sessionsPerWeek,
        sessionMinutes: dto.sessionMinutes ?? 45,
        feePerSession: dto.feePerSession,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: dto.status ?? PlanStatus.ACTIVE,
      },
      include: {
        department: { select: { id: true, name: true, code: true } },
        therapist: {
          select: {
            id: true,
            designation: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
  }

  async updateTreatmentPlan(
    id: string,
    dto: UpdateTreatmentPlanDto,
    userId: string,
    _roleKey: RoleKey,
  ) {
    const existing = await this.prisma.unscopedClient.treatmentPlan.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Treatment plan "${id}" not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      await this.versionService.recordEdit(
        {
          entityType: 'TreatmentPlan',
          entityId: id,
          previousContent: existing,
          changedById: userId,
          reason: 'Treatment plan updated',
        },
        tx,
      );

      return tx.treatmentPlan.update({
        where: { id },
        data: {
          departmentId: dto.departmentId,
          therapistId: dto.therapistId,
          sessionsPerWeek: dto.sessionsPerWeek,
          sessionMinutes: dto.sessionMinutes,
          feePerSession: dto.feePerSession,
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          endDate: dto.endDate ? new Date(dto.endDate) : undefined,
          status: dto.status,
        },
        include: {
          department: { select: { id: true, name: true, code: true } },
          therapist: {
            select: {
              id: true,
              designation: true,
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });
    });
  }

  async deleteTreatmentPlan(id: string, userId: string, _roleKey: RoleKey) {
    const existing = await this.prisma.unscopedClient.treatmentPlan.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Treatment plan "${id}" not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      await this.versionService.recordDelete(
        {
          entityType: 'TreatmentPlan',
          entityId: id,
          previousContent: existing,
          changedById: userId,
          reason: 'Treatment plan cancelled',
        },
        tx,
      );

      return tx.treatmentPlan.update({
        where: { id },
        data: { status: PlanStatus.CANCELLED },
      });
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 3. GOALS & SUBGOALS
  // ─────────────────────────────────────────────────────────────

  /**
   * Retrieves goals with nested active subgoals in a FIXED number of queries.
   * Single findMany with include: subgoals runs in exactly 2 queries regardless of goal count.
   */
  async findGoals(
    clientId: string,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    await this.checkClientReadAccess(clientId, userId, roleKey, userBranchIds);

    return this.prisma.unscopedClient.goal.findMany({
      where: {
        plan: { clientId },
        deletedAt: null,
      },
      include: {
        subgoals: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: [{ term: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async createGoal(
    planId: string,
    dto: CreateGoalDto,
    _userId: string,
    _roleKey: RoleKey,
  ) {
    const plan = await this.prisma.unscopedClient.treatmentPlan.findUnique({
      where: { id: planId },
    });
    if (!plan) {
      throw new NotFoundException(`Treatment plan "${planId}" not found`);
    }

    return this.prisma.unscopedClient.goal.create({
      data: {
        planId,
        term: dto.term,
        title: dto.title,
        baseline: dto.baseline,
        description: dto.description,
        status: dto.status,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
      },
      include: {
        subgoals: { where: { deletedAt: null } },
      },
    });
  }

  async updateGoal(id: string, dto: UpdateGoalDto, userId: string, _roleKey: RoleKey) {
    const existing = await this.prisma.unscopedClient.goal.findUnique({
      where: { id },
    });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Goal "${id}" not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      await this.versionService.recordEdit(
        {
          entityType: 'Goal',
          entityId: id,
          previousContent: existing,
          changedById: userId,
          reason: 'Goal updated',
        },
        tx,
      );

      return tx.goal.update({
        where: { id },
        data: {
          term: dto.term,
          title: dto.title,
          baseline: dto.baseline,
          description: dto.description,
          status: dto.status,
          targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
        },
      });
    });
  }

  async deleteGoal(id: string, userId: string, _roleKey: RoleKey) {
    const existing = await this.prisma.unscopedClient.goal.findUnique({
      where: { id },
    });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Goal "${id}" not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      await this.versionService.recordDelete(
        {
          entityType: 'Goal',
          entityId: id,
          previousContent: existing,
          changedById: userId,
          reason: 'Goal soft deleted',
        },
        tx,
      );

      return tx.goal.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });
  }

  async createSubgoal(
    goalId: string,
    dto: CreateSubgoalDto,
    _userId: string,
    _roleKey: RoleKey,
  ) {
    const goal = await this.prisma.unscopedClient.goal.findUnique({
      where: { id: goalId },
    });
    if (!goal || goal.deletedAt) {
      throw new NotFoundException(`Goal "${goalId}" not found`);
    }

    return this.prisma.unscopedClient.subgoal.create({
      data: {
        goalId,
        frequency: dto.frequency,
        description: dto.description,
        status: dto.status,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async updateSubgoal(
    id: string,
    dto: UpdateSubgoalDto,
    userId: string,
    _roleKey: RoleKey,
  ) {
    const existing = await this.prisma.unscopedClient.subgoal.findUnique({
      where: { id },
    });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Subgoal "${id}" not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      await this.versionService.recordEdit(
        {
          entityType: 'Subgoal',
          entityId: id,
          previousContent: existing,
          changedById: userId,
          reason: 'Subgoal updated',
        },
        tx,
      );

      return tx.subgoal.update({
        where: { id },
        data: {
          frequency: dto.frequency,
          description: dto.description,
          status: dto.status,
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        },
      });
    });
  }

  async deleteSubgoal(id: string, userId: string, _roleKey: RoleKey) {
    const existing = await this.prisma.unscopedClient.subgoal.findUnique({
      where: { id },
    });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Subgoal "${id}" not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      await this.versionService.recordDelete(
        {
          entityType: 'Subgoal',
          entityId: id,
          previousContent: existing,
          changedById: userId,
          reason: 'Subgoal soft deleted',
        },
        tx,
      );

      return tx.subgoal.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 4. PROGRESS ENTRIES
  // ─────────────────────────────────────────────────────────────

  /**
   * Retrieves progress entries with cursor pagination by entryDate.
   * Strictly never loads all progress entries in a single response.
   */
  async findProgressEntries(
    subgoalId: string,
    query: ProgressEntryQueryDto,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const subgoal = await this.prisma.unscopedClient.subgoal.findUnique({
      where: { id: subgoalId },
      include: {
        goal: {
          include: {
            plan: { select: { clientId: true } },
          },
        },
      },
    });

    if (!subgoal || subgoal.deletedAt) {
      throw new NotFoundException(`Subgoal "${subgoalId}" not found`);
    }

    const clientId = subgoal.goal.plan.clientId;
    await this.checkClientReadAccess(clientId, userId, roleKey, userBranchIds);

    const limit = Math.min(query.limit ?? 20, 50);
    const pagination = buildCursorPagination(query.cursor, limit);

    const where: any = {
      subgoalId,
      deletedAt: null,
    };

    const entries = await this.prisma.unscopedClient.progressEntry.findMany({
      where,
      ...(pagination as any),
      orderBy: [{ entryDate: 'desc' }, { id: 'desc' }],
      include: {
        author: {
          select: {
            id: true,
            designation: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    const meta = buildCursorMeta(entries, limit);

    return {
      data: entries,
      meta,
    };
  }

  async createProgressEntry(
    subgoalId: string,
    dto: CreateProgressEntryDto,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const subgoal = await this.prisma.unscopedClient.subgoal.findUnique({
      where: { id: subgoalId },
      include: {
        goal: {
          include: {
            plan: { select: { clientId: true } },
          },
        },
      },
    });

    if (!subgoal || subgoal.deletedAt) {
      throw new NotFoundException(`Subgoal "${subgoalId}" not found`);
    }

    const clientId = subgoal.goal.plan.clientId;
    await this.checkClientReadAccess(clientId, userId, roleKey, userBranchIds);

    let authorId: string;
    const emp = await this.getEmployeeForUser(userId);
    if (emp) {
      authorId = emp.id;
    } else if (roleKey === RoleKey.DIRECTOR) {
      // Find primary therapist for the treatment plan
      const plan = await this.prisma.unscopedClient.treatmentPlan.findUnique({
        where: { id: subgoal.goal.planId },
      });
      if (plan) {
        authorId = plan.therapistId;
      } else {
        throw new BadRequestException('Employee author required for progress entry');
      }
    } else {
      throw new BadRequestException('Current user does not have an associated employee profile');
    }

    return this.prisma.unscopedClient.progressEntry.create({
      data: {
        subgoalId,
        authorId,
        entryDate: new Date(dto.entryDate),
        description: dto.description,
        response: dto.response,
        remarks: dto.remarks,
        level: dto.level,
        appointmentId: dto.appointmentId,
      },
      include: {
        author: {
          select: {
            id: true,
            designation: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
  }

  async updateProgressEntry(
    id: string,
    dto: UpdateProgressEntryDto,
    userId: string,
    roleKey: RoleKey,
  ) {
    const existing = await this.prisma.unscopedClient.progressEntry.findUnique({
      where: { id },
      include: { author: true },
    });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Progress entry "${id}" not found`);
    }

    // Author-only editing for therapists; Director override
    if (roleKey !== RoleKey.DIRECTOR) {
      const emp = await this.getEmployeeForUser(userId);
      if (!emp || existing.authorId !== emp.id) {
        throw new ForbiddenException('Therapists can only edit their own progress entries');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      await this.versionService.recordEdit(
        {
          entityType: 'ProgressEntry',
          entityId: id,
          previousContent: existing,
          changedById: userId,
          reason: 'Progress entry updated',
        },
        tx,
      );

      return tx.progressEntry.update({
        where: { id },
        data: {
          entryDate: dto.entryDate ? new Date(dto.entryDate) : undefined,
          description: dto.description,
          response: dto.response,
          remarks: dto.remarks,
          level: dto.level,
          appointmentId: dto.appointmentId,
        },
        include: {
          author: {
            select: {
              id: true,
              designation: true,
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });
    });
  }

  async deleteProgressEntry(id: string, userId: string, roleKey: RoleKey) {
    const existing = await this.prisma.unscopedClient.progressEntry.findUnique({
      where: { id },
    });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Progress entry "${id}" not found`);
    }

    if (roleKey !== RoleKey.DIRECTOR) {
      const emp = await this.getEmployeeForUser(userId);
      if (!emp || existing.authorId !== emp.id) {
        throw new ForbiddenException('Therapists can only delete their own progress entries');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      await this.versionService.recordDelete(
        {
          entityType: 'ProgressEntry',
          entityId: id,
          previousContent: existing,
          changedById: userId,
          reason: 'Progress entry soft deleted',
        },
        tx,
      );

      return tx.progressEntry.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });
  }
}
