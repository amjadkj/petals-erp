import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MessageStatus } from '@petals/types';

export class WebhookPayloadDto {
  @IsString()
  @IsNotEmpty()
  providerRef!: string;

  @IsEnum(MessageStatus)
  @IsNotEmpty()
  status!: MessageStatus;

  @IsOptional()
  @IsString()
  messageId?: string;
}

