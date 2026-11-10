import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseInterceptors,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AppModule, PermissionAction, RoleKey } from '@petals/types';
import { CurrentUser, RequirePermission } from '../common/decorators';
import { NoStoreInterceptor } from '../client/no-store.interceptor';
import { FinanceService } from './finance.service';
import {
  CreateInvoiceDto,
  RecordPaymentDto,
  CreateExpenseDto,
  InvoiceQueryDto,
  PaymentQueryDto,
  ExpenseQueryDto,
  PnlQueryDto,
  ExportFinanceDto,
} from './dto';

@ApiTags('Finance')
@ApiBearerAuth()
@Controller('finance')
@UseInterceptors(NoStoreInterceptor)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // ─────────────────────────────────────────────────────────────
  // 1. INVOICES
  // ─────────────────────────────────────────────────────────────

  @Post('invoices')
  @RequirePermission(AppModule.FINANCIAL, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Create a new invoice' })
  async createInvoice(
    @Body() dto: CreateInvoiceDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.financeService.createInvoice(dto, userId, roleKey, branchIds);
  }

  @Get('invoices')
  @RequirePermission(AppModule.FINANCIAL, PermissionAction.VIEW)
  @ApiOperation({ summary: 'List invoices with offset pagination and whitelisted sorting' })
  async findInvoices(
    @Query() query: InvoiceQueryDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.financeService.findInvoices(query, userId, roleKey, branchIds);
  }

  @Get('invoices/:id')
  @RequirePermission(AppModule.FINANCIAL, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Get invoice details with payment history and balance' })
  async findInvoiceById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.financeService.findInvoiceById(id, userId, roleKey, branchIds);
  }

  // ─────────────────────────────────────────────────────────────
  // 2. PAYMENTS
  // ─────────────────────────────────────────────────────────────

  @Post('invoices/:id/payments')
  @RequirePermission(AppModule.FINANCIAL, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Record payment against invoice with transactional status update' })
  async recordPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RecordPaymentDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.financeService.recordPayment(id, dto, userId, roleKey, branchIds);
  }

  @Get('payments')
  @RequirePermission(AppModule.FINANCIAL, PermissionAction.VIEW)
  @ApiOperation({ summary: 'List payments with offset pagination and summary total' })
  async findPayments(
    @Query() query: PaymentQueryDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.financeService.findPayments(query, userId, roleKey, branchIds);
  }

  @Get(['payments/due', 'payments-due'])
  @RequirePermission(AppModule.FINANCIAL, PermissionAction.VIEW)
  @ApiOperation({ summary: 'List pending/due payments with guardian contact for follow-up' })
  async findPaymentsDue(
    @Query('branchId') branchId: string | undefined,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.financeService.findPaymentsDue({ branchId }, userId, roleKey, branchIds);
  }

  @Get(['payments/monthly-tracking', 'monthly-tracking'])
  @RequirePermission(AppModule.FINANCIAL, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Monthly payment tracking (billed, collected, pending balance)' })
  async findMonthlyTracking(
    @Query('month') month: string,
    @Query('branchId') branchId: string | undefined,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.financeService.findMonthlyTracking(month, branchId, userId, roleKey, branchIds);
  }

  // ─────────────────────────────────────────────────────────────
  // 3. EXPENSES
  // ─────────────────────────────────────────────────────────────

  @Post('expenses')
  @RequirePermission(AppModule.FINANCIAL, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Record expense' })
  async createExpense(
    @Body() dto: CreateExpenseDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.financeService.createExpense(dto, userId, roleKey, branchIds);
  }

  @Get('expenses')
  @RequirePermission(AppModule.FINANCIAL, PermissionAction.VIEW)
  @ApiOperation({ summary: 'List expenses with offset pagination' })
  async findExpenses(
    @Query() query: ExpenseQueryDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.financeService.findExpenses(query, userId, roleKey, branchIds);
  }

  // ─────────────────────────────────────────────────────────────
  // 4. REPORTS & P&L (CACHED 60s)
  // ─────────────────────────────────────────────────────────────

  @Get('pnl')
  @RequirePermission(AppModule.FINANCIAL_PNL, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Profit and Loss report by month and branch (consolidated or single branch)' })
  async getPnl(
    @Query() query: PnlQueryDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.financeService.getPnl(query, userId, roleKey, branchIds);
  }

  @Get('revenue')
  @RequirePermission(AppModule.FINANCIAL, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Revenue grouped by day, week, or month' })
  async getRevenue(
    @Query('interval') interval: 'day' | 'week' | 'month' = 'day',
    @Query('branchId') branchId?: string,
  ) {
    return this.financeService.getRevenue(interval, branchId);
  }

  @Get(['revenue/by-category', 'revenue-by-category'])
  @RequirePermission(AppModule.FINANCIAL, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Revenue grouped by category' })
  async getRevenueByCategory(@Query('branchId') branchId?: string) {
    return this.financeService.getRevenueByCategory(branchId);
  }

  @Get(['revenue/by-department', 'revenue-by-department'])
  @RequirePermission(AppModule.FINANCIAL, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Revenue grouped by department' })
  async getRevenueByDepartment(@Query('branchId') branchId?: string) {
    return this.financeService.getRevenueByDepartment(branchId);
  }

  @Post('export')
  @HttpCode(HttpStatus.ACCEPTED)
  @RequirePermission(AppModule.FINANCIAL, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Export financial reports as background job (limit 10/hr/user)' })
  async exportReport(
    @Body() dto: ExportFinanceDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
  ) {
    return this.financeService.exportReport(dto, userId, roleKey);
  }
}
