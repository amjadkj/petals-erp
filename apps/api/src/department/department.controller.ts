import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleKey } from '@petals/types';
import { Roles } from '../common/decorators';
import { DepartmentService } from './department.service';

@ApiTags('Departments')
@ApiBearerAuth()
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER, RoleKey.THERAPIST)
  @ApiOperation({ summary: 'List all departments (Staff only)' })
  listDepartments() {
    return this.departmentService.findAll();
  }

  @Get(':id')
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER, RoleKey.THERAPIST)
  @ApiOperation({ summary: 'Get department by ID' })
  getDepartment(@Param('id') id: string) {
    return this.departmentService.findById(id);
  }
}

