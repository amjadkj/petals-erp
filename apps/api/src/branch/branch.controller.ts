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
import { RoleKey } from '@petals/types';
import { CurrentUser, Roles } from '../common/decorators';
import { IRequestContext } from '../common/context/request-context';
import { BranchService } from './branch.service';
import { CreateBranchDto, UpdateBranchDto, BranchQueryDto } from './dto';

@ApiTags('Branches')
@ApiBearerAuth()
@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @Roles(RoleKey.DIRECTOR)
  @ApiOperation({ summary: 'Create a new branch (Director only)' })
  createBranch(@Body() dto: CreateBranchDto) {
    return this.branchService.create(dto);
  }

  @Get()
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER, RoleKey.THERAPIST, RoleKey.PARENT)
  @ApiOperation({ summary: 'List branches (Director sees all, others see assigned branches)' })
  listBranches(
    @Query() query: BranchQueryDto,
    @CurrentUser() user: IRequestContext,
  ) {
    const isDirector = user.roleKey === RoleKey.DIRECTOR;
    const branchIds = user.branchIds || [];
    return this.branchService.findAll(query, branchIds, isDirector);
  }

  @Get(':id')
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER, RoleKey.THERAPIST, RoleKey.PARENT)
  @ApiOperation({ summary: 'Get branch by ID (Director or assigned user)' })
  getBranch(
    @Param('id') id: string,
    @CurrentUser() user: IRequestContext,
  ) {
    const isDirector = user.roleKey === RoleKey.DIRECTOR;
    const branchIds = user.branchIds || [];
    return this.branchService.findById(id, branchIds, isDirector);
  }

  @Patch(':id')
  @Roles(RoleKey.DIRECTOR)
  @ApiOperation({ summary: 'Update a branch (Director only)' })
  updateBranch(
    @Param('id') id: string,
    @Body() dto: UpdateBranchDto,
  ) {
    return this.branchService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleKey.DIRECTOR)
  @ApiOperation({ summary: 'Deactivate a branch (Director only)' })
  deleteBranch(@Param('id') id: string) {
    return this.branchService.delete(id);
  }
}

