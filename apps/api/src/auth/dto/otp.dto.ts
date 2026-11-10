import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { OtpPurpose } from '@prisma/client';

export class RequestOtpDto {
  @ApiProperty({ description: 'Phone number or email address', example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  target!: string;

  @ApiProperty({ enum: OtpPurpose, default: OtpPurpose.LOGIN })
  @IsEnum(OtpPurpose)
  @IsOptional()
  purpose?: OtpPurpose = OtpPurpose.LOGIN;
}

export class VerifyOtpDto {
  @ApiProperty({ description: 'Phone number or email address' })
  @IsString()
  @IsNotEmpty()
  target!: string;

  @ApiProperty({ description: '6-digit OTP code', example: '123456' })
  @IsString()
  @Length(6, 6, { message: 'OTP code must be 6 digits' })
  code!: string;

  @ApiProperty({ enum: OtpPurpose, default: OtpPurpose.LOGIN })
  @IsEnum(OtpPurpose)
  @IsOptional()
  purpose?: OtpPurpose = OtpPurpose.LOGIN;
}

