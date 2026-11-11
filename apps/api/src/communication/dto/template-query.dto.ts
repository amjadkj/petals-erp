import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OffsetPaginationDto } from '../../common/pagination';
import { TemplateStatus } from '@petals/types';

export class TemplateQueryDto extends OffsetPaginationDto {
  @IsOptional()
  @IsEnum(TemplateStatus)
  status?: TemplateStatus;

  @IsOptional()
  @IsString()
  search?: string;
}

