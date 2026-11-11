import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class MonthlyAttendanceQueryDto {
  @ApiProperty({ description: 'Branch ID' })
  @IsUUID()
  branchId!: string;

  @ApiProperty({ description: 'Year (e.g. 2026)' })
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;

  @ApiProperty({ description: 'Month (1-12)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @ApiPropertyOptional({ description: 'Optional employee ID filter' })
  @IsUUID()
  @IsOptional()
  employeeId?: string;
}

