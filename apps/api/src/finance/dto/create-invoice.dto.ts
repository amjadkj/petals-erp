import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RevenueCategory } from '@petals/types';

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Branch ID' })
  @IsUUID('4')
  branchId!: string;

  @ApiProperty({ description: 'Client ID' })
  @IsUUID('4')
  clientId!: string;

  @ApiPropertyOptional({ description: 'Treatment Plan ID' })
  @IsOptional()
  @IsUUID('4')
  planId?: string;

  @ApiPropertyOptional({ example: 'INV-KOC-2026-0001' })
  @IsOptional()
  @IsString()
  invoiceNo?: string;

  @ApiProperty({ enum: RevenueCategory, example: RevenueCategory.CLINICAL_THERAPY })
  @IsEnum(RevenueCategory)
  revenueCategory!: RevenueCategory;

  @ApiProperty({ example: 4500.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ example: '2026-03-01' })
  @IsDateString()
  issuedOn!: string;

  @ApiProperty({ example: '2026-03-15' })
  @IsDateString()
  dueOn!: string;
}

