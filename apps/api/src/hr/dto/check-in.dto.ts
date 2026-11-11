import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CheckInDto {
  @ApiPropertyOptional({ description: 'Branch ID for check-in' })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({ description: 'Work date in YYYY-MM-DD format (defaults to today)' })
  @IsDateString()
  @IsOptional()
  workDate?: string;

  @ApiPropertyOptional({ description: 'Check-in timestamp in ISO format (defaults to now)' })
  @IsDateString()
  @IsOptional()
  checkIn?: string;

  @ApiPropertyOptional({ description: 'Employee ID (defaults to current user employee profile)' })
  @IsUUID()
  @IsOptional()
  employeeId?: string;
}

