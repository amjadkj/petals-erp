import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@petals/types';

export class RecordPaymentDto {
  @ApiProperty({ example: 4500.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.UPI })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiPropertyOptional({ example: 'RCP-KOC-2026-0001' })
  @IsOptional()
  @IsString()
  receiptNo?: string;

  @ApiPropertyOptional({ example: '2026-03-05T14:30:00.000Z' })
  @IsOptional()
  @IsDateString()
  paidAt?: string;
}

