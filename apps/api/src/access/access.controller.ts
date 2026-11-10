import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AccessService } from './access.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IRequestContext } from '../common/context/request-context';
import { RoleKey, AppModule, PermissionAction } from '@petals/types';
import {
  UpdateRoleModulesDto,
  UpdateRolePermissionsDto,
  UpdateUserOverridesDto,
} from './dto';

@ApiTags('Access Control')
@ApiBearerAuth()
@Controller('access')
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Get('me/permissions')
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER, RoleKey.THERAPIST, RoleKey.PARENT)
  @ApiOperation({ summary: 'Get current user resolved permissions map' })
  @ApiResponse({ status: 200, description: 'User permissions map' })
  async getMyPermissions(@CurrentUser('userId') userId: string) {
    return this.accessService.getUserPermissions(userId);
  }

  @Get('roles')
  @Roles(RoleKey.DIRECTOR)
  @ApiOperation({ summary: 'List all roles with modules and permissions (Director only)' })
  async listRoles() {
    return this.accessService.listRolesWithPermissions();
  }

  @Get('roles/:roleKey')
  @Roles(RoleKey.DIRECTOR)
  @ApiOperation({ summary: 'Get single role permissions (Director only)' })
  async getRole(@Param('roleKey') roleKey: RoleKey) {
    return this.accessService.getRolePermissions(roleKey);
  }

  @Put('roles/:roleKey/modules')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleKey.DIRECTOR)
  @ApiOperation({ summary: 'Update module toggles for a role (Director only)' })
  async updateRoleModules(
    @Param('roleKey') roleKey: RoleKey,
    @Body() dto: UpdateRoleModulesDto,
    @CurrentUser('userId') directorUserId: string,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    return this.accessService.updateRoleModules(roleKey, dto.modules, directorUserId, ip);
  }

  @Put('roles/:roleKey/permissions')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleKey.DIRECTOR)
  @ApiOperation({ summary: 'Update action permissions for a role (Director only)' })
  async updateRolePermissions(
    @Param('roleKey') roleKey: RoleKey,
    @Body() dto: UpdateRolePermissionsDto,
    @CurrentUser('userId') directorUserId: string,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    return this.accessService.updateRolePermissions(roleKey, dto.permissions, directorUserId, ip);
  }

  @Get('overrides/:userId')
  @Roles(RoleKey.DIRECTOR)
  @ApiOperation({ summary: 'Get user permission overrides (Director only)' })
  async getUserOverrides(@Param('userId') targetUserId: string) {
    return this.accessService.getUserOverrides(targetUserId);
  }

  @Put('overrides/:userId')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleKey.DIRECTOR)
  @ApiOperation({ summary: 'Update user permission overrides (Director only)' })
  async updateUserOverrides(
    @Param('userId') targetUserId: string,
    @Body() dto: UpdateUserOverridesDto,
    @CurrentUser('userId') directorUserId: string,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    return this.accessService.updateUserOverrides(targetUserId, dto.overrides, directorUserId, ip);
  }

  @Delete('overrides/:userId')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleKey.DIRECTOR)
  @ApiOperation({ summary: 'Delete a user permission override (Director only)' })
  async deleteUserOverride(
    @Param('userId') targetUserId: string,
    @Query('module') module: AppModule,
    @Query('action') action: PermissionAction,
    @CurrentUser('userId') directorUserId: string,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    return this.accessService.deleteUserOverride(targetUserId, module, action, directorUserId, ip);
  }

  // ──────────────── Sample / Verification Endpoints ────────────────

  @Get('test/assessments')
  @RequirePermission(AppModule.PROFILE_ASSESSMENT, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Test endpoint for clinical assessment access' })
  async testAssessments(@CurrentUser() user: IRequestContext) {
    return { success: true, scope: user?.permissionScope };
  }

  @Get('test/clients')
  @RequirePermission(AppModule.CLIENTS, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Test endpoint for clients access' })
  async testClients(@CurrentUser() user: IRequestContext) {
    return { success: true, scope: user?.permissionScope };
  }

  @Get('test/financial-pnl')
  @RequirePermission(AppModule.FINANCIAL_PNL, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Test endpoint for financial P&L access' })
  async testFinancialPnl(@CurrentUser() user: IRequestContext) {
    return { success: true, scope: user?.permissionScope };
  }
}


