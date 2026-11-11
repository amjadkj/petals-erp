import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LeaveDecisionDto {
  @ApiPropertyOptional({ description: 'Optional decision note or comments' })
  @IsString()
  @IsOptional()
  decisionNote?: string;
}

