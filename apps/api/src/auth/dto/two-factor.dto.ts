import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class Verify2faLoginDto {
  @ApiProperty({ description: 'Temporary token returned from initial login step' })
  @IsString()
  @IsNotEmpty()
  tempToken!: string;

  @ApiProperty({ description: '6-digit TOTP code', example: '123456' })
  @IsString()
  @Length(6, 6, { message: '2FA code must be exactly 6 digits' })
  code!: string;
}

export class Enable2faDto {
  @ApiProperty({ description: '6-digit TOTP code to confirm setup', example: '123456' })
  @IsString()
  @Length(6, 6, { message: '2FA code must be exactly 6 digits' })
  code!: string;
}

export class Disable2faDto {
  @ApiProperty({ description: 'Current password for verification' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ description: '6-digit TOTP code' })
  @IsString()
  @Length(6, 6)
  code!: string;
}

