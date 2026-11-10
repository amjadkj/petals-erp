import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { OffsetPaginationDto } from '../../common/pagination/pagination.dto';

export class BranchQueryDto extends OffsetPaginationDto {
  @IsString()
  @IsOptional()
  sort?: string;

  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  search?: string;
}

