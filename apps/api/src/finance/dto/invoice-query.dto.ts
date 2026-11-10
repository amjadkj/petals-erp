import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus, RevenueCategory } from '@petals/types';
import { OffsetPaginationDto } from '../../common/pagination';

export class InvoiceQueryDto extends OffsetPaginationDto {
  @ApiPropertyOptional({ description: 'Branch ID' })
  @IsOptional()
  @IsUUID('4')
  branchId?: string;

  @ApiPropertyOptional({ description: 'Client ID' })
  @IsOptional()
  @IsUUID('4')
  clientId?: string;

  @ApiPropertyOptional({ enum: InvoiceStatus })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional({ enum: RevenueCategory })
  @IsOptional()
  @IsEnum(RevenueCategory)
  revenueCategory?: RevenueCategory;

  @ApiPropertyOptional({ description: 'Issued from date' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'Issued to date' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ description: 'Sort field (e.g. issuedOn, -issuedOn, amount, -amount)' })
  @IsOptional()
  @IsString()
  sort?: string;
}
