import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateClientDto } from './create-client.dto';

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @ApiPropertyOptional({ description: 'Full name of the child/client' })
  name?: string;

  @ApiPropertyOptional({ description: 'Date of birth (ISO 8601 YYYY-MM-DD)' })
  dob?: string;
}
