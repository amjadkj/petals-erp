import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LeadStage } from '@petals/types';

export class CreateLeadDto {
  @IsUUID()
  @IsNotEmpty()
  branchId!: string;

  @ValidateIf((o) => !o.childName)
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  childName?: string;

  @IsOptional()
  @IsString()
  childDob?: string;

  @ValidateIf((o) => !o.phone)
  @IsString()
  @IsNotEmpty()
  contact?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  parentName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(25)
  childAge?: number;

  @IsOptional()
  @IsString()
  concern?: string;

  @IsOptional()
  @IsString()
  concerns?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  nextFollowUp?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(LeadStage)
  stage?: LeadStage;
}

