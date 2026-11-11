import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CacheService } from '../common/redis/cache.service';
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
import {
  CommunicationChannel,
  MessageStatus,
  RoleKey,
  TemplateStatus,
} from '@petals/types';
import {
  WHATSAPP_PROVIDER,
  WhatsAppProvider,
} from './interfaces/whatsapp-provider.interface';
import { CommunicationQueueService } from './communication-queue.service';
import {
  buildCursorMeta,
  buildCursorPagination,
  buildOffsetMeta,
  buildOffsetPagination,
} from '../common/pagination';

const SENSITIVE_CLINICAL_KEYWORDS = [
  'diagnosis',
  'iq score',
  'clinical observation',
  'therapy note',
  'case history',
  'pathology',
  'disorder detail',
];

const DEFAULT_BRANCH_DAILY_CAP = 500;

@Injectable()
export class CommunicationService {
  private readonly logger = new Logger(CommunicationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly queueService: CommunicationQueueService,
    @Inject(WHATSAPP_PROVIDER)
    private readonly whatsAppProvider: WhatsAppProvider,
  ) {}

  /**
   * ────────────────────────── Templates ──────────────────────────
   */

  async createTemplate(dto: CreateTemplateDto, _userId: string) {
    const existing = await this.prisma.unscopedClient.whatsappTemplate.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Template with name "${dto.name}" already exists`);
    }

    return this.prisma.unscopedClient.whatsappTemplate.create({
      data: {
        name: dto.name,
        body: dto.body,
        language: dto.language || 'en',
        status: TemplateStatus.DRAFT,
      },
    });
  }

  async findAllTemplates(query: TemplateQueryDto) {
    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { body: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const { skip, take } = buildOffsetPagination(page, pageSize);

    const [total, items] = await Promise.all([
      this.prisma.unscopedClient.whatsappTemplate.count({ where }),
      this.prisma.unscopedClient.whatsappTemplate.findMany({
        where,
        skip,
        take,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        include: {
          approvedBy: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return {
      data: items,
      meta: buildOffsetMeta(total, page, pageSize),
    };
  }

  async findTemplateById(id: string) {
    const template = await this.prisma.unscopedClient.whatsappTemplate.findUnique({
      where: { id },
      include: {
        approvedBy: { select: { id: true, name: true } },
      },
    });
    if (!template) {
      throw new NotFoundException(`Template "${id}" not found`);
    }
    return template;
  }

  async updateTemplate(id: string, dto: UpdateTemplateDto, _userId: string) {
    const template = await this.findTemplateById(id);
    if (template.status === TemplateStatus.APPROVED) {
      throw new BadRequestException('Cannot edit an approved template directly');
    }

    return this.prisma.unscopedClient.whatsappTemplate.update({
      where: { id },
      data: {
        body: dto.body ?? template.body,
        language: dto.language ?? template.language,
        status: TemplateStatus.DRAFT,
      },
    });
  }

  async approveTemplate(id: string, userId: string) {
    await this.findTemplateById(id);

    return this.prisma.unscopedClient.whatsappTemplate.update({
      where: { id },
      data: {
        status: TemplateStatus.APPROVED,
        approvedById: userId,
      },
      include: {
        approvedBy: { select: { id: true, name: true } },
      },
    });
  }

  async rejectTemplate(id: string) {
    await this.findTemplateById(id);

    return this.prisma.unscopedClient.whatsappTemplate.update({
      where: { id },
      data: {
        status: TemplateStatus.REJECTED,
      },
    });
  }

  /**
   * ────────────────────── Message Sending ──────────────────────
   */

  async sendMessage(
    dto: SendMessageDto,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    // 1. Verify client and branch access
    const client = await this.prisma.unscopedClient.client.findUnique({
      where: { id: dto.clientId },
      include: {
        guardians: {
          include: {
            guardian: { include: { user: true } },
          },
        },
      },
    });
    if (!client || client.deletedAt) {
      throw new NotFoundException(`Client "${dto.clientId}" not found`);
    }

    if (roleKey !== RoleKey.DIRECTOR && !userBranchIds.includes(client.branchId)) {
      throw new ForbiddenException('Cannot send messages to a client in an unassigned branch');
    }

    // 2. Clinical privacy check
    this.assertNoClinicalDetails(dto.customMessage, dto.parameters);

    // 3. Guardian selection & consent validation
    const primaryLink =
      client.guardians.find((g) => g.isPrimary) || client.guardians[0];
    if (!primaryLink) {
      throw new BadRequestException('Client has no linked guardian to contact');
    }
    const guardian = primaryLink.guardian;

    let recipient = dto.recipient;
    let templateName: string | undefined;
    let formattedMessage = dto.customMessage;

    if (dto.channel === CommunicationChannel.WHATSAPP) {
      if (!guardian.whatsappConsent) {
        throw new BadRequestException('Guardian has not consented to WhatsApp messages');
      }
      recipient = recipient || guardian.whatsappNo || guardian.user.phone || '';
      if (!recipient) {
        throw new BadRequestException('No WhatsApp contact number available for guardian');
      }

      if (!dto.templateId) {
        throw new BadRequestException('Template ID is required for WhatsApp messages');
      }

      const template = await this.findTemplateById(dto.templateId);
      if (template.status !== TemplateStatus.APPROVED) {
        throw new BadRequestException('Only approved templates can be used to send WhatsApp messages.');
      }
      templateName = template.name;
      formattedMessage = this.renderTemplateBody(template.body, dto.parameters);
    } else if (dto.channel === CommunicationChannel.EMAIL) {
      if (!guardian.emailConsent) {
        throw new BadRequestException('Guardian has not consented to email messages');
      }
      recipient = recipient || guardian.user.email;
      if (!recipient) {
        throw new BadRequestException('No email address available for guardian');
      }
    }

    // 4. Branch daily cap check & increment
    await this.checkAndIncrementBranchCap(client.branchId, 1);

    // 5. Create CommunicationLog in QUEUED status
    const log = await this.prisma.unscopedClient.communicationLog.create({
      data: {
        clientId: client.id,
        sentById: userId,
        templateId: dto.templateId,
        channel: dto.channel,
        recipient: recipient!,
        message: formattedMessage,
        status: MessageStatus.QUEUED,
      },
    });

    // 6. Enqueue to background worker
    await this.queueService.addJob({
      logId: log.id,
      clientId: client.id,
      channel: dto.channel,
      recipient: recipient!,
      templateName,
      parameters: dto.parameters,
      message: formattedMessage,
    });

    return log;
  }

  async sendBulk(
    dto: SendBulkMessagesDto,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    // 1. Enforce max 5 bulk sends per hour per user
    const userBulkKey = `rate:bulk_comm:${userId}`;
    const currentSends = (await this.cacheService.get<number>(userBulkKey)) || 0;
    if (currentSends >= 5) {
      throw new HttpException(
        'Rate limit exceeded: max 5 bulk sends per hour.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2. Template validation if WhatsApp
    let templateName: string | undefined;
    let templateBody: string | undefined;
    if (dto.channel === CommunicationChannel.WHATSAPP) {
      if (!dto.templateId) {
        throw new BadRequestException('Template ID is required for bulk WhatsApp messages');
      }
      const template = await this.findTemplateById(dto.templateId);
      if (template.status !== TemplateStatus.APPROVED) {
        throw new BadRequestException('Only approved templates can be used to send WhatsApp messages.');
      }
      templateName = template.name;
      templateBody = template.body;
    }

    // 3. Clinical privacy check
    this.assertNoClinicalDetails(undefined, dto.parameters);

    // 4. Resolve branch & clients
    let branchId = dto.branchId;
    if (roleKey !== RoleKey.DIRECTOR) {
      if (branchId && !userBranchIds.includes(branchId)) {
        throw new ForbiddenException('Cannot send bulk messages for an unassigned branch');
      }
      branchId = branchId || userBranchIds[0];
    }
    if (!branchId) {
      throw new BadRequestException('Branch ID is required for bulk sending');
    }

    const whereClients: any = {
      branchId,
      deletedAt: null,
      status: 'ACTIVE',
    };

    if (dto.filter === 'PENDING_FEES') {
      whereClients.invoices = {
        some: {
          status: { in: ['PENDING', 'PARTIAL'] },
        },
      };
    } else if (dto.filter === 'UPCOMING_APPOINTMENT') {
      const now = new Date();
      const in48h = new Date(now.getTime() + 48 * 3600 * 1000);
      whereClients.appointments = {
        some: {
          startTime: { gte: now, lte: in48h },
          status: 'SCHEDULED',
        },
      };
    }

    const clients = await this.prisma.unscopedClient.client.findMany({
      where: whereClients,
      include: {
        guardians: {
          include: {
            guardian: { include: { user: true } },
          },
        },
      },
    });

    // 5. Filter clients with consent
    const eligibleClients = clients.filter((c) => {
      const primary = c.guardians.find((g) => g.isPrimary) || c.guardians[0];
      if (!primary) return false;
      if (dto.channel === CommunicationChannel.WHATSAPP) {
        return primary.guardian.whatsappConsent && (primary.guardian.whatsappNo || primary.guardian.user.phone);
      }
      if (dto.channel === CommunicationChannel.EMAIL) {
        return primary.guardian.emailConsent && primary.guardian.user.email;
      }
      return true;
    });

    if (eligibleClients.length === 0) {
      return {
        totalMatched: clients.length,
        queued: 0,
        skippedNoConsent: clients.length,
      };
    }

    // 6. Check and increment daily branch cap
    await this.checkAndIncrementBranchCap(branchId, eligibleClients.length);

    // 7. Increment user bulk send limit (1 hour TTL)
    await this.cacheService.set(userBulkKey, currentSends + 1, 3600);

    // 8. Queue messages for each client
    let queuedCount = 0;
    for (const c of eligibleClients) {
      const primary = c.guardians.find((g) => g.isPrimary) || c.guardians[0];
      const recipient =
        dto.channel === CommunicationChannel.WHATSAPP
          ? primary.guardian.whatsappNo || primary.guardian.user.phone
          : primary.guardian.user.email;

      const formatted = templateBody
        ? this.renderTemplateBody(templateBody, {
            ...dto.parameters,
            childName: c.name,
            guardianName: primary.guardian.name,
          })
        : undefined;

      const log = await this.prisma.unscopedClient.communicationLog.create({
        data: {
          clientId: c.id,
          sentById: userId,
          templateId: dto.templateId,
          channel: dto.channel,
          recipient: recipient!,
          message: formatted,
          status: MessageStatus.QUEUED,
        },
      });

      await this.queueService.addJob({
        logId: log.id,
        clientId: c.id,
        channel: dto.channel,
        recipient: recipient!,
        templateName,
        parameters: dto.parameters,
        message: formatted,
      });

      queuedCount++;
    }

    return {
      totalMatched: clients.length,
      queued: queuedCount,
      skippedNoConsent: clients.length - queuedCount,
    };
  }

  /**
   * ──────────────────────── Call Log ────────────────────────
   */

  async recordCallLog(
    clientId: string,
    dto: RecordCallLogDto,
    userId: string,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const client = await this.prisma.unscopedClient.client.findUnique({
      where: { id: clientId },
    });
    if (!client || client.deletedAt) {
      throw new NotFoundException(`Client "${clientId}" not found`);
    }

    if (roleKey !== RoleKey.DIRECTOR && !userBranchIds.includes(client.branchId)) {
      throw new ForbiddenException('Cannot record call log for an unassigned branch');
    }

    return this.prisma.unscopedClient.communicationLog.create({
      data: {
        clientId,
        sentById: userId,
        channel: CommunicationChannel.CALL,
        recipient: dto.recipient,
        message: dto.notes ? `Call Log (${dto.durationSeconds || 0}s): ${dto.notes}` : `Call Log (${dto.durationSeconds || 0}s)`,
        status: MessageStatus.DELIVERED,
      },
    });
  }

  /**
   * ────────────────────── Delivery Webhook ──────────────────────
   */

  async handleWebhook(
    payload: WebhookPayloadDto,
    rawBody: string | Buffer,
    signature: string,
  ) {
    // 1. Signature verification
    const isValid = this.whatsAppProvider.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    // 2. Update log status
    const log = await this.prisma.unscopedClient.communicationLog.findFirst({
      where: {
        OR: [
          { providerRef: payload.providerRef },
          payload.messageId ? { id: payload.messageId } : undefined,
        ].filter(Boolean) as any,
      },
    });

    if (log) {
      await this.prisma.unscopedClient.communicationLog.update({
        where: { id: log.id },
        data: { status: payload.status },
      });
      this.logger.log(`Updated communication log ${log.id} to status ${payload.status}`);
    }

    return { received: true };
  }

  /**
   * ────────────────── Cursor Paginated Logs ──────────────────
   */

  async getClientLogs(
    clientId: string,
    query: CommunicationLogQueryDto,
    roleKey: RoleKey,
    userBranchIds: string[],
  ) {
    const client = await this.prisma.unscopedClient.client.findUnique({
      where: { id: clientId },
    });
    if (!client || client.deletedAt) {
      throw new NotFoundException(`Client "${clientId}" not found`);
    }

    if (roleKey !== RoleKey.DIRECTOR && !userBranchIds.includes(client.branchId)) {
      throw new ForbiddenException('Cannot access communication logs for an unassigned branch');
    }

    const limit = query.limit ?? 20;
    const pagination = buildCursorPagination(query.cursor, limit);
    const findArgs: any = {
      where: { clientId },
      take: pagination.take,
      orderBy: [{ sentAt: 'desc' }, { id: 'asc' }],
      include: {
        template: { select: { id: true, name: true } },
        sentBy: { select: { id: true, name: true } },
      },
    };

    if (query.channel) {
      findArgs.where.channel = query.channel;
    }
    if (query.status) {
      findArgs.where.status = query.status;
    }
    if ((pagination as any).cursor) {
      findArgs.cursor = (pagination as any).cursor;
      findArgs.skip = (pagination as any).skip;
    }

    const items = await this.prisma.unscopedClient.communicationLog.findMany(findArgs);

    return {
      data: items,
      meta: buildCursorMeta(items, limit),
    };
  }

  /**
   * ────────────────────── Helper Methods ──────────────────────
   */

  private async checkAndIncrementBranchCap(branchId: string, countToAdd: number): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    const capKey = `rate:branch_msgs:${branchId}:${today}`;
    const currentCount = (await this.cacheService.get<number>(capKey)) || 0;

    if (currentCount + countToAdd > DEFAULT_BRANCH_DAILY_CAP) {
      throw new HttpException(
        `Daily message cap of ${DEFAULT_BRANCH_DAILY_CAP} exceeded for branch. Current: ${currentCount}, attempting to send: ${countToAdd}.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.cacheService.set(capKey, currentCount + countToAdd, 86400);
  }

  private assertNoClinicalDetails(
    customMessage?: string,
    parameters?: Record<string, string>,
  ): void {
    const textsToCheck: string[] = [];
    if (customMessage) textsToCheck.push(customMessage.toLowerCase());
    if (parameters) {
      for (const val of Object.values(parameters)) {
        if (typeof val === 'string') {
          textsToCheck.push(val.toLowerCase());
        }
      }
    }

    for (const text of textsToCheck) {
      for (const keyword of SENSITIVE_CLINICAL_KEYWORDS) {
        if (text.includes(keyword)) {
          throw new BadRequestException(
            `Messages must not contain sensitive clinical details (detected: "${keyword}").`,
          );
        }
      }
    }
  }

  private renderTemplateBody(body: string, parameters?: Record<string, string>): string {
    if (!parameters) return body;
    let rendered = body;
    for (const [key, val] of Object.entries(parameters)) {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), String(val));
    }
    return rendered;
  }
}
