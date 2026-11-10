import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { PrismaService } from '../common/prisma';
import { CacheService } from '../common/redis';
import { Prisma } from '@prisma/client';
import { RoleKey, InvoiceStatus, PaymentMethod } from '@petals/types';

describe('FinanceService', () => {
  let service: FinanceService;
  let prisma: any;
  let cache: any;

  const mockPrisma: any = {
    unscopedClient: {
      invoice: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      payment: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
      },
      expense: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
      },
      branch: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      client: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      clientGuardian: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    },
    $transaction: jest.fn(),
    $queryRaw: jest.fn(),
  };

  const mockCache: any = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    deleteByPrefix: jest.fn(),
    delPattern: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CacheService, useValue: mockCache },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
    prisma = module.get(PrismaService);
    cache = module.get(CacheService);
  });

  describe('Payment Recording & Status Transitions', () => {
    const mockInvoice = {
      id: 'inv-1',
      branchId: 'b-1',
      clientId: 'c-1',
      amount: new Prisma.Decimal(1000),
      status: InvoiceStatus.PENDING,
      branch: { id: 'b-1', code: 'HQ' },
    };

    it('rejects payment recording if role is PARENT', async () => {
      await expect(
        service.recordPayment(
          'inv-1',
          { amount: 500, method: PaymentMethod.CASH },
          'user-parent',
          RoleKey.PARENT,
          ['b-1'],
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects payment recording if branch is not assigned to manager', async () => {
      prisma.unscopedClient.invoice.findUnique.mockResolvedValueOnce(mockInvoice);

      await expect(
        service.recordPayment(
          'inv-1',
          { amount: 500, method: PaymentMethod.CASH },
          'user-mgr',
          RoleKey.MANAGER,
          ['b-other'],
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('sets status to PENDING when totalPaid is less than invoice amount', async () => {
      prisma.unscopedClient.invoice.findUnique.mockResolvedValueOnce(mockInvoice);

      const mockTx = {
        payment: {
          count: jest.fn().mockResolvedValueOnce(0),
          create: jest.fn().mockResolvedValueOnce({
            id: 'pay-1',
            invoiceId: 'inv-1',
            amount: new Prisma.Decimal(400),
            receiptNo: 'RCP-HQ-2026-00001',
          }),
          findMany: jest.fn().mockResolvedValueOnce([
            { amount: new Prisma.Decimal(400) },
          ]),
        },
        invoice: {
          update: jest.fn().mockResolvedValueOnce({
            ...mockInvoice,
            status: InvoiceStatus.PENDING,
          }),
        },
      };

      prisma.$transaction.mockImplementation(async (cb: any) => cb(mockTx));

      const result = await service.recordPayment(
        'inv-1',
        { amount: 400, method: PaymentMethod.CASH },
        'user-dir',
        RoleKey.DIRECTOR,
        [],
      );

      expect(mockTx.invoice.update).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
        data: { status: InvoiceStatus.PENDING },
      });
      expect(result.invoice.status).toBe(InvoiceStatus.PENDING);
    });

    it('transitions status to PAID when totalPaid equals invoice amount', async () => {
      prisma.unscopedClient.invoice.findUnique.mockResolvedValueOnce(mockInvoice);

      const mockTx = {
        payment: {
          count: jest.fn().mockResolvedValueOnce(1),
          create: jest.fn().mockResolvedValueOnce({
            id: 'pay-2',
            invoiceId: 'inv-1',
            amount: new Prisma.Decimal(600),
            receiptNo: 'RCP-HQ-2026-00002',
          }),
          findMany: jest.fn().mockResolvedValueOnce([
            { amount: new Prisma.Decimal(400) },
            { amount: new Prisma.Decimal(600) },
          ]),
        },
        invoice: {
          update: jest.fn().mockResolvedValueOnce({
            ...mockInvoice,
            status: InvoiceStatus.PAID,
          }),
        },
      };

      prisma.$transaction.mockImplementation(async (cb: any) => cb(mockTx));

      const result = await service.recordPayment(
        'inv-1',
        { amount: 600, method: PaymentMethod.UPI },
        'user-dir',
        RoleKey.DIRECTOR,
        [],
      );

      expect(mockTx.invoice.update).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
        data: { status: InvoiceStatus.PAID },
      });
      expect(result.invoice.status).toBe(InvoiceStatus.PAID);
    });

    it('transitions status to ADVANCE when totalPaid exceeds invoice amount', async () => {
      prisma.unscopedClient.invoice.findUnique.mockResolvedValueOnce(mockInvoice);

      const mockTx = {
        payment: {
          count: jest.fn().mockResolvedValueOnce(2),
          create: jest.fn().mockResolvedValueOnce({
            id: 'pay-3',
            invoiceId: 'inv-1',
            amount: new Prisma.Decimal(500),
            receiptNo: 'RCP-HQ-2026-00003',
          }),
          findMany: jest.fn().mockResolvedValueOnce([
            { amount: new Prisma.Decimal(1000) },
            { amount: new Prisma.Decimal(500) },
          ]),
        },
        invoice: {
          update: jest.fn().mockResolvedValueOnce({
            ...mockInvoice,
            status: InvoiceStatus.ADVANCE,
          }),
        },
      };

      prisma.$transaction.mockImplementation(async (cb: any) => cb(mockTx));

      const result = await service.recordPayment(
        'inv-1',
        { amount: 500, method: PaymentMethod.CARD },
        'user-dir',
        RoleKey.DIRECTOR,
        [],
      );

      expect(mockTx.invoice.update).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
        data: { status: InvoiceStatus.ADVANCE },
      });
      expect(result.invoice.status).toBe(InvoiceStatus.ADVANCE);
    });
  });

  describe('Profit and Loss Reporting & Caching', () => {
    it('blocks non-Director role from accessing P&L', async () => {
      await expect(
        service.getPnl(
          { month: '2026-03' },
          'user-mgr',
          RoleKey.MANAGER,
          ['b-1'],
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('returns cached P&L if available without querying DB', async () => {
      const cachedData = {
        period: '2026-03',
        branchId: 'consolidated',
        totalRevenue: 25000,
        totalExpenses: 10000,
        netProfit: 15000,
        marginPercentage: 60,
      };

      cache.get.mockResolvedValueOnce(cachedData);

      const result = await service.getPnl(
        { month: '2026-03' },
        'user-dir',
        RoleKey.DIRECTOR,
        [],
      );

      expect(result).toEqual(cachedData);
      expect(prisma.$queryRaw).not.toHaveBeenCalled();
    });

    it('computes P&L accurately and caches result for 60 seconds on cache miss', async () => {
      cache.get.mockResolvedValueOnce(null);

      // Raw queries return revenue and expense sums
      prisma.$queryRaw
        .mockResolvedValueOnce([{ total: 10000 }]) // Revenue sum
        .mockResolvedValueOnce([{ total: 4000 }]); // Expense sum

      const result = await service.getPnl(
        { month: '2026-01' },
        'user-dir',
        RoleKey.DIRECTOR,
        [],
      );

      expect(result.totalRevenue).toBe(10000);
      expect(result.totalExpenses).toBe(4000);
      expect(result.netProfit).toBe(6000);
      expect(result.marginPercentage).toBe(60);

      // Verify cached with 60 second TTL
      expect(cache.set).toHaveBeenCalledWith(
        expect.stringContaining('finance:report:pnl:'),
        expect.objectContaining({ totalRevenue: 10000, netProfit: 6000 }),
        60,
      );
    });
  });

  describe('Export Rate Limiting', () => {
    it('allows exports under 10 per hour per user', async () => {
      cache.get.mockResolvedValueOnce(5); // 5 exports so far

      const result = await service.exportReport(
        { type: 'PNL' as any, format: 'EXCEL' as any },
        'user-1',
        RoleKey.DIRECTOR,
      );

      expect(result.jobId).toBeDefined();
      expect(result.downloadUrl).toContain('/api/v1/finance/export/download');
      expect(cache.set).toHaveBeenCalledWith('rate:export:user-1', 6, 3600);
    });

    it('throws BadRequestException when user reaches 10 exports per hour', async () => {
      cache.get.mockResolvedValueOnce(10); // Already at limit

      await expect(
        service.exportReport(
          { type: 'PNL' as any, format: 'PDF' as any },
          'user-1',
          RoleKey.DIRECTOR,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
