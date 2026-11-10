import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AppModule, PermissionAction, RoleKey } from '@petals/types';
import { CurrentUser, RequirePermission, Roles } from '../common/decorators';
import { AuditSensitiveRead } from '../audit/audit.decorators';
import { VersionService } from './version.service';
import { RestoreEntityDto, VersionHistoryQueryDto } from './dto';

@ApiTags('Clinical History')
@ApiBearerAuth()
@Controller('clinical/history')
export class ClinicalHistoryController {
  constructor(private readonly versionService: VersionService) {}

  @Get(':entityType/:entityId')
  @RequirePermission(AppModule.PROFILE_ASSESSMENT, PermissionAction.VIEW)
  @AuditSensitiveRead('ClinicalHistory')
  @ApiOperation({
    summary: 'Get version history for a clinical entity with cursor pagination',
  })
  async getHistory(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Query() query: VersionHistoryQueryDto,
  ) {
    return this.versionService.getEntityHistory(entityType, entityId, query);
  }

  @Post(':entityType/:entityId/restore')
  @Roles(RoleKey.DIRECTOR)
  @ApiOperation({
    summary: 'Restore a clinical entity to a previous version (Director only via @Roles)',
  })
  async restore(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Body() dto: RestoreEntityDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.versionService.restoreEntity(entityType, entityId, userId, dto);
  }
}

