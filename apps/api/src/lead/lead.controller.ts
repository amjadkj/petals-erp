import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { LeadService } from './lead.service';
import {
  BoardQueryDto,
  ConvertLeadDto,
  CreateLeadDto,
  LeadQueryDto,
  UpdateLeadDto,
} from './dto';
import { CurrentUser, RequirePermission, Roles } from '../common/decorators';
import { NoStoreInterceptor } from '../client/no-store.interceptor';
import { AppModule, PermissionAction, RoleKey } from '@petals/types';

@Controller('leads')
@UseInterceptors(NoStoreInterceptor)
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  /**
   * Create lead: POST /leads
   */
  @Post()
  @RequirePermission(AppModule.LEADS, PermissionAction.CREATE)
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER)
  create(
    @Body() dto: CreateLeadDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.leadService.create(
      dto,
      userId,
      roleKey,
      branchIds,
    );
  }

  /**
   * List leads: GET /leads
   */
  @Get()
  @RequirePermission(AppModule.LEADS, PermissionAction.VIEW)
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER)
  findAll(
    @Query() query: LeadQueryDto,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.leadService.findAll(
      query,
      roleKey,
      branchIds,
    );
  }

  /**
   * Kanban board with per-column 20 cards and cursor: GET /leads/board
   */
  @Get('board')
  @RequirePermission(AppModule.LEADS, PermissionAction.VIEW)
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER)
  getBoard(
    @Query() query: BoardQueryDto,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.leadService.getBoard(
      query,
      roleKey,
      branchIds,
    );
  }

  /**
   * Trigger follow-up check job: POST /leads/check-follow-ups
   */
  @Post('check-follow-ups')
  @RequirePermission(AppModule.LEADS, PermissionAction.UPDATE)
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER)
  @HttpCode(HttpStatus.OK)
  checkFollowUps() {
    return this.leadService.checkFollowUpsAndNotify();
  }

  /**
   * Preview prefilled client draft from lead: GET /leads/:id/convert-preview
   */
  @Get(':id/convert-preview')
  @RequirePermission(AppModule.LEADS, PermissionAction.VIEW)
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER)
  getConvertPreview(
    @Param('id') id: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.leadService.getConvertPreview(
      id,
      roleKey,
      branchIds,
    );
  }

  /**
   * Convert lead to client in atomic transaction: POST /leads/:id/convert
   */
  @Post(':id/convert')
  @RequirePermission(AppModule.LEADS, PermissionAction.UPDATE)
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER)
  convert(
    @Param('id') id: string,
    @Body() dto: ConvertLeadDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.leadService.convert(
      id,
      dto,
      userId,
      roleKey,
      branchIds,
    );
  }

  /**
   * Get single lead: GET /leads/:id
   */
  @Get(':id')
  @RequirePermission(AppModule.LEADS, PermissionAction.VIEW)
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER)
  findOne(
    @Param('id') id: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.leadService.findOne(
      id,
      roleKey,
      branchIds,
    );
  }

  /**
   * Update lead: PATCH /leads/:id
   */
  @Patch(':id')
  @RequirePermission(AppModule.LEADS, PermissionAction.UPDATE)
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.leadService.update(
      id,
      dto,
      userId,
      roleKey,
      branchIds,
    );
  }
}
