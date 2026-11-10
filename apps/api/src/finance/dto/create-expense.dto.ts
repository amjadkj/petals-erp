import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ description: 'Branch ID' })
  @IsUUID('4')
  branchId!: string;

  @ApiProperty({ example: 'Therapy Toys and Materials' })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiProperty({ example: 1250.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ example: '2026-03-05' })
  @IsDateString()
  spentOn!: string;

  @ApiPropertyOptional({ example: 'Purchased sensory swings and sand kit' })
  @IsOptional()
  @IsString()
  notes?: string;
}
