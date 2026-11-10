import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AppModule, PermissionAction, RoleKey } from '@petals/types';
import { CurrentUser, RequirePermission } from '../common/decorators';
import { NoStoreInterceptor } from './no-store.interceptor';
import { ClientService } from './client.service';
import {
  CreateClientDto,
  UpdateClientDto,
  ClientQueryDto,
  CreateGuardianDto,
} from './dto';

@ApiTags('Clients')
@ApiBearerAuth()
@Controller('clients')
@UseInterceptors(NoStoreInterceptor)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  @RequirePermission(AppModule.CLIENTS, PermissionAction.VIEW)
  @ApiOperation({
    summary:
      'List clients with offset pagination, filters, role scoping, and session counts (No N+1)',
  })
  async findAll(
    @Query() query: ClientQueryDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleId') roleId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.clientService.findAll(query, userId, roleId, roleKey, branchIds);
  }

  @Post()
  @RequirePermission(AppModule.CLIENTS, PermissionAction.CREATE)
  @ApiOperation({
    summary: 'Create a new client with auto-generated client code and optional initial guardians',
  })
  async create(
    @Body() dto: CreateClientDto,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    const isDirector = roleKey === RoleKey.DIRECTOR;
    return this.clientService.create(dto, isDirector, branchIds);
  }

  @Get(':id')
  @RequirePermission(AppModule.CLIENTS, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Get small client header with dynamically resolved allowedTabs' })
  async getHeader(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleId') roleId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.clientService.getHeader(id, userId, roleId, roleKey, branchIds);
  }

  @Get(':id/overview')
  @RequirePermission(AppModule.PROFILE_OVERVIEW, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Get client overview tab data (demographics, active plans, primary guardian)' })
  async getOverview(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.clientService.getOverview(id, userId, roleKey, branchIds);
  }

  @Get(':id/guardians')
  @RequirePermission(AppModule.CLIENTS, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Get guardians linked to this client with visibility permissions' })
  async getGuardians(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.clientService.getGuardians(id, userId, roleKey, branchIds);
  }

  @Post(':id/guardians')
  @RequirePermission(AppModule.CLIENTS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Add or link a guardian / parent user to this client' })
  async addGuardian(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateGuardianDto,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    const isDirector = roleKey === RoleKey.DIRECTOR;
    return this.clientService.addGuardian(id, dto, isDirector, branchIds);
  }

  @Put(':id')
  @RequirePermission(AppModule.CLIENTS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Update client details' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClientDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.clientService.update(id, dto, userId, roleKey, branchIds);
  }

  @Delete(':id')
  @RequirePermission(AppModule.CLIENTS, PermissionAction.DELETE)
  @ApiOperation({ summary: 'Soft delete a client' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roleKey') roleKey: RoleKey,
    @CurrentUser('branchIds') branchIds: string[] = [],
  ) {
    return this.clientService.remove(id, userId, roleKey, branchIds);
  }
}

