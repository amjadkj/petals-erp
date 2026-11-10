import { Type } from 'class-transformer';
import {
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class UpdateEmployeeDto {
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  designation?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  salary?: number;

  @IsISO8601()
  @IsOptional()
  joinedOn?: string;
}

