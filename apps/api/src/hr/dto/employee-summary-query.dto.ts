import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class EmployeeSummaryQueryDto {
  @ApiPropertyOptional({ description: 'Optional branch ID filter' })
  @IsOptional()
  @IsUUID('4')
  branchId?: string;
}
