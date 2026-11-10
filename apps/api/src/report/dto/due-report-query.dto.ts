import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReportType } from '@petals/types';
import { OffsetPaginationDto } from '../../common/pagination';

export class DueReportQueryDto extends OffsetPaginationDto {
  @ApiPropertyOptional({ description: 'Filter by Branch ID' })
  @IsOptional()
  @IsUUID('4')
  branchId?: string;

  @ApiPropertyOptional({ description: 'Filter by Therapist (Employee) ID' })
  @IsOptional()
  @IsUUID('4')
  therapistId?: string;

  @ApiPropertyOptional({ enum: ReportType })
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @ApiPropertyOptional({ description: 'Only return reports that are past due date' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  overdueOnly?: boolean;

  @ApiPropertyOptional({ description: 'Sort field (e.g. dueOn, -dueOn, -createdAt)' })
  @IsOptional()
  @IsString()
  sort?: string;
}

