import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { CommunicationService } from './communication.service';
import {
  CommunicationLogQueryDto,
  CreateTemplateDto,
  RecordCallLogDto,
  SendBulkMessagesDto,
  SendMessageDto,
  TemplateQueryDto,
  UpdateTemplateDto,
  WebhookPayloadDto,
} from './dto';
import { CurrentUser, Public, RequirePermission, Roles } from '../common/decorators';
import { NoStoreInterceptor } from '../client/no-store.interceptor';
import { AppModule, PermissionAction, RoleKey } from '@petals/types';

@Controller()
@UseInterceptors(NoStoreInterceptor)
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  /**
   * ────────────────────────── Templates ──────────────────────────
   */

  @Post('communication/templates')
  @RequirePermission(AppModule.COMMUNICATION, PermissionAction.CREATE)
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER)
  createTemplate(
    @Body() dto: CreateTemplateDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.communicationService.createTemplate(dto, userId);
  }

  @Get('communication/templates')
  @RequirePermission(AppModule.COMMUNICATION, PermissionAction.VIEW)
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER)
  findAllTemplates(@Query() query: TemplateQueryDto) {
    return this.communicationService.findAllTemplates(query);
  }

  @Get('communication/templates/:id')
  @RequirePermission(AppModule.COMMUNICATION, PermissionAction.VIEW)
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER)
  findTemplateById(@Param('id', ParseUUIDPipe) id: string) {
    return this.communicationService.findTemplateById(id);
  }

  @Patch('communication/templates/:id')
  @RequirePermission(AppModule.COMMUNICATION, PermissionAction.UPDATE)
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER)
  updateTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTemplateDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.communicationService.updateTemplate(id, dto, userId);
  }

  @Post('communication/templates/:id/approve')
  @RequirePermission(AppModule.COMMUNICATION, PermissionAction.UPDATE)
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER)
  approveTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.communicationService.approveTemplate(id, userId);
  }

  @Post('communication/templates/:id/reject')
  @RequirePermission(AppModule.COMMUNICATION, PermissionAction.UPDATE)
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER)
  rejectTemplate(@Param('id', ParseUUIDPipe) id: string) {
    return this.communicationService.rejectTemplate(id);
  }

  /**
   * ────────────────────── Message Sending ──────────────────────
   */

  @Post('communication/send')
  @RequirePermission(AppModule.COMMUNICATION, PermissionAction.CREATE)
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER)
  sendMessage(
    @Body() dto: SendMessageDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.communicationService.sendMessage(dto, userId, roleKey, branchIds);
  }

  @Post('communication/send-bulk')
  @RequirePermission(AppModule.COMMUNICATION, PermissionAction.CREATE)
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER)
  sendBulk(
    @Body() dto: SendBulkMessagesDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.communicationService.sendBulk(dto, userId, roleKey, branchIds);
  }

  /**
   * ──────────────────────── Call Log ────────────────────────
   */

  @Post('clients/:clientId/call-logs')
  @RequirePermission(AppModule.COMMUNICATION, PermissionAction.CREATE)
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER)
  recordCallLog(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Body() dto: RecordCallLogDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.communicationService.recordCallLog(clientId, dto, userId, roleKey, branchIds);
  }

  /**
   * ────────────────── Cursor Paginated Logs ──────────────────
   */

  @Get('clients/:clientId/communication-logs')
  @RequirePermission(AppModule.COMMUNICATION, PermissionAction.VIEW)
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER)
  getClientLogs(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Query() query: CommunicationLogQueryDto,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.communicationService.getClientLogs(clientId, query, roleKey, branchIds);
  }

  /**
   * ────────────────────── Delivery Webhook ──────────────────────
   */

  @Public()
  @Post('communication/webhook')
  @HttpCode(HttpStatus.OK)
  handleWebhook(
    @Body() payload: WebhookPayloadDto,
    @Headers('x-hub-signature-256') hubSig?: string,
    @Headers('x-signature') genericSig?: string,
    @Req() req?: any,
  ) {
    const signature = hubSig || genericSig || '';
    const rawBody = req?.rawBody || JSON.stringify(payload);
    return this.communicationService.handleWebhook(payload, rawBody, signature);
  }
}

