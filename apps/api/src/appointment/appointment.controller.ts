import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AppModule, PermissionAction, RoleKey } from '@petals/types';
import { CurrentUser, RequirePermission } from '../common/decorators';
import { NoStoreInterceptor } from '../client/no-store.interceptor';
import { AppointmentService } from './appointment.service';
import {
  CreateAppointmentDto,
  CreateScheduleDto,
  RescheduleAppointmentDto,
  CancelAppointmentDto,
  UpdateAppointmentStatusDto,
  AppointmentQueryDto,
  DailyScheduleQueryDto,
  ClientAppointmentQueryDto,
} from './dto';

@ApiTags('Appointments & Scheduling')
@ApiBearerAuth()
@Controller()
@UseInterceptors(NoStoreInterceptor)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get('appointments')
  @RequirePermission(AppModule.APPOINTMENTS, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Weekly calendar view limited to 31 days with minimal selected display fields' })
  async findCalendar(
    @Query() query: AppointmentQueryDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.appointmentService.findCalendar(query, userId, roleKey, branchIds);
  }

  @Get('appointments/daily')
  @RequirePermission(AppModule.APPOINTMENTS, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Daily schedule cache with Redis, TTL, and post-cache caller scoping' })
  async findDailySchedule(
    @Query() query: DailyScheduleQueryDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.appointmentService.findDailySchedule(query, userId, roleKey, branchIds);
  }

  @Post('appointments')
  @RequirePermission(AppModule.APPOINTMENTS, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Create single appointment with conflict detection' })
  async createAppointment(
    @Body() dto: CreateAppointmentDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
  ) {
    return this.appointmentService.createAppointment(dto, userId, roleKey);
  }

  @Post('schedules')
  @RequirePermission(AppModule.APPOINTMENTS, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Create recurring schedule and generate appointments for rolling window' })
  async createSchedule(
    @Body() dto: CreateScheduleDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
  ) {
    return this.appointmentService.createSchedule(dto, userId, roleKey);
  }

  @Put('appointments/:id/reschedule')
  @RequirePermission(AppModule.APPOINTMENTS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Reschedule appointment with conflict detection' })
  async reschedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RescheduleAppointmentDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
  ) {
    return this.appointmentService.reschedule(id, dto, userId, roleKey);
  }

  @Put('appointments/:id/cancel')
  @RequirePermission(AppModule.APPOINTMENTS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Cancel appointment with required reason and parent notification' })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelAppointmentDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
  ) {
    return this.appointmentService.cancel(id, dto, userId, roleKey);
  }

  @Put('appointments/:id/status')
  @RequirePermission(AppModule.APPOINTMENTS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Mark appointment status (attended, no-show)' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAppointmentStatusDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
  ) {
    return this.appointmentService.updateStatus(id, dto, userId, roleKey);
  }

  @Get('clients/:id/appointments')
  @RequirePermission(AppModule.PROFILE_SESSIONS, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Client session history with cursor pagination' })
  async findClientAppointments(
    @Param('id', ParseUUIDPipe) clientId: string,
    @Query() query: ClientAppointmentQueryDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.appointmentService.findClientAppointments(clientId, query, userId, roleKey, branchIds);
  }
}
