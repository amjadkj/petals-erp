import { Type } from 'class-transformer';
import {
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  employeeCode!: string;

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
  @IsNotEmpty()
  joinedOn!: string;
}

