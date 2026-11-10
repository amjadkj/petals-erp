import { IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DailyScheduleQueryDto {
  @ApiProperty({ description: 'Date in YYYY-MM-DD format', example: '2026-03-15' })
  @IsDateString()
  date!: string;

  @ApiProperty({ description: 'Branch ID' })
  @IsUUID('4')
  branchId!: string;
}
