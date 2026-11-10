import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleKey } from '@petals/types';
import { Roles } from '../common/decorators';
import { AuditService } from './audit.service';
import { AuditLogQueryDto } from './dto';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(RoleKey.DIRECTOR)
  @ApiOperation({ summary: 'List audit logs with cursor pagination and filters (Director only)' })
  async getAuditLogs(@Query() query: AuditLogQueryDto) {
    return this.auditService.findAll(query);
  }
}

