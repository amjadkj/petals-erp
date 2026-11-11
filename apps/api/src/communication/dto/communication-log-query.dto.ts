import { IsEnum, IsOptional } from 'class-validator';
import { CursorPaginationDto } from '../../common/pagination';
import { CommunicationChannel, MessageStatus } from '@petals/types';

export class CommunicationLogQueryDto extends CursorPaginationDto {
  @IsOptional()
  @IsEnum(CommunicationChannel)
  channel?: CommunicationChannel;

  @IsOptional()
  @IsEnum(MessageStatus)
  status?: MessageStatus;
}

