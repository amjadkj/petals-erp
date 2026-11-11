import { ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveStatus, LeaveType } from '@petals/types';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { OffsetPaginationDto } from '../../common/pagination';

export class LeaveQueryDto extends OffsetPaginationDto {
  @ApiPropertyOptional({ enum: LeaveStatus, description: 'Filter by leave status' })
  @IsEnum(LeaveStatus)
  @IsOptional()
  status?: LeaveStatus;

  @ApiPropertyOptional({ enum: LeaveType, description: 'Filter by leave type' })
  @IsEnum(LeaveType)
  @IsOptional()
  leaveType?: LeaveType;

  @ApiPropertyOptional({ description: 'Filter by employee ID' })
  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @ApiPropertyOptional({ description: 'Filter by branch ID' })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({ description: 'From date filter (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'To date filter (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Sort field, e.g. -createdAt, fromDate' })
  @IsString()
  @IsOptional()
  sort?: string;
}

