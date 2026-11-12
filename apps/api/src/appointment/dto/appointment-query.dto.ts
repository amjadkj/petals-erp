import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '@petals/types';

export class AppointmentQueryDto {
  @ApiProperty({ description: 'Start of calendar range (ISO date/datetime)', example: '2026-03-01' })
  @IsDateString()
  from!: string;

  @ApiProperty({ description: 'End of calendar range (ISO date/datetime, max 31 days from start)', example: '2026-03-31' })
  @IsDateString()
  to!: string;

  @ApiPropertyOptional({ description: 'Branch ID' })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
  @IsUUID('4')
  branchId?: string;

  @ApiPropertyOptional({ description: 'Therapist employee ID' })
  @IsOptional()
  @IsUUID('4')
  therapistId?: string;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsUUID('4')
  departmentId?: string;

  @ApiPropertyOptional({ enum: AppointmentStatus })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
