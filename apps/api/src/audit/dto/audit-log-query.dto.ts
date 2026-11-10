import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';
import { CursorPaginationDto } from '../../common/pagination';

export class AuditLogQueryDto extends CursorPaginationDto {
  @ApiPropertyOptional({ description: 'Filter by user UUID' })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by entity name (e.g. User, Branch, Assessment)' })
  @IsString()
  @IsOptional()
  entity?: string;

  @ApiPropertyOptional({ description: 'Filter by branch UUID' })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({ description: 'Filter by start date (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter by end date (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

