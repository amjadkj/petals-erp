import {
  Body,
  Controller,
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
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto } from './dto';

@ApiTags('Employees')
@ApiBearerAuth()
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @RequirePermission(AppModule.EMPLOYEES, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Create employee profile (Requires EMPLOYEES:CREATE)' })
  async createEmployee(
    @Body() dto: CreateEmployeeDto,
    @CurrentUser() user: IRequestContext,
  ) {
    const canSetSalary = await this.employeeService.checkSalaryPermission(
      user.userId,
      user.roleId || '',
      user.roleKey,
      PermissionAction.CREATE,
    );
    return this.employeeService.create(dto, canSetSalary);
  }

  @Get()
  @RequirePermission(AppModule.EMPLOYEES, PermissionAction.VIEW)
  @ApiOperation({ summary: 'List employees (Requires EMPLOYEES:VIEW; Salary requires EMPLOYEE_SALARY:VIEW)' })
  async listEmployees(
    @Query() query: EmployeeQueryDto,
    @CurrentUser() user: IRequestContext,
  ) {
    const isDirector = user.roleKey === RoleKey.DIRECTOR;
    const branchIds = user.branchIds || [];
    const canViewSalary = await this.employeeService.checkSalaryPermission(
      user.userId,
      user.roleId || '',
      user.roleKey,
      PermissionAction.VIEW,
    );
    return this.employeeService.findAll(query, branchIds, isDirector, canViewSalary);
  }

  @Get(':id')
  @RequirePermission(AppModule.EMPLOYEES, PermissionAction.VIEW)
  @ApiOperation({ summary: 'Get employee profile by ID (Requires EMPLOYEES:VIEW)' })
  async getEmployee(
    @Param('id') id: string,
    @CurrentUser() user: IRequestContext,
  ) {
    const isDirector = user.roleKey === RoleKey.DIRECTOR;
    const branchIds = user.branchIds || [];
    const canViewSalary = await this.employeeService.checkSalaryPermission(
      user.userId,
      user.roleId || '',
      user.roleKey,
      PermissionAction.VIEW,
    );
    return this.employeeService.findById(id, branchIds, isDirector, canViewSalary);
  }

  @Patch(':id')
  @RequirePermission(AppModule.EMPLOYEES, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Update employee profile (Requires EMPLOYEES:UPDATE)' })
  async updateEmployee(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser() user: IRequestContext,
  ) {
    const canUpdateSalary = await this.employeeService.checkSalaryPermission(
      user.userId,
      user.roleId || '',
      user.roleKey,
      PermissionAction.UPDATE,
    );
    return this.employeeService.update(id, dto, canUpdateSalary);
  }
}
