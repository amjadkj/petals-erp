import { Type } from 'class-transformer';
import {
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.phone !== undefined && o.phone !== null && o.phone !== '')
  @Matches(/^(\+91[\-\s]?)?[6789]\d{9}$/, {
    message: 'Mobile number must be a valid 10-digit Indian phone number',
  })
  phone?: string;

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

  @IsUUID('4', { message: 'branchId must be a valid UUID' })
  @IsOptional()
  branchId?: string;
}


