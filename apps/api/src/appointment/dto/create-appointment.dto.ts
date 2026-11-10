import { IsDateString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Branch ID' })
  @IsUUID('4')
  branchId!: string;

  @ApiProperty({ description: 'Client ID' })
  @IsUUID('4')
  clientId!: string;

  @ApiProperty({ description: 'Therapist employee ID' })
  @IsUUID('4')
  therapistId!: string;

  @ApiProperty({ example: '2026-03-15T10:00:00.000Z' })
  @IsDateString()
  startsAt!: string;

  @ApiProperty({ example: '2026-03-15T10:45:00.000Z' })
  @IsDateString()
  endsAt!: string;

  @ApiPropertyOptional({ description: 'Associated schedule ID' })
  @IsOptional()
  @IsUUID('4')
  scheduleId?: string;
}
