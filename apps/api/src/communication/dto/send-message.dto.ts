import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CommunicationChannel } from '@petals/types';

export class SendMessageDto {
  @IsUUID()
  @IsNotEmpty()
  clientId!: string;

  @IsEnum(CommunicationChannel)
  @IsNotEmpty()
  channel!: CommunicationChannel;

  @IsOptional()
  @IsUUID()
  templateId?: string;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, string>;

  @IsOptional()
  @IsString()
  customMessage?: string;

  @IsOptional()
  @IsString()
  recipient?: string;
}

