import { IsOptional, IsString, IsUUID } from 'class-validator';
import { OffsetPaginationDto } from '../../common/pagination/pagination.dto';

export class EmployeeQueryDto extends OffsetPaginationDto {
  @IsString()
  @IsOptional()
  sort?: string;

  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsUUID()
  @IsOptional()
  branchId?: string;

  @IsString()
  @IsOptional()
  search?: string;
}

