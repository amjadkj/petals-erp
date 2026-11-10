import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { GoalTerm, GoalStatus } from '@petals/types';

export class UpdateGoalDto {
  @ApiPropertyOptional({ enum: GoalTerm })
  @IsOptional()
  @IsEnum(GoalTerm)
  term?: GoalTerm;

  @ApiPropertyOptional({ example: 'Improve bilateral motor coordination' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Child is unable to use both hands cooperatively' })
  @IsOptional()
  @IsString()
  baseline?: string;

  @ApiPropertyOptional({ example: 'Demonstrates hand dominance and bilateral integration' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: GoalStatus })
  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;

  @ApiPropertyOptional({ example: '2026-06-30' })
  @IsOptional()
  @IsDateString()
  targetDate?: string;
}
