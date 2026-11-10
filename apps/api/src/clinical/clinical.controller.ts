import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AppModule, PermissionAction, RoleKey } from '@petals/types';
import { CurrentUser, RequirePermission } from '../common/decorators';
import { NoStoreInterceptor } from '../client/no-store.interceptor';
import { ClinicalService } from './clinical.service';
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

@ApiTags('Clinical')
@ApiBearerAuth()
@Controller()
@UseInterceptors(NoStoreInterceptor)
export class ClinicalController {
  constructor(private readonly clinicalService: ClinicalService) {}

  // ─────────────────────────────────────────────────────────────
  // 1. ASSESSMENTS
  // ─────────────────────────────────────────────────────────────

  @Get('clients/:id/assessments')
  @RequirePermission(AppModule.PROFILE_ASSESSMENT, PermissionAction.VIEW)
  @ApiOperation({ summary: 'List client assessments with offset pagination' })
  async findAssessments(
    @Param('id', ParseUUIDPipe) clientId: string,
    @Query() query: AssessmentQueryDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.clinicalService.findAssessments(clientId, query, userId, roleKey, branchIds);
  }

  @Post('clients/:id/assessments')
  @RequirePermission(AppModule.PROFILE_ASSESSMENT, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Create a new assessment for client' })
  async createAssessment(
    @Param('id', ParseUUIDPipe) clientId: string,
    @Body() dto: CreateAssessmentDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.clinicalService.createAssessment(clientId, dto, userId, roleKey, branchIds);
  }

  @Put('assessments/:id')
  @RequirePermission(AppModule.PROFILE_ASSESSMENT, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Update assessment (author-only for therapists, Director override)' })
  async updateAssessment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssessmentDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
  ) {
    return this.clinicalService.updateAssessment(id, dto, userId, roleKey);
  }

  @Delete('assessments/:id')
  @RequirePermission(AppModule.PROFILE_ASSESSMENT, PermissionAction.DELETE)
  @ApiOperation({ summary: 'Soft delete assessment (author-only for therapists, Director override)' })
  async deleteAssessment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
  ) {
    return this.clinicalService.deleteAssessment(id, userId, roleKey);
  }

  // ─────────────────────────────────────────────────────────────
  // 2. TREATMENT PLANS
  // ─────────────────────────────────────────────────────────────

  @Get('clients/:id/treatment-plans')
  @RequirePermission(AppModule.PROFILE_PAYMENT_PLAN, PermissionAction.VIEW)
  @ApiOperation({ summary: 'List client treatment plans' })
  async findTreatmentPlans(
    @Param('id', ParseUUIDPipe) clientId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.clinicalService.findTreatmentPlans(clientId, userId, roleKey, branchIds);
  }

