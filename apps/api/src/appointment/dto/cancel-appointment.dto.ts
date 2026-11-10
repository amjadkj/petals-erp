import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelAppointmentDto {
  @ApiProperty({ example: 'Client requested reschedule due to illness' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
