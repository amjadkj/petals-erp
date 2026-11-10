import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AppModule, PermissionAction, RoleKey } from '@petals/types';
import { CurrentUser, RequirePermission, Roles } from '../common/decorators';
import { NoStoreInterceptor } from '../client/no-store.interceptor';
import { ReportService } from './report.service';
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

@ApiTags('Reports & Documents')
@ApiBearerAuth()
@Controller()
@UseInterceptors(NoStoreInterceptor)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // ─────────────────────────────────────────────────────────────
  // 1. CLIENT REPORTS
  // ─────────────────────────────────────────────────────────────

  @Get('clients/:clientId/reports')
  @RequirePermission(AppModule.PROFILE_REPORTS, PermissionAction.VIEW)
  @ApiOperation({ summary: 'List client reports with offset pagination' })
  async findClientReports(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Query() query: ReportQueryDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.reportService.findClientReports(clientId, query, userId, roleKey, branchIds);
  }

  @Get('clients/:clientId/reports/summary')
  @RequirePermission(AppModule.PROFILE_REPORTS, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Get summary counts of reports per status in single groupBy' })
  async getReportsSummary(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.reportService.getReportsSummary(clientId, userId, roleKey, branchIds);
  }

  @Post('clients/:clientId/reports')
  @RequirePermission(AppModule.PROFILE_REPORTS, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Create a new clinical report in DRAFT status' })
  async createReport(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Body() dto: CreateReportDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.reportService.createReport(clientId, dto, userId, roleKey, branchIds);
  }

  @Get('reports/due')
  @RequirePermission(AppModule.REPORTS, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Global due reports dashboard for Director and Manager' })
  async getDueReports(
    @Query() query: DueReportQueryDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.reportService.getDueReports(query, userId, roleKey, branchIds);
  }

  @Get('reports/:id')
  @RequirePermission(AppModule.PROFILE_REPORTS, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Get report details by ID' })
  async findReportById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.reportService.findReportById(id, userId, roleKey, branchIds);
  }

  @Patch('reports/:id')
  @RequirePermission(AppModule.PROFILE_REPORTS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Update report (title, content, fileUrl, status)' })
  async updateReport(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.reportService.updateReport(id, dto, userId, roleKey, branchIds);
  }

  @Post('reports/:id/share')
  @RequirePermission(AppModule.PROFILE_REPORTS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Share report with parents in single transaction (shared=true, audit, notification)' })
  async shareReport(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.reportService.shareReport(id, userId, roleKey, branchIds);
  }

  @Get('clients/:clientId/reports/activity')
  @RequirePermission(AppModule.PROFILE_REPORTS, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Get report activity timeline for client using cursor pagination' })
  async getClientReportActivity(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Query() query: ReportActivityQueryDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.reportService.getClientReportActivity(clientId, query, userId, roleKey, branchIds);
  }

  @Post('reports/check-overdue')
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER)
  @ApiOperation({ summary: 'Trigger daily check for overdue reports and send notifications' })
  async triggerOverdueReminders() {
    return this.reportService.checkOverdueReportsAndNotify();
  }

  // ─────────────────────────────────────────────────────────────
  // 2. DOCUMENTS
  // ─────────────────────────────────────────────────────────────

  @Post('clients/:clientId/documents/upload-url')
  @RequirePermission(AppModule.PROFILE_DOCUMENTS, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Generate S3 signed upload URL (rate limited 30/hr/user, size/type validated)' })
  async generateDocumentUploadUrl(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Body() dto: DocumentUploadUrlDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.reportService.generateDocumentUploadUrl(clientId, dto, userId, roleKey, branchIds);
  }

  @Post('clients/:clientId/documents')
  @RequirePermission(AppModule.PROFILE_DOCUMENTS, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Record uploaded document metadata for client' })
  async createDocument(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Body() dto: CreateDocumentDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.reportService.createDocument(clientId, dto, userId, roleKey, branchIds);
  }

  @Get('clients/:clientId/documents')
  @RequirePermission(AppModule.PROFILE_DOCUMENTS, PermissionAction.VIEW)
  @ApiOperation({ summary: 'List client documents with offset pagination' })
  async findClientDocuments(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Query() query: DocumentQueryDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.reportService.findClientDocuments(clientId, query, userId, roleKey, branchIds);
  }

  @Get('documents/:id/download-url')
  @RequirePermission(AppModule.PROFILE_DOCUMENTS, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Generate signed download URL for document' })
  async getDocumentDownloadUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.reportService.getDocumentDownloadUrl(id, userId, roleKey, branchIds);
  }
}

