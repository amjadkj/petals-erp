import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ClientStatus } from '@petals/types';
import { OffsetPaginationDto } from '../../common/pagination';

export class ClientQueryDto extends OffsetPaginationDto {
  @ApiPropertyOptional({ description: 'Filter by branch UUID' })
  @Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({ description: 'Filter by department UUID' })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Filter by assigned therapist (Employee UUID)' })
  @IsUUID()
  @IsOptional()
  therapistId?: string;

  @ApiPropertyOptional({ enum: ClientStatus, description: 'Filter by client status' })
  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;

  @ApiPropertyOptional({ description: 'Search by client name or code (case-insensitive substring)' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort field with optional - prefix for descending (allowed: name, createdAt, clientCode, status, dob)',
    default: '-createdAt',
  })
  @IsString()
  @IsOptional()
  sort?: string;
}

