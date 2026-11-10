import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OffsetPaginationDto } from '../../common/pagination';

export class DocumentQueryDto extends OffsetPaginationDto {
  @ApiPropertyOptional({ description: 'Sort field (e.g. -createdAt, createdAt, title)' })
  @IsOptional()
  @IsString()
  sort?: string;
}
