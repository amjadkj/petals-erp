import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DashboardQueryDto {
  @ApiPropertyOptional({
    description: 'Branch ID filter (UUID or "ALL" for Director; defaults to caller branch for staff)',
  })
  @IsString()
  @IsOptional()
  branchId?: string;
}

