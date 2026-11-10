import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProgressLevel } from '@petals/types';

export class UpdateProgressEntryDto {
  @ApiPropertyOptional({ example: '2026-03-10' })
  @IsOptional()
  @IsDateString()
  entryDate?: string;

  @ApiPropertyOptional({ example: 'Completed cutting task with moderate verbal prompts.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Child engaged well for 15 minutes.' })
  @IsOptional()
  @IsString()
  response?: string;

  @ApiPropertyOptional({ example: 'Recommend continuing bilateral activities.' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({ enum: ProgressLevel })
  @IsOptional()
  @IsEnum(ProgressLevel)
  level?: ProgressLevel;

  @ApiPropertyOptional({ description: 'Associated appointment ID' })
  @IsOptional()
  @IsUUID('4')
  appointmentId?: string;
}

