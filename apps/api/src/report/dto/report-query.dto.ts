import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReportStatus, ReportType } from '@petals/types';
import { OffsetPaginationDto } from '../../common/pagination';

export class ReportQueryDto extends OffsetPaginationDto {
  @ApiPropertyOptional({ description: 'Filter reports authored by specific employee ID' })
  @IsOptional()
  @IsUUID('4')
  authorId?: string;

  @ApiPropertyOptional({ description: 'Filter reports for specific client ID' })
  @IsOptional()
  @IsUUID('4')
  clientId?: string;

  @ApiPropertyOptional({ description: 'Filter reports by client branch ID' })
  @IsOptional()
  @IsUUID('4')
  branchId?: string;

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
