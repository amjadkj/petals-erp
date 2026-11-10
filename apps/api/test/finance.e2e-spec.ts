import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule as AppMainModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/common/prisma';
import { CacheService } from '../src/common/redis';
import { QueryCounter } from '../src/common/testing/query-count.helper';
import { hashPassword } from '../src/common/crypto';
import {
  RoleKey,
  ClientStatus,
  InvoiceStatus,
  PaymentMethod,
  RevenueCategory,
  AppModule,
  PermissionAction,
} from '@petals/types';

describe('Finance Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cacheService: CacheService;
  let queryCounter: QueryCounter;

  let directorToken: string;
  let directorUserId: string;
  let managerToken: string;
  let parentToken: string;

  let branchId: string;
  let branch2Id: string;
  let departmentId: string;
  let child1Id: string;
  let child2Id: string;
  let plan1Id: string;
  let plan2Id: string;

  const defaultPassword = 'Password123!Secure';
  const directorPassword = 'ChangeMe123!';
  const managerEmail = 'manager1-p10@petals.com';
  const parentEmail = 'parent1-p10@petals.com';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppMainModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.set('trust proxy', 1);

    app.setGlobalPrefix('api/v1', {
      exclude: ['health', 'api/docs'],
    });

    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());

    await app.init();
    prisma = app.get(PrismaService);
    cacheService = app.get(CacheService);
    queryCounter = new QueryCounter(app);

    // Teardown previous test data
    await prisma.unscopedClient.payment.deleteMany({
      where: {
        invoice: { client: { clientCode: { startsWith: 'P10' } } },
      },
    });
    await prisma.unscopedClient.invoice.deleteMany({
      where: {
        client: { clientCode: { startsWith: 'P10' } },
      },
    });
    await prisma.unscopedClient.expense.deleteMany({
      where: {
        branch: { code: { in: ['P10B1', 'P10B2'] } },
      },
    });
    await prisma.unscopedClient.treatmentPlan.deleteMany({
      where: {
        client: { clientCode: { startsWith: 'P10' } },
      },
    });
    await prisma.unscopedClient.clientGuardian.deleteMany({
      where: {
        client: { clientCode: { startsWith: 'P10' } },
      },
    });
    await prisma.unscopedClient.client.deleteMany({
      where: { clientCode: { startsWith: 'P10' } },
    });
    await prisma.unscopedClient.guardian.deleteMany({
      where: { user: { email: parentEmail } },
    });
    await prisma.unscopedClient.employee.deleteMany({
      where: { user: { email: managerEmail } },
    });
    await prisma.unscopedClient.user.deleteMany({
      where: { email: { in: [managerEmail, parentEmail] } },
    });

    // 1. Setup Branches
    const branch1 = await prisma.unscopedClient.branch.upsert({
      where: { code: 'P10B1' },
      update: {},
      create: {
        name: 'Phase 10 Branch One',
        code: 'P10B1',
        city: 'Kochi',
      },
    });
    branchId = branch1.id;

    const branch2 = await prisma.unscopedClient.branch.upsert({
      where: { code: 'P10B2' },
      update: {},
      create: {
        name: 'Phase 10 Branch Two',
        code: 'P10B2',
        city: 'Trivandrum',
      },
    });
    branch2Id = branch2.id;

    const dept = await prisma.unscopedClient.department.findFirstOrThrow({
      where: { code: 'OT' },
    });
    departmentId = dept.id;

    // 2. Log in Director
    const dirRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'director@petals.com', password: directorPassword })
      .expect(200);
    directorToken = dirRes.body.accessToken;

    const dirUser = await prisma.unscopedClient.user.findFirstOrThrow({
      where: { email: 'director@petals.com' },
    });
    directorUserId = dirUser.id;
    await cacheService.del(`rate:export:${directorUserId}`);

    const hashedPassword = await hashPassword(defaultPassword);

    // 3. Setup Manager Role & Permissions
    const managerRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.MANAGER },
    });

    // Ensure Manager has FINANCIAL module (VIEW & CREATE) but NOT FINANCIAL_PNL
    await prisma.unscopedClient.roleModule.upsert({
      where: { roleId_module: { roleId: managerRole.id, module: AppModule.FINANCIAL } },
      update: { enabled: true },
      create: { roleId: managerRole.id, module: AppModule.FINANCIAL, enabled: true },
    });
    for (const act of [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.UPDATE]) {
      await prisma.unscopedClient.rolePermission.upsert({
        where: { roleId_module_action: { roleId: managerRole.id, module: AppModule.FINANCIAL, action: act } },
        update: { allowed: true },
        create: { roleId: managerRole.id, module: AppModule.FINANCIAL, action: act, allowed: true },
      });
    }

    // Ensure Manager has CLIENTS view
    await prisma.unscopedClient.roleModule.upsert({
      where: { roleId_module: { roleId: managerRole.id, module: AppModule.CLIENTS } },
      update: { enabled: true },
      create: { roleId: managerRole.id, module: AppModule.CLIENTS, enabled: true },
    });
    await prisma.unscopedClient.rolePermission.upsert({
      where: { roleId_module_action: { roleId: managerRole.id, module: AppModule.CLIENTS, action: PermissionAction.VIEW } },
      update: { allowed: true },
      create: { roleId: managerRole.id, module: AppModule.CLIENTS, action: PermissionAction.VIEW, allowed: true },
    });

    // Make sure Manager does NOT have FINANCIAL_PNL enabled
    await prisma.unscopedClient.roleModule.upsert({
      where: { roleId_module: { roleId: managerRole.id, module: AppModule.FINANCIAL_PNL } },
      update: { enabled: false },
      create: { roleId: managerRole.id, module: AppModule.FINANCIAL_PNL, enabled: false },
    });

    const mgrUser = await prisma.unscopedClient.user.create({
      data: {
        name: 'Manager P10',
        email: managerEmail,
        passwordHash: hashedPassword,
        phone: '+919876510001',
        roleId: managerRole.id,
        branches: { create: { branchId, isPrimary: true } },
      },
    });

    const mgrEmp = await prisma.unscopedClient.employee.create({
      data: {
        userId: mgrUser.id,
        departmentId,
        employeeCode: 'EMP-P10-MGR',
        joinedOn: new Date('2025-01-01'),
      },
    });

    const mgrRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: managerEmail, password: defaultPassword })
      .expect(200);
    managerToken = mgrRes.body.accessToken;

    // 4. Setup Parent Role & Permissions
    const parentRole = await prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: RoleKey.PARENT },
    });

    // Parent needs FINANCIAL view permission for their own invoices
    await prisma.unscopedClient.roleModule.upsert({
      where: { roleId_module: { roleId: parentRole.id, module: AppModule.FINANCIAL } },
      update: { enabled: true },
      create: { roleId: parentRole.id, module: AppModule.FINANCIAL, enabled: true },
    });
    await prisma.unscopedClient.rolePermission.upsert({
      where: { roleId_module_action: { roleId: parentRole.id, module: AppModule.FINANCIAL, action: PermissionAction.VIEW } },
      update: { allowed: true },
      create: { roleId: parentRole.id, module: AppModule.FINANCIAL, action: PermissionAction.VIEW, allowed: true },
    });

    const pUser = await prisma.unscopedClient.user.create({
      data: {
        name: 'Parent P10',
        email: parentEmail,
        passwordHash: hashedPassword,
        phone: '+919876510002',
        roleId: parentRole.id,
      },
    });

    const guardian = await prisma.unscopedClient.guardian.create({
      data: {
        userId: pUser.id,
        name: 'Parent P10',
        whatsappNo: '+919876510002',
      },
    });

    const parentLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: parentEmail, password: defaultPassword })
      .expect(200);
    parentToken = parentLogin.body.accessToken;

    // 5. Setup Clients and Treatment Plans
    const child1 = await prisma.unscopedClient.client.create({
      data: {
        clientCode: 'P10C01',
        name: 'Aarav Child P10',
        dob: new Date('2020-04-10'),
        gender: 'MALE',
        branchId,
        status: ClientStatus.ACTIVE,
      },
    });
    child1Id = child1.id;

    await prisma.unscopedClient.clientGuardian.create({
      data: {
        clientId: child1.id,
        guardianId: guardian.id,
        relation: 'Mother',
        isPrimary: true,
      },
    });

    const plan1 = await prisma.unscopedClient.treatmentPlan.create({
      data: {
        clientId: child1.id,
        departmentId,
        therapistId: mgrEmp.id,
        sessionsPerWeek: 3,
        feePerSession: 1000,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-06-30'),
        status: 'ACTIVE',
      },
    });
    plan1Id = plan1.id;

    const child2 = await prisma.unscopedClient.client.create({
      data: {
        clientCode: 'P10C02',
        name: 'Diya Child P10',
        dob: new Date('2019-08-20'),
        gender: 'FEMALE',
        branchId: branch2Id,
        status: ClientStatus.ACTIVE,
      },
    });
    child2Id = child2.id;

    const plan2 = await prisma.unscopedClient.treatmentPlan.create({
      data: {
        clientId: child2.id,
        departmentId,
        therapistId: mgrEmp.id,
        sessionsPerWeek: 2,
        feePerSession: 1000,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-06-30'),
        status: 'ACTIVE',
      },
    });
    plan2Id = plan2.id;
  });

  afterAll(async () => {
    await prisma.unscopedClient.payment.deleteMany({
      where: {
        invoice: { client: { clientCode: { startsWith: 'P10' } } },
      },
    });
    await prisma.unscopedClient.invoice.deleteMany({
      where: {
        client: { clientCode: { startsWith: 'P10' } },
      },
    });
    await prisma.unscopedClient.expense.deleteMany({
      where: {
        branch: { code: { in: ['P10B1', 'P10B2'] } },
      },
    });
    await prisma.unscopedClient.treatmentPlan.deleteMany({
      where: {
        client: { clientCode: { startsWith: 'P10' } },
      },
    });
    await prisma.unscopedClient.clientGuardian.deleteMany({
      where: {
        client: { clientCode: { startsWith: 'P10' } },
      },
    });
    await prisma.unscopedClient.client.deleteMany({
      where: { clientCode: { startsWith: 'P10' } },
    });
    await prisma.unscopedClient.guardian.deleteMany({
      where: { user: { email: parentEmail } },
    });
    await prisma.unscopedClient.employee.deleteMany({
      where: { user: { email: managerEmail } },
    });
    await prisma.unscopedClient.user.deleteMany({
      where: { email: { in: [managerEmail, parentEmail] } },
    });

    await app.close();
  });

  // ─────────────────────────────────────────────────────────────
  // 1. INVOICE CREATION & STATUS TRANSITIONS
  // ─────────────────────────────────────────────────────────────

  let invoice1Id: string;
  let invoice2Id: string;

  describe('Invoice Lifecycle & Payment Recording', () => {
    it('creates an invoice in PENDING status and sends Cache-Control: no-store', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/finance/invoices')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          branchId,
          clientId: child1Id,
          planId: plan1Id,
          revenueCategory: RevenueCategory.CLINICAL_THERAPY,
          amount: 3000,
          issuedOn: '2026-03-01',
          dueOn: '2026-03-15',
        })
        .expect(201);

      invoice1Id = res.body.id;
      expect(res.body.invoiceNo).toMatch(/^INV-P10B1-2026-\d{4}$/);
      expect(res.body.status).toBe(InvoiceStatus.PENDING);
      expect(Number(res.body.amount)).toBe(3000);
      expect(res.headers['cache-control']).toContain('no-store');
    });

    it('records partial payment: status remains PENDING in one transaction', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/finance/invoices/${invoice1Id}/payments`)
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          amount: 1000,
          method: PaymentMethod.CASH,
          paidAt: '2026-03-05T10:00:00.000Z',
        })
        .expect(201);

      expect(res.body.payment).toBeDefined();
      expect(res.body.payment.receiptNo).toMatch(/^RCP-P10B1-2026-\d{5}$/);
      expect(Number(res.body.payment.amount)).toBe(1000);
      expect(res.body.invoice.status).toBe(InvoiceStatus.PENDING);

      // Verify invoice lookup balances
      const invCheck = await request(app.getHttpServer())
        .get(`/api/v1/finance/invoices/${invoice1Id}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(invCheck.body.totalPaid).toBe(1000);
      expect(invCheck.body.balanceDue).toBe(2000);
    });

    it('records remaining payment: transitions status to PAID in transaction', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/finance/invoices/${invoice1Id}/payments`)
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          amount: 2000,
          method: PaymentMethod.UPI,
          paidAt: '2026-03-10T14:30:00.000Z',
        })
        .expect(201);

      expect(res.body.invoice.status).toBe(InvoiceStatus.PAID);

      const invCheck = await request(app.getHttpServer())
        .get(`/api/v1/finance/invoices/${invoice1Id}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(invCheck.body.status).toBe(InvoiceStatus.PAID);
      expect(invCheck.body.totalPaid).toBe(3000);
      expect(invCheck.body.balanceDue).toBe(0);
    });

    it('records extra payment: transitions status to ADVANCE in transaction', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/finance/invoices/${invoice1Id}/payments`)
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          amount: 500,
          method: PaymentMethod.BANK_TRANSFER,
          paidAt: '2026-03-12T09:00:00.000Z',
        })
        .expect(201);

      expect(res.body.invoice.status).toBe(InvoiceStatus.ADVANCE);

      const invCheck = await request(app.getHttpServer())
        .get(`/api/v1/finance/invoices/${invoice1Id}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(invCheck.body.status).toBe(InvoiceStatus.ADVANCE);
      expect(invCheck.body.totalPaid).toBe(3500);
      expect(invCheck.body.balanceDue).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. PAYMENTS LIST & PAYMENT DUE
  // ─────────────────────────────────────────────────────────────

  describe('Payments List, Payments Due & Monthly Tracking', () => {
    beforeAll(async () => {
      // Create second invoice for child 2 in branch 2 with no payments
      const res = await request(app.getHttpServer())
        .post('/api/v1/finance/invoices')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          branchId: branch2Id,
          clientId: child2Id,
          planId: plan2Id,
          revenueCategory: RevenueCategory.ASSESSMENT_FEE,
          amount: 4000,
          issuedOn: '2026-03-01',
          dueOn: '2026-03-10',
        })
        .expect(201);
      invoice2Id = res.body.id;
    });

    it('returns payments list with financial summary', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/finance/payments')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      expect(res.body.summary).toBeDefined();
      expect(res.body.summary.totalReceived).toBeGreaterThanOrEqual(3500);
    });

    it('returns payments due with guardian contact information', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/finance/payments-due')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      const dueItem = res.body.data.find((item: any) => item.invoiceId === invoice2Id);
      expect(dueItem).toBeDefined();
      expect(dueItem.clientName).toBe('Diya Child P10');
      expect(dueItem.balanceDue).toBe(4000);
      expect(dueItem.status).toBe(InvoiceStatus.PENDING);
    });

    it('returns monthly payment tracking', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/finance/monthly-tracking?month=2026-03')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(res.body.month).toBe('2026-03');
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. EXPENSES, P&L & AGGREGATE REPORTS (RAW SQL & FIXTURES)
  // ─────────────────────────────────────────────────────────────

  describe('Expenses and Profit & Loss', () => {
    it('creates branch expenses and verifies P&L totals against fixtures', async () => {
      // 1. Create expenses
      await request(app.getHttpServer())
        .post('/api/v1/finance/expenses')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          branchId,
          category: 'Clinic Rent',
          amount: 1200,
          spentOn: '2026-03-02',
          notes: 'March monthly rent',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/finance/expenses')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          branchId,
          category: 'Therapy Materials',
          amount: 300,
          spentOn: '2026-03-04',
          notes: 'Sensory toys and sensory integration balls',
        })
        .expect(201);

      // Total payments in branch1 = 3500. Total expenses in branch1 = 1500.
      // Net profit = 3500 - 1500 = 2000.
      // Margin % = (2000 / 3500) * 100 = 57.14%

      const pnlRes = await request(app.getHttpServer())
        .get(`/api/v1/finance/pnl?branchId=${branchId}&month=2026-03`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(pnlRes.body.totalRevenue).toBe(3500);
      expect(pnlRes.body.totalExpenses).toBe(1500);
      expect(pnlRes.body.netProfit).toBe(2000);
      expect(pnlRes.body.marginPercentage).toBe(57.14);
    });

    it('serves aggregate reports using raw SQL (revenue by interval, category, dept)', async () => {
      const revInterval = await request(app.getHttpServer())
        .get(`/api/v1/finance/revenue?interval=month&branchId=${branchId}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(Array.isArray(revInterval.body)).toBe(true);

      const revCategory = await request(app.getHttpServer())
        .get(`/api/v1/finance/revenue/by-category?branchId=${branchId}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(Array.isArray(revCategory.body)).toBe(true);
      const sessionCat = revCategory.body.find((c: any) => c.category === RevenueCategory.CLINICAL_THERAPY);
      expect(sessionCat).toBeDefined();
      expect(sessionCat.total_revenue).toBe(3500);

      const revDept = await request(app.getHttpServer())
        .get(`/api/v1/finance/revenue/by-department?branchId=${branchId}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(Array.isArray(revDept.body)).toBe(true);
      const otDept = revDept.body.find((d: any) => d.department_code === 'OT');
      expect(otDept).toBeDefined();
      expect(otDept.total_revenue).toBe(3500);
    });

    it('caches aggregate reports for 60s and invalidates cache when new payment/expense is added', async () => {
      // 1. Initial P&L fetch
      const pnl1 = await request(app.getHttpServer())
        .get(`/api/v1/finance/pnl?branchId=${branchId}&month=2026-03`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(pnl1.body.totalExpenses).toBe(1500);

      // 2. Add another expense of 500
      await request(app.getHttpServer())
        .post('/api/v1/finance/expenses')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          branchId,
          category: 'Utility Bills',
          amount: 500,
          spentOn: '2026-03-08',
          notes: 'Electricity bill',
        })
        .expect(201);

      // 3. New P&L fetch shows cache invalidation
      const pnl2 = await request(app.getHttpServer())
        .get(`/api/v1/finance/pnl?branchId=${branchId}&month=2026-03`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(pnl2.body.totalExpenses).toBe(2000);
      expect(pnl2.body.netProfit).toBe(1500);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. MANAGER & PARENT ACCESS RESTRICTIONS
  // ─────────────────────────────────────────────────────────────

  describe('Manager & Parent Permission Restrictions', () => {
    it('allows Manager to view payments due and monthly tracking in their branch', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/finance/payments-due')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/api/v1/finance/monthly-tracking?month=2026-03')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);
    });

    it('forbids Manager from viewing Profit & Loss (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/finance/pnl?branchId=${branchId}&month=2026-03`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);
    });

    it('allows Parent to view their own child invoice', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/finance/invoices/${invoice1Id}`)
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      expect(res.body.id).toBe(invoice1Id);
      expect(res.body.client.name).toBe('Aarav Child P10');
    });

    it('forbids Parent from viewing another child invoice (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/finance/invoices/${invoice2Id}`)
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(403);
    });

    it('forbids Parent from recording payments directly (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/finance/invoices/${invoice1Id}/payments`)
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          amount: 500,
          method: PaymentMethod.CASH,
        })
        .expect(403);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. EXPORT RATE LIMITING & PAGINATION CAPS
  // ─────────────────────────────────────────────────────────────

  describe('Export Rate Limiting & Pagination Caps', () => {
    it('caps page size to 100 on invoice list', async () => {
      // Exceeding max 100 is rejected by validation pipe
      const res = await request(app.getHttpServer())
        .get('/api/v1/finance/invoices?pageSize=200')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(400);

      expect(res.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('pageSize must not be greater than 100')]),
      );

      // Max allowable 100 returns successfully
      const resValid = await request(app.getHttpServer())
        .get('/api/v1/finance/invoices?pageSize=100')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(resValid.body.meta.pageSize).toBe(100);
    });

    it('limits exports to 10 per hour per user, rejecting the 11th with 400', async () => {
      // Clear any rate key before test
      await cacheService.del(`rate:export:${directorUserId}`);

      for (let i = 1; i <= 10; i++) {
        const res = await request(app.getHttpServer())
          .post('/api/v1/finance/export')
          .set('Authorization', `Bearer ${directorToken}`)
          .send({
            type: 'PNL',
            format: 'EXCEL',
          })
          .expect(202);

        expect(res.body.jobId).toBeDefined();
        expect(res.body.downloadUrl).toBeDefined();
      }

      // 11th request fails
      const res11 = await request(app.getHttpServer())
        .post('/api/v1/finance/export')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          type: 'PNL',
          format: 'EXCEL',
        })
        .expect(400);

      expect(res11.body.message).toContain('Export rate limit exceeded');
    });

    it('verifies constant query counts on paginated lists (no N+1)', async () => {
      queryCounter.start();
      await request(app.getHttpServer())
        .get('/api/v1/finance/invoices?page=1&pageSize=1')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);
      const count1 = queryCounter.stop();

      queryCounter.start();
      await request(app.getHttpServer())
        .get('/api/v1/finance/invoices?page=1&pageSize=10')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);
      const count2 = queryCounter.stop();

      // Query count should remain constant between 1 item and 10 items
      expect(count2).toBe(count1);
    });
  });
});
