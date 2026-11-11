import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleKey } from '@petals/types';
import { CurrentUser, Roles } from '../common/decorators';
import { IRequestContext } from '../common/context/request-context';
import { NoStoreInterceptor } from '../client/no-store.interceptor';
import { HrService } from './hr.service';
import {
  CheckInDto,
  CheckOutDto,
  DailyAttendanceQueryDto,
  MonthlyAttendanceQueryDto,
  CreateHolidayDto,
  HolidayQueryDto,
  CreateLeaveRequestDto,
  LeaveQueryDto,
  LeaveDecisionDto,
  DirectorAvailabilityDto,
  EmployeeGoalsQueryDto,
  EmployeeActivityQueryDto,
} from './dto';

@ApiTags('HR')
@ApiBearerAuth()
@UseInterceptors(NoStoreInterceptor)
@Controller('hr')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  // ─────────────────────────────────────────────────────────────
  // 1. ATTENDANCE
  // ─────────────────────────────────────────────────────────────

  @Post('attendance/check-in')
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER, RoleKey.THERAPIST)
  @ApiOperation({ summary: 'Record staff check-in' })
  async checkIn(@Body() dto: CheckInDto, @CurrentUser() user: IRequestContext) {
    return this.hrService.checkIn(dto, user);
  }

  @Post('attendance/check-out')
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER, RoleKey.THERAPIST)
  @ApiOperation({ summary: 'Record staff check-out' })
  async checkOut(@Body() dto: CheckOutDto, @CurrentUser() user: IRequestContext) {
    return this.hrService.checkOut(dto, user);
  }

  @Get('attendance/daily')
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER, RoleKey.THERAPIST)
  @ApiOperation({ summary: 'Get daily attendance view per branch' })
  async getDailyAttendance(
    @Query() query: DailyAttendanceQueryDto,
    @CurrentUser() user: IRequestContext,
  ) {
    return this.hrService.getDailyAttendance(query, user);
  }

  @Get('attendance/monthly')
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER, RoleKey.THERAPIST)
  @ApiOperation({ summary: 'Get monthly attendance grid from a single aggregate query' })
  async getMonthlyAttendance(
    @Query() query: MonthlyAttendanceQueryDto,
    @CurrentUser() user: IRequestContext,
  ) {
    return this.hrService.getMonthlyAttendance(query, user);
  }

  // ─────────────────────────────────────────────────────────────
  // 2. HOLIDAYS
  // ─────────────────────────────────────────────────────────────

  @Post('holidays')
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER)
  @ApiOperation({ summary: 'Create holiday (Director or branch Manager)' })
  async createHoliday(
    @Body() dto: CreateHolidayDto,
    @CurrentUser() user: IRequestContext,
  ) {
    return this.hrService.createHoliday(dto, user);
  }

  @Get('holidays')
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER, RoleKey.THERAPIST)
  @ApiOperation({ summary: 'Get holidays calendar' })
  async getHolidays(
    @Query() query: HolidayQueryDto,
    @CurrentUser() user: IRequestContext,
  ) {
    return this.hrService.getHolidays(query, user);
  }

  @Delete('holidays/:id')
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER)
  @ApiOperation({ summary: 'Delete holiday' })
  async deleteHoliday(
    @Param('id') id: string,
    @CurrentUser() user: IRequestContext,
  ) {
    return this.hrService.deleteHoliday(id, user);
  }

  // ─────────────────────────────────────────────────────────────
  // 3. LEAVE REQUESTS & BACKUP APPROVAL
  // ─────────────────────────────────────────────────────────────

  @Post('leaves')
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER, RoleKey.THERAPIST)
  @ApiOperation({ summary: 'Apply for leave' })
  async applyLeave(
    @Body() dto: CreateLeaveRequestDto,
    @CurrentUser() user: IRequestContext,
  ) {
    return this.hrService.applyLeave(dto, user);
  }

  @Get('leaves')
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER, RoleKey.THERAPIST)
  @ApiOperation({ summary: 'List leave requests (offset pagination)' })
  async getLeaves(
    @Query() query: LeaveQueryDto,
    @CurrentUser() user: IRequestContext,
  ) {
    return this.hrService.getLeaves(query, user);
  }

  @Post('leaves/:id/approve')
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER)
  @ApiOperation({
    summary:
      'Approve leave (Director, or backup Manager when Director is away). Flags conflicting appointments and invalidates daily schedule cache.',
  })
  async approveLeave(
    @Param('id') id: string,
    @Body() dto: LeaveDecisionDto,
    @CurrentUser() user: IRequestContext,
  ) {
    return this.hrService.approveLeave(id, dto, user);
  }

  @Post('leaves/:id/reject')
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER)
  @ApiOperation({ summary: 'Reject leave (Director, or backup Manager when Director is away)' })
  async rejectLeave(
    @Param('id') id: string,
    @Body() dto: LeaveDecisionDto,
    @CurrentUser() user: IRequestContext,
  ) {
    return this.hrService.rejectLeave(id, dto, user);
  }

  @Post('director/availability')
  @Roles(RoleKey.DIRECTOR)
  @ApiOperation({ summary: 'Director sets their away/available status' })
  async setDirectorAvailability(
    @Body() dto: DirectorAvailabilityDto,
    @CurrentUser() user: IRequestContext,
  ) {
    return this.hrService.setDirectorAvailability(dto, user);
  }

  // ─────────────────────────────────────────────────────────────
  // 4. EMPLOYEE DETAIL ENDPOINTS FOR DIRECTOR
  // ─────────────────────────────────────────────────────────────

  @Get('employees/:id/summary')
  @Roles(RoleKey.DIRECTOR)
  @ApiOperation({
    summary:
      'Director employee summary: assigned cases, total sessions, reports submitted, on-time report rate',
  })
  async getEmployeeSummary(
    @Param('id') id: string,
    @CurrentUser() user: IRequestContext,
  ) {
    return this.hrService.getEmployeeSummary(id, user);
  }

  @Get('employees/:id/goals')
  @Roles(RoleKey.DIRECTOR)
  @ApiOperation({
    summary:
      'Director employee goals/sub-goals view: progress entries with description, response, remarks (paginated)',
  })
  async getEmployeeGoals(
    @Param('id') id: string,
    @Query() query: EmployeeGoalsQueryDto,
    @CurrentUser() user: IRequestContext,
  ) {
    return this.hrService.getEmployeeGoals(id, query, user);
  }

  @Get('employees/:id/activity-log')
  @Roles(RoleKey.DIRECTOR)
  @ApiOperation({
    summary: 'Director employee activity log: everything the employee entered (cursor pagination)',
  })
  async getEmployeeActivityLog(
    @Param('id') id: string,
    @Query() query: EmployeeActivityQueryDto,
    @CurrentUser() user: IRequestContext,
  ) {
    return this.hrService.getEmployeeActivityLog(id, query, user);
  }
}

