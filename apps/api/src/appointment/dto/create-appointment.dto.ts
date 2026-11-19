import { IsDateString, IsEnum, IsOptional, IsUUID, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentType } from '@petals/types';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Branch ID' })
  @IsUUID('4')
  branchId!: string;

  @ApiPropertyOptional({ description: 'Client ID (required if leadId not provided)' })
  @ValidateIf((o) => !o.leadId)
  @IsUUID('4')
  clientId?: string;

  @ApiPropertyOptional({ description: 'Lead ID (required if clientId not provided)' })
  @IsOptional()
  @IsUUID('4')
  leadId?: string;

  @ApiPropertyOptional({ description: 'Appointment type', enum: AppointmentType, default: AppointmentType.REGULAR })
  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType = AppointmentType.REGULAR;

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