  @Post('clients/:id/treatment-plans')
  @RequirePermission(AppModule.PROFILE_PAYMENT_PLAN, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Create a treatment plan for client' })
  async createTreatmentPlan(
    @Param('id', ParseUUIDPipe) clientId: string,
    @Body() dto: CreateTreatmentPlanDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.clinicalService.createTreatmentPlan(clientId, dto, userId, roleKey, branchIds);
  }

  @Put('treatment-plans/:id')
  @RequirePermission(AppModule.PROFILE_PAYMENT_PLAN, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Update treatment plan' })
  async updateTreatmentPlan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTreatmentPlanDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
  ) {
    return this.clinicalService.updateTreatmentPlan(id, dto, userId, roleKey);
  }

  @Delete('treatment-plans/:id')
  @RequirePermission(AppModule.PROFILE_PAYMENT_PLAN, PermissionAction.DELETE)
  @ApiOperation({ summary: 'Cancel/Delete treatment plan' })
  async deleteTreatmentPlan(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
  ) {
    return this.clinicalService.deleteTreatmentPlan(id, userId, roleKey);
  }

  // ─────────────────────────────────────────────────────────────
  // 3. GOALS & SUBGOALS
  // ─────────────────────────────────────────────────────────────

  @Get('clients/:id/goals')
  @RequirePermission(AppModule.PROFILE_PROGRESS, PermissionAction.VIEW)
  @ApiOperation({ summary: 'List client goals with nested sub-goals in fixed query count' })
  async findGoals(
    @Param('id', ParseUUIDPipe) clientId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.clinicalService.findGoals(clientId, userId, roleKey, branchIds);
  }

  @Post('treatment-plans/:planId/goals')
  @RequirePermission(AppModule.PROFILE_PROGRESS, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Create a goal under a treatment plan' })
  async createGoal(
    @Param('planId', ParseUUIDPipe) planId: string,
    @Body() dto: CreateGoalDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
  ) {
    return this.clinicalService.createGoal(planId, dto, userId, roleKey);
  }

  @Put('goals/:id')
  @RequirePermission(AppModule.PROFILE_PROGRESS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Update goal' })
  async updateGoal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGoalDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
  ) {
    return this.clinicalService.updateGoal(id, dto, userId, roleKey);
  }

  @Delete('goals/:id')
  @RequirePermission(AppModule.PROFILE_PROGRESS, PermissionAction.DELETE)
  @ApiOperation({ summary: 'Soft delete goal' })
  async deleteGoal(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
  ) {
    return this.clinicalService.deleteGoal(id, userId, roleKey);
  }

  @Post('goals/:goalId/subgoals')
  @RequirePermission(AppModule.PROFILE_PROGRESS, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Create a subgoal under a goal' })
  async createSubgoal(
    @Param('goalId', ParseUUIDPipe) goalId: string,
    @Body() dto: CreateSubgoalDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
  ) {
    return this.clinicalService.createSubgoal(goalId, dto, userId, roleKey);
  }

  @Put('subgoals/:id')
  @RequirePermission(AppModule.PROFILE_PROGRESS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Update subgoal' })
  async updateSubgoal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubgoalDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
  ) {
    return this.clinicalService.updateSubgoal(id, dto, userId, roleKey);
  }

  @Delete('subgoals/:id')
  @RequirePermission(AppModule.PROFILE_PROGRESS, PermissionAction.DELETE)
  @ApiOperation({ summary: 'Soft delete subgoal' })
  async deleteSubgoal(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
  ) {
    return this.clinicalService.deleteSubgoal(id, userId, roleKey);
  }

  // ─────────────────────────────────────────────────────────────
  // 4. PROGRESS ENTRIES
  // ─────────────────────────────────────────────────────────────

  @Get('subgoals/:id/progress-entries')
  @RequirePermission(AppModule.PROFILE_PROGRESS, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Cursor-paginated progress entries by entry date' })
  async findProgressEntries(
    @Param('id', ParseUUIDPipe) subgoalId: string,
    @Query() query: ProgressEntryQueryDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.clinicalService.findProgressEntries(subgoalId, query, userId, roleKey, branchIds);
  }

  @Post('subgoals/:id/progress-entries')
  @RequirePermission(AppModule.PROFILE_PROGRESS, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Create a progress entry under a subgoal' })
  async createProgressEntry(
    @Param('id', ParseUUIDPipe) subgoalId: string,
    @Body() dto: CreateProgressEntryDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.clinicalService.createProgressEntry(subgoalId, dto, userId, roleKey, branchIds);
  }

  @Put('progress-entries/:id')
  @RequirePermission(AppModule.PROFILE_PROGRESS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Update progress entry (author-only for therapists, Director override)' })
  async updateProgressEntry(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProgressEntryDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
  ) {
    return this.clinicalService.updateProgressEntry(id, dto, userId, roleKey);
  }

  @Delete('progress-entries/:id')
  @RequirePermission(AppModule.PROFILE_PROGRESS, PermissionAction.DELETE)
  @ApiOperation({ summary: 'Soft delete progress entry (author-only for therapists, Director override)' })
  async deleteProgressEntry(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
  ) {
    return this.clinicalService.deleteProgressEntry(id, userId, roleKey);
  }
}
