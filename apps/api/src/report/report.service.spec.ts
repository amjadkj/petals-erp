import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReportService } from './report.service';
import { StorageService } from './storage.service';
import { PrismaService } from '../common/prisma';
import { CacheService } from '../common/redis';
import { RoleKey, ReportStatus, ReportType } from '@petals/types';

describe('ReportService & StorageService', () => {
  let service: ReportService;
  let storage: StorageService;
  let prisma: any;
  let cache: any;

  const mockPrisma: any = {
    unscopedClient: {
      report: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        groupBy: jest.fn(),
      },
      document: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
      },
      client: {
        findUnique: jest.fn(),
      },
      clientGuardian: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      employee: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
      auditLog: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      notification: {
        create: jest.fn(),
      },
    },
    $transaction: jest.fn(),
  };

  const mockCache: any = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockConfig: any = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test-signing-secret';
      if (key === 'STORAGE_BASE_URL') return 'https://storage.petals.com';
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        StorageService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CacheService, useValue: mockCache },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
    storage = module.get<StorageService>(StorageService);
    prisma = module.get(PrismaService);
    cache = module.get(CacheService);
  });

  describe('StorageService', () => {
    it('generates signed upload URL with HMAC signature', () => {
      const result = storage.generateSignedUploadUrl('c-1', 'assessment.pdf', 'application/pdf', 900);

      expect(result.uploadUrl).toContain('https://storage.petals.com/upload/clients/c-1/');
      expect(result.uploadUrl).toContain('signature=');
      expect(result.fileUrl).toContain('https://storage.petals.com/clients/c-1/');
      expect(result.expiresInSeconds).toBe(900);
      expect(result.headers['Content-Type']).toBe('application/pdf');
    });

    it('generates signed download URL with HMAC signature', () => {
      const result = storage.generateSignedDownloadUrl('https://storage.petals.com/clients/c-1/test.pdf', 3600);

      expect(result.downloadUrl).toContain('https://storage.petals.com/download/clients/c-1/test.pdf');
      expect(result.downloadUrl).toContain('signature=');
      expect(result.expiresInSeconds).toBe(3600);
    });

    it('rejects unsupported file mime types', () => {
      expect(() => {
        storage.validateFile('application/x-executable', 1024);
      }).toThrow(BadRequestException);
    });

    it('rejects files exceeding 15MB limit', () => {
      expect(() => {
        storage.validateFile('application/pdf', 16 * 1024 * 1024);
      }).toThrow(BadRequestException);
    });
  });

  describe('Share Report Transaction', () => {
    const mockReport = {
      id: 'rep-1',
      clientId: 'c-1',
      title: 'Speech Therapy Evaluation',
      type: ReportType.ASSESSMENT,
      status: ReportStatus.REVIEWED,
      sharedWithParent: false,
      client: { id: 'c-1', name: 'Aarav Child', branchId: 'b-1' },
      author: { id: 'emp-1', userId: 'user-t1', employeeCode: 'EMP-001' },
    };

    it('rejects sharing if role is PARENT', async () => {
      await expect(
        service.shareReport('rep-1', 'user-p', RoleKey.PARENT, ['b-1']),
      ).rejects.toThrow(ForbiddenException);
    });

    it('executes share in a single transaction (update, audit, notification)', async () => {
      prisma.unscopedClient.report.findUnique.mockResolvedValueOnce(mockReport);

      const mockTx = {
        report: {
          update: jest.fn().mockResolvedValueOnce({
            ...mockReport,
            sharedWithParent: true,
            status: ReportStatus.SHARED,
          }),
        },
        auditLog: {
          create: jest.fn().mockResolvedValueOnce({ id: 'aud-1' }),
        },
        clientGuardian: {
          findMany: jest.fn().mockResolvedValueOnce([
            { guardian: { userId: 'parent-user-1', name: 'Mother' } },
            { guardian: { userId: 'parent-user-2', name: 'Father' } },
          ]),
        },
        notification: {
          create: jest.fn().mockResolvedValue({ id: 'notif-1' }),
        },
      };

      prisma.$transaction.mockImplementation(async (cb: any) => cb(mockTx));

      const result = await service.shareReport('rep-1', 'user-dir', RoleKey.DIRECTOR, []);

      expect(mockTx.report.update).toHaveBeenCalledWith({
        where: { id: 'rep-1' },
        data: { sharedWithParent: true, status: ReportStatus.SHARED },
        include: { client: { select: { id: true, name: true, branchId: true } } },
      });

      expect(mockTx.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'SHARE_REPORT',
            entity: 'Report',
            entityId: 'rep-1',
          }),
        }),
      );

      expect(mockTx.notification.create).toHaveBeenCalledTimes(2);
      expect(result.notificationsQueued).toBe(2);
      expect(result.report.status).toBe(ReportStatus.SHARED);
    });
  });

  describe('Report Summary via GroupBy', () => {
    it('aggregates counts per status in a single query', async () => {
      prisma.unscopedClient.client.findUnique.mockResolvedValueOnce({ id: 'c-1', branchId: 'b-1' });

      prisma.unscopedClient.report.groupBy.mockResolvedValueOnce([
        { status: ReportStatus.DRAFT, _count: { _all: 3 } },
        { status: ReportStatus.SUBMITTED, _count: { _all: 2 } },
        { status: ReportStatus.SHARED, _count: { _all: 5 } },
      ]);

      const summary = await service.getReportsSummary('c-1', 'user-dir', RoleKey.DIRECTOR, []);

      expect(prisma.unscopedClient.report.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          by: ['status'],
          where: expect.objectContaining({ clientId: 'c-1' }),
        }),
      );

      expect(summary.DRAFT).toBe(3);
      expect(summary.SUBMITTED).toBe(2);
      expect(summary.REVIEWED).toBe(0);
      expect(summary.SHARED).toBe(5);
      expect(summary.total).toBe(10);
    });
  });

  describe('Overdue Detection & Global Due Reports', () => {
    it('forbids therapists and parents from accessing global due reports', async () => {
      await expect(
        service.getDueReports({ page: 1, pageSize: 20 }, 'user-t1', RoleKey.THERAPIST, ['b-1']),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.getDueReports({ page: 1, pageSize: 20 }, 'user-p', RoleKey.PARENT, ['b-1']),
      ).rejects.toThrow(ForbiddenException);
    });

    it('marks reports past due date as isOverdue for Director and Manager', async () => {
      const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days from now

      prisma.unscopedClient.report.findMany.mockResolvedValueOnce([
        {
          id: 'rep-overdue',
          dueOn: pastDate,
          status: ReportStatus.DRAFT,
          client: { id: 'c-1', name: 'Child 1', clientCode: 'P11C01', branch: { id: 'b-1', name: 'HQ', code: 'HQ' } },
          author: { id: 'emp-1', employeeCode: 'EMP-01', user: { id: 'u-1', name: 'Therapist 1' } },
        },
        {
          id: 'rep-ontime',
          dueOn: futureDate,
          status: ReportStatus.DRAFT,
          client: { id: 'c-2', name: 'Child 2', clientCode: 'P11C02', branch: { id: 'b-1', name: 'HQ', code: 'HQ' } },
          author: { id: 'emp-2', employeeCode: 'EMP-02', user: { id: 'u-2', name: 'Therapist 2' } },
        },
      ]);
      prisma.unscopedClient.report.count.mockResolvedValueOnce(2);

      const result = await service.getDueReports({ page: 1, pageSize: 20 }, 'user-mgr', RoleKey.MANAGER, ['b-1']);

      expect(result.data.length).toBe(2);
      expect(result.data[0].id).toBe('rep-overdue');
      expect(result.data[0].isOverdue).toBe(true);
      expect(result.data[1].id).toBe('rep-ontime');
      expect(result.data[1].isOverdue).toBe(false);
    });
  });

  describe('Daily Overdue Notification Job', () => {
    it('creates reminder notifications grouped by therapist author for overdue reports', async () => {
      const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

      prisma.unscopedClient.report.findMany.mockResolvedValueOnce([
        {
          id: 'r-1',
          dueOn: pastDate,
          author: { id: 'emp-1', userId: 'user-t1', user: { id: 'user-t1', name: 'Therapist 1' } },
        },
        {
          id: 'r-2',
          dueOn: pastDate,
          author: { id: 'emp-1', userId: 'user-t1', user: { id: 'user-t1', name: 'Therapist 1' } },
        },
        {
          id: 'r-3',
          dueOn: pastDate,
          author: { id: 'emp-2', userId: 'user-t2', user: { id: 'user-t2', name: 'Therapist 2' } },
        },
      ]);

      prisma.unscopedClient.notification.create.mockResolvedValue({ id: 'notif-id' });

      const res = await service.checkOverdueReportsAndNotify();

      expect(res.overdueCount).toBe(3);
      expect(res.notificationsCreated).toBe(2); // 2 therapists
      expect(prisma.unscopedClient.notification.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('Document Upload Rate Limit (30/hr/user)', () => {
    it('allows document upload url when under 30 per hour', async () => {
      prisma.unscopedClient.client.findUnique.mockResolvedValueOnce({ id: 'c-1', branchId: 'b-1' });
      cache.get.mockResolvedValueOnce(15); // 15 so far

      const res = await service.generateDocumentUploadUrl(
        'c-1',
        { fileName: 'summary.pdf', fileType: 'application/pdf', fileSizeBytes: 1024 * 1024 },
        'user-1',
        RoleKey.DIRECTOR,
        [],
      );

      expect(res.uploadUrl).toBeDefined();
      expect(cache.set).toHaveBeenCalledWith('rate:doc_upload:user-1', 16, 3600);
    });

    it('rejects document upload url when user reaches 30 per hour', async () => {
      prisma.unscopedClient.client.findUnique.mockResolvedValueOnce({ id: 'c-1', branchId: 'b-1' });
      cache.get.mockResolvedValueOnce(30); // At limit

      await expect(
        service.generateDocumentUploadUrl(
          'c-1',
          { fileName: 'summary.pdf', fileType: 'application/pdf', fileSizeBytes: 1024 * 1024 },
          'user-1',
          RoleKey.DIRECTOR,
          [],
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
