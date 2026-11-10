import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportType } from '@petals/types';

export class CreateReportDto {
  @ApiProperty({ enum: ReportType, example: ReportType.ASSESSMENT })
  @IsEnum(ReportType)
  type!: ReportType;

  @ApiProperty({ example: 'Initial Occupational Therapy Evaluation' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Client demonstrates difficulties in fine motor coordination...' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 'https://storage.petals.com/reports/ot-eval-123.pdf' })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({ example: '2026-03-31' })
  @IsOptional()
  @IsDateString()
  dueOn?: string;
}
