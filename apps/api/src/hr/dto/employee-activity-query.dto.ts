import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { CursorPaginationDto } from '../../common/pagination';

export class EmployeeActivityQueryDto extends CursorPaginationDto {
  @ApiPropertyOptional({ description: 'Optional branch ID filter' })
  @IsOptional()
  @IsUUID('4')
  branchId?: string;
}
