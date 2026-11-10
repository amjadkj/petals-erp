import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GoalTerm, GoalStatus } from '@petals/types';

export class CreateGoalDto {
  @ApiProperty({ enum: GoalTerm, example: GoalTerm.LONG })
  @IsEnum(GoalTerm)
  term!: GoalTerm;

  @ApiProperty({ example: 'Improve bilateral motor coordination' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Child is unable to use both hands cooperatively' })
  @IsOptional()
  @IsString()
  baseline?: string;

  @ApiPropertyOptional({ example: 'Demonstrates hand dominance and bilateral integration' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: GoalStatus, default: GoalStatus.NOT_STARTED })
  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus = GoalStatus.NOT_STARTED;

  @ApiPropertyOptional({ example: '2026-06-30' })
  @IsOptional()
  @IsDateString()
  targetDate?: string;
}
