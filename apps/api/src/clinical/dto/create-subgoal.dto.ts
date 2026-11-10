import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubgoalFrequency, GoalStatus } from '@petals/types';

export class CreateSubgoalDto {
  @ApiProperty({ enum: SubgoalFrequency, example: SubgoalFrequency.WEEKLY })
  @IsEnum(SubgoalFrequency)
  frequency!: SubgoalFrequency;

  @ApiProperty({ example: 'Cut paper along a straight line using child-safe scissors' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({ enum: GoalStatus, default: GoalStatus.NOT_STARTED })
  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus = GoalStatus.NOT_STARTED;

  @ApiPropertyOptional({ example: '2026-03-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-03-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
