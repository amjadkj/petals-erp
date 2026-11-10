import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RescheduleAppointmentDto {
  @ApiProperty({ example: '2026-03-16T11:00:00.000Z' })
  @IsDateString()
  startsAt!: string;

  @ApiProperty({ example: '2026-03-16T11:45:00.000Z' })
  @IsDateString()
  endsAt!: string;
}
