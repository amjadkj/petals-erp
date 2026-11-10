import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DocumentUploadUrlDto {
  @ApiProperty({ example: 'evaluation_results.pdf' })
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  fileType!: string;

  @ApiProperty({ example: 2048000, description: 'File size in bytes (max 15MB)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(15 * 1024 * 1024, { message: 'File size must not exceed 15MB' })
  fileSizeBytes!: number;
}

