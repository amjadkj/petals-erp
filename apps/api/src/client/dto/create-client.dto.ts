import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ClientStatus } from '@petals/types';
import { CreateGuardianDto } from './create-guardian.dto';

export class CreateClientDto {
  @ApiProperty({ description: 'Branch UUID to which the client belongs' })
  @IsUUID()
  @IsNotEmpty()
  branchId!: string;

  @ApiPropertyOptional({
    description: 'Unique client code. Auto-generated per branch (e.g. BLR-2026-0001) if omitted.',
  })
  @IsString()
  @IsOptional()
  clientCode?: string;

  @ApiProperty({ description: 'Full name of the child/client' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Date of birth (ISO 8601 YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  dob!: string;

  @ApiPropertyOptional({ description: 'Gender of the client (e.g. MALE, FEMALE, OTHER)' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ description: 'Clinical case history and initial notes' })
  @IsString()
  @IsOptional()
  caseHistory?: string;

  @ApiPropertyOptional({
    enum: ClientStatus,
    default: ClientStatus.ACTIVE,
    description: 'Current status of the client',
  })
  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;

  @ApiPropertyOptional({
    type: [CreateGuardianDto],
    description: 'Initial guardians to link or create for this client',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGuardianDto)
  @IsOptional()
  guardians?: CreateGuardianDto[];
}

