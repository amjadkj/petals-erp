import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { OffsetPaginationDto } from '../../common/pagination';
import { LeadStage } from '@petals/types';

export class LeadQueryDto extends OffsetPaginationDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsEnum(LeadStage)
  stage?: LeadStage;

  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sort?: string;
}
