import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class DailyAttendanceQueryDto {
  @ApiPropertyOptional({ description: 'Branch ID filter' })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @ApiProperty({ description: 'Work date in YYYY-MM-DD format' })
  @IsDateString()
  date!: string;
}

