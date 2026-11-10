import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReportStatus, ReportType } from '@petals/types';
import { OffsetPaginationDto } from '../../common/pagination';

export class ReportQueryDto extends OffsetPaginationDto {
  @ApiPropertyOptional({ enum: ReportType })
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @ApiPropertyOptional({ enum: ReportStatus })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({ description: 'Sort field (e.g. -dueOn, dueOn, -createdAt, title)' })
  @IsOptional()
  @IsString()
  sort?: string;
}

