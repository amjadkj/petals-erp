import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReportStatus, ReportType } from '@petals/types';

export class UpdateReportDto {
  @ApiPropertyOptional({ enum: ReportType })
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @ApiPropertyOptional({ example: 'Updated OT Evaluation' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated observations...' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 'https://storage.petals.com/reports/ot-eval-revised.pdf' })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({ example: '2026-04-15' })
  @IsOptional()
  @IsDateString()
  dueOn?: string;

  @ApiPropertyOptional({ enum: ReportStatus, example: ReportStatus.SUBMITTED })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;
}
