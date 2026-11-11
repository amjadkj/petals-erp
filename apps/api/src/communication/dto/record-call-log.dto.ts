import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class RecordCallLogDto {
  @IsString()
  @IsNotEmpty()
  recipient!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;
}

