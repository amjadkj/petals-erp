import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateGuardianDto {
  @ApiProperty({ description: 'Full name of the guardian' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Email address (used for parent portal login)' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'WhatsApp contact number' })
  @IsString()
  @IsOptional()
  whatsappNo?: string;

  @ApiProperty({ description: 'Relationship to client (e.g. Mother, Father, Legal Guardian)' })
  @IsString()
  @IsNotEmpty()
  relation!: string;

  @ApiPropertyOptional({ default: false, description: 'Whether this is the primary guardian' })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({ default: true, description: 'Whether parent can view Overview tab' })
  @IsBoolean()
  @IsOptional()
  canViewOverview?: boolean;

  @ApiPropertyOptional({ default: false, description: 'Whether parent can view Assessment tab' })
  @IsBoolean()
  @IsOptional()
  canViewAssessment?: boolean;

  @ApiPropertyOptional({ default: true, description: 'Whether parent can view Payment Plan tab' })
  @IsBoolean()
  @IsOptional()
  canViewPaymentPlan?: boolean;

  @ApiPropertyOptional({ default: false, description: 'Whether parent can view Reports tab' })
  @IsBoolean()
  @IsOptional()
  canViewReports?: boolean;

  @ApiPropertyOptional({ default: false, description: 'Consent to receive WhatsApp messages' })
  @IsBoolean()
  @IsOptional()
  whatsappConsent?: boolean;

  @ApiPropertyOptional({ default: false, description: 'Consent to receive email updates' })
  @IsBoolean()
  @IsOptional()
  emailConsent?: boolean;

  @ApiPropertyOptional({ description: 'Optional initial password for parent user account (defaults to ChangeMe123! if new)' })
  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;
}

