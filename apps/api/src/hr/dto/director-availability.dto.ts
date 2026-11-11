import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class DirectorAvailabilityDto {
  @ApiProperty({
    description: 'ISO datetime until when director is unavailable (null to mark available)',
    nullable: true,
  })
  @IsDateString()
  @IsOptional()
  awayUntil!: string | null;
}

