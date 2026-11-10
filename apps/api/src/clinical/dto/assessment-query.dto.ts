import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OffsetPaginationDto } from '../../common/pagination';

export class AssessmentQueryDto extends OffsetPaginationDto {
  @ApiPropertyOptional({
    description: 'Sort field: assessedOn, -assessedOn, createdAt, -createdAt',
    example: '-assessedOn',
  })
  @IsOptional()
  @IsString()
  sort?: string;
}
