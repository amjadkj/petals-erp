import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ExportType {
  INVOICES = 'INVOICES',
  PAYMENTS = 'PAYMENTS',
  EXPENSES = 'EXPENSES',
  PNL = 'PNL',
}

export enum ExportFormat {
  EXCEL = 'EXCEL',
  PDF = 'PDF',
}

export class ExportFinanceDto {
  @ApiProperty({ enum: ExportType, example: ExportType.INVOICES })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsEnum(ExportType)
  type!: ExportType;

  @ApiProperty({ enum: ExportFormat, example: ExportFormat.EXCEL })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsEnum(ExportFormat)
  format!: ExportFormat;

  @ApiPropertyOptional({ description: 'Branch ID' })
  @IsOptional()
  @IsUUID('4')
  branchId?: string;

  @ApiPropertyOptional({ example: '2026-03-01' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-03-31' })
  @IsOptional()
  @IsString()
  to?: string;
}
