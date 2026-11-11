import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CommunicationChannel } from '@petals/types';

export class SendBulkMessagesDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsString()
  @IsNotEmpty()
  filter!: 'PENDING_FEES' | 'UPCOMING_APPOINTMENT' | 'ALL_ACTIVE';

  @IsEnum(CommunicationChannel)
  @IsNotEmpty()
  channel!: CommunicationChannel;

  @IsOptional()
  @IsUUID()
  templateId?: string;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, string>;
}

