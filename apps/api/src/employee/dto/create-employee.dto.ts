import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { RoleKey } from '@petals/types';

export class CreateEmployeeDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ValidateIf((o) => !o.userId)
  @IsString()
  @IsNotEmpty({ message: 'Name is required when creating a new employee' })
  @MaxLength(100)
  name?: string;

  @ValidateIf((o) => !o.userId)
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required when creating a new employee' })
  email?: string;

  @ValidateIf((o) => !o.userId)
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100)
  password?: string;

  @IsString()
  @IsOptional()
  @Matches(/^(\+91[\-\s]?)?[6789]\d{9}$/, {
    message: 'Mobile number must be a valid 10-digit Indian phone number',
  })
  phone?: string;

  @IsEnum(RoleKey)
  @IsOptional()
  roleKey?: RoleKey;

  @ValidateIf((o) => !o.userId)
  @IsUUID('4', { message: 'branchId must be a valid UUID' })
  @IsNotEmpty({ message: 'branchId is required when creating a new employee' })
  branchId?: string;

  @IsString()
  @IsOptional()
  employeeCode?: string;

  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  departmentName?: string;

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
