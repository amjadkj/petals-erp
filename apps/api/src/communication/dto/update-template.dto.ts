import { IsOptional, IsString } from 'class-validator';

export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  language?: string;
}

