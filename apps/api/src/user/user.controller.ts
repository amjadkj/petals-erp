import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppModule, PermissionAction, RoleKey } from '@petals/types';
import { CurrentUser, RequirePermission } from '../common/decorators';
import { IRequestContext } from '../common/context/request-context';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @RequirePermission(AppModule.EMPLOYEES, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Create a new staff user (Requires EMPLOYEES:CREATE)' })
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get()
  @RequirePermission(AppModule.EMPLOYEES, PermissionAction.VIEW)
  @ApiOperation({ summary: 'List staff users (Requires EMPLOYEES:VIEW)' })
  listUsers(
    @Query() query: UserQueryDto,
    @CurrentUser() user: IRequestContext,
  ) {
    const isDirector = user.roleKey === RoleKey.DIRECTOR;
    const branchIds = user.branchIds || [];
    return this.userService.findAll(query, branchIds, isDirector);
  }

  @Get(':id')
  @RequirePermission(AppModule.EMPLOYEES, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Get staff user by ID (Requires EMPLOYEES:VIEW)' })
  getUser(
    @Param('id') id: string,
    @CurrentUser() user: IRequestContext,
  ) {
    const isDirector = user.roleKey === RoleKey.DIRECTOR;
    const branchIds = user.branchIds || [];
    return this.userService.findById(id, branchIds, isDirector);
  }

  @Patch(':id')
  @RequirePermission(AppModule.EMPLOYEES, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Update staff user (Requires EMPLOYEES:UPDATE)' })
  updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @RequirePermission(AppModule.EMPLOYEES, PermissionAction.DELETE)
  @ApiOperation({ summary: 'Deactivate user (Requires EMPLOYEES:DELETE)' })
  deactivateUser(@Param('id') id: string) {
    return this.userService.deactivate(id);
  }

  @Delete(':id')
  @RequirePermission(AppModule.EMPLOYEES, PermissionAction.DELETE)
  @ApiOperation({ summary: 'Deactivate user (Requires EMPLOYEES:DELETE)' })
  deleteUser(@Param('id') id: string) {
    return this.userService.deactivate(id);
  }
}

