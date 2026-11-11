import { Test, TestingModule } from '@nestjs/testing';
import { CommunicationService } from './communication.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { CacheService } from '../common/redis/cache.service';
import { CommunicationQueueService } from './communication-queue.service';
import { WHATSAPP_PROVIDER } from './interfaces/whatsapp-provider.interface';
import {
  CommunicationChannel,
  MessageStatus,
  RoleKey,
  TemplateStatus,
} from '@petals/types';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';

describe('CommunicationService', () => {
  let service: CommunicationService;
  let prisma: any;
  let cacheService: any;
  let queueService: any;
  let whatsAppProvider: any;

  const mockClient = {
    id: 'client-1',
    name: 'Aarav Kumar',
    branchId: 'branch-1',
    deletedAt: null,
    guardians: [
      {
        isPrimary: true,
        guardian: {
          id: 'guardian-1',
          name: 'Rajesh Kumar',
          whatsappNo: '+919876543210',
          whatsappConsent: true,
          emailConsent: true,
          user: { email: 'rajesh@example.com', phone: '+919876543210' },
        },
      },
    ],
  };

  const mockTemplate = {
    id: 'template-1',
    name: 'appointment_reminder',
    body: 'Hello {{guardianName}}, reminder for {{childName}} appointment tomorrow.',
    language: 'en',
    status: TemplateStatus.APPROVED,
    approvedById: 'user-dir',
  };

  beforeEach(async () => {
    prisma = {
      whatsappTemplate: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      communicationLog: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      client: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };
    prisma.unscopedClient = prisma;

    cacheService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
    };

    queueService = {
      addJob: jest.fn().mockResolvedValue(undefined),
    };

    whatsAppProvider = {
      sendMessage: jest.fn().mockResolvedValue({
        providerRef: 'mock-wa-ref',
        status: MessageStatus.SENT,
      }),
      verifyWebhookSignature: jest.fn().mockReturnValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunicationService,
        { provide: PrismaService, useValue: prisma },
        { provide: CacheService, useValue: cacheService },
        { provide: CommunicationQueueService, useValue: queueService },
        { provide: WHATSAPP_PROVIDER, useValue: whatsAppProvider },
      ],
    }).compile();

    service = module.get<CommunicationService>(CommunicationService);
  });

  describe('Templates', () => {
    it('creates a new template with status DRAFT', async () => {
      prisma.whatsappTemplate.findUnique.mockResolvedValue(null);
      prisma.whatsappTemplate.create.mockResolvedValue({
        ...mockTemplate,
        status: TemplateStatus.DRAFT,
      });

      const res = await service.createTemplate(
        { name: 'new_template', body: 'Hello {{name}}' },
        'user-dir',
      );

      expect(res.status).toBe(TemplateStatus.DRAFT);
      expect(prisma.whatsappTemplate.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'new_template',
            status: TemplateStatus.DRAFT,
          }),
        }),
      );
    });

    it('rejects duplicate template name with ConflictException', async () => {
      prisma.whatsappTemplate.findUnique.mockResolvedValue(mockTemplate);

      await expect(
        service.createTemplate(
          { name: 'appointment_reminder', body: 'Hello' },
          'user-dir',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('approves a template and records approvedById', async () => {
      prisma.whatsappTemplate.findUnique.mockResolvedValue({
        ...mockTemplate,
        status: TemplateStatus.DRAFT,
      });
      prisma.whatsappTemplate.update.mockResolvedValue({
        ...mockTemplate,
        status: TemplateStatus.APPROVED,
        approvedById: 'user-dir',
      });

      const res = await service.approveTemplate('template-1', 'user-dir');

      expect(res.status).toBe(TemplateStatus.APPROVED);
      expect(prisma.whatsappTemplate.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'template-1' },
          data: { status: TemplateStatus.APPROVED, approvedById: 'user-dir' },
        }),
      );
    });
  });

  describe('Single Message Sending', () => {
    it('rejects sending WhatsApp message if template is NOT approved', async () => {
      prisma.client.findUnique.mockResolvedValue(mockClient);
      prisma.whatsappTemplate.findUnique.mockResolvedValue({
        ...mockTemplate,
        status: TemplateStatus.DRAFT, // unapproved
      });

      await expect(
        service.sendMessage(
          {
            clientId: 'client-1',
            channel: CommunicationChannel.WHATSAPP,
            templateId: 'template-1',
          },
          'user-mgr',
          RoleKey.MANAGER,
          ['branch-1'],
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects sending if guardian has not consented', async () => {
      prisma.client.findUnique.mockResolvedValue({
        ...mockClient,
        guardians: [
          {
            isPrimary: true,
            guardian: {
              ...mockClient.guardians[0].guardian,
              whatsappConsent: false, // NO CONSENT
            },
          },
        ],
      });

      await expect(
        service.sendMessage(
          {
            clientId: 'client-1',
            channel: CommunicationChannel.WHATSAPP,
            templateId: 'template-1',
          },
          'user-mgr',
          RoleKey.MANAGER,
          ['branch-1'],
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects messages containing sensitive clinical keywords', async () => {
      prisma.client.findUnique.mockResolvedValue(mockClient);

      await expect(
        service.sendMessage(
          {
            clientId: 'client-1',
            channel: CommunicationChannel.EMAIL,
            customMessage: 'The client diagnosis is autism spectrum disorder.',
          },
          'user-mgr',
          RoleKey.MANAGER,
          ['branch-1'],
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('queues a valid WhatsApp message with approved template', async () => {
      prisma.client.findUnique.mockResolvedValue(mockClient);
      prisma.whatsappTemplate.findUnique.mockResolvedValue(mockTemplate);
      prisma.communicationLog.create.mockResolvedValue({
        id: 'log-1',
        clientId: 'client-1',
        channel: CommunicationChannel.WHATSAPP,
        recipient: '+919876543210',
        status: MessageStatus.QUEUED,
      });

      const res = await service.sendMessage(
        {
          clientId: 'client-1',
          channel: CommunicationChannel.WHATSAPP,
          templateId: 'template-1',
          parameters: { guardianName: 'Rajesh', childName: 'Aarav' },
        },
        'user-mgr',
        RoleKey.MANAGER,
        ['branch-1'],
      );

      expect(res.id).toBe('log-1');
      expect(queueService.addJob).toHaveBeenCalledWith(
        expect.objectContaining({
          logId: 'log-1',
          clientId: 'client-1',
          channel: CommunicationChannel.WHATSAPP,
          recipient: '+919876543210',
        }),
      );
    });
  });

  describe('Bulk Sending & Rate Limits', () => {
    it('enforces max 5 bulk sends per hour per user with 429', async () => {
      cacheService.get.mockResolvedValue(5); // already sent 5 times

      await expect(
        service.sendBulk(
          {
            branchId: 'branch-1',
            filter: 'ALL_ACTIVE',
            channel: CommunicationChannel.WHATSAPP,
            templateId: 'template-1',
          },
          'user-mgr',
          RoleKey.MANAGER,
          ['branch-1'],
        ),
      ).rejects.toThrow(HttpException);

      try {
        await service.sendBulk(
          {
            branchId: 'branch-1',
            filter: 'ALL_ACTIVE',
            channel: CommunicationChannel.WHATSAPP,
            templateId: 'template-1',
          },
          'user-mgr',
          RoleKey.MANAGER,
          ['branch-1'],
        );
      } catch (err: any) {
        expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      }
    });

    it('enforces daily branch message cap with 429', async () => {
      prisma.whatsappTemplate.findUnique.mockResolvedValue(mockTemplate);
      prisma.client.findMany.mockResolvedValue([mockClient]);
      // Daily cap key returns 500 (cap full)
      cacheService.get.mockImplementation(async (key: string) => {
        if (key.startsWith('rate:branch_msgs:')) return 500;
        return 0; // bulk sends ok
      });

      try {
        await service.sendBulk(
          {
            branchId: 'branch-1',
            filter: 'ALL_ACTIVE',
            channel: CommunicationChannel.WHATSAPP,
            templateId: 'template-1',
          },
          'user-mgr',
          RoleKey.MANAGER,
          ['branch-1'],
        );
        fail('Should have thrown 429');
      } catch (err: any) {
        expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      }
    });
  });

  describe('Delivery Webhook', () => {
    it('rejects invalid signature with UnauthorizedException', async () => {
      whatsAppProvider.verifyWebhookSignature.mockReturnValue(false);

      await expect(
        service.handleWebhook(
          { providerRef: 'msg-123', status: MessageStatus.DELIVERED },
          '{}',
          'bad-signature',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('updates communication log status when signature is valid', async () => {
      whatsAppProvider.verifyWebhookSignature.mockReturnValue(true);
      prisma.communicationLog.findFirst.mockResolvedValue({ id: 'log-1' });
      prisma.communicationLog.update.mockResolvedValue({
        id: 'log-1',
        status: MessageStatus.DELIVERED,
      });

      const res = await service.handleWebhook(
        { providerRef: 'wa_ref_123', status: MessageStatus.DELIVERED },
        '{}',
        'valid-signature',
      );

      expect(res.received).toBe(true);
      expect(prisma.communicationLog.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'log-1' },
          data: { status: MessageStatus.DELIVERED },
        }),
      );
    });
  });

  describe('Call Logs & Cursor Pagination', () => {
    it('records a voice call log', async () => {
      prisma.client.findUnique.mockResolvedValue(mockClient);
      prisma.communicationLog.create.mockResolvedValue({
        id: 'log-call-1',
        channel: CommunicationChannel.CALL,
        recipient: '+919876543210',
        message: 'Call Log (120s): Spoke regarding therapy progress',
        status: MessageStatus.DELIVERED,
      });

      const res = await service.recordCallLog(
        'client-1',
        {
          recipient: '+919876543210',
          notes: 'Spoke regarding therapy progress',
          durationSeconds: 120,
        },
        'user-mgr',
        RoleKey.MANAGER,
        ['branch-1'],
      );

      expect(res.channel).toBe(CommunicationChannel.CALL);
      expect(res.status).toBe(MessageStatus.DELIVERED);
    });

    it('returns cursor-paginated communication logs for a client', async () => {
      prisma.client.findUnique.mockResolvedValue(mockClient);
      prisma.communicationLog.findMany.mockResolvedValue([
        {
          id: 'log-1',
          sentAt: new Date(),
          channel: CommunicationChannel.WHATSAPP,
        },
      ]);

      const res = await service.getClientLogs(
        'client-1',
        { limit: 10 },
        RoleKey.MANAGER,
        ['branch-1'],
      );

      expect(res.data).toHaveLength(1);
      expect(res.meta).toBeDefined();
    });
  });
});
