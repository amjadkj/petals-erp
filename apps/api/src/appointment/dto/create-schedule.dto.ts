import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateScheduleDto {
  @ApiProperty({ description: 'Treatment Plan ID' })
  @IsUUID('4')
  planId!: string;

  @ApiProperty({ example: 'FREQ=WEEKLY;BYDAY=MO,WE' })
  @IsString()
  @IsNotEmpty()
  recurrenceRule!: string;

  @ApiProperty({ example: '10:00', description: 'Start time in HH:mm format' })
  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @ApiPropertyOptional({ example: 45, default: 45 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(15)
  durationMinutes?: number = 45;

  @ApiProperty({ example: '2026-03-01' })
  @IsDateString()
  startsOn!: string;

  @ApiPropertyOptional({ example: '2026-06-30' })
  @IsOptional()
  @IsDateString()
  endsOn?: string;
}
