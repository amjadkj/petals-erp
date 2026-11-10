import { IsDateString, IsOptional, IsString, IsUUID, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAssessmentDto {
  @ApiPropertyOptional({ example: '2026-03-15' })
  @IsOptional()
  @IsDateString()
  assessedOn?: string;

  @ApiPropertyOptional({ example: 'Sensory Profile 2' })
  @IsOptional()
  @IsString()
  tool?: string;

  @ApiPropertyOptional({ example: 'Child demonstrated sensory seeking behaviors.' })
  @IsOptional()
  @IsString()
  observation?: string;

  @ApiPropertyOptional({ example: { tactile: 24, auditory: 18, visual: 30 } })
  @IsOptional()
  @IsObject()
  scores?: Record<string, any>;

  @ApiPropertyOptional({ example: 'Recommend 2 sessions/week of sensory integration.' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: 'Assessor employee ID' })
  @IsOptional()
  @IsUUID('4')
  assessorId?: string;
}

