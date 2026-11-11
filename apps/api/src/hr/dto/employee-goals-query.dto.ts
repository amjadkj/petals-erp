import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { OffsetPaginationDto } from '../../common/pagination';

export class EmployeeGoalsQueryDto extends OffsetPaginationDto {
  @ApiPropertyOptional({ description: 'Sort field, e.g. -entryDate, entryDate' })
  @IsString()
  @IsOptional()
  sort?: string;
}

