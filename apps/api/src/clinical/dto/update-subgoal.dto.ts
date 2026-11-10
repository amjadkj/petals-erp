import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SubgoalFrequency, GoalStatus } from '@petals/types';

export class UpdateSubgoalDto {
  @ApiPropertyOptional({ enum: SubgoalFrequency })
  @IsOptional()
  @IsEnum(SubgoalFrequency)
  frequency?: SubgoalFrequency;

  @ApiPropertyOptional({ example: 'Cut paper along a straight line using child-safe scissors' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: GoalStatus })
  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;

  @ApiPropertyOptional({ example: '2026-03-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-03-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
