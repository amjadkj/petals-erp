import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveType } from '@petals/types';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLeaveRequestDto {
  @ApiPropertyOptional({ description: 'Employee ID (defaults to current user employee profile)' })
  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @ApiProperty({ enum: LeaveType, description: 'Type of leave' })
  @IsEnum(LeaveType)
  leaveType!: LeaveType;

  @ApiProperty({ description: 'Start date in YYYY-MM-DD format' })
  @IsDateString()
  @IsNotEmpty()
  fromDate!: string;

  @ApiProperty({ description: 'End date in YYYY-MM-DD format' })
  @IsDateString()
  @IsNotEmpty()
  toDate!: string;

  @ApiPropertyOptional({ description: 'Reason for leave' })
  @IsString()
  @IsOptional()
  reason?: string;
}

