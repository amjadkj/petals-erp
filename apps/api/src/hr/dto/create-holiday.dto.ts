import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateHolidayDto {
  @ApiPropertyOptional({ description: 'Branch ID (omit or null for all branches)' })
  @IsUUID()
  @IsOptional()
  branchId?: string | null;

  @ApiProperty({ description: 'Date in YYYY-MM-DD format' })
  @IsDateString()
  date!: string;

  @ApiProperty({ description: 'Holiday name' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}

