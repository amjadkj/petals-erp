import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppModule, PermissionAction } from '@petals/types';
import { CurrentUser, RequirePermission } from '../common/decorators';
import { IRequestContext } from '../common/context/request-context';
import { NoStoreInterceptor } from '../client/no-store.interceptor';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseInterceptors(NoStoreInterceptor)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @RequirePermission(AppModule.DASHBOARD, PermissionAction.VIEW)
  @ApiOperation({
    summary:
      'Get role-specific dashboard (Director: operational + financial P&L; Manager: operational view without P&L; Therapist: assigned clients & schedule; Parent: children sessions)',
  })
  async getDashboard(
    @Query() query: DashboardQueryDto,
    @CurrentUser() user: IRequestContext,
  ) {
    return this.dashboardService.getDashboard(query, user);
  }
}

