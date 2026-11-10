import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanStatus } from '@petals/types';

export class CreateTreatmentPlanDto {
  @ApiProperty({ description: 'Department ID' })
  @IsUUID('4')
  departmentId!: string;

  @ApiProperty({ description: 'Assigned therapist employee ID' })
  @IsUUID('4')
  therapistId!: string;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sessionsPerWeek!: number;

  @ApiPropertyOptional({ example: 45, default: 45 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(15)
  sessionMinutes?: number = 45;

  @ApiProperty({ example: 800.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  feePerSession!: number;

  @ApiProperty({ example: '2026-03-01' })
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional({ example: '2026-08-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: PlanStatus, default: PlanStatus.ACTIVE })
  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus = PlanStatus.ACTIVE;
}

