import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class ConvertLeadDto {
  @ValidateIf((o) => !o.childName)
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  childName?: string;

  @IsDateString()
  @IsNotEmpty()
  dob!: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  caseHistory?: string;

  @IsString()
  @IsNotEmpty()
  guardianName!: string;

  @IsString()
  @IsNotEmpty()
  guardianPhone!: string;

  @IsOptional()
  @IsEmail()
  guardianEmail?: string;

  @IsOptional()
  @IsString()
  guardianWhatsApp?: string;

  @IsOptional()
  @IsString()
  guardianRelation?: string = 'Parent';

  @IsOptional()
  @IsBoolean()
  guardianConsent?: boolean = false;
}

