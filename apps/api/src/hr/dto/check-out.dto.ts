import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CheckOutDto {
  @ApiPropertyOptional({ description: 'Work date in YYYY-MM-DD format (defaults to today)' })
  @IsDateString()
  @IsOptional()
  workDate?: string;

  @ApiPropertyOptional({ description: 'Check-out timestamp in ISO format (defaults to now)' })
  @IsDateString()
  @IsOptional()
  checkOut?: string;

  @ApiPropertyOptional({ description: 'Employee ID (defaults to current user employee profile)' })
  @IsUUID()
  @IsOptional()
  employeeId?: string;
}

