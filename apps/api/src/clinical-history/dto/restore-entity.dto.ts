import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class RestoreEntityDto {
  @ApiPropertyOptional({
    description: 'Specific version number to restore. If omitted, restores latest prior state.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  versionNo?: number;

  @ApiPropertyOptional({ description: 'Reason for restoring this clinical entry' })
  @IsString()
  @IsOptional()
  reason?: string;
}

